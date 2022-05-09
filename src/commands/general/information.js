import { Context } from 'telegraf';
import TelegrafClient from '../../structures/client/Client.js';
import Command from '../../structures/models/Command.js';

export default class Information extends Command {
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    super({
      name: 'information',
      aliases: ['info'],
      description: 'Информация о боте',
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   */
  async exec(ctx) {
    return ctx.replyWithMarkdown(
`Версия: \`v${this.client.version}\`

Новостной канал: [t.me/ppkbotnews](https://t.me/ppkbotnews)
Чат: [t.me/ppkbotchat](https://t.me/ppkbotchat)

Список изменений /changelog
Политика конфиденциальности /privacy

Разработчик: [VK](https://vk.com/stavzdev) | [TG](https://t.me/stavzdev)
Исходный код: [GitHub](https://github.com/StavZ/timetable-telegram-bot)`,
      {
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'VK', url: 'https://vk.com/stavzdev' },
              { text: 'TG', url: 'https://t.me/stavzdev' },
            ],
            [
              {
                text: 'GitHub',
                url: 'https://github.com/StavZ/timetable-telegram-bot',
              },
            ],
          ],
        },
      }
    );
  }
}
