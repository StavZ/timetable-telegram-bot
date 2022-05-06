import { Context } from 'telegraf';
import Client from '../../structures/client/Client.js';
import Command from '../../structures/client/Command.js';
import md from 'telegraph.md';

export default class StartCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor(client) {
    super({
      name: 'remoteworks',
      aliases: ['rw', 'дистант'],
      category: 'remoteworks',
      usage: 'rw',
      description: 'Дистанционные задания',
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec(ctx, args) {
    const user = await this.client.userManager.getUser(ctx.from.id);
    if (!user.usergroup) return ctx.replyWithMarkdown('Вы не выбрали группу.\nИспользуйте команду /selectgroup, чтобы выбрать группу.');

    this.client.action('by-title', async (ctxt) => {
      return await this.startByTitle(ctxt, user);
    });

    const rw = (await this.client.remoteWorks.getRemoteWorks(user.usergroup))?.reverse();
    const titles = this.shortTitles(rw);
    titles.forEach((t) => {
      this.client.action(t.short, (ctt) => {
        const tasks = rw.filter((r) => r.title === t.title);
        return this.showByTitle(ctt, tasks, t.short);
      });
    });

    this.client.action('back-to-titles', (ctxs) => {
      return this.startByTitle(ctxs, user);
    });

    this.client.action('todays-tasks', async (ctxts) => {
      const todayDate = this.client.moment().format('DD-MM-YY');
      const rwdtoday = await this.findByDate(ctxts.from.id, todayDate);
      return this.showByDate(ctxts, rwdtoday, true);
    });

    this.start(ctx, args);
  }

  /**
   * @param {Context} ctx
   * @param {import('../../structures/parser/RWParser.js').task[]} rw
   * @param {string[]} args
   */
  async start(ctx, args) {
    if (!args.length || (args[0] ? !this.validateDate(args[0]) : false)) {
      ctx.replyWithMarkdown(
        `Данная функция находится в стадии тестирования!\nЛюбые ошибки, пожалуйста, отправляйте в поддержку /support.\n\nФильтр \`'По дисциплине'\` - поиск по дисциплине из доступных заданий на сайте.\nФильтр \`'Задания на сегодня'\` - задания на сегодняшний день.\n\nФильтр показывает только опубликованные задания, если нет нужной Вам дисциплины - задания не опубликованы.\n\nЕсли Вы хотите указать свою дату при поиске заданий используйте такой формат команды:\n/remoteworks день-месяц-год\nПример: \`/remoteworks 31-1-22\` (без пробелов между тире).`,
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'По дисциплине', callback_data: 'by-title' }],
              [
                {
                  text: `Задания на сегодня ${this.client.moment().format('DD-MM-YY')}`,
                  callback_data: 'todays-tasks',
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
   *
   * @param {Context} ctx
   * @param {import('../../structures/client/managers/UserManager.js').user} user
   * @param {import('../../structures/parser/RWParser.js').task[]} rw
   */
  async startByTitle(ctx) {
    const user = await this.client.userManager.getUser(ctx.from.id);
    const rw = (await this.client.remoteWorks.getRemoteWorks(user.usergroup))?.reverse();
    const titles = this.shortTitles(rw);
    const keyboard = this.parseFullKeyboard(titles, 3);
    ctx.editMessageText('Выберите дисциплину из списка ниже для просмотра дистанционных заданий:', { reply_markup: { inline_keyboard: keyboard } });
  }

  /**
   * @param {import('../../structures/parser/RWParser.js').task[]} rw
   * @param {string} date
   */
  async findByDate(userid, date) {
    if (!date) return [];
    const user = await this.client.userManager.getUser(userid);
    const rw = (await this.client.remoteWorks.getRemoteWorks(user.usergroup))?.reverse();
    const found = rw.filter((t) => t.date?.regular === date);
    return found;
  }

  findByTitle() {}

  /**
   * @param {Context} ctx
   * @param {import('../../structures/client/managers/UserManager.js').user} user
   * @param {import('../../structures/parser/RWParser.js').task[]} rw
   */
  async showByDate(ctx, rw, edit = false) {
    const user = await this.client.userManager.getUser(ctx.from.id);
    if (!rw.length) {
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
        const telegraph = await this.createTelegraph(
          task.title,
          user.usergroup,
          task.date.regular,
          task.teacher,
          `Тема задания: ${task.taskSubject}\n\n${task.taskContent ?? 'Задание не указано.'}${
            task.links.length ? `\n${task.links.map((l, i) => `[Ссылка ${i + 1}](${l})`).join('\n')}` : ''
          }\n\nПочта преподавателя: [${task.email}](mailto:${task.email}?subject=${encodeURI(
            user.usergroup
          )})\n*(При нажатии на почту, Вас переадресует на почтовый клиент по умолчанию.\nТакже, указанная Вами группа сразу появляется в теме сообщения, пожалуйста проверьте её правильность)*`
        );

        msg += `Дисциплина: \`${task.title}\`\nГруппа: \`${user.usergroup}\`\nДата: \`${task.date.toString()} ${task.date.day ? `(${task.date.day})` : ''}\`\nТема задания: ${
          task.taskSubject
        }\nЗадание:\n${telegraph}${task.links.length ? `\nФайлы:\n${task.links.map((l, i) => `[Ссылка ${i + 1}](${l})`).join('\n')}` : ''}${task.teacher ? `\nПреподаватель: ${task.teacher}` : ''}${
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
   * @param {import('../../structures/client/managers/UserManager.js').user} user
   * @param {import('../../structures/parser/RWParser.js').task[]} tasks
   * @param {number} mid
   * @param {string} key
   */
  async showByTitle(ctx, tasks, stitle, mid, key) {
    const user = await this.client.userManager.getUser(ctx.from.id);
    const task = key ? tasks.find((t) => t.date.regular === key) : tasks[0];
    tasks.forEach((ta) => {
      this.client.action(`${user.usergroup}${stitle}-${ta.date?.regular}`, (c) => {
        this.showByTitle(c, tasks, stitle, c.update.callback_query.message.message_id, ta.date.regular);
      });
    });
    let keyboard = [];
    if (tasks.length > 1) {
      keyboard = this.parseKeyboard(tasks, task, `${user.usergroup}${stitle}`, 4);
    }
    keyboard.push([{ text: 'Назад', callback_data: 'back-to-titles' }]);
    const msg = `Найдено \`${tasks.length}\` задани${tasks.length === 1 ? 'е' : tasks.length > 1 && tasks.length < 5 ? 'я' : tasks.length >= 5 ? 'й' : 'я'}.\n\nДисциплина: \`${
      task.title
    }\`\nГруппа: \`${user.usergroup}\`\nДата: \`${task.date.toString()}${task.date.day ? ` (${task.date.day})` : ''}\`\nТема задания: ${task.taskSubject}\nЗадание:\n${await this.createTelegraph(
      task.title,
      user.usergroup,
      task.date.regular,
      (task.teacher ? task.teacher : ''),
      `Тема задания: ${task.taskSubject}\n\n${task.taskContent ?? 'Задание не указано.'}${
        task.links.length ? `\n${task.links.map((l, i) => `[Ссылка ${i + 1}](${l})`).join('\n')}` : ''
      }\n\n${task.email ? `Почта преподавателя: [${task.email}](mailto:${task.email}?subject=${encodeURI(
        user.group
      )})\n*(При нажатии на почту Вас переадресует на Вашу почту по умолчанию. Пожалуйста проверьте правильность Вашей группы в теме сообщения)*` : ''}`
    )}${task.teacher ? `\nПреподаватель: ${task.teacher}` : ''}${task.email ? `\nПочта преподавателя: \`${task.email}\`\n(нажмите, чтобы скопировать почту)` : ''}`;
    if (mid) {
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

  async createTelegraph(title, group, dateRegular, teacher, content) {
    const page = await this.client.telegraph.createPage(`${title} ${group} (${dateRegular})`, md(content), `${teacher}`, 'https://t.me/ppkslavyanovabot', true);
    return page.url;
  }

  /**
   * @param {import('../../structures/parser/RWParser.js').task[]} rw
   */
  shortTitles(rw) {
    const titles = [];
    for (let i = 0; i < rw.length; i++) {
      const task = rw[i];
      if (!titles.includes(task.title)) titles.push(task.title);
    }
    const data = [];
    for (const title of titles) {
      data.push({
        short: title.split(/\s/).reduce((response, word) => (response += word.slice(0, 2)), ''),
        title: title,
      });
    }
    return data;
  }

  /**
   * @param {{title:string,short:string}[]} array
   * @param {number} chunkSize
   */
  parseFullKeyboard(array, chunkSize) {
    const keyboard = [];
    array.forEach((i) => {
      keyboard.push({
        text: `${i.title}`,
        callback_data: `${i.short}`,
      });
    });
    return keyboard.chunk(chunkSize);
  }

  /**
   * @param {import('../../structures/parser/RWParser.js').task[]} tasks
   * @param {string} stask
   * @param {number} chunk
   * @returns {{text: string, callback_data: string}[][]}
   */
  parseKeyboard(tasks, stask, prefix, chunk) {
    const list = tasks.map((s) => s.date.regular);
    const listWithoutSelected = list.removeItem(stask);
    const keyboard = [];
    listWithoutSelected.forEach((a) => {
      keyboard.push({
        text: `${a}`,
        callback_data: `${prefix}-${a}`,
      });
    });
    return keyboard.chunk(chunk);
  }
}
