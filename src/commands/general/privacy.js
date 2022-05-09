import { Context } from 'telegraf';
import TelegrafClient from '../../structures/client/Client.js';
import Command from '../../structures/models/Command.js';

export default class Privacy extends Command {
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    super({
      name: 'privacy',
      aliases: [],
      description: 'Политика конфиденциальности',
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   */
  async exec(ctx) {
    return ctx.replyWithMarkdown(
      `
Политика конфиденциальности @ppkslavyanovabot:

 • Бот не хранит в базе данных и не запоминает ваши никнеймы или имя и фамилию, которую вы указали в своём профиле Telegram.
 • Бот сохраняет ваш уникальный ID, который предоставляет Telegram Bot API для того, чтобы сохранять данные для каждого пользователя отдельно.
 • В базе данных хранится только выбранная вами группа, ваш курс (расчитывается из выбранной вами группы) и дату регистрации в системе бота (с версии v5.0.0) для более подробной статистики бота.
 • Разработчик никак не взаимодействует с колледжем напрямую. Вся информация берётся с официального сайта колледжа https://ppkslavyanova.ru.
 • *Ваши данные не предоставляются третьим лицам!*

Вы можете проверить это в исходном коде бота: [GitHub](https://github.com/StavZ/timetable-telegram-bot).

Если у вас есть вопросы - обратитесь к разработчику /support.`,
      { disable_web_page_preview: true }
    );
  }
}
