import { Context } from 'telegraf';
import Client from '../../structures/client/Client.js';
import Command from '../../structures/client/Command.js';

export default class StartCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor (client) {
    super({
      name: 'start',
      aliases: [],
      category: 'general',
      ownerOnly: false,
      usage: 'start',
      description: 'Стартовая команда бота.',
      includeInHelp: false,
      path: import.meta.url
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
    ctx.replyWithMarkdown(`Привет!\n\nМоя главная функция - это *автоматическая рассылка расписания* студентам колледжа ППК им. Н.Г. Славянова.\`*\`\n\nЧтобы выбрать группу /selectgroup.\n\nОзнакомится со всеми командами /help.\nРазработчик: [VK](https://vk.com/stavzdev) | [TG](https://t.me/stavzdev)\n\n\`*\`_Автоматическая рассылка включается по-умолчанию, когда Вы выбираете свою группу.\nЧтобы её отключить - _/autoscheduler.`);
  }
}
