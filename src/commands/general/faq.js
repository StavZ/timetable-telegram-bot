import { Context } from 'telegraf';
import Client from '../../structures/client/Client.js';
import Command from '../../structures/client/Command.js';

export default class FaqCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor (client) {
    super({
      name: 'faq',
      aliases: [],
      category: 'general',
      usage: 'faq',
      description: 'Информация о проекте и ответы на вопросы.',
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec (ctx, args) {
    const msg = `Данный проект создавался с целью удобности для студентов получать расписание пар с сайта колледжа, т.к. каждый раз заходить и проверять появилось расписание или нет, не удобно.\n\nНекоторые вопросы, на которые я отвечу:\n1. Будет-ли вводится монетизация (реклама, донат и т.д.)?\nНет! Я не собираюсь вводить рекламу или донат в функционал бота, т.к. обслуживание бота не тратит моих денежных средств, только моё время.\n\n2. Как Вы можете поддержать данный проект?\nНа данный момент, самая лучшая поддержка - это распространение бота среди студентов колледжа.\n\nЕсли у вас есть другие вопросы, напишите в поддержку /support или мне напрямую (ссылки на соц. сети находятся в /info).`;
    ctx.replyWithMarkdown(msg);
  }
}
