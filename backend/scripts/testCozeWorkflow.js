const fs = require('fs');
const path = require('path');
const axios = require('axios');

function extractFirstMatch(text, regex) {
  const match = text.match(regex);
  if (!match) return null;
  return match[1] || match[0] || null;
}

function loadRunUrlFromDocs() {
  const candidates = [
    path.resolve(__dirname, '../../实际coze工作流调用.md'),
    path.resolve(__dirname, '../../coze对接文档.md'),
  ];

  for (const p of candidates) {
    if (!fs.existsSync(p)) continue;
    const text = fs.readFileSync(p, 'utf8');
    const url = extractFirstMatch(text, /(https?:\/\/[^\s'"]+coze\.site\/run)/i);
    if (url) return url;
  }
  return null;
}

function loadTokenFromDocs() {
  return null;
}

async function main() {
  const runUrl = process.env.COZE_WORKFLOW_RUN_URL || loadRunUrlFromDocs();
  if (!runUrl) {
    throw new Error('Missing COZE_WORKFLOW_RUN_URL (or cannot infer from docs)');
  }

  const token = process.env.COZE_WORKFLOW_TOKEN || loadTokenFromDocs();
  if (!token) {
    throw new Error('Missing COZE_WORKFLOW_TOKEN');
  }

  const payload = {
    tool_id: 'generate',
    input: {
      text: '传统祥云纹样，适合用于中式包装设计',
      options: {
        elements: ['祥云', '如意纹'],
        style: 'traditional',
        color_scheme: 'red_gold',
        num_results: 1,
      },
    },
  };

  const res = await axios.post(runUrl, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    timeout: 120000,
    validateStatus: () => true,
  });

  const preview = typeof res.data === 'string' ? res.data.slice(0, 500) : res.data;
  console.log(JSON.stringify({ status: res.status, data: preview }, null, 2));
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exitCode = 1;
});
