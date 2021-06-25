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
    const userSchema = await this.client.userManager.getUserSchema(ctx.from.id);
    if (!userSchema) {
      this.client.userManager.createUserSchema(ctx.from.id, ctx.chat.id);
    } else {
      if (!userSchema.chatId) {
        this.client.userManager.updateUserSchema(ctx.from.id, 'chatId', ctx.chat.id);
      }
    }
    ctx.replyWithMarkdown('Моя главная функция:\nАвтоматическая рассылка расписания студентам колледжа.\nВ будущем будет добавлена автоматическая рассылка расписания преподавателям колледжа.\n\nМои основные команды:\n\`/selectgroup\` - Позволяет выбрать группу, чтобы в дальнейшем получать её расписание.\n\`/рассылка\` - Включить/выключить автоматическую рассылку расписания.\n\`/schedule\` - Отправляет текущее раcписание выбранной группы с сайта колледжа.\n\`/bells\` - Отправляет расписание звонков.\n\nБольше информации вы найдете с помощью \`/help\`.');
    // this.client.commandHandler.getCommand('help').exec(ctx, []);
  }
}
module.exports = StartCommand;
