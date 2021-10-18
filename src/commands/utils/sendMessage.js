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

    let msg = args.join(' ');

    const users = await this.client.userManager.getUsers({ autoScheduler: true });

    ctx.replyWithMarkdown(`Предосмотр сообщения:\n\n${msg}\n\nДанное сообщение будет отправлено \`${users.length}\` пользователям.`, { reply_markup: { inline_keyboard: [[{ callback_data: 'agree-sendmessage', text: 'Отправить!' }], [{ callback_data: 'disagree-sendmessage', text: 'Отмена' }]] } });

    this.client.action('agree-sendmessage', (ctx) => {
      this.client.sendMessageAsDeveloper(msg, 'all');
      ctx.editMessageText(`${msg}\n\nБыло отправлено ${users.length} пользователям.`)
    });
    this.client.action('disagree-sendmessage', (ctx) => {
      ctx.editMessageText('Отправка сообщения была отменена.')
    })
  }
}