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
        `ID: \`${user.id}\`\nГруппа: \`${user.usergroup ? user.usergroup : 'Не выбрана'}\`${
          user.usergroup ? `\nСтатус рассылки: \`${user.autoscheduler ? 'Включена' : 'Выключена'}\`\nКурс: \`${this.client.userManager.calculateCourse(user.usergroup)}\`` : ''
        }`
      );
    }
    const user = await this.client.userManager.getUser(ctx.from.id);
    ctx.replyWithMarkdown(
      `Ваш профиль\n\nID: \`${user.id}\`\nГруппа: \`${user.usergroup ? user.usergroup : 'Не выбрана'}\`${
        user.usergroup ? `\nКурс: \`${this.client.userManager.calculateCourse(user.usergroup)} (${this.client.time.getStudYear()})\`` : ''
      }`
    );
  }
}
