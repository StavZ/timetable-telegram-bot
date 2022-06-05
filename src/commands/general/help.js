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
      priority: false,
      tempHide: false
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   */
  async exec(ctx) {
    let msg = `Список команд @ppkslavyanovabot\n\n`;
    // @ts-ignore
    const priorityCommands = this.client.commands.filter((c) => (c.config.includeInHelp || !c.config.ownerOnly) && c.priority);
    // @ts-ignore
    const commands = this.client.commands.filter((c) => (c.config.includeInHelp || !c.config.ownerOnly) && !c.priority && !c.tempHide).sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
    msg += `Основные команды:\n${priorityCommands.map((c) => `• /${c.name} - ${c.description}`).join('\n')}\n\n`;
    msg += `${commands.map((c) => `- /${c.name} - ${c.description}`).join('\n')}`;
    return ctx.reply(msg);
  }
}
