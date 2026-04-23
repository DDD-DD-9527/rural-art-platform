const SubsidyConfig = require('../models/SubsidyConfig');
const { DEFAULT_SUBSIDY_CONFIG } = require('../config/subsidyDefault');

const ensureConfig = async () => {
  const existing = await SubsidyConfig.findOne({ key: 'default' }).lean();
  if (existing && existing.config) return existing;

  const created = await SubsidyConfig.create({
    key: 'default',
    config: DEFAULT_SUBSIDY_CONFIG
  });
  return created.toObject();
};

exports.getSubsidyConfigPublic = async (req, res) => {
  try {
    const doc = await ensureConfig();
    res.json({
      success: true,
      data: {
        config: doc.config
      }
    });
  } catch (error) {
    console.error('获取技能补贴配置失败:', error);
    res.status(500).json({
      success: false,
      message: '获取技能补贴配置失败'
    });
  }
};

exports.getSubsidyConfigAdmin = async (req, res) => {
  try {
    const doc = await ensureConfig();
    res.json({
      success: true,
      data: {
        key: doc.key,
        config: doc.config,
        updatedAt: doc.updatedAt,
        createdAt: doc.createdAt
      }
    });
  } catch (error) {
    console.error('管理员获取技能补贴配置失败:', error);
    res.status(500).json({
      success: false,
      message: '获取技能补贴配置失败'
    });
  }
};

exports.updateSubsidyConfigAdmin = async (req, res) => {
  try {
    const { config } = req.body;
    if (!config || typeof config !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'config 必须是对象'
      });
    }

    const updated = await SubsidyConfig.findOneAndUpdate(
      { key: 'default' },
      { $set: { config } },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    res.json({
      success: true,
      data: {
        key: updated.key,
        config: updated.config,
        updatedAt: updated.updatedAt,
        createdAt: updated.createdAt
      }
    });
  } catch (error) {
    console.error('管理员更新技能补贴配置失败:', error);
    res.status(500).json({
      success: false,
      message: '更新技能补贴配置失败'
    });
  }
};

