import { Context } from 'telegraf';
import TelegrafClient from '../../structures/client/Client.js';
import Command from '../../structures/models/Command.js';
import Timetable from '../../structures/parsers/Timetable.js';

export default class TimetableC extends Command {
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    super({
      name: 'timetable',
      aliases: ['schedule'],
      description: 'Расписание пар',
      priority: true,
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   */
  async exec(ctx) {
    if (!this.client.cache.timetables?.length) return ctx.reply('В данный момент нет информации о расписании!\nПовторите попытку через минуту.');

    const user = await this.client.users.get(ctx.from.id);
    if (!user?.group) return ctx.reply('Вы не выбрали группу!\nИспользуйте /selectgroup для выбора.');

    this.client.action('cancel-timetable', (ctx) => {
      return ctx.editMessageReplyMarkup({ inline_keyboard: null });
    });

    this.client.action('group-timetable', (ctx) => {
      return this.selectGroup(ctx);
    });

    this.client.action('back-to-user-timetable', (ctx) => {
      return this.showUserSchedule(ctx, null, ctx.update.callback_query.message.message_id);
    });

    this.client.action('show-remote-works', async (ctxu) => {
      // @ts-ignore
      let date = ctxu.update.callback_query.message.reply_markup.inline_keyboard.at(-2).at(0).text.split(' ').at(-1).split('/');
      date = `${date[0]}-${date[1]}-${date[2].slice(2, 4)}`;
      const cmd = this.client.commands.get('remoteworks');
      const rw = await this.client.rw.getByDate(user.group, date);
      // @ts-ignore
      return cmd.showByDate(ctxu, rw, true);
    });

    this.showUserSchedule(ctx);
  }

  /**
   * @param {Context} ctx
   */
  async showUserSchedule(ctx, key, editId) {
    const user = await this.client.users.get(ctx.from.id);
    const timetables = this.client.cache.timetables;
    const keys = this.client.timetable.getKeys(timetables);

    const id = editId ? editId : ctx.message.message_id;

    /**
     * @type {Timetable}
     */
    let timetable;
    if (!key) timetable = timetables[0];
    else timetable = timetables.find((t) => t.date.regular === key);

    for (let k in keys) {
      this.client.action(`user-timetable-${id}-${k}`, (ctx) => {
        return this.showUserSchedule(ctx, k, ctx.update.callback_query.message.message_id);
      });
    }

    const userTimetable = timetable.getTimetable(user.group);
    const msg = this.client.timetable.generateMessage(userTimetable);

    const keyboard = this.generateKeyboard(id, timetables, 2, 'user-timetable', key ? key : userTimetable.date.regular);
    keyboard.push([{ text: 'Расписание другой группы', callback_data: 'group-timetable' }]);
    if (userTimetable.lessons.filter((l) => l.isRemote).length) {
      keyboard.push([{ text: `Показать дистанционные задания ${timetable.date.regular}`, callback_data: 'show-remote-works' }]);
    }
    keyboard.push([{ text: 'Убрать кнопки', callback_data: 'cancel-timetable' }]);

    if (editId) {
      this.client.telegram
        .editMessageText(ctx.chat.id, editId, editId, msg, { reply_markup: { inline_keyboard: keyboard }, disable_web_page_preview: true, parse_mode: 'Markdown' })
        .catch(this.client.logger.error);
    } else {
      ctx.replyWithMarkdown(msg, { reply_markup: { inline_keyboard: keyboard, one_time_keyboard: true }, disable_web_page_preview: true }).catch(this.client.logger.error);
    }
  }

  /**
   * @param {Context} ctx
   */
  async selectGroup(ctx) {
    let groups = await this.client.timetable.getGroups();
    // @ts-ignore
    const keyboard = this.generateKeyboard(ctx.update.callback_query.message.message_id, groups, 4, 'group-selection', null);
    keyboard.push([{ text: 'Назад', callback_data: 'back-to-user-timetable' }]);

    groups.forEach((g) => {
      // @ts-ignore
      this.client.action(`group-selection-${ctx.update.callback_query.message.message_id}-${g}`, (ctx) => {
        return this.showGroupSchedule(ctx, g, null, ctx.update.callback_query.message.message_id);
      });
    });

    return ctx.editMessageText('Выберите группу из списка ниже:', { reply_markup: { inline_keyboard: keyboard } });
  }

  /**
   * @param {Context} ctx
   */
  showGroupSchedule(ctx, group, key, editId) {
    const timetables = this.client.cache.timetables;
    const keys = this.client.timetable.getKeys(timetables);

    let timetable;
    if (!key) timetable = timetables[0];
    else timetable = timetables.find((t) => t.date.regular === key);

    for (let k in keys) {
      this.client.action(`group-timetable-${group}-${editId}-${k}`, (ctx) => {
        return this.showGroupSchedule(ctx, group, k, ctx.update.callback_query.message.message_id);
      });
    }

    const groupTimetable = timetable.getTimetable(group);
    const keyboard = this.generateKeyboard(editId, timetables, 2, `group-timetable-${group}`, key ? key : groupTimetable.date.regular);
    keyboard.push([{ text: 'Назад', callback_data: 'back-to-user-timetable' }]);
    keyboard.push([{ text: 'Убрать кнопки', callback_data: 'cancel-timetable' }]);

    const msg = this.client.timetable.generateMessage(groupTimetable);

    this.client.telegram.editMessageText(ctx.chat.id, editId, editId, msg, { reply_markup: { inline_keyboard: keyboard }, disable_web_page_preview: true, parse_mode: 'Markdown' });
  }

  /**
   * @param {number} id
   * @param {any[]} items
   * @param {number} chunk
   * @param {string} selItem
   */
  generateKeyboard(id, items, chunk, kbtype = 'user-timetable', selItem) {
    // @ts-ignore
    items = selItem ? items.map((i) => i.date.regular).removeItem(selItem) : kbtype.includes('group') ? items : items.map((i) => i.date.regular);
    const keyboard = [];

    items.forEach((i) => {
      keyboard.push({
        // @ts-ignore
        text: `${kbtype.includes('group') ? i.split(' ')[0].replace(',', '') : i}`,
        callback_data: `${kbtype}-${id}-${i}`,
      });
    });

    // @ts-ignore
    return keyboard.chunk(chunk);
  }

  showRemoteWorks() {}
}
