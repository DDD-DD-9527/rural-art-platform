const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const { validationResult } = require('express-validator');

// 获取课程列表
const getCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category = '',
      difficulty = '',
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isPublished = true
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 构建查询条件
    let query = {};
    
    if (isPublished !== 'false') {
      query['settings.isPublished'] = true;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    // 构建排序条件
    const sort = {};
    if (search) {
      sort.score = { $meta: 'textScore' };
    } else {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // 查询课程
    const courses = await Course.find(query)
      .populate('creator', 'username profile.nickname profile.avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-lessons.steps -lessons.materials'); // 列表页不返回详细内容

    // 获取总数
    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取课程列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取课程列表失败'
    });
  }
};

// 获取课程详情
const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId)
      .populate('creator', 'username profile.nickname profile.avatar profile.bio');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    // 如果课程未发布，只有创作者和管理员可以查看
    if (!course.settings.isPublished) {
      if (!req.user || 
          (req.user._id.toString() !== course.creator._id.toString() && 
           req.user.role !== 'admin')) {
        return res.status(403).json({
          success: false,
          message: '课程暂未发布'
        });
      }
    }

    // 增加浏览量
    await course.incrementViewCount();

    res.json({
      success: true,
      data: {
        course
      }
    });
  } catch (error) {
    console.error('获取课程详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取课程详情失败'
    });
  }
};

// 创建课程
const createCourse = async (req, res) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('课程创建验证失败:', {
        errors: errors.array(),
        requestBody: req.body
      });
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.array()
      });
    }

    const courseData = {
      ...req.body,
      creator: req.user._id
    };

    const course = new Course(courseData);
    await course.save();

    // 填充创作者信息
    await course.populate('creator', 'username profile.nickname profile.avatar');

    res.status(201).json({
      success: true,
      message: '课程创建成功',
      data: {
        course
      }
    });
  } catch (error) {
    console.error('创建课程错误:', error);
    res.status(500).json({
      success: false,
      message: '创建课程失败'
    });
  }
};

// 更新课程
const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入验证失败',
        errors: errors.array()
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    // 检查权限
    if (course.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，只能修改自己的课程'
      });
    }

    // 更新课程
    Object.assign(course, req.body);
    course.updatedAt = new Date();
    await course.save();

    // 填充创作者信息
    await course.populate('creator', 'username profile.nickname profile.avatar');

    res.json({
      success: true,
      message: '课程更新成功',
      data: {
        course
      }
    });
  } catch (error) {
    console.error('更新课程错误:', error);
    res.status(500).json({
      success: false,
      message: '更新课程失败'
    });
  }
};

// 删除课程
const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    // 检查权限
    if (course.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，只能删除自己的课程'
      });
    }

    await Course.findByIdAndDelete(courseId);

    res.json({
      success: true,
      message: '课程删除成功'
    });
  } catch (error) {
    console.error('删除课程错误:', error);
    res.status(500).json({
      success: false,
      message: '删除课程失败'
    });
  }
};

// 发布课程
const publishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    // 检查权限
    if (course.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，只能发布自己的课程'
      });
    }

    // 检查课程是否完整
    if (!course.lessons || course.lessons.length === 0) {
      return res.status(400).json({
        success: false,
        message: '课程必须包含至少一个课时才能发布'
      });
    }

    course.publish();
    await course.save();

    res.json({
      success: true,
      message: '课程发布成功',
      data: {
        course
      }
    });
  } catch (error) {
    console.error('发布课程错误:', error);
    res.status(500).json({
      success: false,
      message: '发布课程失败'
    });
  }
};

// 取消发布课程
const unpublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    // 检查权限
    if (course.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足，只能操作自己的课程'
      });
    }

    course.unpublish();
    await course.save();

    res.json({
      success: true,
      message: '课程已取消发布',
      data: {
        course
      }
    });
  } catch (error) {
    console.error('取消发布课程错误:', error);
    res.status(500).json({
      success: false,
      message: '取消发布课程失败'
    });
  }
};

// 获取热门课程
const getPopularCourses = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const courses = await Course.getPopularCourses(parseInt(limit));
    
    res.json({
      success: true,
      data: {
        courses
      }
    });
  } catch (error) {
    console.error('获取热门课程错误:', error);
    res.status(500).json({
      success: false,
      message: '获取热门课程失败'
    });
  }
};

// 获取推荐课程
const getRecommendedCourses = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user?._id;
    
    // 简单的推荐逻辑：基于用户学习历史和热门课程
    let courses;
    
    if (userId) {
      // 已登录用户：基于学习历史推荐
      courses = await Course.find({
        'settings.isPublished': true
      })
      .populate('creator', 'username profile.nickname profile.avatar')
      .sort({ 'stats.rating.average': -1, 'stats.enrolledCount': -1 })
      .limit(parseInt(limit))
      .select('-lessons.steps -lessons.materials');
    } else {
      // 未登录用户：推荐热门课程
      courses = await Course.getPopularCourses(parseInt(limit));
    }
    
    res.json({
      success: true,
      data: {
        courses
      }
    });
  } catch (error) {
    console.error('获取推荐课程错误:', error);
    res.status(500).json({
      success: false,
      message: '获取推荐课程失败'
    });
  }
};

// 报名课程
const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // 检查课程是否存在
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    // 检查课程是否已发布
    if (!course.settings.isPublished) {
      return res.status(400).json({
        success: false,
        message: '课程暂未发布，无法报名'
      });
    }

    // 检查是否已经报名
    const existingEnrollment = await Enrollment.findOne({
      student: userId,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: '您已经报名了这门课程'
      });
    }

    // 创建报名记录
    const enrollment = new Enrollment({
      student: userId,
      course: courseId,
      status: 'enrolled'
    });

    await enrollment.save();

    // 更新课程报名统计
    await Course.findByIdAndUpdate(courseId, {
      $inc: { 'stats.enrolledCount': 1 }
    });

    // 填充课程信息
    await enrollment.populate('course', 'title thumbnail category difficulty');

    res.status(201).json({
      success: true,
      message: '报名成功',
      data: {
        enrollment
      }
    });
  } catch (error) {
    console.error('课程报名错误:', error);
    res.status(500).json({
      success: false,
      message: '课程报名失败'
    });
  }
};

// 更新学习进度
const updateProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonId, timeSpent = 0 } = req.body;
    const userId = req.user._id;

    // 验证输入
    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: '课时ID不能为空'
      });
    }

    // 查找报名记录
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: courseId
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: '您尚未报名此课程'
      });
    }

    // 验证课时是否属于该课程
    const course = await Course.findById(courseId);
    const lesson = course.lessons.find(l => l._id.toString() === lessonId);
    
    if (!lesson) {
      return res.status(400).json({
        success: false,
        message: '课时不存在'
      });
    }

    // 更新学习进度
    await enrollment.updateProgress(lessonId, timeSpent);
    await enrollment.calculateProgress();

    // 如果课程完成，自动颁发证书
    if (enrollment.status === 'completed') {
      await enrollment.issueCertificate();
      
      // 更新课程完成统计
      await Course.findByIdAndUpdate(courseId, {
        $inc: { 'stats.completedCount': 1 }
      });
    }

    res.json({
      success: true,
      message: '学习进度更新成功',
      data: {
        progress: enrollment.progress,
        status: enrollment.status,
        certificate: enrollment.certificate
      }
    });
  } catch (error) {
    console.error('更新学习进度错误:', error);
    res.status(500).json({
      success: false,
      message: '更新学习进度失败'
    });
  }
};

// 获取学习进度
const getProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // 查找报名记录
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: courseId
    }).populate('course', 'title lessons');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: '您尚未报名此课程'
      });
    }

    res.json({
      success: true,
      data: {
        enrollment: {
          status: enrollment.status,
          progress: enrollment.progress,
          notes: enrollment.notes,
          review: enrollment.review,
          certificate: enrollment.certificate,
          enrolledAt: enrollment.enrolledAt,
          completedAt: enrollment.completedAt
        }
      }
    });
  } catch (error) {
    console.error('获取学习进度错误:', error);
    res.status(500).json({
      success: false,
      message: '获取学习进度失败'
    });
  }
};

// 获取用户的课程报名列表
const getUserEnrollments = async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 20,
      sortBy = 'enrolledAt',
      sortOrder = 'desc'
    } = req.query;
    const userId = req.user._id;

    const enrollments = await Enrollment.getUserEnrollments(userId, {
      status,
      page,
      limit,
      sortBy,
      sortOrder
    });

    const total = await Enrollment.countDocuments({
      student: userId,
      ...(status && { status })
    });

    res.json({
      success: true,
      data: {
        enrollments,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取用户课程报名列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取课程报名列表失败'
    });
  }
};

// 获取课程的报名学员列表（仅课程创作者和管理员可访问）
const getCourseEnrollments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      status,
      page = 1,
      limit = 20,
      sortBy = 'enrolledAt',
      sortOrder = 'desc'
    } = req.query;

    // 检查权限
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    if (req.user.role !== 'admin' && 
        req.user._id.toString() !== course.creator.toString()) {
      return res.status(403).json({
        success: false,
        message: '无权访问此信息'
      });
    }

    const enrollments = await Enrollment.getCourseEnrollments(courseId, {
      status,
      page,
      limit,
      sortBy,
      sortOrder
    });

    const total = await Enrollment.countDocuments({
      course: courseId,
      ...(status && { status })
    });

    res.json({
      success: true,
      data: {
        enrollments,
        pagination: {
          current: parseInt(page),
          pageSize: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取课程报名学员列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取报名学员列表失败'
    });
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  unpublishCourse,
  getPopularCourses,
  getRecommendedCourses,
  enrollCourse,
  updateProgress,
  getProgress,
  getUserEnrollments,
  getCourseEnrollments
};