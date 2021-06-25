const { Context } = require('telegraf');
const Client = require('../../structures/client/Client');
const Command = require('../../structures/client/Command');

class InformationCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor (client) {
    super({
      name: 'информация',
      aliases: ['о-боте', 'about'],
      category: 'general',
      ownerOnly: false,
      description: 'Информация о боте.',
      includeInHelp: true,
      path: __filename
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec (ctx, args) {
    ctx.replyWithMarkdown(`Версия: \`v${require('../../../package.json').version}\`\nРазработчик: [ВК](https://vk.com/stavzdev) | @StavZDev\nИсходный код: [GitHub](https://github.com/StavZ/timetable-telegram-bot)`, { disable_web_page_preview: true });
  }
}
module.exports = InformationCommand;
