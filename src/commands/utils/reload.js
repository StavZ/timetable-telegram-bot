import {Context} from 'telegraf';
import Client from '../../structures/client/Client.js'
import Command from '../../structures/client/Command.js'

export default class ReloadCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor (client) {
    super({
      name: 'reload',
      aliases: [],
      category: 'utils',
      description: 'Позволяет перезагрузить команду.',
      usage: 'reload [команда]'
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec (ctx, args) {
    if (!args.length) return ctx.reply('Укажите команду для перезагрузки!');
    this.client.commandHandler.reload(args[0]).then((res) => {
      ctx.replyWithMarkdown(`Команда \`${res.name}\` была успешно перезагружена!`);
    }).catch((rej) => {
      if (!rej) return ctx.replyWithMarkdown(`Команда \`${args[0]}\` не найдена!`);
      ctx.replyWithMarkdown(`Произошла ошибка во время перезагрузки команды:\n${rej}`);
    });
  }
}
