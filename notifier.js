const discord = require('discord.js');
const cfg = require('./config');

function parsecolor(val) {
  if (!val) return 0x00a2ff;
  const hex = val.replace('#', '').replace('0x', '');
  const num = parseInt(hex, 16);
  return isNaN(num) ? 0x00a2ff : num;
}

function getdownloadurl(platform, hash) {
  if (!hash || !hash.startsWith('version-')) return null;
  const plat = (platform || '').toLowerCase();
  if (plat === 'windows') {
    return 'https://setup.rbxcdn.com/' + hash + '-RobloxApp.zip';
  }
  if (plat === 'mac') {
    return 'https://setup.rbxcdn.com/mac/' + hash + '-RobloxPlayer.zip';
  }
  return null;
}

function makelatestembed(vers) {
  let desc = '### Current Roblox Deployments\n\n';

  desc += '**Desktop Clients**\n';
  if (vers.windows) {
    desc += '> **Windows**\n';
    desc += '• Version: `' + vers.windows.version + '`\n';
    desc += '• Hash: `' + vers.windows.hash + '`\n';
    desc += '• Built: `' + vers.windows.builtat + '`\n\n';
  }
  if (vers.mac) {
    desc += '> **Mac**\n';
    desc += '• Version: `' + vers.mac.version + '`\n';
    desc += '• Hash: `' + vers.mac.hash + '`\n';
    desc += '• Built: `' + vers.mac.builtat + '`\n\n';
  }

  desc += '**Mobile Clients**\n';
  if (vers.ios) {
    desc += '> **iOS**\n';
    desc += '• Version: `' + vers.ios.version + '`\n';
    desc += '• Released: `' + vers.ios.builtat + '`\n\n';
  }
  if (vers.android) {
    desc += '> **Android**\n';
    desc += '• Version: `' + vers.android.version + '`\n';
    desc += '• Released: `' + vers.android.builtat + '`\n';
  }

  return new discord.EmbedBuilder()
    .setColor(parsecolor(cfg.embedcolor))
    .setDescription(desc.trim())
    .setTimestamp();
}

async function sendnotif(bot, ver) {
  try {
    const chan = await bot.channels.fetch(cfg.chanid);
    if (!chan || !chan.isTextBased()) return;

    let headline = '### Roblox Client Update\n';
    if (ver.isfuture) {
      headline = '### Roblox Future Build Detected\n';
    } else if (ver.isrevert) {
      headline = '### Roblox Version Rollback\n';
    }

    let desc = headline;
    desc += '> New update detected for **' + ver.platform + '**.\n\n';
    desc += '**Build Information**\n';
    desc += '• Version: `' + ver.version + '`\n';

    if (ver.hash) {
      desc += '• Build Hash: `' + ver.hash + '`\n';
    }

    desc += '• Timestamp: `' + ver.builtat + '`\n';

    if (ver.prevver || ver.prevhash) {
      desc += '\n**Previous State**\n';
      if (ver.prevver) {
        desc += '• Prior Version: `' + ver.prevver + '`\n';
      }
      if (ver.prevhash) {
        desc += '• Prior Hash: `' + ver.prevhash + '`\n';
      }
    }

    const embed = new discord.EmbedBuilder()
      .setColor(parsecolor(cfg.embedcolor))
      .setDescription(desc.trim())
      .setTimestamp();

    const payload = { embeds: [embed] };

    const dlurl = getdownloadurl(ver.platform, ver.hash);
    if (dlurl) {
      const row = new discord.ActionRowBuilder().addComponents(
        new discord.ButtonBuilder()
          .setLabel('Download Build')
          .setStyle(discord.ButtonStyle.Link)
          .setURL(dlurl)
      );
      payload.components = [row];
    }

    if (cfg.premsg && cfg.premsg.trim().length > 0) {
      payload.content = cfg.premsg;
    }

    await chan.send(payload);
  } catch {}
}

module.exports = { sendnotif, makelatestembed };
