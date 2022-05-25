import { Context } from 'telegraf';
import TelegrafClient from '../../structures/client/Client.js';
import Command from '../../structures/models/Command.js';

export default class SendMessage extends Command {
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    super({
      name: 'sendMessage',
      aliases: [],
      description: 'Отправить сообщение от имени разработчика',
      priority: false
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec(ctx, args) {
    if (!args.length) return;

    const userID = Number(args[0]);
    if (isNaN(userID)) {
      return this.client.sendMessage(args.join(' '), 'all').catch(this.client.logger.error);
    } else {
      return this.client.sendMessage(args.slice(1).join(' '), 'user', userID).catch(this.client.logger.error);
    }
  }
}
