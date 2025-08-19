const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

// 图片压缩和优化
const optimizeImage = async (filePath, options = {}) => {
  try {
    const { width = 1200, quality = 80 } = options;
    const ext = path.extname(filePath).toLowerCase();
    const outputPath = filePath.replace(ext, '_optimized' + ext);
    
    await sharp(filePath)
      .resize(width, null, { withoutEnlargement: true })
      .jpeg({ quality })
      .toFile(outputPath);
    
    // 删除原文件，重命名优化后的文件
    await unlinkAsync(filePath);
    await fs.promises.rename(outputPath, filePath);
    
    return filePath;
  } catch (error) {
    console.error('图片优化失败:', error);
    return filePath; // 如果优化失败，返回原文件路径
  }
};

// 生成文件URL
const generateFileUrl = (filename, type = 'temp') => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  return `${baseUrl}/uploads/${type}/${filename}`;
};

// 上传单个图片
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '没有上传文件'
      });
    }
    
    const { type = 'temp' } = req.body;
    const file = req.file;
    
    // 如果是图片，进行优化
    if (file.mimetype.startsWith('image/')) {
      await optimizeImage(file.path, {
        width: type === 'avatar' ? 300 : 1200,
        quality: type === 'avatar' ? 90 : 80
      });
    }
    
    const fileUrl = generateFileUrl(file.filename, type);
    
    res.json({
      success: true,
      message: '文件上传成功',
      data: {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: fileUrl,
        type: type
      }
    });
  } catch (error) {
    console.error('上传文件失败:', error);
    res.status(500).json({
      success: false,
      message: '上传文件失败',
      error: error.message
    });
  }
};

// 上传多个图片
const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有上传文件'
      });
    }
    
    const { type = 'temp' } = req.body;
    const files = req.files;
    const uploadedFiles = [];
    
    // 处理每个文件
    for (const file of files) {
      // 如果是图片，进行优化
      if (file.mimetype.startsWith('image/')) {
        await optimizeImage(file.path, {
          width: 1200,
          quality: 80
        });
      }
      
      const fileUrl = generateFileUrl(file.filename, type);
      
      uploadedFiles.push({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: fileUrl,
        type: type
      });
    }
    
    res.json({
      success: true,
      message: `成功上传${files.length}个文件`,
      data: uploadedFiles
    });
  } catch (error) {
    console.error('批量上传文件失败:', error);
    res.status(500).json({
      success: false,
      message: '批量上传文件失败',
      error: error.message
    });
  }
};

// 上传头像
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '没有上传头像文件'
      });
    }
    
    const file = req.file;
    
    // 头像特殊处理：裁剪为正方形
    if (file.mimetype.startsWith('image/')) {
      const outputPath = file.path.replace(path.extname(file.path), '_avatar.jpg');
      
      await sharp(file.path)
        .resize(300, 300, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 90 })
        .toFile(outputPath);
      
      // 删除原文件，重命名处理后的文件
      await unlinkAsync(file.path);
      await fs.promises.rename(outputPath, file.path);
    }
    
    const fileUrl = generateFileUrl(file.filename, 'avatars');
    
    res.json({
      success: true,
      message: '头像上传成功',
      data: {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: fileUrl,
        type: 'avatar'
      }
    });
  } catch (error) {
    console.error('上传头像失败:', error);
    res.status(500).json({
      success: false,
      message: '上传头像失败',
      error: error.message
    });
  }
};

// 上传课程相关文件
const uploadCourseFiles = async (req, res) => {
  try {
    const files = req.files;
    const uploadedFiles = {
      thumbnail: null,
      videos: [],
      materials: []
    };
    
    // 处理缩略图
    if (files.thumbnail && files.thumbnail[0]) {
      const thumbnailFile = files.thumbnail[0];
      await optimizeImage(thumbnailFile.path, {
        width: 800,
        quality: 85
      });
      
      uploadedFiles.thumbnail = {
        filename: thumbnailFile.filename,
        originalName: thumbnailFile.originalname,
        mimetype: thumbnailFile.mimetype,
        size: thumbnailFile.size,
        url: generateFileUrl(thumbnailFile.filename, 'courses'),
        type: 'thumbnail'
      };
    }
    
    // 处理视频文件
    if (files.videos) {
      for (const videoFile of files.videos) {
        uploadedFiles.videos.push({
          filename: videoFile.filename,
          originalName: videoFile.originalname,
          mimetype: videoFile.mimetype,
          size: videoFile.size,
          url: generateFileUrl(videoFile.filename, 'courses'),
          type: 'video'
        });
      }
    }
    
    // 处理课程材料
    if (files.materials) {
      for (const materialFile of files.materials) {
        uploadedFiles.materials.push({
          filename: materialFile.filename,
          originalName: materialFile.originalname,
          mimetype: materialFile.mimetype,
          size: materialFile.size,
          url: generateFileUrl(materialFile.filename, 'courses'),
          type: 'material'
        });
      }
    }
    
    res.json({
      success: true,
      message: '课程文件上传成功',
      data: uploadedFiles
    });
  } catch (error) {
    console.error('上传课程文件失败:', error);
    res.status(500).json({
      success: false,
      message: '上传课程文件失败',
      error: error.message
    });
  }
};

// 删除文件
const deleteFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const { type = 'temp' } = req.query;
    
    const filePath = path.join(__dirname, '../../uploads', type, filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }
    
    // 删除文件
    await unlinkAsync(filePath);
    
    res.json({
      success: true,
      message: '文件删除成功'
    });
  } catch (error) {
    console.error('删除文件失败:', error);
    res.status(500).json({
      success: false,
      message: '删除文件失败',
      error: error.message
    });
  }
};

// 获取文件信息
const getFileInfo = async (req, res) => {
  try {
    const { filename } = req.params;
    const { type = 'temp' } = req.query;
    
    const filePath = path.join(__dirname, '../../uploads', type, filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }
    
    // 获取文件统计信息
    const stats = await fs.promises.stat(filePath);
    const fileUrl = generateFileUrl(filename, type);
    
    res.json({
      success: true,
      data: {
        filename: filename,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        url: fileUrl,
        type: type
      }
    });
  } catch (error) {
    console.error('获取文件信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取文件信息失败',
      error: error.message
    });
  }
};

module.exports = {
  uploadImage,
  uploadImages,
  uploadAvatar,
  uploadCourseFiles,
  deleteFile,
  getFileInfo
};