const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticate } = require('../middleware/auth');
const aiService = require('../services/aiService');

const router = express.Router();

// 配置multer用于文件上传
const upload = multer({
  dest: 'uploads/temp/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // 只允许图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'), false);
    }
  }
});

/**
 * 图片增强接口 - 临时移除认证用于测试
 * POST /api/ai/enhance-image
 */
router.post('/enhance-image', upload.single('image'), async (req, res) => {
  try {
    console.log('收到图片增强请求:', {
      file: req.file ? req.file.filename : 'no file',
      enhanceType: req.body.enhanceType,
      userId: req.user?.id || 'anonymous',
      origin: req.get('origin')
    });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请上传图片文件'
      });
    }

    // 构建图片URL
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/temp/${req.file.filename}`;
    
    // 调用AI服务进行图片增强
    const result = await aiService.enhanceImage(imageUrl, {
      enhanceType: req.body.enhanceType || 'quality',
      preserveStyle: req.body.preserveStyle !== 'false',
      format: 'png'
    });

    if (result.success) {
      res.json({
        success: true,
        message: '图片增强成功',
        data: {
          originalUrl: imageUrl,
          enhancedUrl: result.data.enhancedUrl,
          suggestion: result.data.suggestion,
          conversation_id: result.data.conversation_id
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message || '图片增强失败',
        error: result.error
      });
    }

  } catch (error) {
    console.error('图片增强接口错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

/**
 * 风格转换接口
 * POST /api/ai/style-transfer
 */
router.post('/style-transfer', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请上传图片文件'
      });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/temp/${req.file.filename}`;
    const styleType = req.body.style || '传统中国画';

    const result = await aiService.transferStyle(imageUrl, styleType, {
      intensity: parseFloat(req.body.intensity) || 0.8,
      preserveContent: req.body.preserveContent !== 'false'
    });

    if (result.success) {
      res.json({
        success: true,
        message: '风格转换成功',
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message || '风格转换失败',
        error: result.error
      });
    }

  } catch (error) {
    console.error('风格转换接口错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

/**
 * 图案生成接口
 * POST /api/ai/pattern-generate
 */
router.post('/pattern-generate', async (req, res) => {
  try {
    const { description, style, size, colorScheme, complexity } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: '请提供图案描述'
      });
    }

    const result = await aiService.generatePattern(description, {
      style: style || 'traditional',
      size: size || 'medium',
      colorScheme: colorScheme || 'auto',
      complexity: complexity || 'medium'
    });

    if (result.success) {
      res.json({
        success: true,
        message: '图案生成成功',
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message || '图案生成失败',
        error: result.error
      });
    }

  } catch (error) {
    console.error('图案生成接口错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

/**
 * 智能修复接口
 * POST /api/ai/smart-repair
 */
router.post('/smart-repair', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请上传图片文件'
      });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/temp/${req.file.filename}`;

    const result = await aiService.smartRepair(imageUrl, {
      repairType: req.body.repairType || 'auto',
      preserveOriginal: req.body.preserveOriginal !== 'false',
      quality: req.body.quality || 'high'
    });

    if (result.success) {
      res.json({
        success: true,
        message: '智能修复成功',
        data: result.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message || '智能修复失败',
        error: result.error
      });
    }

  } catch (error) {
    console.error('智能修复接口错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
});

/**
 * AI服务状态检查
 * GET /api/ai/status
 */
router.get('/status', async (req, res) => {
  try {
    const status = await aiService.checkServiceStatus();
    
    res.json({
      success: true,
      message: 'AI服务状态查询成功',
      data: status
    });

  } catch (error) {
    console.error('AI服务状态检查错误:', error);
    res.status(500).json({
      success: false,
      message: '状态检查失败',
      error: error.message
    });
  }
});

module.exports = router;
