const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');
const uploadController = require('../controllers/uploadController');

const router = express.Router();

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 创建子目录
const createSubDirs = () => {
  const subDirs = ['avatars', 'posts', 'courses', 'temp'];
  subDirs.forEach(dir => {
    const dirPath = path.join(uploadDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};
createSubDirs();

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.body.type || 'temp';
    let subDir = 'temp';
    
    switch (type) {
      case 'avatar':
        subDir = 'avatars';
        break;
      case 'post':
        subDir = 'posts';
        break;
      case 'course':
        subDir = 'courses';
        break;
      default:
        subDir = 'temp';
    }
    
    const destPath = path.join(uploadDir, subDir);
    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 检查文件类型
  const allowedTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  };
  
  const allAllowedTypes = [...allowedTypes.image, ...allowedTypes.video, ...allowedTypes.document];
  
  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

// 配置multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // 最多5个文件
  },
  fileFilter: fileFilter
});

// 路由定义

// 上传单个图片
router.post('/image', authenticate, upload.single('file'), uploadController.uploadImage);

// 上传多个图片
router.post('/images', authenticate, upload.array('files', 5), uploadController.uploadImages);

// 上传头像
router.post('/avatar', authenticate, upload.single('avatar'), uploadController.uploadAvatar);

// 上传课程相关文件
router.post('/course', authenticate, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'videos', maxCount: 10 },
  { name: 'materials', maxCount: 20 }
]), uploadController.uploadCourseFiles);

// 删除文件
router.delete('/file/:filename', authenticate, uploadController.deleteFile);

// 获取文件信息
router.get('/file/:filename', uploadController.getFileInfo);

module.exports = router;