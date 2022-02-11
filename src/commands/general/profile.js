import { Context } from 'telegraf';
import Client from '../../structures/client/Client.js';
import Command from '../../structures/client/Command.js';

export default class ProfileCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor(client) {
    super({
      name: 'profile',
      aliases: ['профиль'],
      category: 'general',
      description: 'Ваш профиль.',
      usage: 'profile',
    });
    this.client = client;
    this.roles = {
      student: 'Студент',
      teacher: 'Преподаватель',
    };
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec(ctx, args) {
    if (args.length && this.client.isOwner(ctx)) {
      const user = await this.client.userManager.getUser(args[0]);
      if (!user) return ctx.replyWithMarkdown('Пользователь не найден.');
      return ctx.replyWithMarkdown(
        `ID: \`${user.id}\`\nГруппа: \`${user.group ? user.group : 'Не выбрана'}\`${
          user.group ? `\nСтатус рассылки: \`${user.autoScheduler ? 'Включена' : 'Выключена'}\`\nКурс: \`${this.client.userManager.calculateCourse(user.group)}\`` : ''
        }`
      );
    }
    const user = await this.client.userManager.getUser(ctx.from.id);
    ctx.replyWithMarkdown(
      `Ваш профиль\n\nID: \`${user.id}\`\nГруппа: \`${user.group ? user.group : 'Не выбрана'}\`${
        user.group ? `\nКурс: \`${this.client.userManager.calculateCourse(user.group)} (${this.client.time.getStudYear()})\`` : ''
      }`
    );
  }
}
