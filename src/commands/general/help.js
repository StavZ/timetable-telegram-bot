import {Context} from 'telegraf';
import Client from '../../structures/client/Client.js'
import Command from '../../structures/client/Command.js'

export default class HelpCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor (client) {
    super({
      name: 'help',
      aliases: ['помощь'],
      category: 'general',
      ownerOnly: false,
      description: 'Список команд бота.',
      includeInHelp: true,
      usage: 'помощь [команда]',
      path: import.meta.url
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
      commands.filter((c) => c.includeInHelp).forEach((command) => {
        msg += `- ${this.client.prefix}${command.name} - ${command.description}\n`
      })
      return ctx.replyWithMarkdown(msg);
    }
    if (this.client.commandHandler.hasCommand(args[0])) {
      const command = this.client.commandHandler.getCommand(args[0]);
      return ctx.replyWithMarkdown(`Команда: ${this.client.prefix}${command.name}\nОписание: ${command.description}\nИспользование: ${this.client.prefix}${command.usage}${command.aliases.length ? `\nСокращени${command.aliases.length > 1 ? 'я' : 'е'}: ${command.aliases.map((a) => `${this.client.prefix}${a}`).join(' | ')}` : ``}`)
    }
  }
}
