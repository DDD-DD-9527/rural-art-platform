const axios = require('axios');

class AIService {
  constructor() {
    // 广州大学智能体配置
    this.gzhuConfig = {
      apiUrl: process.env.GZHU_AGENT_API_URL || 'https://api.gzhu.edu.cn/agent',
      apiKey: process.env.GZHU_AGENT_KEY || ''
    };

    // Coze智能体配置
    this.cozeConfig = {
      apiUrl: process.env.COZE_API_URL || 'https://api.coze.com/v1',
      apiKey: process.env.COZE_API_KEY || '',
      bots: {
        imageEnhance: process.env.COZE_IMAGE_ENHANCE_BOT_ID || '',
        styleTransfer: process.env.COZE_STYLE_TRANSFER_BOT_ID || '',
        patternGenerate: process.env.COZE_PATTERN_GENERATE_BOT_ID || '',
        smartRepair: process.env.COZE_SMART_REPAIR_BOT_ID || ''
      }
    };

    // 创建HTTP客户端
    this.gzhuClient = axios.create({
      baseURL: this.gzhuConfig.apiUrl,
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${this.gzhuConfig.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    this.cozeClient = axios.create({
      baseURL: this.cozeConfig.apiUrl,
      timeout: 60000,
      headers: {
        'Authorization': `Bearer ${this.cozeConfig.apiKey}`,
        'Content-Type': 'application/json'
      }
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

    // Coze智能体请求拦截器
    this.cozeClient.interceptors.request.use(
      (config) => {
        console.log('Coze AI请求:', {
          url: config.url,
          method: config.method,
          timestamp: new Date().toISOString()
        });
        return config;
      },
      (error) => {
        console.error('Coze AI请求错误:', error);
        return Promise.reject(error);
      }
    );

    this.cozeClient.interceptors.response.use(
      (response) => {
        console.log('Coze AI响应成功:', {
          status: response.status,
          url: response.config.url
        });
        return response;
      },
      (error) => {
        console.error('Coze AI响应错误:', {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );
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
   * 调用Coze智能体
   * @param {string} botId - 智能体ID
   * @param {Object} data - 请求数据
   * @returns {Promise<Object>} 智能体响应
   */
  async callCozeBot(botId, data) {
    try {
      const response = await this.cozeClient.post('/chat', {
        bot_id: botId,
        user_id: data.userId || 'anonymous',
        query: data.query || '',
        chat_history: data.chatHistory || [],
        extra: data.extra || {}
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Coze智能体调用失败:', error);
      return {
        success: false,
        message: 'AI工具暂时不可用，请稍后重试',
        error: error.message
      };
    }
  }

  /**
   * 图片增强
   * @param {string} imageUrl - 图片URL
   * @param {Object} options - 增强选项
   * @returns {Promise<Object>} 增强结果
   */
  async enhanceImage(imageUrl, options = {}) {
    try {
      const result = await this.callCozeBot(this.cozeConfig.bots.imageEnhance, {
        query: '请增强这张图片',
        extra: {
          imageUrl,
          enhanceType: options.enhanceType || 'auto',
          quality: options.quality || 'high',
          preserveStyle: options.preserveStyle !== false
        }
      });

      if (result.success) {
        return {
          success: true,
          data: {
            originalUrl: imageUrl,
            enhancedUrl: result.data.enhanced_image_url,
            improvements: result.data.improvements || [],
            processingTime: result.data.processing_time
          }
        };
      }

      return result;
    } catch (error) {
      console.error('图片增强失败:', error);
      return {
        success: false,
        message: '图片增强失败',
        error: error.message
      };
    }
  }

  /**
   * 风格转换
   * @param {string} imageUrl - 原图URL
   * @param {string} styleType - 风格类型
   * @param {Object} options - 转换选项
   * @returns {Promise<Object>} 转换结果
   */
  async transferStyle(imageUrl, styleType, options = {}) {
    try {
      const result = await this.callCozeBot(this.cozeConfig.bots.styleTransfer, {
        query: `请将图片转换为${styleType}风格`,
        extra: {
          imageUrl,
          styleType,
          intensity: options.intensity || 0.8,
          preserveContent: options.preserveContent !== false
        }
      });

      if (result.success) {
        return {
          success: true,
          data: {
            originalUrl: imageUrl,
            styledUrl: result.data.styled_image_url,
            styleType,
            processingTime: result.data.processing_time
          }
        };
      }

      return result;
    } catch (error) {
      console.error('风格转换失败:', error);
      return {
        success: false,
        message: '风格转换失败',
        error: error.message
      };
    }
  }

  /**
   * 图案生成
   * @param {string} description - 图案描述
   * @param {Object} options - 生成选项
   * @returns {Promise<Object>} 生成结果
   */
  async generatePattern(description, options = {}) {
    try {
      const result = await this.callCozeBot(this.cozeConfig.bots.patternGenerate, {
        query: `请生成${description}图案`,
        extra: {
          description,
          style: options.style || 'traditional',
          size: options.size || 'medium',
          colorScheme: options.colorScheme || 'auto',
          complexity: options.complexity || 'medium'
        }
      });

      if (result.success) {
        return {
          success: true,
          data: {
            patternUrl: result.data.pattern_image_url,
            description,
            variations: result.data.variations || [],
            processingTime: result.data.processing_time
          }
        };
      }

      return result;
    } catch (error) {
      console.error('图案生成失败:', error);
      return {
        success: false,
        message: '图案生成失败',
        error: error.message
      };
    }
  }

  /**
   * 智能修复
   * @param {string} imageUrl - 待修复图片URL
   * @param {Object} options - 修复选项
   * @returns {Promise<Object>} 修复结果
   */
  async smartRepair(imageUrl, options = {}) {
    try {
      const result = await this.callCozeBot(this.cozeConfig.bots.smartRepair, {
        query: '请修复这张图片',
        extra: {
          imageUrl,
          repairType: options.repairType || 'auto',
          preserveOriginal: options.preserveOriginal !== false,
          quality: options.quality || 'high'
        }
      });

      if (result.success) {
        return {
          success: true,
          data: {
            originalUrl: imageUrl,
            repairedUrl: result.data.repaired_image_url,
            repairDetails: result.data.repair_details || [],
            processingTime: result.data.processing_time
          }
        };
      }

      return result;
    } catch (error) {
      console.error('智能修复失败:', error);
      return {
        success: false,
        message: '智能修复失败',
        error: error.message
      };
    }
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

    // 检查Coze智能体
    try {
      const start = Date.now();
      await this.cozeClient.get('/health');
      status.coze.available = true;
      status.coze.latency = Date.now() - start;
    } catch (error) {
      console.warn('Coze智能体不可用:', error.message);
    }

    return status;
  }
}

// 创建单例实例
const aiService = new AIService();

module.exports = aiService;