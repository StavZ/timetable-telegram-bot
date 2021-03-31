const { Context } = require('telegraf');
const Client = require('../../structures/client/Client');
const Command = require('../../structures/client/Command');

class StartCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor (client) {
    super({
      name: 'start',
      aliases: ['старт'],
      category: 'general',
      ownerOnly: false,
      path: __filename,
      includeInHelp: false
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec (ctx, args) {
    this.client.commandHandler.getCommand('help').exec(ctx, []);
  }
}
module.exports = StartCommand;
