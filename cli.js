const readline = require('readline');
const roblox = require('./roblox');
const notifier = require('./notifier');

function startcli(bot) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.setPrompt('console: ');
  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    if (input.startsWith('.test')) {
      const parts = input.split(' ');
      const target = (parts[1] || '').toLowerCase();

      if (['windows', 'mac', 'ios', 'android'].includes(target)) {
        const ver = await roblox.fetchver(target);
        if (ver) await notifier.sendnotif(bot, ver);
      }
    }
    rl.prompt();
  });
}

module.exports = { startcli };
