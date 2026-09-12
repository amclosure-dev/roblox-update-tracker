const discord = require('discord.js');
const roblox = require('./roblox');
const notifier = require('./notifier');

async function initcmds(bot) {
  try {
    const cmds = [
      new discord.SlashCommandBuilder()
        .setName('latest')
        .setDescription('Displays the latest Roblox build for every device')
    ];

    await bot.application.commands.set(cmds);
  } catch {}

  bot.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'latest') {
      const vers = await roblox.fetchall();
      const embed = notifier.makelatestembed(vers);
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  });
}

module.exports = { initcmds };
