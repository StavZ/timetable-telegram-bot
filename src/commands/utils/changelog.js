import { Context } from 'telegraf';
import Client from '../../structures/client/Client.js';
import Command from '../../structures/client/Command.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export default class ChangelogCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor(client) {
    super({
      name: 'changelog',
      aliases: ['список-изменений'],
      category: 'utils',
      usage: 'changelog',
      description: 'Список изменений.',
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec(ctx, args) {
    /**
     * @type {Object.<string,{changelog:{content:string,important:boolean}[],old:boolean,date:string}>}
     */
    const changelogs = require('../../../changelogs.json');
    const keys = Object.keys(changelogs);

    keys.forEach((k) => {
      if (changelogs[k].old) {
        delete changelogs[k];
      }
    });

    this.client.action('cancel-changelog', (ctx) => {
      ctx.editMessageReplyMarkup({ inline_keyboard: null });
    });

    keys.forEach((key) => {
      this.client.action(key, (ctx) => {
        this.showChangelog(ctx, changelogs, key, {
          message_id: ctx.update.callback_query.message.message_id,
        });
      });
    });

    this.showChangelog(ctx, changelogs, keys[0]);
  }

  showChangelog(ctx, changelogs, key, edit) {
    const changelog = changelogs[key].changelog;
    let msg = `Список изменений \`v${key}\`\nДата обновления \`${changelogs[key].date}\`\n`;
    for (const c of changelog) {
      msg += ` • ${c.important ? `*${c.content}*` : c.content}\n`;
    }
    const keyboard = this.parseKeyboard(changelogs, key);
    keyboard.push([{ text: 'Убрать кнопки', callback_data: 'cancel-changelog' }]);
    if (edit) {
      this.client.telegram.editMessageText(ctx.chat.id, edit.message_id, edit.message_id, msg, { reply_markup: { inline_keyboard: keyboard }, parse_mode: 'Markdown' });
    } else {
      ctx.replyWithMarkdown(msg, {
        reply_markup: { inline_keyboard: keyboard },
      });
    }
  }

  parseKeyboard(changelogs, selected) {
    const keys = Object.keys(changelogs);
    keys.removeItem(selected);
    const data = [];
    keys.forEach((k) => {
      data.push({ text: `v${k}`, callback_data: k });
    });
    return data.chunk(3);
  }
}
