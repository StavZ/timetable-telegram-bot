import { Context } from "telegraf";
import TelegrafClient from "../../structures/client/Client.js";
import Command from "../../structures/models/Command.js";

export default class Bells extends Command {
  /**
   * @param {TelegrafClient} client 
   */
  constructor (client) {
    super({
      name: 'bells',
      description: 'Расписание звонков',
      aliases: [],
      priority: true
    })
    this.client = client;
  }

  /**
   * @param {Context} ctx 
   */
  async exec (ctx) {
    const bells = this.client.constants.bells;
    let msg = 'Расписание звонков\n\n\`\n';

    for (const bell of Object.keys(bells)) {
      const b = bells[bell]
      msg += `${bell} пара | ${b.start} - ${b.end}\n`
    }
    msg += `\`\n\`*\`Любые изменения в расписании звонков будут рассылаться разработчиком.`
    return ctx.replyWithMarkdown(msg);
  }
}