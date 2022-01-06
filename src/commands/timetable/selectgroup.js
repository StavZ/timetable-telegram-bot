import { Context } from 'telegraf';
import Client from '../../structures/client/Client.js';
import Command from '../../structures/client/Command.js';

export default class SelectgroupCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor(client) {
    super({
      name: 'selectgroup',
      aliases: ['выбрать-группу'],
      category: 'timetable',
      description: 'Выбор группы.',
      usage: 'selectgroup',
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

    const keyboard = this.parseKeyboard(Object.keys(groupIds)).chunk(4);
    keyboard.push([{ text: 'Отмена', callback_data: 'cancel-select-group' }]);

    this.client.action('cancel-select-group', (ctx) => {
      ctx.editMessageText('Выбор группы был отменен.');
    });

    let group;

    ctx.replyWithMarkdown(
      'Для начала выберите свою специальность из списка ниже:',
      { reply_markup: { inline_keyboard: keyboard } }
    );
    Object.keys(groupIds).forEach((g) => {
      this.client.action(g, async (ctx) => {
        const groupkb = this.parseKeyboard(groups[groupIds[g]]).chunk(4);
        groupkb.push([
          { text: 'Отмена', callback_data: 'cancel-select-group' },
        ]);
        ctx
          .editMessageText(
            `Вы выбрали специальность \`${groupIds[g]}\`.\nВыберите свою группу из списка ниже:`,
            { parse_mode: 'Markdown' }
          )
          .then(() => {
            ctx.editMessageReplyMarkup({ inline_keyboard: groupkb });
          });
        groups[groupIds[g]].forEach((gr) => {
          this.client.action(gr, (ctx) => {
            group = gr;
            ctx.editMessageText(
              `Вы выбрали специальность \`${groupIds[g]}\`.\nВаша группа: \`${gr}\`.\n\nВерно?`,
              {
                parse_mode: 'Markdown',
                reply_markup: {
                  inline_keyboard: [
                    [{ callback_data: 'agree', text: 'Да!' }],
                    [
                      {
                        callback_data: 'disagree',
                        text: 'Нет! Начать с начала',
                      },
                    ],
                  ],
                },
              }
            );
          });
        });
      });
    });

    this.client.action('agree', (ctx) => {
      this.client.userManager.setGroup(ctx.from.id, group);
      ctx.editMessageText('Вы выбрали группу `' + group + '`.', {
        parse_mode: 'Markdown',
      });
    });

    this.client.action('disagree', (ctx) => {
      ctx.deleteMessage(ctx.update.callback_query.message.message_id);
      group = null;
      this.exec(ctx, args);
    });
  }

  flip(json) {
    var ret = {};
    for (var key in json) {
      ret[json[key]] = key;
    }
    return ret;
  }

  /**
   * @param {string[]} array
   */
  parseKeyboard(array) {
    const _ = [];
    array.forEach((a) => {
      _.push({ text: a, callback_data: a });
    });
    return _;
  }
}
