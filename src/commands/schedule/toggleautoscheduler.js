const { Context } = require('telegraf');
const Client = require('../../structures/client/Client');
const Command = require('../../structures/client/Command');

class ToggleautoschedulerCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor (client) {
    super({
      name: 'toggleautoscheduler',
      aliases: ['рассылка', 'auto'],
      category: 'schedule',
      ownerOnly: false,
      description: 'Включить/выключить автоматическую рассылку нового расписания.',
      includeInHelp: true,
      path: __filename
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec (ctx, args) {
    const user = await this.client.userManager.getUserSchema(ctx.from.id);
    const currentStatus = user.autoScheduler;
    this.client.userManager.updateUserSchema(ctx.from.id, 'autoScheduler', !currentStatus);
    ctx.reply(`Автоматическая рассылка ${!currentStatus ? 'включена' : 'выключена'}.`);
  }
}
module.exports = ToggleautoschedulerCommand;
