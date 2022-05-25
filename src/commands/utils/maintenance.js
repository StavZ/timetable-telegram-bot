import { Context, Markup } from 'telegraf';
import TelegrafClient from '../../structures/client/Client.js';
import Command from '../../structures/models/Command.js';

export default class Maintenance extends Command {
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    super({
      name: 'maintenance',
      aliases: ['mt'],
      description: 'Отключение автоматизации',
      priority: false
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   */
  async exec(ctx) {
    this.client.manager.stop();
    ctx.reply('Отключено!')
  }
}
