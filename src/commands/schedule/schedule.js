/* eslint-disable guard-for-in */
const { Context } = require('telegraf');
const Client = require('../../structures/client/Client');
const Command = require('../../structures/client/Command');
const moment = require('moment-timezone');

class ScheduleCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor (client) {
    super({
      name: 'расписание',
      aliases: ['schedule'],
      category: 'schedule',
      ownerOnly: false,
      description: 'Отправляет текущее расписание, размещенное на сайте.',
      includeInHelp: true,
      path: __filename
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec (ctx, args) {
    if (this.client.summerHolidays()) return ctx.replyWithMarkdown('Команда \`schedule\` отключена до следующего учебного года.');
    const user = await this.client.userManager.getUserSchema(ctx.from.id);
    if (!user || !user.group) {
      return this.client.commandHandler.getCommand('selectgroup').exec(ctx, []);
    }

    const schedules = await this.client.parser.getAvailableSchedules();
    const schedulesByKeys = this.schedulesByKeys(schedules);

    this.client.action('cancel-schedule', (ctx) => {
      ctx.editMessageReplyMarkup({});
    });
    for (const key in schedulesByKeys) {
      this.client.action(key, (ctx) => {
        this.showSchedule(ctx, user, schedulesByKeys[key], schedules, { message_id: ctx.update.callback_query.message.message_id, key });
      });
    }

    this.showSchedule(ctx, user, schedules[0], schedules);
  }

  /**
   * @param {Context} ctx
   * @param {*} user
   * @param {import('../../structures/schedule/Parser.new').AvailableSchedulesData} schedule
   * @param {import('../../structures/schedule/Parser.new').AvailableSchedulesData[]} schedules
   */
  showSchedule (ctx, user, schedule, schedules, edit) {
    const userSchedule = schedule.schedule.find((s) => s.group === user.group);
    let msg = `${schedule.dateString}\nГруппа: ${user.group}\n\`\`\`\n`;
    if (userSchedule) {
      for (const l of userSchedule.schedule) {
        msg += `${l.error ? `${l.error}\n` : `${l.number} пара - ${l.title}${l.teacher ? ` у ${l.teacher}` : ''}${l.classroom && l.address ? ` • ${l.classroom} | ${l.address}` : (l.classroom && !l.address ? ` • ${l.classroom}` : (!l.classroom && l.address ? ` • ${l.address}` : ''))}\n`}`;
        if (l.error && msg.includes(l.error)) break;
      }
    } else {
      msg += `Расписание не найдено.`;
    }
    msg += `\n\`\`\`\n[Ссылка на сайт](${schedule.link})`;
    const keyboard = this.parseKeyboard(schedules, (!userSchedule ? (edit ? edit.key : schedules[0].date.regular) : userSchedule.date.regular));
    keyboard.push([{ text: 'Отмена', callback_data: 'cancel-schedule' }]);
    if (edit) {
      this.client.telegram.editMessageText(ctx.chat.id, edit.message_id, edit.message_id, msg, { reply_markup: { inline_keyboard: keyboard }, parse_mode: 'Markdown' });
    } else {
      ctx.replyWithMarkdown(msg, { reply_markup: { inline_keyboard: keyboard } });
    }
  }

  /**
   * @param {import('@schedule/Parser.new').AvailableSchedulesData[]} schedules
   * @param {string} selectedSchedule
   * @returns {{text: string, callback_data: string}[][]}
   */
  parseKeyboard (schedules, selectedSchedule) {
    const list = schedules.map((s) => s.date.regular);
    const listWithoutSelected = list.removeItem(selectedSchedule);
    const data = [];
    listWithoutSelected.forEach((a) => {
      data.push({ text: a.custom_text ? a.custom_text : `${a}`, callback_data: a.custom_callback_data ? a.custom_callback_data : a });
    });
    return data.chunk(2);
  }

  /**
   * @param {import('../../structures/schedule/Parser.new').AvailableSchedulesData[]} schedules
   * @returns {Record<string,import('../../structures/schedule/Parser.new').AvailableSchedulesData}
   */
  schedulesByKeys (schedules) {
    const s = {};
    for (const schedule in schedules) {
      s[schedules[schedule].date.regular] = schedules[schedule];
    }
    return s;
  }
}
module.exports = ScheduleCommand;
