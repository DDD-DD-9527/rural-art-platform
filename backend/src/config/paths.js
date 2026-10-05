const path = require('path');
const { UPLOAD_CONFIG } = require('./constants');

const UPLOAD_ROOT = path.isAbsolute(UPLOAD_CONFIG.UPLOAD_DIR)
  ? UPLOAD_CONFIG.UPLOAD_DIR
  : path.resolve(__dirname, '../..', UPLOAD_CONFIG.UPLOAD_DIR);

module.exports = { UPLOAD_ROOT };
