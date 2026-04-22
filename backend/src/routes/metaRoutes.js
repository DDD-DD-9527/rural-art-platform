const express = require('express');
const {
  COURSE_CATEGORIES,
  COURSE_DIFFICULTIES,
  COURSE_CATEGORY_GROUPS
} = require('../config/courseMeta');
 
const router = express.Router();
 
router.get('/courses', (req, res) => {
  res.json({
    success: true,
    data: {
      categories: COURSE_CATEGORIES,
      difficulties: COURSE_DIFFICULTIES,
      categoryGroups: COURSE_CATEGORY_GROUPS
    }
  });
});
 
module.exports = router;
