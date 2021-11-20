import * as dotenv from 'dotenv';
dotenv.config();

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

/**
 * Timezone
 */
import moment from 'moment-timezone';
import { TelegramError } from 'telegraf';
moment.tz.setDefault(process.env.TZ);

import Client from './src/structures/client/Client.js';
import Command from './src/structures/client/Command.js';
import Module from './src/structures/models/Module.js';
const client = new Client(process.env.NODE_ENV === 'development' ? process.env.DEV_TOKEN : process.env.TOKEN);
client.run();

const loggerBlacklist = [1705065791];

process.once('SIGINT', () => {
  client.stop('SIGINT');
  if (!client.manager.isDisabled) {
    client?.manager.stopListeners();
  }
});
process.once('SIGTERM', () => {
  client.stop('SIGTERM');
  if (!client.manager.isDisabled) {
    client?.manager.stopListeners();
  }
});

client.on('message', (ctx) => {
  if (!ctx.message.text) return;
  if (!ctx.message.text.startsWith(client.prefix)) return;
  if (ctx.from.is_bot) return;

  if (!loggerBlacklist.includes(ctx.from.id)) {
    client.logger.info(`[${ctx.from.id}] ${ctx.from.username ? ctx.from.username : ctx.from.first_name} > ${ctx.message.text}`);
  }

  const args = ctx.message.text.slice(client.prefix.length).trim().split(/ +/g);
  const command = args.shift();

  /**
   * @type {Command}
   */
  let cmd;
  if (client.commandHandler.commands.has(command)) {
    cmd = client.commandHandler.commands.get(command);
  } else if (client.commandHandler.aliases.has(command)) {
    cmd = client.commandHandler.commands.get(client.commandHandler.aliases.get(command));
  }
  if (!cmd) return;
  if (cmd.config.ownerOnly && !client.isOwner(ctx)) {
    return ctx.reply('Данная команда доступна только разработчику!');
  }
  if (cmd.config.isDisabled && !client.isOwner(ctx)) {
    return ctx.reply('Данная команда отключена!');
  }
  try {
    if (!cmd.exec) {
      return ctx.replyWithMarkdown(`В данный момент эта команда отключена и не доступна!`);
    }
    cmd.exec(ctx, args).then(async () => {
      const module = await Module.findOne({ name: cmd.name, type: 'command' });
      module.runs += 1;
      module.save();
    });
  } catch (e) {
    client.logger.error(e);
  }
});

process.on('unhandledRejection', (result, error) => {
  if (error instanceof TelegramError) {
    if (error.code === 409) {
      client.logger.warn('Detected TelegramError code 409!');
      process.exit(1);
    }
  }
  client.logger.error('[unhandledRejection]', error);
});

process.on('uncaughtException', (error) => {
  client.logger.error('[uncaughtException]', error);
});