const axios = require('axios');
const { CozeAPI } = require('@coze/api');
const { AI_CONFIG } = require('../config/constants');

class AIService {
  constructor() {
    // 广州大学智能体配置
    this.gzhuConfig = AI_CONFIG.GZHU_AGENT;

    // Coze智能体配置
    this.cozeConfig = AI_CONFIG.COZE;

    // 创建广州大学HTTP客户端
    this.gzhuClient = axios.create({
      baseURL: this.gzhuConfig.apiUrl,
      timeout: this.gzhuConfig.timeout,
      headers: {
        'Authorization': `Bearer ${this.gzhuConfig.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // 创建Coze官方API客户端
    this.cozeClient = new CozeAPI({
      token: this.cozeConfig.apiKey,
      baseURL: this.cozeConfig.apiUrl
    });

    // 设置请求拦截器
    this.setupInterceptors();
  }

  setupInterceptors() {
    // 广州大学智能体请求拦截器
    this.gzhuClient.interceptors.request.use(
      (config) => {
        console.log('GZHU AI请求:', {
          url: config.url,
          method: config.method,
          timestamp: new Date().toISOString()
        });
        return config;
      },
      (error) => {
        console.error('GZHU AI请求错误:', error);
        return Promise.reject(error);
      }
    );

    this.gzhuClient.interceptors.response.use(
      (response) => {
        console.log('GZHU AI响应成功:', {
          status: response.status,
          url: response.config.url
        });
        return response;
      },
      (error) => {
        console.error('GZHU AI响应错误:', {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );

    // Coze SDK不需要设置拦截器，已在callCozeBot方法中添加日志
  }

  // ==================== 广州大学智能体服务 ====================

  /**
   * AI助手对话
   * @param {string} message - 用户消息
   * @param {string} userId - 用户ID
   * @param {Object} context - 上下文信息
   * @returns {Promise<Object>} AI回复
   */
  async chatWithAssistant(message, userId, context = {}) {
    try {
      const response = await this.gzhuClient.post('/chat', {
        message,
        userId,
        context: {
          platform: 'rural-art-platform',
          timestamp: new Date().toISOString(),
          ...context
        }
      });

      return {
        success: true,
        data: {
          reply: response.data.reply,
          suggestions: response.data.suggestions || [],
          context: response.data.context || {}
        }
      };
    } catch (error) {
      console.error('AI助手对话失败:', error);
      return {
        success: false,
        message: 'AI助手暂时不可用，请稍后重试',
        error: error.message
      };
    }
  }

  /**
   * 获取学习建议
   * @param {Object} userProfile - 用户资料
   * @param {Array} learningHistory - 学习历史
   * @returns {Promise<Object>} 学习建议
   */
  async getLearningRecommendations(userProfile, learningHistory) {
    try {
      const response = await this.gzhuClient.post('/recommendations', {
        userProfile,
        learningHistory,
        requestType: 'learning_recommendations'
      });

      return {
        success: true,
        data: {
          recommendations: response.data.recommendations || [],
          reasons: response.data.reasons || [],
          nextSteps: response.data.nextSteps || []
        }
      };
    } catch (error) {
      console.error('获取学习建议失败:', error);
      return {
        success: false,
        message: '获取学习建议失败',
        error: error.message
      };
    }
  }

  // ==================== Coze智能体服务 ====================

  /**
   * 调用Coze智能体 - 使用官方SDK
   * @param {string} botId - 智能体ID
   * @param {Object} data - 请求数据
   * @returns {Promise<Object>} 智能体响应
   */
  async callCozeBot(botId, data) {
    try {
      console.log('调用Coze智能体:', {
        botId,
        userId: data.userId || 'user-' + Date.now(),
        content: data.query || data.content || ''
      });

      // 使用Coze官方SDK
      const response = await this.cozeClient.chat.create({
        bot_id: botId,
        user_id: data.userId || 'user-' + Date.now(),
        stream: false,
        auto_save_history: true,
        additional_messages: [
          {
            content: data.query || data.content || '',
            content_type: 'text',
            role: 'user',
            type: 'question'
          }
        ]
      });

      console.log('Coze API响应:', {
        status: 'success',
        messageCount: response.messages?.length || 0,
        conversationId: response.conversation_id
      });

      return {
        success: true,
        data: {
          messages: response.messages || [],
          conversation_id: response.conversation_id,
          usage: response.usage || {}
        }
      };
    } catch (error) {
      console.error('Coze智能体调用失败:', {
        error: error.message,
        stack: error.stack,
        botId,
        data
      });
      
      // 处理不同类型的错误
      let errorMessage = 'AI工具暂时不可用，请稍后重试';
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        errorMessage = 'AI服务认证失败，请检查API密钥';
      } else if (error.message?.includes('429') || error.message?.includes('rate limit')) {
        errorMessage = 'AI服务请求过于频繁，请稍后重试';
      } else if (error.message?.includes('500') || error.message?.includes('Internal Server Error')) {
        errorMessage = 'AI服务暂时不可用';
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error.message,
        status: error.response?.status || error.status
      };
    }
  }

  /**
   * 图片增强 - 暂时返回额度用完提示
   * @param {string} imageUrl - 图片URL
   * @param {Object} options - 增强选项
   * @returns {Promise<Object>} 增强结果
   */
  async enhanceImage(imageUrl, options = {}) {
    console.log('📤 图片增强请求 - 返回额度用完提示', {
      imageUrl: imageUrl,
      options: options
    });

    // 直接返回额度用完的提示，不调用Coze API
    return {
      success: true,  // 改为成功状态，避免前端报错
      message: 'Coze额度已用完，待管理员重新补充额度再行测试',
      data: {
        originalUrl: imageUrl,
        enhancedUrl: null,
        suggestion: '🚫 Coze额度已用完，待管理员重新补充额度再行测试',
        processing_time: Date.now(),
        quota_exhausted: true
      }
    };
  }

  /**
   * 风格转换 - 暂时返回额度用完提示
   * @param {string} imageUrl - 原图URL
   * @param {string} styleType - 风格类型
   * @param {Object} options - 转换选项
   * @returns {Promise<Object>} 转换结果
   */
  async transferStyle(imageUrl, styleType, options = {}) {
    console.log('🎨 风格转换请求 - 返回额度用完提示', {
      imageUrl: imageUrl,
      styleType: styleType,
      options: options
    });

    return {
      success: true,  // 改为成功状态，避免前端报错
      message: 'Coze额度已用完，待管理员重新补充额度再行测试',
      data: {
        originalUrl: imageUrl,
        styledUrl: null,
        styleType,
        suggestion: '🚫 Coze额度已用完，待管理员重新补充额度再行测试',
        processingTime: Date.now(),
        quota_exhausted: true
      }
    };
  }

  /**
   * 图案生成 - 暂时返回额度用完提示
   * @param {string} description - 图案描述
   * @param {Object} options - 生成选项
   * @returns {Promise<Object>} 生成结果
   */
  async generatePattern(description, options = {}) {
    console.log('🖼️ 图案生成请求 - 返回额度用完提示', {
      description: description,
      options: options
    });

    return {
      success: true,  // 改为成功状态，避免前端报错
      message: 'Coze额度已用完，待管理员重新补充额度再行测试',
      data: {
        patternUrl: null,
        description,
        suggestion: '🚫 Coze额度已用完，待管理员重新补充额度再行测试',
        variations: [],
        processingTime: Date.now(),
        quota_exhausted: true
      }
    };
  }

  /**
   * 智能修复 - 暂时返回额度用完提示
   * @param {string} imageUrl - 待修复图片URL
   * @param {Object} options - 修复选项
   * @returns {Promise<Object>} 修复结果
   */
  async smartRepair(imageUrl, options = {}) {
    console.log('🔧 智能修复请求 - 返回额度用完提示', {
      imageUrl: imageUrl,
      options: options
    });

    return {
      success: true,  // 改为成功状态，避免前端报错
      message: 'Coze额度已用完，待管理员重新补充额度再行测试',
      data: {
        originalUrl: imageUrl,
        repairedUrl: null,
        suggestion: '🚫 Coze额度已用完，待管理员重新补充额度再行测试',
        repairDetails: [],
        processingTime: Date.now(),
        quota_exhausted: true
      }
    };
  }

  // ==================== 工具方法 ====================

  /**
   * 检查服务状态
   * @returns {Promise<Object>} 服务状态
   */
  async checkServiceStatus() {
    const status = {
      gzhu: { available: false, latency: null },
      coze: { available: false, latency: null }
    };

    // 检查广州大学智能体
    try {
      const start = Date.now();
      await this.gzhuClient.get('/health');
      status.gzhu.available = true;
      status.gzhu.latency = Date.now() - start;
    } catch (error) {
      console.warn('GZHU智能体不可用:', error.message);
    }

    // 检查Coze智能体 - 通过尝试简单调用来测试
    try {
      const start = Date.now();
      
      // 尝试调用Coze API来检查连接性
      const testResult = await this.callCozeBot('7538355440988979239', {
        query: 'test',
        userId: 'health-check'
      });
      
      if (testResult.success) {
        status.coze.available = true;
        status.coze.latency = Date.now() - start;
        console.log('Coze API连接正常');
      } else {
        console.warn('Coze API测试失败:', testResult.message);
      }
    } catch (error) {
      console.warn('Coze智能体不可用:', error.message);
    }

    return status;
  }
}

// 创建单例实例
const aiService = new AIService();

module.exports = aiService;