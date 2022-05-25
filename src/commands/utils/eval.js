import { Context } from 'telegraf';
import { inspect } from 'util';
import TelegrafClient from '../../structures/client/Client.js';
import Command from '../../structures/models/Command.js';
import fs from 'fs';

export default class Eval extends Command {
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    super({
      name: 'eval',
      aliases: [],
      description: 'Eval',
      priority: false
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec(ctx, args) {
    if (!args.length) return ctx.reply('I need a code.');

    let code = args.join(' ');

    if (code.includes('await')) code = `(async () => { ${code} })()`;
    let result;
    try {
      result = await eval(code);
    } catch (e) {
      result = e;
    }

    result = inspect(result, { depth: 1 });
    return ctx.replyWithMarkdown(`\`\`\`\n${result.length > 4000 ? result.slice(0, 4000) : result}\n\`\`\``);
  }
}
