import { Context, Markup } from 'telegraf';
import Client from '../../structures/client/Client.js';
import Command from '../../structures/models/Command.js';

export default class Selectgroup extends Command {
  /**
   * @param {Client} client
   */
  constructor(client) {
    super({
      name: 'selectgroup',
      aliases: [],
      category: 'timetable',
      description: 'Выбор группы',
      usage: 'selectgroup',
      priority: true
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec(ctx, args) {
    const groups = this.config.groups;
    const groupIds = this.flip(this.config.groupIds);
    const user = await this.client.users.get(ctx.from.id);

    const keyboard = new Markup.inlineKeyboard(this.parseKeyboard(Object.keys(groupIds), 4));

    this.client.action('cancel-select-group', (ctx) => {
      ctx.editMessageText('Выбор группы был отменен');
    });

    let group;

    ctx.replyWithMarkdown('Для начала выберите свою специальность из списка ниже:', keyboard);

    Object.keys(groupIds).forEach((g) => {
      this.client.action(g, (ctx) => {
        const groupkb = new Markup.inlineKeyboard(this.parseKeyboard(groups[groupIds[g]], 4));

        ctx.editMessageText(`Вы выбрали специальность \`${groupIds[g]}\`.\nВыберите свою группу из списка ниже:`, { ...groupkb, parse_mode: 'Markdown' });

        groups[groupIds[g]].forEach((gr) => {
          this.client.action(gr, (ctx) => {
            group = gr;

            ctx.editMessageText(`Вы выбрали специальность \`${groupIds[g]}\`.\nВаша группа: \`${gr}\`.\n\nВерно?`, {
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: [[Markup.button.callback('Да', `agree-selectgroup`)], [Markup.button.callback('Нет', `disagree-selectgroup`)]],
              },
            });
          });
        });
      });
    });

    this.client.action('agree-selectgroup', (ctx) => {
      user._setGroup(group);
      ctx.editMessageText('Вы выбрали группу `' + group + '`', {
        parse_mode: 'Markdown',
      });
    });

    this.client.action('disagree-selectgroup', (ctx) => {
      ctx.deleteMessage(ctx.update.callback_query.message.message_id);
      group = null;
      this.exec(ctx, args);
    });
  }

  flip(json) {
    var res = {};
    for (var key in json) {
      res[json[key]] = key;
    }
    return res;
  }

  /**
   * @param {string[]} array
   * @param {number} chunkSize
   */
  parseKeyboard(array, chunkSize) {
    let _ = [];
    array.forEach((a) => {
      _.push(new Markup.button.callback(a, a));
    });
    _ = _.chunk(chunkSize);
    _.push([new Markup.button.callback('Отмена', 'cancel-select-group')]);
    return _;
  }
}
