const { Context } = require('telegraf');
const Client = require('../../structures/client/Client');
const Command = require('../../structures/client/Command');
const { inspect } = require('util');

class ProfileCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor (client) {
    super({
      name: 'профиль',
      aliases: ['profile'],
      category: 'schedule',
      ownerOnly: false,
      usage: 'профиль',
      description: 'Ваш профиль.',
      includeInHelp: true,
      path: __filename
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec (ctx, args) {
    const user = await this.client.userManager.getUserSchema(ctx.from.id);
    const roles = {
      'student': 'Студент',
      'teacher': 'Преподаватель'
    };
    ctx.replyWithMarkdown(`Профиль @${ctx.from.username}\n\nID: \`${user.id}\`\nВыбранная группа: \`${user.group ? user.group : 'Не выбрана'}\`\nРоль: \`${roles[user.role]}\``);
  }
}
module.exports = ProfileCommand;
