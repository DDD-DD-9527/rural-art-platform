const DEFAULT_SUBSIDY_CONFIG = {
  program: {
    headerTitle: '广东省瑶绣制作技能补贴',
    title: '广东省瑶绣制作专项职业能力补贴',
    description: '传承瑶族非物质文化遗产，支持瑶绣制作技能培训与就业创业',
    subsidyStandardAmount: 800,
    subsidyRatioPercent: 100,
    qualifiedTipTitle: '您已通过资格审核',
    qualifiedTipText: '瑶绣制作专项职业能力补贴：¥800 | 非遗传承补助：最高¥2,000',
    courseSectionTitle: '符合瑶绣制作补贴条件的课程',
    historySectionTitle: '我的申请记录'
  },
  steps: [
    { title: '培训报名', description: '报名瑶绣制作技能培训课程' },
    { title: '参加培训', description: '完成规定课时的培训学习' },
    { title: '考核鉴定', description: '参加专项职业能力考核' },
    { title: '申请补贴', description: '提交补贴申请材料' },
    { title: '审核拨付', description: '审核通过后发放补贴' }
  ],
  categories: [
    { value: 'yao-embroidery', label: '瑶绣制作' },
    { value: 'traditional', label: '传统工艺' },
    { value: 'cultural-heritage', label: '非遗传承' }
  ],
  eligibleCourses: [
    {
      id: 1,
      name: '瑶绣制作技艺培训',
      originalPrice: 1200,
      subsidyPrice: 800,
      description:
        '深入学习瑶族传统刺绣技艺，掌握瑶绣的历史文化、制作工艺和现代应用。符合广东省专项职业能力补贴条件。',
      category: 'yao-embroidery',
      rating: 4.9,
      students: 89,
      subsidyType: '专项职业能力补贴',
      certificationName: '广东省瑶绣制作专项职业能力证书'
    },
    {
      id: 2,
      name: '瑶族传统工艺基础',
      originalPrice: 800,
      subsidyPrice: 600,
      description: '学习瑶族传统工艺基础知识，包括工具使用、材料选择和基础技法',
      category: 'traditional',
      rating: 4.7,
      students: 156,
      subsidyType: '非遗传承补助',
      certificationName: '瑶族传统工艺基础证书'
    },
    {
      id: 3,
      name: '瑶绣图案设计与创新',
      originalPrice: 1000,
      subsidyPrice: 750,
      description: '掌握传统瑶绣图案设计原理，学习现代设计思路和创新应用',
      category: 'yao-embroidery',
      rating: 4.8,
      students: 67,
      subsidyType: '文创产品奖励',
      certificationName: '瑶绣图案设计师证书'
    },
    {
      id: 4,
      name: '瑶族文化与非遗传承',
      originalPrice: 600,
      subsidyPrice: 480,
      description: '深入了解瑶族文化背景，学习非遗传承的理论知识和实践方法',
      category: 'cultural-heritage',
      rating: 4.6,
      students: 234,
      subsidyType: '非遗传承补助',
      certificationName: '非遗传承人培训证书'
    },
    {
      id: 5,
      name: '瑶绣产品开发与营销',
      originalPrice: 1500,
      subsidyPrice: 1200,
      description: '学习瑶绣产品的商业化开发，掌握市场营销和品牌推广技巧',
      category: 'yao-embroidery',
      rating: 4.9,
      students: 45,
      subsidyType: '创业扶持补贴',
      certificationName: '瑶绣产品开发师证书'
    },
    {
      id: 6,
      name: '传统手工艺保护与传承',
      originalPrice: 900,
      subsidyPrice: 720,
      description: '学习传统手工艺的保护方法和传承技巧，培养非遗传承意识',
      category: 'cultural-heritage',
      rating: 4.5,
      students: 198,
      subsidyType: '非遗传承补助',
      certificationName: '传统手工艺保护证书'
    }
  ],
  applicationHistorySample: [
    {
      id: 1,
      courseName: '瑶绣制作技艺培训',
      subsidyAmount: 800,
      subsidyType: '专项职业能力补贴',
      applyDate: '2024-02-01',
      status: '已通过',
      certificationName: '广东省瑶绣制作专项职业能力证书'
    },
    {
      id: 2,
      courseName: '瑶族传统工艺基础',
      subsidyAmount: 600,
      subsidyType: '非遗传承补助',
      applyDate: '2024-01-20',
      status: '已通过',
      certificationName: '瑶族传统工艺基础证书'
    },
    {
      id: 3,
      courseName: '瑶绣图案设计与创新',
      subsidyAmount: 750,
      subsidyType: '文创产品奖励',
      applyDate: '2024-02-10',
      status: '审核中',
      certificationName: '瑶绣图案设计师证书'
    }
  ],
  profileCard: {
    title: '瑶绣制作技能补贴',
    leftAmount: 800,
    leftLabel: '专项职业能力补贴',
    rightCount: 5,
    rightLabel: '瑶绣相关课程',
    bullets: [
      '符合广东省瑶绣制作专项职业能力补贴条件',
      '已完成瑶绣制作技艺培训课程'
    ]
  }
};

module.exports = { DEFAULT_SUBSIDY_CONFIG };
