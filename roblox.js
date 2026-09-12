const endpoints = {
  windows: 'https://clientsettingscdn.roblox.com/v2/client-version/WindowsPlayer',
  mac: 'https://clientsettingscdn.roblox.com/v2/client-version/MacPlayer',
  mobile: 'https://itunes.apple.com/lookup?bundleId=com.roblox.robloxmobile',
  dhwin: 'https://setup.rbxcdn.com/DeployHistory.txt',
  dhmac: 'https://setup.rbxcdn.com/mac/DeployHistory.txt'
};

async function fetchlogs() {
  try {
    const [wintxt, mactxt] = await Promise.all([
      fetch(endpoints.dhwin).then((r) => (r.ok ? r.text() : '')),
      fetch(endpoints.dhmac).then((r) => (r.ok ? r.text() : ''))
    ]);
    return { wintxt, mactxt };
  } catch {
    return { wintxt: '', mactxt: '' };
  }
}

function parsedh(txt, matchstr) {
  if (!txt) return { date: 'Unknown', ver: '', hash: '' };
  const lines = txt.split('\n').filter((l) => l.includes(matchstr));
  const lastline = lines[lines.length - 1] || '';
  const datem = lastline.match(/at\s+([^,]+),/);
  const verm = lastline.match(/git hash:\s*([^\s]+)/) || lastline.match(/file version:\s*([^\s,]+,\s*[^\s,]+,\s*[^\s,]+,\s*[^\s,]+)/);
  const hashm = lastline.match(/New\s+\S+\s+(version-[a-f0-9]+)/i);

  let verval = '';
  if (verm) {
    verval = verm[1].replace(/\s+/g, '').replace(/,/g, '.');
  }

  return {
    date: datem ? datem[1] : 'Unknown',
    ver: verval,
    hash: hashm ? hashm[1] : ''
  };
}

async function fetchver(platform) {
  try {
    const logs = await fetchlogs();

    if (platform === 'windows') {
      const res = await fetch(endpoints.windows);
      if (!res.ok) return null;
      const data = await res.json();
      const dh = parsedh(logs.wintxt, 'WindowsPlayer');
      return {
        platform: 'Windows',
        version: data.version || dh.ver || 'Unknown',
        hash: data.clientVersionUpload || dh.hash || 'Unknown',
        builtat: dh.date
      };
    }

    if (platform === 'mac') {
      const res = await fetch(endpoints.mac);
      if (!res.ok) return null;
      const data = await res.json();
      const dh = parsedh(logs.mactxt, 'Client');
      return {
        platform: 'Mac',
        version: data.version || dh.ver || 'Unknown',
        hash: data.clientVersionUpload || dh.hash || 'Unknown',
        builtat: dh.date
      };
    }

    if (platform === 'ios' || platform === 'android') {
      const res = await fetch(endpoints.mobile);
      if (!res.ok) return null;
      const data = await res.json();
      const item = data.results && data.results[0];
      if (!item) return null;
      const platname = platform === 'ios' ? 'iOS' : 'Android';
      const reldate = item.currentVersionReleaseDate
        ? new Date(item.currentVersionReleaseDate).toLocaleString('en-US', { timeZone: 'UTC' }) + ' UTC'
        : 'Unknown';
      return {
        platform: platname,
        version: item.version || 'Unknown',
        hash: null,
        builtat: reldate
      };
    }

    return null;
  } catch {
    return null;
  }
}

async function fetchall() {
  const [win, mac, ios, android] = await Promise.all([
    fetchver('windows'),
    fetchver('mac'),
    fetchver('ios'),
    fetchver('android')
  ]);
  return { windows: win, mac: mac, ios: ios, android: android };
}

async function fetchfuture() {
  try {
    const logs = await fetchlogs();
    const list = [];
    if (logs.wintxt) {
      const lines = logs.wintxt.split('\n').filter((l) => l.includes('Studio64') || l.includes('WindowsPlayer'));
      const last = lines[lines.length - 1];
      if (last) {
        const datem = last.match(/at\s+([^,]+),/);
        const verm = last.match(/git hash:\s*([^\s]+)/);
        const hashm = last.match(/(version-[a-f0-9]+)/i);
        list.push({
          platform: 'Windows',
          version: verm ? verm[1] : 'Unknown',
          hash: hashm ? hashm[1] : 'Unknown',
          builtat: datem ? datem[1] : 'Unknown',
          isfuture: true
        });
      }
    }
    return list;
  } catch {
    return [];
  }
}

module.exports = { fetchver, fetchall, fetchfuture };
