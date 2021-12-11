import { Context } from 'telegraf';
import Client from '../../structures/client/Client.js';
import Command from '../../structures/client/Command.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export default class InformationCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor (client) {
    super({
      name: 'information',
      aliases: ['информация', 'инфо', 'info', 'about'],
      category: 'general',
      description: 'Информация о боте.',
      usage: 'info'
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec (ctx, args) {
    const version = require('../../../package.json').version;
    const userCount = await this.client.userManager.getUserCount();
    ctx.replyWithMarkdown(`Версия: \`v${version}\`\nСписок изменений /changelog\nКоличество пользователей: \`${userCount}\`\n\nРазработчик: [VK](https://vk.com/stavzdev) | [TG](https://t.me/stavzdev)\nИсходный код: [GitHub](https://github.com/StavZ/timetable-telegram-bot)`, { disable_web_page_preview: true, reply_markup: { inline_keyboard: [[{ text: 'VK', url: 'https://vk.com/stavzdev' }, { text: 'TG', url: 'https://t.me/stavzdev' }], [{ text: 'GitHub', url: 'https://github.com/StavZ/timetable-telegram-bot' }]] } });
  }
}
