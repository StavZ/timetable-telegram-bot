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
      description: 'Включить/Выключить автоматическую рассылку расписания.'
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec (ctx, args) {
    const user = await this.client.userManager.getUser(ctx.from.id);
    const currentStatus = user.autoScheduler;
    this.client.userManager.updateUser(ctx.from.id, 'autoScheduler', !currentStatus);
    ctx.reply(`Автоматическая рассылка ${!currentStatus ? 'включена' : 'выключена'}.`);
  }
}
