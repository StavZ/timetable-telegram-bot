import { Context } from 'telegraf';
import Client from '../../structures/client/Client.js';
import Command from '../../structures/client/Command.js';
import Schedule from '../../structures/parser/Schedule.js';

export default class ScheduleCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor(client) {
    super({
      name: 'schedule',
      aliases: ['расписание', 'timetable'],
      usage: 'timetable',
      category: 'schedule',
      description: 'Текущее расписание, размещенное на сайте.',
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec(ctx, args) {
    if (!this.client.manager.cache.schedules) return ctx.reply('В данный момент нет информации о расписании!\nПопробуйте повторить попытку через минуту.');
    this.client.action('cancel-timetable', (ctx) => {
      ctx.editMessageReplyMarkup({ inline_keyboard: null });
    });

    this.client.action('switch-group', async (ctx) => {
      const groups = await this.client.parser.getGroups();
      const keyboard = this.parseGroupsKeyboard(groups).chunk(4);
      keyboard.push([{ text: 'Отмена', callback_data: 'back-to-user-schedule' }]);
      ctx.editMessageText('Выберете группу из списка ниже, чтобы посмотреть расписание.\n_Это не поменяет Вашу группу для получения расписания по умолчанию._', {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: keyboard },
      });
      groups.forEach((group) => {
        this.client.action(`${group}-schedule`, async (ctx) => {
          this.execGroup(ctx, this.client.manager.cache.schedules, group, ctx.update.callback_query.message.message_id);
        });
      });
    });

    this.client.action('back-to-user-schedule', async (ctx) => {
      this.showUserSchedule(ctx, this.client.manager.cache.schedules, ctx.update.callback_query.message.message_id);
    });

    this.showUserSchedule(ctx, this.client.manager.cache.schedules);
  }

  /**
   * @param {Context} ctx
   * @param {Schedule[]} schedules
   * @param {number|null} message_id
   * @param {string|null} key
   */
  async showUserSchedule(ctx, schedules, message_id = null, key = null) {
    const user = await this.client.userManager.getUser(ctx.from.id);
    const keys = this.client.parser.getSchedulesKeys(schedules);
    let schedule;
    if (key) {
      schedule = schedules.find((s) => s.date.regular === key);
    } else {
      schedule = schedules[0];
    }
    if (!user.usergroup) {
      return ctx.replyWithMarkdown('Вы не выбрали группу.\nИспользуйте команду /selectgroup, чтобы выбрать группу.');
    }
    const userSchedule = schedule.getLessonlistByGroup(user.usergroup);
    let msg = `Расписание на ${userSchedule.date.toString()} (${userSchedule.date.day.toProperCase()})\nГруппа: ${user.usergroup}\n\`\n${this.config.message ? `${this.config.message}\n\n` : ''}`;
    if (userSchedule.lessons.length) {
      for (const l of userSchedule.lessons) {
        msg += `${
          l.error
            ? `${l.error}\n`
            : `${l.number} пара - ${l.title}${l.teacher ? ` у ${l.teacher}` : ''}${
                l.classroom && l.address ? ` • ${l.classroom} | ${l.address}` : l.classroom && !l.address ? ` • ${l.classroom}` : !l.classroom && l.address ? ` • ${l.address}` : ''
              }\n`
        }`;
        if (l.error && msg.includes(l.error)) break;
      }
      msg += `\`\`\`${this.client.generateBells(userSchedule) ? `\n${this.client.generateBells(userSchedule)}` : ''}\n\n[Ссылка на сайт](${userSchedule.url}${
        userSchedule.cartId ? `#${userSchedule.cartId}` : ''
      })`;
    } else {
      msg += `\`\`\`Расписание не найдено*\n\`\n\`*\`_Расписание не найдено - значит, что пары не были поставлены._`;
    }
    const keyboard = this.parseKeyboard(schedules, key ? key : userSchedule.date.regular, null, 2);
    keyboard.push([{ text: 'Расписание другой группы', callback_data: 'switch-group' }]);
    keyboard.push([{ text: 'Убрать кнопки', callback_data: 'cancel-timetable' }]);
    if (message_id) {
      this.client.telegram
        .editMessageText(ctx.chat.id, message_id, message_id, msg, {
          reply_markup: { inline_keyboard: keyboard },
          parse_mode: 'Markdown',
        })
        .catch(this.client.logger.error);
    } else {
      ctx.replyWithMarkdown(msg, { reply_markup: { inline_keyboard: keyboard } }).catch(this.client.logger.error);
    }

    for (const key in keys) {
      this.client.action(key, (ctx) => {
        this.showUserSchedule(ctx, schedules, ctx.update.callback_query.message.message_id, key);
      });
    }
  }

  /**
   * @param {Context} ctx
   * @param {string} group
   * @param {Schedule[]} schedules
   * @param {number|null} message_id
   * @param {string|null} key
   */
  async execGroup(ctx, schedules, group, message_id = null, key = null) {
    const keys = this.client.parser.getSchedulesKeys(schedules);
    let schedule;
    if (key) {
      schedule = schedules.find((s) => s.date.regular === key);
    } else {
      schedule = schedules[0];
    }

    const groupSchedule = schedule.getLessonlistByGroup(group);
    let msg = `Расписание на ${groupSchedule.date.toString()} (${groupSchedule.date.day.toProperCase()})\nГруппа: ${group}\n\`\`\`\n${this.config.message ? `${this.config.message}\n\n` : ''}`;
    if (groupSchedule.lessons.length) {
      for (const l of groupSchedule.lessons) {
        msg += `${
          l.error
            ? `${l.error}\n`
            : `${l.number} пара - ${l.title}${l.teacher ? ` у ${l.teacher}` : ''}${
                l.classroom && l.address ? ` • ${l.classroom} | ${l.address}` : l.classroom && !l.address ? ` • ${l.classroom}` : !l.classroom && l.address ? ` • ${l.address}` : ''
              }\n`
        }`;
        if (l.error && msg.includes(l.error)) break;
      }
      msg += `\`\`\`${this.client.generateBells(groupSchedule) ? `\n${this.client.generateBells(groupSchedule)}` : ''}\n\n[Ссылка на сайт](${groupSchedule.url}${
        groupSchedule.cartId ? `#${groupSchedule.cartId}` : ''
      })`;
    } else {
      msg += `\`\`\`Расписание не найдено*\n\`\n\`*\`_Расписание не найдено - значит, что пары не были поставлены._`;
    }

    const keyboard = this.parseKeyboard(schedules, key ? key : groupSchedule.date.regular, `-${group}`, 2);
    keyboard.push([{ text: 'Расписание другой группы', callback_data: 'switch-group' }]);
    keyboard.push([{ text: 'Убрать кнопки', callback_data: 'cancel-timetable' }]);
    keyboard.push([{ text: 'Назад', callback_data: 'back-to-user-schedule' }]);
    if (message_id) {
      this.client.telegram
        .editMessageText(ctx.chat.id, message_id, message_id, msg, {
          reply_markup: { inline_keyboard: keyboard },
          parse_mode: 'Markdown',
        })
        .catch(this.client.logger.error);
    } else {
      ctx.replyWithMarkdown(msg, { reply_markup: { inline_keyboard: keyboard } }).catch(this.client.logger.error);
    }

    for (const key in keys) {
      this.client.action(`${key}-${group}`, (ctx) => {
        this.execGroup(ctx, schedules, group, ctx.update.callback_query.message.message_id, key);
      });
    }
  }

  /**
   * @param {Schedule[]} schedules
   * @param {string} selectedSchedule
   * @param {number} chunk
   * @returns {{text: string, callback_data: string}[][]}
   */
  parseKeyboard(schedules, selectedSchedule, postfix, chunk) {
    const list = schedules.map((s) => s.date.regular);
    const listWithoutSelected = list.removeItem(selectedSchedule);
    const keyboard = [];
    listWithoutSelected.forEach((a) => {
      keyboard.push({
        text: `${a}`,
        callback_data: `${a}${postfix ? postfix : ''}`,
      });
    });
    return keyboard.chunk(chunk);
  }

  parseGroupsKeyboard(array) {
    const _ = [];
    array.forEach((a) => {
      _.push({ text: a, callback_data: `${a}-schedule` });
    });
    return _;
  }
}
