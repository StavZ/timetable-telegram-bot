import { Context, Markup } from 'telegraf';
import TelegrafClient from '../../structures/client/Client.js';
import Command from '../../structures/models/Command.js';

export default class Autoscheduler extends Command {
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    super({
      name: 'autoscheduler',
      aliases: [],
      description: 'Включить/выключить автоматическую рассылку',
      priority: true
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   */
  async exec(ctx) {
    const user = await this.client.users.get(ctx.from.id);
    const currentStatus = user.autoScheduler;

    const keyboard = new Markup.inlineKeyboard([
      Markup.button.callback('Выключить', `disable-autoscheduler-${ctx.message.message_id}`, !currentStatus),
      Markup.button.callback('Включить', `enable-autoscheduler-${ctx.message.message_id}`, currentStatus),
    ]);

    ctx.replyWithMarkdown(`Текущий статус автоматической рассылки: \`${currentStatus ? 'Включена' : 'Выключена'}\`.`, keyboard);

    this.client.action(`disable-autoscheduler-${ctx.message.message_id}`, (ctx) => {
      user._setAutoschedulerState(!currentStatus)
      return ctx.editMessageText('Автоматическая рассылка выключена.')
    })
    this.client.action(`enable-autoscheduler-${ctx.message.message_id}`, (ctx) => {
      user._setAutoschedulerState(!currentStatus)
      return ctx.editMessageText('Автоматическая рассылка включена.')
    })
  }
}
