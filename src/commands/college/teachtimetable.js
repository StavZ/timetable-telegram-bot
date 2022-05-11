import TelegrafClient from '../../structures/client/Client.js';
import Command from '../../structures/models/Command.js';
import { Context } from 'telegraf';
import TTimetable from '../../structures/parsers/TTimetable.js';
import User from '../../structures/models/User.js';

export default class TeacherTimetable extends Command {
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    super({
      name: 'teachtimetable',
      aliases: [],
      priority: true,
      description: 'Расписание преподавателей',
    });
    this.client = client;
  }
  /**
   * @param {Context} ctx
   */
  async exec(ctx) {
    if (!this.client.cache.ttimetables?.length) return ctx.reply('В данный момент нет информации о расписании!\nПовторите попытку через минуту.');

    this.client.action('cancel-teacher-timetable', (ctx1) => {
      return ctx1.editMessageReplyMarkup({ inline_keyboard: null });
    });

    this.client.action('other-teacher-timetable', (ctx2) => {
      return this.selectTeacher(ctx2);
    });

    this.client.action('back-to-teacher-timetable', (ctx3) => {
      return this.showUserTeachSchedule(ctx3, null, ctx3.update.callback_query.message.message_id);
    });

    return this.showUserTeachSchedule(ctx);
  }

  /**
   * @param {Context} ctx
   */
  async showUserTeachSchedule(ctx, key, editId) {
    /**
     * @type {User}
     */
    const user = await this.client.users.get(ctx.from.id);
    const timetables = this.client.cache.ttimetables;
    const keys = this.client.teachtimetable.getKeys(timetables);
    const teachers = this.client.commands.get('email').config.emails.map((e) => e.teacherShort);

    const id = editId ? editId : ctx.message.message_id;

    let timetable;
    if (!key) timetable = timetables[0];
    else timetable = timetables.find((t) => t.date.regular === key);

    for (let k in keys) {
      this.client.action(`teacher-timetable-${id}-${k}-${(user.teacher ? user.teacher : teachers[0]).split(/\s/).length === 1 ? (user.teacher ? user.teacher : teachers[0]).slice(0, 8) : (user.teacher ? user.teacher : teachers[0]).split(/\s/).reduce((response, word) => (response += word.slice(0, 3)), '')}`, (ctx) => {
        return this.showUserTeachSchedule(ctx, k, ctx.update.callback_query.message.message_id);
      });
    }

    const userTimetable = timetable.getTimetable(user?.teacher ? user.teacher : teachers[0]);
    const msg = this.client.teachtimetable.generateMessage(userTimetable);

    const keyboard = this.generateKeyboard(id, timetables, 2, 'teacher-timetable', key ? key : userTimetable.date.regular, (user.teacher ? user.teacher : teachers[0]));
    keyboard.push([{ text: 'Расписание другого преподавателя', callback_data: 'other-teacher-timetable' }]);
    keyboard.push([{ text: 'Убрать кнопки', callback_data: 'cancel-teacher-timetable' }]);

    if (editId) {
      this.client.telegram
        .editMessageText(ctx.chat.id, editId, editId, msg, { reply_markup: { inline_keyboard: keyboard, one_time_keyboard: true }, parse_mode: 'Markdown', disable_web_page_preview: true })
        .catch(this.client.logger.error);
    } else {
      ctx.replyWithMarkdown(msg, { reply_markup: { inline_keyboard: keyboard, one_time_keyboard: true }, disable_web_page_preview: true }).catch(this.client.logger.error);
    }
  }

  /**
   * @param {Context} ctx
   */
  async selectTeacher(ctx) {
    const teachers = this.client.commands.get('email').config.emails.map((e) => e.teacherShort);
    const keyboard = this.generateKeyboard(ctx.update.callback_query.message.message_id, teachers, 4, 'teacher-sel', null);
    keyboard.push([{ text: 'Назад', callback_data: 'back-to-teacher-timetable' }]);

    teachers.forEach((g) => {
      this.client.action(`teacher-sel-${ctx.update.callback_query.message.message_id}-${g.split(/\s/).length === 1 ? g.toLowerCase() : g.split(/\s/).reduce((response, word) => (response += word.slice(0, 5)), '').toLowerCase()}`, (ctx) => {
        return this.showTeachSchedule(ctx, g, null, ctx.update.callback_query.message.message_id);
      });
    });

    return ctx.editMessageText('Выберите преподавателя:', { reply_markup: { inline_keyboard: keyboard, one_time_keyboard: true, disable_web_page_preview: true } });
  }

  /**
   * @param {Context} ctx
   */
  showTeachSchedule(ctx, teacher, key, editId) {
    const timetables = this.client.cache.ttimetables;
    const keys = this.client.teachtimetable.getKeys(timetables);

    let timetable;
    if (!key) timetable = timetables[0];
    else timetable = timetables.find((t) => t.date.regular === key);

    for (let k in keys) {
      this.client.action(`teacher-timetable-${teacher}-${editId}-${k}-teach`, (ctx) => {
        return this.showTeachSchedule(ctx, teacher, k, ctx.update.callback_query.message.message_id);
      });
    }

    const teachTimetable = timetable.getTimetable(teacher);
    const keyboard = this.generateKeyboard(editId, timetables, 2, `teacher-timetable-${teacher}`, key ? key : teachTimetable.date.regular, 'teach');

    keyboard.push([{ text: 'Убрать кнопки', callback_data: 'cancel-teacher-timetable' }]);
    keyboard.push([{ text: 'Назад', callback_data: 'back-to-teacher-timetable' }]);

    const msg = this.client.teachtimetable.generateMessage(teachTimetable);

    this.client.telegram.editMessageText(ctx.chat.id, editId, editId, msg, { reply_markup: { inline_keyboard: keyboard }, disable_web_page_preview: true, parse_mode: 'Markdown' });
  }

  /**
   * @param {number} id
   * @param {TTimetable[]} items
   * @param {number} chunk
   * @param {string} selItem
   */
  generateKeyboard(id, items, chunk, kbtype = 'teacher-timetable', selItem, teacher) {
    items = selItem ? items.map((i) => i.date.regular).removeItem(selItem) : kbtype.includes('teacher') ? items : items.map((i) => i.date.regular);
    const keyboard = [];

    items.forEach((i) => {
      keyboard.push({
        text: `${i}`,
        callback_data: `${kbtype}-${id}-${i.split(/\s/).length === 1 ? i.toLowerCase() : i.split(/\s/).reduce((response, word) => (response += word.slice(0, 5)).toLowerCase(), '')}${teacher ? `-${teacher}` : ''}`,
      });
    });

    return keyboard.chunk(chunk);
  }
}
