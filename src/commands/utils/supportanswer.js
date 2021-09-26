import { Context } from 'telegraf';
import Client from '../../structures/client/Client.js';
import Command from '../../structures/client/Command.js';

export default class SupportAnswer extends Command {
  /**
   * @param {Client} client
   */
  constructor (client) {
    super({
      name: 'supportanswer',
      aliases: [],
      category: 'utils',
      ownerOnly: true,
      description: 'Ответ на обращение в поддержку.',
      includeInHelp: false,
      path: import.meta.url
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec (ctx, args) {
    if (!args.length) {
      return ctx.reply('Укажите ID пользователя, номер обращения и ответ.');
    }

    const userID = args[0];
    const messageID = args[1];
    const answer = args.slice(2).join(' ');

    const user = await this.client.userManager.getUser(userID);
    if (!user) {
      return ctx.reply('Пользователь не найден!');
    }

    const message = user.supportMessages[messageID - 1];

    ctx.reply(`Ответ отправлен пользователю ${user.id}.`).then(() => {
      this.client.telegram.sendMessage(user.id, `Ответ разработчика на ваше обращение \`#${messageID}\`.\n\nВаш вопрос: ${message.message}\n\nОтвет разработчика: ${answer}`, { parse_mode: 'Markdown' });
    });

  }
}
