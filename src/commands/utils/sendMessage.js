import { Context } from "telegraf";
import Client from "../../structures/client/Client.js";
import Command from "../../structures/client/Command.js";

export default class SendMessageCommand extends Command {
  /**
   * @param {Client} client 
   */
  constructor (client) {
    super({
      name: 'sendMessage',
      aliases: [],
      category: 'utils',
      description: 'Позволяет разработчику отправить сообщение всем пользователям.',
      usage: 'sendMessage \`[message]\`',
    });
    this.client = client;
  }
  /**
   * @param {Context} ctx 
   * @param {string[]} args 
   */
  async exec (ctx, args) {
    if (!args.length) return ctx.reply('Сообщение не указано!');

    const userID = Number(args[0]);
    if (isNaN(userID)) {
      let msg = args.join(' ');

      const users = (await this.client.userManager.getUsers({ autoScheduler: true })).filter((u) => u.group !== null);

      ctx.replyWithMarkdown(`Предпросмотр сообщения:\n\n${msg}\n\nДанное сообщение будет отправлено \`${users.length}\` пользователям.`, { reply_markup: { inline_keyboard: [[{ callback_data: 'agree-sendmessage-all', text: 'Отправить!' }], [{ callback_data: 'disagree-sendmessage-all', text: 'Отмена' }]] } });

      this.client.action('agree-sendmessage-all', (ctx) => {
        this.client.sendMessageAsDeveloper(msg, 'all');
        ctx.editMessageText(`${msg}\n\nСообщение было отправлено ${users.length} пользователям.`);
      });
      this.client.action('disagree-sendmessage-all', (ctx) => {
        ctx.editMessageText('Отправка сообщения была отменена.');
      });
    } else {
      let msg = args.slice(1).join(' ');

      ctx.replyWithMarkdown(`Предпросмотр сообщения:\n\n${msg}\n\nСообщение будет отправлено пользователю \`#${userID}\`.`, { reply_markup: { inline_keyboard: [[{ callback_data: 'agree-sendmessage-user', text: 'Отправить!' }], [{ callback_data: 'disagree-sendmessage-user', text: 'Отмена' }]] } });

      this.client.action('agree-sendmessage-user', (ctx) => {
        this.client.sendMessageAsDeveloper(msg, 'user', userID).then((r) => {
          if (r) {
            ctx.editMessageText(`${msg}\n\nСообщение было отправлен пользователю \`#${userID}\`.`, { parse_mode: 'Markdown' });
          } else {
            ctx.editMessageText(`Пользователь \`#${userID}\` не найден.`, { parse_mode: 'Markdown' });
          }
        });
      });
      this.client.action('disagree-sendmessage-user', (ctx) => {
        ctx.editMessageText('Отправка сообщения была отменена.');
      });
    }
  }
}