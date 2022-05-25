import { Context } from 'telegraf';
import TelegrafClient from '../../structures/client/Client.js';
import Command from '../../structures/models/Command.js';

export default class Remote extends Command {
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    super({
      name: 'remote',
      description: 'Удаленное управление модулями',
      aliases: [],
      priority: false
    });
    this.client = client;
  }

  /**
   *
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec(ctx, args) {
    if (!args.length || args.length < 2) return ctx.replyWithMarkdown('Использование: `/remote [module-name] [module-type] [prop] [value]`.');

    const moduleName = args[0];
    const moduleType = args[1];
    // @ts-ignore
    const module = await this.client.remote.get(moduleName, moduleType, false);
    if (!module) return ctx.reply(`Модуль ${moduleName} [${moduleType}] не найден.`);

    if (args.length === 2) {
      const keys = Object.keys(module.config);
      let config = '';
      for (const key of keys) {
        config += `• ${key}: \`${module.config[key]}\`\n`;
      }
      ctx.replyWithMarkdown(`Модуль: \`${module.modulename}\`\nТип: \`${module.moduletype}\`\nКонфиг:\n${config}`);
      return;
    }
  }
}
