import { Context } from 'telegraf';
import Client from '../../structures/client/Client.js';
import Command from '../../structures/client/Command.js';
import moment from 'moment-timezone';

export default class SupportCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor (client) {
    super({
      name: 'support',
      aliases: ['поддержка'],
      category: 'utils',
      ownerOnly: false,
      description: 'Обращение в поддержку бота',
      includeInHelp: true,
      usage: 'поддержка [вопрос]',
      path: import.meta.url
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec (ctx, args) {
    // 1.8e+6
    if (!args.length) {
      return ctx.replyWithMarkdown(`Вы не указали тему обращения.\nПожалуйста, указывайте Ваш вопрос полностью!\nИспользование: /${this.name} \`[вопрос]\`.`);
    }

    const user = await this.client.userManager.getUser(ctx.from.id);
    let messages = user.supportMessages;
    if (user.supportMessages.length) {
      let lastMessage = messages[messages.length - 1];
      if (Date.now() - lastMessage.date < 1.8e+6) {
        return ctx.replyWithMarkdown(`Обращение в поддержку доступно каждые 30 минут.\nСледующее обращение \`${moment(lastMessage.date + 1.8e+6).format('DD/MM/YYYY HH:MM')}\`.`);
      }
    }

    const message = {
      id: messages.length + 1,
      date: Date.now(),
      message: args.join(' ')
    };

    ctx.replyWithMarkdown(`Обращение в поддержку \`#${messages.length + 1}\`.\nВопрос: ${args.join(' ')}\n\nОжидайте ответа от разработчика.`).then((r) => {
      this.client.userManager.pushSupportMessage(ctx.from.id, message);
      this.client.sendToOwner(`Пользователь: \`${ctx.from.id}\`\nВопрос: ${args.join(' ')}\n\nОтветить: /supportanswer \`${ctx.from.id} ${messages.length + 1} [ответ]\`.`, { parse_mode: 'Markdown' });
    });
  }
}
