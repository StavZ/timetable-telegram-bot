const { Context } = require('telegraf');
const Client = require('../../structures/client/Client');
const Command = require('../../structures/client/Command');

class BellsCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor (client) {
    super({
      name: 'звонки',
      aliases: ['bells', 'расписание-звонков'],
      category: 'schedule',
      ownerOnly: false,
      description: 'Расписание звонков.',
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
    const bells = {
      1: { start: '8:30', end: '9:50' },
      2: { start: '10:05', end: '11:25' },
      3: { start: '11:40', end: '13:00' },
      4: { start: '13:30', end: '14:50' },
      5: { start: '15:05', end: '16:25' },
      6: { start: '16:40', end: '18:00' }
    };
    let msg = 'Расписание звонов\n\n```\n';
    // eslint-disable-next-line guard-for-in
    for (const bellN in bells) {
      const bell = bells[bellN];
      msg += `${bellN} пара | ${bell.start} - ${bell.end}\n`;
    }
    msg += `\`\`\``;
    ctx.replyWithMarkdown(msg);
  }
}
module.exports = BellsCommand;
