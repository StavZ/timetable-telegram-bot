const { Context } = require('telegraf');
const Client = require('../../structures/client/Client');
const Command = require('../../structures/client/Command');
const Schedule = require('../../structures/schedule/Schedule');

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
      usage: 'расписание',
      description: 'Показывает расписание.',
      includeInHelp: true,
      path: __filename
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec (ctx, args, selectedSchedule, edit = false, message_id, inline_id) {
    const user = await this.client.userManager.getUserSchema(ctx.from.id);
    if (!user || !user.group) {
      return this.client.commandHandler.getCommand('selectgroup').exec(ctx, []);
    }
    const schedules = await this.client.parser.getAvailableSchedules();
    if (!selectedSchedule) {
      selectedSchedule = schedules[0].date.regular;
    }
    console.log(message_id);
    console.log(inline_id);
    schedules.push({ date: { regular: { custom_callback_data: 'cancel', custom_text: 'Отмена' } } });
    const keyboard = this.parseKeyboard(schedules, selectedSchedule);
    if (edit) {
      this.client.telegram.editMessageText(ctx.chat.id, message_id, inline_id, this.parseScheduleMessage(schedules.find((s) => s.date.regular === selectedSchedule), user.group), { reply_markup: { inline_keyboard: keyboard }, parse_mode: 'Markdown' });
    } else {
      ctx.replyWithMarkdown(this.parseScheduleMessage(schedules[0], user.group), { reply_markup: { inline_keyboard: keyboard } });
    }
    // schedules
    keyboard[0].forEach((k) => {
      this.client.action(k.callback_data, (ctx_copy) => {
        selectedSchedule = k.text;
        console.log(ctx_copy.update);
        this.client.commandHandler.getCommand('schedule').exec(ctx, [], k.callback_data, true, ctx_copy.update.callback_query.message.message_id, ctx_copy.update.callback_query.message.message_id);
        //ctx.editMessageText(this.parseScheduleMessage(schedules.find((s) => s.date.regular === k.text), user.group), { parse_mode: 'Markdown' });
      });
    });

    // cancel
    keyboard[1].forEach((k) => {
      this.client.action(k.callback_data, (ctx) => {
        ctx.editMessageReplyMarkup({});
      });
    });
  }

  /**
   * @param {import('@schedule/Parser.new').AvailableSchedulesData} schedule
   * @param {string} selectedGroup
   * @returns {string}
   */
  parseScheduleMessage (schedule, selectedGroup) {
    let msg = `${schedule.dateString}\nГруппа: ${selectedGroup}\n\`\`\`\n`;
    const groupSchedule = schedule.schedule.find((s) => s.group === selectedGroup);
    if (!groupSchedule) return `Прозошла ошибка! Посетите сайт для просмотра расписания на ${schedule.date.regular}\n[Ссылка на сайт](${schedule.link})`;
    for (const l of groupSchedule.schedule) {
      msg += `${l.error ? `${l.error}\n` : `${l.number} пара - ${l.title}${l.teacher ? ` у ${l.teacher}` : ''}${l.classroom && l.address ? ` • ${l.classroom} | ${l.address}` : (l.classroom && !l.address ? ` • ${l.classroom}` : (!l.classroom && l.address ? ` • ${l.address}` : ''))}\n`}`;
      if (l.error && msg.includes(l.error)) break;
    }
    msg += `\n\`\`\`[Ссылка на сайт](${schedule.link})`;
    return msg;
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
      data.push({ text: a.custom_text ? a.custom_text : a, callback_data: a.custom_callback_data ? a.custom_callback_data : a });
    });
    return data.chunk(2);
  }
}
module.exports = ScheduleCommand;
