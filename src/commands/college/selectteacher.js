import TelegrafClient from '../../structures/client/Client.js';
import Command from '../../structures/models/Command.js';
import { Context } from 'telegraf';

export default class SelectTeacher extends Command {
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    super({
      name: 'selectteacher',
      priority: true,
      description: 'Выбор преподавателя',
      aliases: [],
    });
    this.client = client;
  }

  /**
   *
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec(ctx, args) {
    const unchunked = this.parseKeyboard(this.client.commands.get('email').config.emails.map((e) => e.teacherShort));
    const keyboard = unchunked.chunk(3);
    keyboard.push([{ text: 'Отмена', callback_data: 'cancel-teacher-select-group' }]);

    ctx.reply('Выберете преподавателя из списка:', { reply_markup: { inline_keyboard: keyboard } });
    unchunked.forEach((e) => {
      this.client.action(e.callback_data, (ctx) => {
        this.client.users.setTeacher(ctx.from.id, e.text);
        ctx.editMessageText(`Вы выбрали преподавателя \`${e.text}\`.\n\n${this.client.prefix}teachtimetable - Раcписание преподавателей.`, { parse_mode: 'Markdown' });
      });
    });
    this.client.action('cancel-teacher-select-group', (ctx) => {
      ctx.editMessageReplyMarkup({});
      ctx.editMessageText('Выбор преподавателя был отменен.');
    });
  }
  /**
   * @param {string[]} array
   */
  parseKeyboard(array) {
    const _ = [];
    array.forEach((a) => {
      _.push({ text: a, callback_data: a });
    });
    return _;
  }
}
