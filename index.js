const discord = require('discord.js');
const cfg = require('./config');
const roblox = require('./roblox');
const tracker = require('./tracker');
const cli = require('./cli');
const commands = require('./commands');

function getacttype(typestr) {
  const map = {
    playing: discord.ActivityType.Playing,
    listening: discord.ActivityType.Listening,
    watching: discord.ActivityType.Watching,
    competing: discord.ActivityType.Competing
  };
  return map[(typestr || '').toLowerCase()] ?? discord.ActivityType.Watching;
}

function getstatus(statusstr) {
  const map = {
    dnd: 'dnd',
    idle: 'idle',
    online: 'online',
    offline: 'invisible',
    invisible: 'invisible'
  };
  return map[(statusstr || '').toLowerCase()] || 'online';
}

const bot = new discord.Client({
  intents: [
    discord.GatewayIntentBits.Guilds,
    discord.GatewayIntentBits.GuildMessages
  ]
});

bot.once('clientReady', async () => {
  bot.user.setPresence({
    status: getstatus(cfg.status),
    activities: [
      {
        name: cfg.activityname,
        type: getacttype(cfg.activitytype)
      }
    ]
  });

  await commands.initcmds(bot);

  const vers = await roblox.fetchall();
  if (vers.windows && vers.windows.hash) {
    console.log('Windows: ' + vers.windows.hash);
  }
  if (vers.mac && vers.mac.hash) {
    console.log('Mac: ' + vers.mac.hash);
  }
  if (vers.ios && vers.ios.version) {
    console.log('iOS: ' + vers.ios.version);
  }
  if (vers.android && vers.android.version) {
    console.log('Android: ' + vers.android.version);
  }

  tracker.starttracker(bot, vers);
  cli.startcli(bot);
});

bot.login(cfg.token);
