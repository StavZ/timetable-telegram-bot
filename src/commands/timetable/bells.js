import {Context} from 'telegraf';
import Client from '../../structures/client/Client.js'
import Command from '../../structures/client/Command.js'

export default class BellsCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor (client) {
    super({
      name: 'bells',
      aliases: ['звонки', 'раcписание-звонков'],
      category: 'timetable',
      ownerOnly: false,
      description: 'Отправляет раписание звонков.',
      usage: 'bells',
      includeInHelp: true,
      path: import.meta.url
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
    let msg = `Раcписание звонков\n\n\`\`\`\n`;
    for (const bellN in bells) {
      const bell = bells[bellN];
      msg += `${bellN} пара | ${bell.start} - ${bell.end}\n`
    }
    msg += `\`\`\``;
    ctx.replyWithMarkdownV2(msg);
  }
}
