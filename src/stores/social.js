import { defineStore } from "pinia";
import { ref, reactive } from "vue";
import { socialAPI, postAPI } from "@/services/api";
import { ElMessage } from "element-plus";

export const useSocialStore = defineStore(
  "social",
  () => {
    // 点赞状态映射 - 存储帖子ID到点赞状态的映射
    const likeStates = ref({});

    // 关注状态映射 - 存储用户ID到关注状态的映射
    const followStates = ref({});

    // 帖子点赞数映射 - 存储帖子ID到点赞数的映射
    const likeCounts = ref({});

    // 加载状态
    const loading = ref(false);

    /**
     * 初始化帖子的点赞和关注状态
     * @param {Array} posts - 帖子数组
     */
    const initializePostsState = (posts) => {
      if (!posts || !Array.isArray(posts)) {
        console.warn("⚠️ Posts is not an array:", posts);
        return;
      }

      console.log("🔧 Social Store: 开始初始化状态，帖子数量:", posts.length);
      console.log("🔧 Social Store: 当前缓存状态:", {
        likeStates: Object.keys(likeStates.value).length,
        followStates: Object.keys(followStates.value).length,
        likeCounts: Object.keys(likeCounts.value).length,
      });

      posts.forEach((post, index) => {
        if (post && (post._id || post.id)) {
          const postId = (post._id || post.id).toString();

          console.log(`📝 处理帖子 ${index + 1} (ID: ${postId}):`, {
            serverIsLiked: post.isLiked,
            serverLikeCount: post.stats?.likeCount || post.likes || 0,
            cachedIsLiked: likeStates.value[postId],
            cachedLikeCount: likeCounts.value[postId],
          });

          // 服务器返回的状态优先于本地缓存状态
          const oldLikeState = likeStates.value[postId];
          if (Object.prototype.hasOwnProperty.call(post, "isLiked")) {
            likeStates.value[postId] = Boolean(post.isLiked);
            if (oldLikeState !== Boolean(post.isLiked)) {
              console.log(
                `🔄 帖子 ${postId} 点赞状态更新: ${oldLikeState} -> ${Boolean(post.isLiked)}`,
              );
            }
          } else if (
            !Object.prototype.hasOwnProperty.call(likeStates.value, postId)
          ) {
            // 只有在服务器没有返回状态且本地也没有缓存时才设为false
            likeStates.value[postId] = false;
            console.log(`🆕 帖子 ${postId} 点赞状态初始化为: false`);
          }

          // 点赞数总是更新为服务器最新值
          const likeCount = post.stats?.likeCount || post.likes || 0;
          const oldLikeCount = likeCounts.value[postId];
          likeCounts.value[postId] = likeCount;
          if (oldLikeCount !== likeCount) {
            console.log(
              `🔢 帖子 ${postId} 点赞数更新: ${oldLikeCount} -> ${likeCount}`,
            );
          }

          // 服务器返回的关注状态优先于本地缓存状态
          if (post.author && (post.author._id || post.author.id)) {
            const authorId = (post.author._id || post.author.id).toString();
            const oldFollowState = followStates.value[authorId];

            console.log(`👤 处理作者 ${authorId}:`, {
              serverIsFollowing: post.author.isFollowing,
              cachedIsFollowing: followStates.value[authorId],
            });

            if (
              Object.prototype.hasOwnProperty.call(post.author, "isFollowing")
            ) {
              followStates.value[authorId] = Boolean(post.author.isFollowing);
              if (oldFollowState !== Boolean(post.author.isFollowing)) {
                console.log(
                  `🔄 作者 ${authorId} 关注状态更新: ${oldFollowState} -> ${Boolean(post.author.isFollowing)}`,
                );
              }
            } else if (
              !Object.prototype.hasOwnProperty.call(
                followStates.value,
                authorId,
              )
            ) {
              // 只有在服务器没有返回状态且本地也没有缓存时才设为false
              followStates.value[authorId] = false;
              console.log(`🆕 作者 ${authorId} 关注状态初始化为: false`);
            }
          }
        }
      });

      console.log("✅ Social Store: 状态初始化完成:", {
        likeStates: likeStates.value,
        followStates: followStates.value,
        likeCounts: likeCounts.value,
      });
    };

    /**
     * 获取帖子的点赞状态
     * @param {string} postId - 帖子ID
     * @returns {boolean} 点赞状态
     */
    const getPostLikeState = (postId) => {
      if (!postId) return false;
      return likeStates.value[postId.toString()] || false;
    };

    /**
     * 获取帖子的点赞数
     * @param {string} postId - 帖子ID
     * @returns {number} 点赞数
     */
    const getPostLikeCount = (postId) => {
      if (!postId) return 0;
      return likeCounts.value[postId.toString()] || 0;
    };

    /**
     * 获取用户的关注状态
     * @param {string} userId - 用户ID
     * @returns {boolean} 关注状态
     */
    const getUserFollowState = (userId) => {
      if (!userId) return false;
      return followStates.value[userId.toString()] || false;
    };

    /**
     * 切换帖子点赞状态
     * @param {string} postId - 帖子ID
     * @returns {Promise<Object>} 操作结果
     */
    const togglePostLike = async (postId) => {
      if (loading.value) return { success: false, message: "操作进行中..." };

      try {
        loading.value = true;
        const postIdStr = postId.toString();

        // 乐观更新 - 先更新本地状态
        const currentLikeState = likeStates.value[postIdStr] || false;
        const currentLikeCount = likeCounts.value[postIdStr] || 0;

        const newLikeState = !currentLikeState;
        const newLikeCount = newLikeState
          ? currentLikeCount + 1
          : currentLikeCount - 1;

        // 乐观更新本地状态
        likeStates.value[postIdStr] = newLikeState;
        likeCounts.value[postIdStr] = Math.max(0, newLikeCount);

        // 调用API
        const response = await postAPI.toggleLikePost(postId);

        // 检查响应格式：后端返回 { success: true, data: { isLiked, likeCount } }
        if (
          response &&
          response.success &&
          response.data &&
          typeof response.data.isLiked === "boolean" &&
          typeof response.data.likeCount === "number"
        ) {
          // 使用服务器返回的准确数据更新状态
          likeStates.value[postIdStr] = response.data.isLiked;
          likeCounts.value[postIdStr] = response.data.likeCount;

          const message = response.data.isLiked ? "点赞成功" : "取消点赞成功";
          ElMessage.success(message);

          return {
            success: true,
            isLiked: response.data.isLiked,
            likeCount: response.data.likeCount,
            message,
          };
        } else {
          console.error("服务器响应格式错误:", response);
          throw new Error("服务器响应格式错误");
        }
      } catch (error) {
        console.error("点赞操作失败:", error);

        // 回滚本地状态
        const postIdStr = postId.toString();
        const originalLikeState = !likeStates.value[postIdStr];
        const originalLikeCount = originalLikeState
          ? likeCounts.value[postIdStr] - 1
          : likeCounts.value[postIdStr] + 1;

        likeStates.value[postIdStr] = originalLikeState;
        likeCounts.value[postIdStr] = Math.max(0, originalLikeCount);

        ElMessage.error("操作失败，请稍后重试");
        return { success: false, message: "操作失败" };
      } finally {
        loading.value = false;
      }
    };

    /**
     * 切换用户关注状态
     * @param {string} userId - 用户ID
     * @returns {Promise<Object>} 操作结果
     */
    const toggleUserFollow = async (userId) => {
      if (loading.value) return { success: false, message: "操作进行中..." };

      try {
        loading.value = true;
        const userIdStr = userId.toString();

        // 先检查当前真实的关注状态
        const statusResponse = await socialAPI.checkFollowStatus(userId);
        const currentFollowState = statusResponse?.data?.isFollowing || false;

        let response;
        if (currentFollowState) {
          // 当前已关注，执行取消关注
          response = await socialAPI.unfollowUser(userId);
          if (response?.success) {
            followStates.value[userIdStr] = false;
            ElMessage.success("取消关注成功");
            return {
              success: true,
              isFollowing: false,
              message: "取消关注成功",
            };
          }
        } else {
          // 当前未关注，执行关注
          response = await socialAPI.followUser(userId);
          if (response?.success) {
            followStates.value[userIdStr] = true;
            ElMessage.success("关注成功");
            return { success: true, isFollowing: true, message: "关注成功" };
          }
        }

        throw new Error(response?.message || "操作失败");
      } catch (error) {
        console.error("关注操作失败:", error);

        if (error.message && error.message.includes("已关注")) {
          followStates.value[userId.toString()] = true;
          ElMessage.warning("您已关注该用户");
        } else if (error.message && error.message.includes("未关注")) {
          followStates.value[userId.toString()] = false;
          ElMessage.warning("您未关注该用户");
        } else {
          ElMessage.error("操作失败，请稍后重试");
        }

        return { success: false, message: "操作失败" };
      } finally {
        loading.value = false;
      }
    };

    /**
     * 同步帖子状态到store
     * @param {Object} post - 帖子对象
     */
    const syncPostState = (post) => {
      if (!post || !(post._id || post.id)) return;

      const postId = (post._id || post.id).toString();

      // 同步点赞状态
      if (typeof post.isLiked === "boolean") {
        post.isLiked = getPostLikeState(postId);
      }

      // 同步点赞数
      const likeCount = getPostLikeCount(postId);
      if (post.stats) {
        post.stats.likeCount = likeCount;
      }
      if (typeof post.likes === "number") {
        post.likes = likeCount;
      }

      // 同步作者关注状态
      if (post.author && (post.author._id || post.author.id)) {
        const authorId = (post.author._id || post.author.id).toString();
        post.author.isFollowing = getUserFollowState(authorId);
      }
    };

    /**
     * 批量同步帖子状态
     * @param {Array} posts - 帖子数组
     */
    const syncPostsState = (posts) => {
      if (!Array.isArray(posts)) return posts;

      posts.forEach((post) => {
        syncPostState(post);
      });

      return posts;
    };

    /**
     * 清除所有状态（用于用户登出）
     */
    const clearAllStates = () => {
      Object.keys(likeStates.value).forEach(
        (key) => delete likeStates.value[key],
      );
      Object.keys(followStates.value).forEach(
        (key) => delete followStates.value[key],
      );
      Object.keys(likeCounts.value).forEach(
        (key) => delete likeCounts.value[key],
      );
      console.log("Social store cleared");
    };

    /**
     * 强制更新帖子状态（用于页面刷新后的状态恢复）
     * @param {string} postId - 帖子ID
     * @param {boolean} isLiked - 点赞状态
     * @param {number} likeCount - 点赞数
     */
    const forceUpdatePostState = (postId, isLiked, likeCount) => {
      const postIdStr = postId.toString();
      likeStates.value[postIdStr] = isLiked;
      likeCounts.value[postIdStr] = likeCount;
    };

    /**
     * 强制更新用户关注状态
     * @param {string} userId - 用户ID
     * @param {boolean} isFollowing - 关注状态
     */
    const forceUpdateFollowState = (userId, isFollowing) => {
      followStates.value[userId.toString()] = isFollowing;
    };

    /**
     * 关注用户
     * @param {string} userId - 用户ID
     * @returns {Promise<Object>} 操作结果
     */
    const followUser = async (userId) => {
      if (loading.value) return { success: false, message: "操作进行中..." };

      try {
        loading.value = true;
        const userIdStr = userId.toString();

        // 先检查服务器端的真实状态，避免本地状态不准确
        try {
          const statusResponse = await socialAPI.checkFollowStatus(userId);
          const serverFollowState = statusResponse?.data?.isFollowing || false;

          if (serverFollowState) {
            // 服务器显示已关注，同步本地状态
            followStates.value[userIdStr] = true;
            ElMessage.warning("您已经关注了该用户");
            return { success: true, isFollowing: true };
          }
        } catch (statusError) {
          console.warn("检查关注状态失败，继续执行关注操作:", statusError);
        }

        // 乐观更新
        followStates.value[userIdStr] = true;

        // 调用API
        const response = await socialAPI.followUser(userId);

        if (response?.success) {
          // 确保状态已更新
          followStates.value[userIdStr] = true;

          // 触发全局状态更新事件，通知所有组件刷新
          window.dispatchEvent(
            new CustomEvent("followStateChanged", {
              detail: { userId: userIdStr, isFollowing: true },
            }),
          );

          ElMessage.success("关注成功");
          return { success: true, isFollowing: true };
        } else {
          // 回滚状态
          followStates.value[userIdStr] = false;
          const message = response?.message || "关注失败";
          ElMessage.error(message);
          return { success: false, message };
        }
      } catch (error) {
        // 回滚状态
        const userIdStr = userId.toString();
        followStates.value[userIdStr] = false;

        console.error("关注操作失败:", error);
        const message = error.message?.includes("已经关注")
          ? "您已经关注了该用户"
          : "关注失败，请稍后重试";
        ElMessage.error(message);
        return { success: false, message };
      } finally {
        loading.value = false;
      }
    };

    /**
     * 取消关注用户
     * @param {string} userId - 用户ID
     * @returns {Promise<Object>} 操作结果
     */
    const unfollowUser = async (userId) => {
      if (loading.value) return { success: false, message: "操作进行中..." };

      try {
        loading.value = true;
        const userIdStr = userId.toString();

        // 检查当前状态
        const currentFollowState = followStates.value[userIdStr] || false;
        if (!currentFollowState) {
          ElMessage.warning("您未关注该用户");
          return { success: true, isFollowing: false };
        }

        // 乐观更新
        followStates.value[userIdStr] = false;

        // 调用API
        const response = await socialAPI.unfollowUser(userId);

        if (response?.success) {
          // 确保状态已更新
          followStates.value[userIdStr] = false;

          // 触发全局状态更新事件，通知所有组件刷新
          window.dispatchEvent(
            new CustomEvent("followStateChanged", {
              detail: { userId: userIdStr, isFollowing: false },
            }),
          );

          ElMessage.success("取消关注成功");
          return { success: true, isFollowing: false };
        } else {
          // 回滚状态
          followStates.value[userIdStr] = true;
          const message = response?.message || "取消关注失败";
          ElMessage.error(message);
          return { success: false, message };
        }
      } catch (error) {
        // 回滚状态
        const userIdStr = userId.toString();
        followStates.value[userIdStr] = true;

        console.error("取消关注操作失败:", error);
        const message = error.message?.includes("未关注")
          ? "您未关注该用户"
          : "取消关注失败，请稍后重试";
        ElMessage.error(message);
        return { success: false, message };
      } finally {
        loading.value = false;
      }
    };

    return {
      // 状态
      loading,

      // 方法
      initializePostsState,
      getPostLikeState,
      getPostLikeCount,
      getUserFollowState,
      togglePostLike,
      toggleUserFollow,
      followUser,
      unfollowUser,
      syncPostState,
      syncPostsState,
      clearAllStates,
      forceUpdatePostState,
      forceUpdateFollowState,
    };
  },
  {
    persist: {
      key: "social",
      storage: localStorage,
      paths: ["likeStates", "followStates", "likeCounts"],
    },
  },
);
