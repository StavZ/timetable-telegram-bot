import { Context } from 'telegraf';
import TelegrafClient from '../../structures/client/Client.js';
import Command from '../../structures/models/Command.js';
import User from '../../structures/models/User.js';
import RemoteWork from '../../structures/parsers/RemoteWork.js';

export default class RemoteWorks extends Command {
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    super({
      name: 'remoteworks',
      description: 'Дистанционные задания',
      aliases: ['rw'],
      priority: true,
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec(ctx, args) {
    const user = await this.client.users.get(ctx.from.id);
    if (!user.group) return ctx.replyWithMarkdown(`Вы не выбрали группу!\nИспользуйте команду /selectgroup, чтобы выбрать группу.`);

    const id = ctx.message.message_id;

    this.client.action(`${id}-by-title`, async (ctxt) => {
      // @ts-ignore
      return this.startByTitle(Object.assign(ctxt, { id }), user);
    });

    const rw = (await this.client.rw.get(user.group))?.reverse();
    if (!rw || !rw.length) return ctx.replyWithMarkdown(`Дистанционные задания для вашей группы не найдены!\nВозможно произошла ошибка, сообщите об этом разработчику /support.`);

    const titles = this.shortTitles(rw);
    titles.forEach((t) => {
      this.client.action(`${id}-${t.short}`, (ctt) => {
        const tasks = rw.filter((r) => r.title === t.title);
        // @ts-ignore
        return this.showByTitle(Object.assign(ctt, { id }), tasks, t.short);
      });
    });

    this.client.action(`${id}-back-to-titles`, (ctxs) => {
      // @ts-ignore
      return this.startByTitle(Object.assign(ctxs, { id }), user);
    });

    this.client.action(`${id}-todays-tasks`, async (ctxts) => {
      const todayDate = this.client.moment().format('DD-MM-YY');
      const rwdtoday = await this.findByDate(ctxts.from.id, todayDate);
      return this.showByDate(Object.assign(ctxts, { id }), rwdtoday, true);
    });

    this.start(Object.assign(ctx, { id }), args);
  }

  async start(ctx, args) {
    if (!args.length || (args[0] ? !this.validateDate(args[0]) : false)) {
      ctx.replyWithMarkdown(
        `Доступные фильтры поиска:\n\nФильтр \`'По дисциплине'\` - поиск по дисциплине из доступных заданий на сайте.\nФильтр \`'Задания на сегодня'\` - задания на сегодняшний день.\n\nФильтр показывает только опубликованные задания, если нет нужной Вам дисциплины - задания не опубликованы.\n\nЕсли Вы хотите указать свою дату при поиске заданий используйте такой формат команды:\n/remoteworks день-месяц-год\nПример: \`/remoteworks 31-1-22\` (без пробелов между тире).`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'По дисциплине', callback_data: `${ctx.id}-by-title` }],
              [
                {
                  text: `Задания на сегодня ${this.client.moment().format('DD-MM-YY')}`,
                  callback_data: `${ctx.id}-todays-tasks`,
                },
              ],
            ],
          },
        }
      );
    } else {
      const date = args[0];
      const rwd = await this.findByDate(ctx.from.id, this.validateDate(date));
      this.showByDate(ctx, rwd);
    }
  }

  /**
   *
   * @param {Context} ctx
   */
  async startByTitle(ctx) {
    const user = await this.client.users.get(ctx.from.id);
    const rw = (await this.client.rw.get(user.group))?.reverse();
    // @ts-ignore
    const titles = this.shortTitles(rw);
    // @ts-ignore
    const keyboard = this.parseFullKeyboard(titles, 2, ctx.id);
    ctx.editMessageText('Выберите дисциплину из списка ниже для просмотра дистанционных заданий:', { reply_markup: { inline_keyboard: keyboard } });
  }

  /**
   * @param {number} userid
   * @param {string} date
   */
  // @ts-ignore
  async findByDate(userid, date) {
    if (!date) return [];
    const user = await this.client.users.get(userid);
    const rw = (await this.client.rw.getByDate(user.group, date))?.reverse();
    return rw;
  }

  /**
   * @param {Context} ctx
   * @param {?boolean} edit
   * @param {RemoteWork[]} rw
   */
  async showByDate(ctx, rw, edit = false) {
    const user = await this.client.users.get(ctx.from.id);
    if (!rw?.length) {
      if (edit) {
        ctx.editMessageText('Задания не найдены на эту дату.', {
          reply_markup: { inline_keyboard: null },
        });
      } else {
        ctx.replyWithMarkdown('Задания не найдены на эту дату.');
      }
    } else {
      let msg = `Найдено \`${rw.length}\` задани${rw.length === 1 ? 'е' : rw.length > 1 && rw.length < 5 ? 'я' : rw.length >= 5 ? 'й' : 'я'}.\n\n`;
      for (let i = 0; i < rw.length; i++) {
        const task = rw[i];
        const telegraph = await this.client.telegraph.get(task);

        msg += `Дисциплина: \`${task.title}\`\nГруппа: \`${user.group}\`${task.date.day ? `\nДата: \`${task.date.toString()} ${task.date.day ? `(${task.date.day})` : ''}` : ''}\`\nТема задания: ${task.subject}\nЗадание:\n${
          telegraph.url
        }${task.links.length ? `\nФайлы:\n${task.links.map((l, i) => `[Ссылка ${i + 1}](${l})`).join('\n')}` : ''}${task.teacher ? `\nПреподаватель: ${task.teacher}` : ''}${
          task.email ? `\nПочта преподавателя: \`${task.email}\`\n(нажмите, чтобы скопировать почту)` : ''
        }`;

        if (i + 1 !== rw.length) msg += `\n${'—'.repeat(20)}\n`;
      }

      ctx[edit ? 'editMessageText' : 'replyWithMarkdown'](msg, {
        disable_web_page_preview: true,
        reply_markup: { inline_keyboard: null },
        parse_mode: 'Markdown',
      });
    }
  }

  /**
   * @param {Context} ctx
   * @param {RemoteWork[]} tasks
   * @param {any} stitle
   * @param {?number} mid
   * @param {?string} key
   */
  async showByTitle(ctx, tasks, stitle, mid, key) {
    const user = await this.client.users.get(ctx.from.id);
    const task = key ? tasks.find((t) => t.date?.regular === key) : tasks[0];
    tasks.forEach((ta) => {
      // @ts-ignore
      this.client.action(`${ctx.id}${user.group}${stitle}-${ta.date?.regular}`, (c) => {
        // @ts-ignore
        this.showByTitle(Object.assign(c, { id: ctx.id }), tasks, stitle, c.update.callback_query.message.message_id, ta.date.regular);
      });
    });
    let keyboard = [];
    if (tasks.length > 1) {
      // @ts-ignore
      keyboard = this.parseKeyboard(tasks, task, `${ctx.id}${user.group}${stitle}`, 4);
    }
    // @ts-ignore
    keyboard.push([{ text: 'Назад', callback_data: `${ctx.id}-back-to-titles` }]);
    const msg = `Найдено \`${tasks.length}\` задани${tasks.length === 1 ? 'е' : tasks.length > 1 && tasks.length < 5 ? 'я' : tasks.length >= 5 ? 'й' : 'я'}.\n\nДисциплина: \`${
      task.title
    }\`\nГруппа: \`${user.group}\`${task.date.day ? `\nДата: \`${task.date.toString()} ${task.date.day ? `(${task.date.day})\`` : ''}` : ''}\nТема задания: ${task.subject}\nЗадание:\n${
      (await this.client.telegraph.get(task)).url
    }${task.teacher ? `\nПреподаватель: ${task.teacher}` : ''}${task.email ? `\nПочта преподавателя: \`${task.email}\`\n(нажмите, чтобы скопировать почту)` : ''}`;
    if (mid) {
      // @ts-ignore
      this.client.telegram.editMessageText(ctx.chat.id, mid, mid, msg, {
        reply_markup: { inline_keyboard: keyboard },
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      });
    } else {
      ctx.editMessageText(msg, {
        reply_markup: { inline_keyboard: keyboard },
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      });
    }
  }

  /**
   * @param {string} date
   */
  validateDate(date) {
    let [day, month, year] = date.split(/\-/);
    if (!day || !month || !year) return null;
    if (day.length === 1) {
      day = `0${day}`;
    }
    if (month.length === 1) {
      month = `0${month}`;
    }
    return `${day}-${month}-${year}`;
  }

  /**
   * @param {number} userid
   * @param {string} date
   */
  // @ts-ignore
  async findByDate(userid, date) {
    if (!date) return [];
    const user = await this.client.users.get(userid);
    const rw = (await this.client.rw.get(user.group))?.reverse();
    const found = rw.filter((t) => t.date?.regular === date);
    return found;
  }

  /**
   *
   * @param {RemoteWork[]} rw
   * @returns {{short:string,title:string}[]}
   */
  shortTitles(rw) {
    /**
     * @type {string[]}
     */
    const titles = [];
    for (let i = 0; i < rw.length; i++) {
      const task = rw[i];
      // @ts-ignore
      if (!titles.includes(task.title)) titles.push(task.title);
    }
    const data = [];
    for (const title of titles) {
      data.push({
        short: title.split(/\s/).length === 1 ? title.slice(0, 8) : title.split(/\s/).reduce((response, word) => (response += word.slice(0, 3)), ''),
        title: title,
      });
    }
    return data;
  }

  /**
   * @param {{title:string,short:string}[]} array
   * @param {number} chunkSize
   */
  parseFullKeyboard(array, chunkSize, id) {
    const keyboard = [];
    array.forEach((i) => {
      keyboard.push({
        text: `${i.title}`,
        callback_data: `${id}-${i.short}`,
      });
    });
    // @ts-ignore
    return keyboard.chunk(chunkSize);
  }

  /**
   * @param {RemoteWork[]} tasks
   * @param {string} stask
   * @param {number} chunk
   * @returns {{text: string, callback_data: string}[][]}
   */
  parseKeyboard(tasks, stask, prefix, chunk) {
    const list = tasks.map((s) => s.date.regular);
    // @ts-ignore
    const listWithoutSelected = list.removeItem(stask.date.regular);
    const keyboard = [];
    listWithoutSelected.forEach((a) => {
      keyboard.push({
        text: `${a}`,
        callback_data: `${prefix}-${a}`,
      });
    });
    // @ts-ignore
    return keyboard.chunk(chunk);
  }
}
