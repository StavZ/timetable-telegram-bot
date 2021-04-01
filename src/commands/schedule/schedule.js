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
      usage: 'расписание [сегодня|завтра]',
      description: 'Показывает расписание на сегодня (на завтра).',
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
    const user = await this.client.userManager.getUserSchema(ctx.from.id);
    if (!user || !user.group) {
      return this.client.commandHandler.getCommand('selectgroup').exec(ctx, []);
    }
    let today = true;
    if (args.length && args[0].match(/завтра/i)) {
      today = false;
    }
    const schedule = await this.client.parser.getScheduleByGroup(user.group, today);
    ctx.replyWithMarkdown(this.parse(schedule));
  }
  /**
   * @param {Schedule} schedule
   */
  parse (schedule) {
    let msg = `Расписание на ${this.client.moment(schedule.date, 'DD-MM-YYYY')}`;
    msg += `\nГруппа: \`${schedule.group}\`\n\`\`\`\n`;
    schedule.schedule.forEach((l) => {
      msg += `${l.number} пара - ${l.title}${l.teacher ? ` у ${l.teacher}` : ''}${l.classroom && l.address ? ` • ${l.classroom} | ${l.address}` : (l.classroom && !l.address ? ` • ${l.classroom}` : (!l.classroom && l.address ? ` • ${l.address}` : ''))}\n`;
    });
    msg += `\n\`\`\``;
    return msg;
  }
}
module.exports = ScheduleCommand;
