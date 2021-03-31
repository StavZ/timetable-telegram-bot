/* eslint-disable no-console */
const config = require('dotenv').config().parsed;
const Client = require('./src/structures/client/Client');
const client = new Client(config.TOKEN);

client.run();

process.once('SIGINT', () => client.stop('SIGINT'));
process.once('SIGTERM', () => client.stop('SIGTERM'));

client.on('message', (ctx) => {
  if (!ctx.message.text.startsWith('/')) return;
  if (ctx.from.is_bot) return;
  client.logger.info(`[${ctx.from.id}] ${ctx.from.username} > ${ctx.message.text}`);
  //if (ctx.message.text.toString().toLowerCase() === '/подписка') {
  //  client.manager.enableNewsletter(ctx.from.id, true);
  //  return ctx.reply('Вы успешно подписались на обновления бота.\nЯ уведомлю вас, когда бот будет готов к работе.');
  //}
  //if (ctx.from.id !== client.owner) {
  //  return ctx.replyWithMarkdown('В данный момент бот находится в стадии разработки.\nЧтобы получить уведомлении о начале работы бота, напишите \`/подписка\`');
  //}

  const args = ctx.message.text.slice('/'.length).trim().split(/ +/g);
  const command = args.shift();

  let cmd;
  if (client.commandHandler.commands.has(command)) {
    cmd = client.commandHandler.commands.get(command);
  } else if (client.commandHandler.aliases.has(command)) {
    cmd = client.commandHandler.commands.get(client.commandHandler.aliases.get(command));
  }
  if (!cmd) return;
  if (cmd.ownerOnly && ctx.from.id !== client.owner) {
    return ctx.reply('Данная команда доступна только разработчику!');
  }
  try {
    cmd.exec(ctx, args).catch((e) => {
      client.logger.error(e);
    });
  } catch (e) {
    client.logger.error(e);
  }
});
