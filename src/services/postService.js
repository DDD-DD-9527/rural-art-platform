import api from "./api";

// 帖子相关API服务
export const postService = {
  // 获取帖子列表
  async getPosts(params = {}) {
    try {
      const response = await api.get("/posts", { params });
      return response.data;
    } catch (error) {
      console.error("获取帖子列表失败:", error);
      throw error;
    }
  },

  // 获取帖子详情
  async getPostById(id) {
    try {
      const response = await api.get(`/posts/${id}`);
      return response.data;
    } catch (error) {
      console.error("获取帖子详情失败:", error);
      throw error;
    }
  },

  // 创建帖子
  async createPost(postData) {
    try {
      const response = await api.post("/posts", postData);
      return response.data;
    } catch (error) {
      console.error("创建帖子失败:", error);
      throw error;
    }
  },

  // 更新帖子
  async updatePost(id, postData) {
    try {
      const response = await api.put(`/posts/${id}`, postData);
      return response.data;
    } catch (error) {
      console.error("更新帖子失败:", error);
      throw error;
    }
  },

  // 删除帖子
  async deletePost(id) {
    try {
      const response = await api.delete(`/posts/${id}`);
      return response.data;
    } catch (error) {
      console.error("删除帖子失败:", error);
      throw error;
    }
  },

  // 点赞/取消点赞帖子
  async toggleLikePost(id) {
    try {
      const response = await api.post(`/posts/${id}/like`);
      return response.data;
    } catch (error) {
      console.error("点赞操作失败:", error);
      throw error;
    }
  },

  // 获取热门帖子
  async getHotPosts(params = {}) {
    try {
      const response = await api.get("/posts/hot/list", { params });
      return response.data;
    } catch (error) {
      console.error("获取热门帖子失败:", error);
      throw error;
    }
  },

  // 获取推荐帖子
  async getRecommendedPosts(params = {}) {
    try {
      const response = await api.get("/posts/recommended/list", { params });
      return response.data;
    } catch (error) {
      console.error("获取推荐帖子失败:", error);
      throw error;
    }
  },

  // 获取用户帖子
  async getUserPosts(userId, params = {}) {
    try {
      const response = await api.get(`/posts/user/${userId}`, { params });
      return response.data;
    } catch (error) {
      console.error("获取用户帖子失败:", error);
      throw error;
    }
  },

  // 举报帖子
  async reportPost(id, reportData) {
    try {
      const response = await api.post(`/posts/${id}/report`, reportData);
      return response.data;
    } catch (error) {
      console.error("举报帖子失败:", error);
      throw error;
    }
  },
};

export default postService;
