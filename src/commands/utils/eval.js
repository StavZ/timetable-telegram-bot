const { Context } = require('telegraf');
const Client = require('../../structures/client/Client');
const Command = require('../../structures/client/Command');
const { inspect } = require('util');

class EvalCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor (client) {
    super({
      name: 'eval',
      aliases: [],
      category: 'utils',
      ownerOnly: true,
      description: 'Eval command',
      includeInHelp: false,
      path: __filename
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec (ctx, args) {
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
    const o_o = RegExp(`${process.env.TOKEN}|${process.env.MONGOURI}|${process.env.DEV_TOKEN}`, 'gim');
    result = inspect(result, { depth: 1 }).replace(o_o, '[👀]') + '';
    ctx.replyWithMarkdown(`\`\`\`js\n${result.length > 4000 ? result.slice(0, 4000) : result}\n\`\`\``);
  }
}
module.exports = EvalCommand;
