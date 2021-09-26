import {Context} from 'telegraf';
import Client from '../../structures/client/Client.js'
import Command from '../../structures/client/Command.js'

export default class AutoschedulerCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor (client) {
    super({
      name: 'autoscheduler',
      aliases: ['рассылка'],
      category: 'timetable',
      usage: 'autoscheduler',
      ownerOnly: false,
      description: 'Включить/Выключить автоматическую рассылку расписания.',
      includeInHelp: true,
      path: import.meta.url
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec (ctx, args) {
    const user = await this.client.userManager.getUser(ctx.from.id);
    if (!user.group && !user.autoScheduler) {
      return ctx.replyWithMarkdown('Автоматическая рассылка не будет работать, пока вы не выбрали группу.\nВыберете группу с помощью команды `/selectgroup` и затем снова введите команду `/рассылка`.');
    }
    const currentStatus = user.autoScheduler;
    this.client.userManager.updateUser(ctx.from.id, 'autoScheduler', !currentStatus);
    ctx.reply(`Автоматическая рассылка ${!currentStatus ? 'включена' : 'выключена'}.`);
  }
}
