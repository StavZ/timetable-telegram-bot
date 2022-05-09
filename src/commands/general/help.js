import { Context } from 'telegraf';
import TelegrafClient from '../../structures/client/Client.js';
import Command from '../../structures/models/Command.js';

export default class Help extends Command {
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    super({
      name: 'help',
      aliases: [],
      description: 'Список команд бота',
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   */
  async exec(ctx) {
    let msg = `Список команд @ppkslavyanovabot\n\n`;
    const priorityCommands = this.client.commands.filter((c) => (c.config.includeInHelp || !c.config.ownerOnly) && c.priority);
    const commands = this.client.commands.filter((c) => (c.config.includeInHelp || !c.config.ownerOnly) && !c.priority).sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
    msg += `Основные команды:\n${priorityCommands.map((c) => `• /${c.name} - ${c.description}`).join('\n')}\n\n`;
    msg += `${commands.map((c) => `- /${c.name} - ${c.description}`).join('\n')}`;
    return ctx.reply(msg);
  }
}
