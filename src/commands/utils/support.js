import { Context } from 'telegraf';
import TelegrafClient from '../../structures/client/Client.js';
import Command from '../../structures/models/Command.js';

export default class Support extends Command {
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    super({
      name: 'support',
      aliases: [],
      description: 'Служба поддержки',
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   */
  async exec(ctx) {
    return ctx.replyWithMarkdown(
`В обновлении \`v6.0.0\` и выше встроенная служба поддержки удалена из функционала бота.

По вопросам, пожалуйста, обращайтесь напрямую к разработчику через соц.сети:
VK: [vk.com/stavzdev](https://vk.com/stavzdev)
Telegram: [t.me/stavzdev](https://t.me/stavzdev)
Чат: [t.me/ppkbotchat](https://t.me/ppkbotchat)

Если Вы обнаружили ошибку в боте, пожалуйста, присылайте скриншоты из чата с ботом или описывайте Ваши действия, как произошла данная ошибка.`, { disable_web_page_preview: true });
  }
}
