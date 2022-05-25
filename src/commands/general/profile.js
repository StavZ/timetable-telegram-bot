import { Context } from 'telegraf';
import TelegrafClient from '../../structures/client/Client.js';
import Command from '../../structures/models/Command.js';

export default class Profile extends Command {
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    super({
      name: 'profile',
      aliases: [],
      description: 'Профиль',
      priority: false
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec(ctx, args) {
    if (args.length && this.client.isOwner(ctx)) {
      const user = await this.client.users.get(Number(args[0]));
      if (!user) return ctx.replyWithMarkdown(`Пользователь \`${args[0]}\` не найден.`);
      return ctx.replyWithMarkdown(
        `ID: \`${user.id}\`${user.regDate ? `\nДата регистрации: \`${this.client.moment(new Date(Number(user.regDate))).format('DD-MM-YY')}\`` : ''}\nГруппа: \`${
          user.group ? user.group : 'Не указана'
        }\`\n${user.group ? `Курс: \`${this.client.time.getCourse(user.group)} (${this.client.time.getStudYear()})\`` : ''}\nСтатус рассылки: \`${user.autoScheduler ? 'Включена' : 'Выключена'}\``
      );
    }
    const user = await this.client.users.get(ctx.from.id);
    return ctx.replyWithMarkdown(
      `ID: \`${ctx.from.id}\`${user.regDate ? `\nДата регистрации: \`${this.client.moment(new Date(Number(user.regDate))).format('DD-MM-YY')}\`` : ''}\nГруппа: \`${
        user.group ? user.group : 'Не указана'
      }\`${user.group ? `\nКурс: \`${this.client.time.getCourse(user.group)} (${this.client.time.getStudYear()})\`` : ''}`
    );
  }
}
