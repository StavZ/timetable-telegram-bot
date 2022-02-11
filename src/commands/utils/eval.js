import { Context } from 'telegraf';
import Client from '../../structures/client/Client.js';
import Command from '../../structures/client/Command.js';
import { inspect } from 'util';

export default class EvalCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor(client) {
    super({
      name: 'eval',
      aliases: [],
      category: 'utils',
      description: 'Запускает код JS.',
      usage: 'eval `[код]`',
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec(ctx, args) {
    if (!args.length) return ctx.reply('Мне нужен код.');
    let code = args.join(' ');
    if (code.includes('await')) code = `(async () => { ${code} })()`;
    let result;
    try {
      result = await eval(code);
    } catch (e) {
      result = e;
    }
    // eslint-disable-next-line camelcase
    const o_o = RegExp(`${process.env.TOKEN}${process.env.DEV_TOKEN ? `|${process.env.DEV_TOKEN}` : ''}|${process.env.MONGODB_PASS}|${process.env.MONGODB_USER}`, 'gim');
    result = inspect(result, { depth: 1 }).replace(o_o, '[•••]') + '';
    ctx.replyWithMarkdown(`\`\`\`js\n${result.length > 4000 ? result.slice(0, 4000) : result}\n\`\`\``);
  }
}
