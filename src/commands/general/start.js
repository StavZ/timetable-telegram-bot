import { Context } from 'telegraf';
import Client from '../../structures/client/Client.js';
import Command from '../../structures/client/Command.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export default class StartCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor (client) {
    super({
      name: 'start',
      aliases: [],
      category: 'general',
      usage: 'start',
      description: 'Стартовая команда бота.',
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec (ctx, args) {
    const user = await this.client.userManager.getUser(ctx.from.id);
    if (!user) await this.client.userManager.createUser(ctx.from.id);
    const version = require('../../../package.json').version;
    ctx.replyWithMarkdown(`Привет!\n\nМоя главная функция - это *автоматическая рассылка расписания* студентам колледжа ППК им. Н.Г. Славянова.\`*\`\n\nВыбрать группу - /selectgroup.\nПоддержка - /support.\nСписок изменений \`v${version} [BETA]\` - /changelog.\nОзнакомится со всеми командами - /help.\nИнформация о данном проекте - /faq.\n\nРазработчик: [VK](https://vk.com/stavzdev) | [TG](https://t.me/stavzdev)\n\n\`*\`_Автоматическая рассылка включается по-умолчанию, когда Вы выберете свою группу.\nЧтобы её отключить - _/autoscheduler.`, { disable_web_page_preview: true });
  }
}
