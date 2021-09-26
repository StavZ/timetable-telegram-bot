import { Context } from 'telegraf';
import Client from '../../structures/client/Client.js';
import Command from '../../structures/client/Command.js';

export default class ProfileCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor (client) {
    super({
      name: 'profile',
      aliases: ['профиль'],
      category: 'general',
      ownerOnly: false,
      description: 'Ваш профиль.',
      includeInHelp: true,
      usage: 'profile',
      path: import.meta.url
    });
    this.client = client;
    this.roles = {
      'student': 'Студент',
      'teacher': 'Преподаватель'
    };
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec (ctx, args) {
    if (args.length && this.client.isOwner(ctx)) {
      const user = await this.client.userManager.getUser(args[0]);
      return ctx.replyWithMarkdown(`ID: \`${user.id}\`\nВыбранная группа: \`${user.group ? user.group : 'Не выбрана'}\`\nРоль: \`${this.roles[user.role]}\``);
    }
    const user = await this.client.userManager.getUser(ctx.from.id);
    ctx.replyWithMarkdown(`Профиль @${ctx.from.username ? ctx.from.username : ctx.from.first_name}\n\nID: \`${user.id}\`\nВыбранная группа: \`${user.group ? user.group : 'Не выбрана'}\`\nРоль: \`${this.roles[user.role]}\``);
  }
}
