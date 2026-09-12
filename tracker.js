const cfg = require('./config');
const roblox = require('./roblox');
const notifier = require('./notifier');

const lastvers = {
  windows: null,
  mac: null,
  ios: null,
  android: null
};

let lastfuture = null;

function semvercmp(a, b) {
  const pa = (a || '').split('.').map(Number);
  const pb = (b || '').split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

async function rblxupd(bot) {
  const curvers = await roblox.fetchall();

  for (const key of cfg.platforms) {
    const cur = curvers[key];
    if (!cur || !cur.version) continue;

    if (lastvers[key] && (cur.version !== lastvers[key].version || cur.hash !== lastvers[key].hash)) {
      const prev = lastvers[key];
      const isrev = semvercmp(cur.version, prev.version) < 0;

      lastvers[key] = cur;

      if (isrev) {
        if (cfg.reverts) {
          await notifier.sendnotif(bot, { ...cur, prevver: prev.version, prevhash: prev.hash, isrevert: true });
        }
      } else {
        await notifier.sendnotif(bot, { ...cur, prevver: prev.version, prevhash: prev.hash });
      }
    } else if (!lastvers[key]) {
      lastvers[key] = cur;
    }
  }

  if (cfg.future) {
    const futurebuilds = await roblox.fetchfuture();
    for (const fb of futurebuilds) {
      if (fb.hash && fb.hash !== 'Unknown' && lastfuture && fb.hash !== lastfuture) {
        lastfuture = fb.hash;
        await notifier.sendnotif(bot, fb);
      } else if (!lastfuture && fb.hash) {
        lastfuture = fb.hash;
      }
    }
  }
}

function starttracker(bot, initvers) {
  if (initvers) {
    for (const key of ['windows', 'mac', 'ios', 'android']) {
      if (initvers[key]) lastvers[key] = initvers[key];
    }
  }
  setInterval(() => rblxupd(bot), cfg.pollinterval);
}

module.exports = { rblxupd, starttracker };
