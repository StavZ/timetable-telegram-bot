import { Context } from 'telegraf';
import Client from '../../structures/client/Client.js';
import Command from '../../structures/client/Command.js';

export default class StatsCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor(client) {
    super({
      name: 'stats',
      aliases: ['статистика'],
      description: 'Статистика бота.',
      usage: 'stats',
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec(ctx, args) {
    const userCount = await this.client.userManager.getUserCount();
    const activeUsers = (
      await this.client.userManager.getUsers({ autoScheduler: true })
    ).filter((u) => u.group !== null);
    let msg = `Количество пользователей: \`${userCount}\`\nКол-во активных пользователей\`*\`: \`${activeUsers.length}\`\n\n*Таблица пользователей по курсам*\n\`\`\`\n`;
    for (let i = 1; i < 5; i++) {
      const users = (await this.client.userManager.getUsersByCourse(i)).filter(
        (u) => u.autoScheduler
      );
      msg += `${i} курс | ${users.length}\n`;
    }
    msg += `\`\`\`\n\`*\`Активным пользователем считается тот, кто выбрал группу и включил автоматическую рассылку.`;
    ctx.replyWithMarkdown(msg);
  }
}
