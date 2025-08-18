import api from './api';

// 评论相关API服务
export const commentService = {
  // 获取评论列表
  async getComments(params = {}) {
    try {
      const response = await api.get('/comments', { params });
      return response.data;
    } catch (error) {
      console.error('获取评论列表失败:', error);
      throw error;
    }
  },

  // 获取评论详情
  async getCommentById(id) {
    try {
      const response = await api.get(`/comments/${id}`);
      return response.data;
    } catch (error) {
      console.error('获取评论详情失败:', error);
      throw error;
    }
  },

  // 创建评论
  async createComment(commentData) {
    try {
      const response = await api.post('/comments', commentData);
      return response.data;
    } catch (error) {
      console.error('创建评论失败:', error);
      throw error;
    }
  },

  // 更新评论
  async updateComment(id, commentData) {
    try {
      const response = await api.put(`/comments/${id}`, commentData);
      return response.data;
    } catch (error) {
      console.error('更新评论失败:', error);
      throw error;
    }
  },

  // 删除评论
  async deleteComment(id) {
    try {
      const response = await api.delete(`/comments/${id}`);
      return response.data;
    } catch (error) {
      console.error('删除评论失败:', error);
      throw error;
    }
  },

  // 点赞/取消点赞评论
  async toggleLikeComment(id) {
    try {
      const response = await api.post(`/comments/${id}/like`);
      return response.data;
    } catch (error) {
      console.error('点赞评论失败:', error);
      throw error;
    }
  },

  // 举报评论
  async reportComment(id, reportData) {
    try {
      const response = await api.post(`/comments/${id}/report`, reportData);
      return response.data;
    } catch (error) {
      console.error('举报评论失败:', error);
      throw error;
    }
  }
};

export default commentService;