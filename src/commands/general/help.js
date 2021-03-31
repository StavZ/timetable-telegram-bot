const { Context } = require('telegraf');
const { command } = require('../../structures/client/Client');
const Client = require('../../structures/client/Client');
const Command = require('../../structures/client/Command');

class HelpCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor (client) {
    super({
      name: 'помощь',
      aliases: ['help'],
      category: 'general',
      description: 'Список команд бота.',
      ownerOnly: false,
      path: __filename
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec (ctx, args) {
    if (!args.length) {
      const commands = this.client.commandHandler.commands;
      let msg = `Список команд @ppkslavyanovabot\n\n`;
      commands.filter((c) => c.includeInHelp).forEach((c) => {
        msg += `\`/${c.name}\` - ${c.description}\n`;
      });
      return ctx.replyWithMarkdown(msg);
    }
  }
}
module.exports = HelpCommand;
