import { Context } from 'telegraf';
import TelegrafClient from '../../structures/client/Client.js';
import Command from '../../structures/models/Command.js';

export default class Test1 extends Command {
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    super({
      name: 'test',
      aliases: [],
      description: '',
      priority: false,
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   */
  async exec(ctx) {
    ctx.reply("There's nothing to test :/");
  }
}
