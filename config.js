const fs = require('fs');
const path = require('path');

const envpath = path.resolve(__dirname, '.env');
if (fs.existsSync(envpath)) {
  const content = fs.readFileSync(envpath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      const commentidx = val.indexOf(' #');
      if (commentidx !== -1) {
        val = val.slice(0, commentidx).trim();
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const rawplatforms = process.env.PLATFORMS;
const parsedplatforms = rawplatforms
  ? rawplatforms
      .toLowerCase()
      .split(',')
      .map((p) => p.trim())
      .filter((p) => ['windows', 'mac', 'ios', 'android'].includes(p))
  : [];

const cfg = {
  token: process.env.TOKEN || '',
  chanid: process.env.CHANNEL_ID || '',
  premsg: process.env.PREMESSAGE || '',
  pollinterval: process.env.POLL_INTERVAL ? parseInt(process.env.POLL_INTERVAL, 10) : NaN,
  embedcolor: process.env.EMBED_COLOR || '',
  platforms: parsedplatforms,
  status: process.env.STATUS || '',
  activitytype: process.env.ACTIVITY_TYPE || '',
  activityname: process.env.ACTIVITY_NAME || '',
  future: (process.env.FUTURE || '').toLowerCase() === 'true',
  reverts: (process.env.REVERTS || '').toLowerCase() === 'true'
};

module.exports = cfg;
