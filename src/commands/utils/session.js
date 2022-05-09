import { Context } from 'telegraf';
import TelegrafClient from '../../structures/client/Client.js';
import Command from '../../structures/models/Command.js';
import ms from 'ms';

export default class Session extends Command {
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    super({
      name: 'session',
      aliases: [],
      description: 'Текущая сессия бота',
      priority: false,
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx 
   * @param {string[]} args 
   */
  async exec (ctx, args) {
    const lastRestart = this.client.lastRestart;
    const cmdRuns = this.client.cmdRuns;
    const activeUsers = (await this.client.users.filter({ autoscheduler: true })).filter((u) => u.group !== null);
    const registrationsToday = activeUsers.filter((u) => this.client.moment(Number(u.regDate)).isSame(this.client.moment(), 'day'))?.length || 0;
    const dbSize = (await this.client.db.query('SELECT pg_size_pretty(pg_database_size(\'tg_bot_db\'))')).rows[0].pg_size_pretty;

    ctx.replyWithMarkdown(`Последняя перезагрузка: \`${this.client.moment(lastRestart).format('DD-MM-YY hh:mm')} (online for ${ms(Date.now() - lastRestart)})\`\nРазмер базы данных: \`${dbSize}\`\nЗапусков команд: \`${cmdRuns}\`\nЗарегестрировано сегодня: \`${registrationsToday}\``);
  }
}
