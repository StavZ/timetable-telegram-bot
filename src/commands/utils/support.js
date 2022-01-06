import { Context } from 'telegraf';
import Client from '../../structures/client/Client.js';
import Command from '../../structures/client/Command.js';
import moment from 'moment-timezone';
import ms from 'ms';

export default class SupportCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor(client) {
    super({
      name: 'support',
      aliases: ['поддержка'],
      category: 'utils',
      description: 'Служба поддержки бота',
      usage: 'support `[тема]`',
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec(ctx, args) {
    if (!args.length) {
      return ctx.replyWithMarkdown(
        `Вы не указали тему обращения.\nПожалуйста, указывайте тему обращения полностью!\nИспользование: /${this.name} \`[тема]\`.\n\nВы можете обратиться в поддержку раз в 15 минут, если Вас это не устраивает, то Вы можете обратиться к разработчику напрямую. Можете воспользоваться командой /info, там Вы найдете ссылки на Telegram и VK разработчика.`
      );
    }

    const user = await this.client.userManager.getUser(ctx.from.id);
    if (!user) await this.client.userManager.createUser(ctx.from.id);
    let messages = user.supportMessages;
    if (user.supportMessages.length) {
      let lastMessage = messages[messages.length - 1];
      if (Date.now() < lastMessage.date + 900000) {
        return ctx.replyWithMarkdown(
          `Обращение в поддержку доступно каждые 15 минут.\nСледующее обращение через \`${ms(
            900000 - (Date.now() - lastMessage.date)
          )}\`.\nЕсли Вы хотите обратиться к разработчику напрямую, можете воспользоваться командой /info, там Вы найдете ссылки на Telegram и VK разработчика.`
        );
      }
    }

    const message = {
      id: messages.length + 1,
      date: Date.now(),
      message: args.join(' '),
    };

    ctx
      .replyWithMarkdown(
        `Обращение в поддержку \`#${messages.length + 1}\`.\nТема: ${args.join(
          ' '
        )}\n\nОжидайте ответа от разработчика.`
      )
      .then((r) => {
        this.client.userManager.pushSupportMessage(ctx.from.id, message);
        this.client.sendToOwner(
          `Пользователь: \`${ctx.from.id}\`\nТема: ${args.join(
            ' '
          )}\n\nОтветить: /supportanswer \`${ctx.from.id} ${
            messages.length + 1
          } [ответ]\`.`,
          { parse_mode: 'Markdown' }
        );
      });
  }
}
