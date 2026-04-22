const COURSE_CATEGORIES = [
  { value: 'traditional-crafts', label: '传统工艺' },
  { value: 'painting', label: '绘画艺术' },
  { value: 'sculpture', label: '雕塑艺术' },
  { value: 'textile', label: '纺织/刺绣' },
  { value: 'pottery', label: '陶艺制作' },
  { value: 'woodwork', label: '木工工艺' },
  { value: 'paper-art', label: '纸艺剪纸' },
  { value: 'folk-art', label: '民俗艺术' },
  { value: 'calligraphy', label: '书法艺术' },
  { value: 'other', label: '数字技能' }
];
 
const COURSE_DIFFICULTIES = [
  { value: 'beginner', label: '初级' },
  { value: 'intermediate', label: '中级' },
  { value: 'advanced', label: '高级' }
];
 
const COURSE_CATEGORY_GROUPS = [
  {
    id: 'all',
    label: '全部',
    categories: COURSE_CATEGORIES.map(c => c.value)
  },
  {
    id: 'art',
    label: '艺术教育',
    categories: [
      'traditional-crafts',
      'painting',
      'sculpture',
      'textile',
      'pottery',
      'woodwork',
      'paper-art',
      'folk-art',
      'calligraphy'
    ]
  },
  {
    id: 'digital',
    label: '数字技能',
    categories: ['other']
  }
];
 
module.exports = {
  COURSE_CATEGORIES,
  COURSE_DIFFICULTIES,
  COURSE_CATEGORY_GROUPS
};
