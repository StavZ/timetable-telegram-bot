import * as dotenv from 'dotenv';
dotenv.config();

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

/**
 * Timezone
 */
import moment from 'moment-timezone';
moment.tz.setDefault(process.env.TZ);

import Client from './src/structures/client/Client.js';
const client = new Client(process.env.NODE_ENV === 'development' ? process.env.DEV_TOKEN : process.env.TOKEN);
client.run();
client.prefix = '/';

process.once('SIGINT', () => client.stop('SIGINT'));
process.once('SIGTERM', () => client.stop('SIGTERM'));

client.on('message', (ctx) => {
  if (!ctx.message.text.startsWith(client.prefix)) return;
  if (ctx.from.is_bot) return;
  client.logger.info(`[${ctx.from.id}] ${ctx.from.username ? ctx.from.username : ctx.from.first_name} > ${ctx.message.text}`);

  const args = ctx.message.text.slice(client.prefix.length).trim().split(/ +/g);
  const command = args.shift();

  let cmd;
  if (client.commandHandler.commands.has(command)) {
    cmd = client.commandHandler.commands.get(command);
  } else if (client.commandHandler.aliases.has(command)) {
    cmd = client.commandHandler.commands.get(client.commandHandler.aliases.get(command));
  }
  if (!cmd) return;
  if (cmd.ownerOnly && !client.isOwner(ctx)) {
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
