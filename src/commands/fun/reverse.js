import { Context } from 'telegraf';
import TelegrafClient from '../../structures/client/Client.js';
import Command from '../../structures/models/Command.js';

export default class Profile extends Command {
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    super({
      name: 'reverse',
      aliases: [],
      description: 'Fun command',
      priority: false,
      tempHide: true
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec(ctx, args) {
    if (!args.length) return ctx.reply('Аргументы?')
    ctx.reply(`${args.join(' ').split('').reverse().join('')}`)
  }
}
