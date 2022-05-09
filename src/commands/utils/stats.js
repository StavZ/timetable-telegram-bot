import { Context } from 'telegraf';
import TelegrafClient from '../../structures/client/Client.js';
import Command from '../../structures/models/Command.js';

export default class Stats extends Command {
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    super({
      name: 'stats',
      aliases: ['статистика'],
      description: 'Статистика бота',
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec(ctx, args) {
    const userCount = await this.client.users.size();
    const activeUsers = (await this.client.users.filter({ autoscheduler: true })).filter((u) => u.group !== null);
    const registrationsToday = activeUsers.filter((u) => this.client.moment(Number(u.regDate)).isSame(this.client.moment(), 'day'))?.length || 0;
    const newsUsersCount = await this.client.telegram.getChatMembersCount('@ppkbotnews');

    let msg = `Количество пользователей за всё время: \`${userCount}\`\nКоличество активных пользователей: \`${activeUsers.length}\`\nЗарегистрировано сегодня: \`${registrationsToday}\`\n[Новостной канал](https://t.me/ppkbotnews): \`${newsUsersCount}\`\n\n*Таблица активных пользователей*\n\`\`\`\n`;
    for (let i = 1; i < 5; i++) {
      const users = (await this.client.users.filter({ course: i })).filter((u) => u.autoScheduler);
      msg += `${Number(i)} курс | ${users.length}\n`;
    }
    msg += `\`\`\``;
    return ctx.replyWithMarkdown(msg, { disable_web_page_preview: true });
  }
}
