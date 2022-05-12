import { Context } from 'telegraf';
import TelegrafClient from '../../structures/client/Client.js';
import Command from '../../structures/models/Command.js';
import sm from 'string-similarity';

export default class Emails extends Command {
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    super({
      name: 'email',
      description: 'Почта преподавателей',
      aliases: [],
      priority: true,
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec(ctx, args) {
    const emails = this.config.emails;

    if (!args.length) {
      return ctx.replyWithMarkdown(`Почта преподавателей:\n${emails.sort((a, b) => a.teacherShort.localeCompare(b.teacherShort)).map((e) => `${e.teacherShort} - \`${e.email}\``).join('\n')}\n\nНажмите на почту, чтобы скопировать.`);
    }

    const match = this.autoComplete(args);
    if (!match) return ctx.reply(`Преподаватель не найден.`);

    return ctx.replyWithMarkdown(`${match.teacher}\n\`${match.email}\`\n\nНажмите на почту, чтобы скопировать.`);
  }

  /**
   * @param {string[]} args
   */
  autoComplete(args) {
    const teachers = this.config.emails.map((t) => t.teacher);
    const match = sm.findBestMatch(args.join(' '), teachers);
    const bestMatch = match.bestMatch.target;
    const teacher = this.config.emails.find((t) => t.teacher === bestMatch);
    return teacher;
  }
}
