const { Context } = require('telegraf');
const Client = require('../../structures/client/Client');
const Command = require('../../structures/client/Command');

class ReloadCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor (client) {
    super({
      name: 'reload',
      aliases: [],
      category: 'utils',
      ownerOnly: true,
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
    if (!args.length) return ctx.reply('Укажите команду для перезагрузки!');
    this.client.commandHandler.reload(args[0]).then((res) => {
      ctx.replyWithMarkdown(`Команда \`${res.name}\` была успешно перезагружена!`);
    }).catch((rej) => {
      if (!rej) return ctx.replyWithMarkdown(`Команда \`${args[0]}\` не найдена!`);
      ctx.replyWithMarkdown(`Произошла ошибка во время перезагрузки команды:\n${rej}`);
    });
  }
}
module.exports = ReloadCommand;
