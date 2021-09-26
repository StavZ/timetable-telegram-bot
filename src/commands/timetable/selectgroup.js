import { Context } from 'telegraf';
import Client from '../../structures/client/Client.js';
import Command from '../../structures/client/Command.js';

export default class SelectgroupCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor (client) {
    super({
      name: 'selectgroup',
      aliases: ['выбрать-группу'],
      category: 'timetable',
      ownerOnly: false,
      description: 'Выбор группы колледжа.',
      usage: 'selectgroup',
      includeInHelp: true,
      path: import.meta.url
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec (ctx, args) {
    const unchunked = this.parseKeyboard(await this.client.parser.getGroups());
    const keyboard = unchunked.chunk(4);
    keyboard.push([{ text: 'Отмена', callback_data: 'cancel-select-group' }]);

    ctx.reply('Выберете свою группу из списка:', { reply_markup: { inline_keyboard: keyboard } });
    unchunked.forEach((e) => {
      this.client.action(e.callback_data, (ctx) => {
        this.client.userManager.setGroup(ctx.from.id, e.text);
        ctx.editMessageText(`Вы выбрали группу \`${e.text}\`.\n\n\`${this.client.prefix}schedule\` - Раcписание уроков.`, { parse_mode: 'Markdown' });
      });
    });
    this.client.action('cancel-select-group', (ctx) => {
      ctx.editMessageReplyMarkup({});
      ctx.editMessageText('Выбор группы был отменен.');
    });
  }

  /**
   * @param {string[]} array
   */
  parseKeyboard (array) {
    const _ = [];
    array.forEach((a) => {
      _.push({ text: a, callback_data: a });
    });
    return _;
  }
}
