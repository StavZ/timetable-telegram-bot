import { Context, Markup } from 'telegraf';
import TelegrafClient from '../../structures/client/Client.js';
import Command from '../../structures/models/Command.js';

export default class Start extends Command {
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    super({
      name: 'start',
      aliases: [],
      description: 'Стартовая команда бота',
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   */
  async exec(ctx) {
    let user = await this.client.users.get(ctx.from.id);
    if (!user) user = await this.client.users.create(ctx.from.id);

    this.client.action('start-select-group', (ctxs) => {
      return this.client.commands.get('selectgroup').exec(ctx, []);
    });

    const msg = `Привет!
Я бот колледжа ППК им. Н.Г. Славянова.

Мои функции:
- Автоматическая рассылка расписания пар 🗓
- Удобный поиск/просмотр дистанционных заданий 🔎
- Расписание преподавателей 👨‍🏫
- Почта преподавателей ✉️
С каждой версией функций становится больше 🚀

Новостной канал: https://t.me/ppkbotnews 
Чат: https://t.me/ppkbotchat
Важная информация о проекте - [здесь](https://t.me/ppkbotnews/11)

Выбрать группу - /selectgroup
Информация о проекте - /faq
Список команд - /help

Версия: \`v${this.client.version}\`
Разработчик: 
VK: https://vk.com/stavzdev
TG: https://t.me/stavzdev`;

    return ctx.replyWithMarkdown(msg, {
      disable_web_page_preview: true,
      reply_markup: { inline_keyboard: [[Markup.button.callback('Выбрать группу', 'start-select-group')]], one_time_keyboard: true },
    });
  }
}
