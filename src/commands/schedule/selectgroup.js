const { Context } = require('telegraf');
const Client = require('../../structures/client/Client');
const Command = require('../../structures/client/Command');

class ChoiceGroupCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor (client) {
    super({
      name: 'выбратьгруппу',
      aliases: ['selectgroup', 'выбрать-группу'],
      category: 'schedule',
      usage: 'выбратьгруппу',
      description: 'Выбор группы.',
      ownerOnly: false,
      path: __filename
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec (ctx, args) {
    const parsed = this.parse((await this.client.parser.getGroups()));
    const keyboard = parsed.chunk(4);
    ctx.reply('Выберете одну группу из списка, чтобы получать её раписание:', { reply_markup: { inline_keyboard: keyboard } });
    parsed.forEach((e) => {
      this.client.action(e.callback_data, (ctx) => {
        this.client.userManager.setGroup(ctx.from.id, e.text);
        ctx.editMessageText(`Вы выбрали группу \`${e.text}\`.\n\n\`${this.client.prefix}расписание\` - Раcписание группы.`, { parse_mode: 'Markdown' });
      });
    });
  }

  /**
   * @param {string[]} array
   */
  parse (array) {
    const _ = [];
    array.forEach((a) => {
      _.push({ text: a, callback_data: a });
    });
    return _;
  }
}
module.exports = ChoiceGroupCommand;
