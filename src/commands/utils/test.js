/* eslint-disable no-console */
const { Context, Markup } = require('telegraf');
const Client = require('../../structures/client/Client');
const Command = require('../../structures/client/Command');

class TestCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor (client) {
    super({
      name: 'test',
      aliases: ['t'],
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
    console.time('test');
    this.client.parser.parsePage().then((r) => {
      ctx.reply('parsed');
      console.timeEnd('test');
    });
    console.log(this.client.fetcher.cache.size);
    // console.log(this.client.fetcher.cache);
  }
}
module.exports = TestCommand;
