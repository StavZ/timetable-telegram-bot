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
      description: 'Отправляет список команд или показывает информацию об указанной команде.',
      usage: 'помощь [команда]',
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
        msg += `\`- ${c.name}\` - ${c.description}\n`;
      });
      msg += `\nИспользование: \`${this.client.prefix}команда\``;
      return ctx.replyWithMarkdown(msg);
    }
    if (this.client.commandHandler.hasCommand(args[0])) {
      const command = this.client.commandHandler.getCommand(args[0]);
      if (command.ownerOnly) return;
      return ctx.replyWithMarkdown(`Команда: \`${this.client.prefix}${command.name}\`\nОписание: \`${command.description}\`\nИспользование: \`${this.client.prefix}${command.usage}\`${command.aliases.length ? `\nСокращени${command.aliases.length > 1 ? 'я' : 'е'}: ${command.aliases.map((a) => `\`${this.client.prefix}${a}\``).join(' | ')}` : ``}`);
    }
  }
}
module.exports = HelpCommand;
