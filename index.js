/**
 * .env
 */
import * as dotenv from 'dotenv';
dotenv.config();

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
  global.dev = true;
}

/**
 * Timezone
 */
import moment from 'moment-timezone';
moment.tz.setDefault(process.env.TZ);

/**
 * Client initialization
 */
import TelegrafClient from './src/structures/client/Client.js';
const client = new TelegrafClient(process.env.NODE_ENV === 'development' ? process.env.DEV_TOKEN : process.env.TOKEN);
client.run();

const ignoreLogID = [1705065791];

client.commands
  .loadAll()
  .then(() => {
    const allCommands = [];
    client.commands.commands.forEach((c) => {
      allCommands.push(c.name);
    });
    client.commands.aliases.forEach((v, k) => {
      allCommands.push(k);
    });
    allCommands.forEach((c) => {
      client.command(c, async (ctx) => {
        if (!ctx.message.text) return;
        if (!ctx.message.text.startsWith(client.prefix)) return;
        if (ctx.from.is_bot) return;

        const cmd = client.commands.get(c);

        let args = ctx.message.text.slice(client.prefix.length).trim().split(/ +/g);
        args.shift();
        if (cmd.config.ownerOnly && !client.isOwner(ctx)) {
          return ctx.reply('Данная команда доступна только разработчику!');
        }
        if (cmd.config.isDisabled && !client.isOwner(ctx)) {
          return ctx.reply('Данная команда временно отключена!');
        }
        try {
          if (!cmd.exec) return;
          const user = await client.users.get(ctx.from.id);
          return cmd
            .exec(Object.assign(ctx, { user }), args)
            .catch((e) => client.logger.error(e))
            .then(async () => {
              if (!ignoreLogID.includes(ctx.from.id)) {
                client.logger.info(`[${ctx.from.id}] ${ctx.from.username ? ctx.from.username : ctx.from.first_name} => ${ctx.message.text}`);
                if (process.env.NODE_ENV === 'production') {
                  client.cmdRuns += 1;
                }
              }
            });
        } catch (e) {
          client.logger.error(e);
        }
        return ctx;
      });
    });
  })
  .catch(client.logger.error);

client.db.on('error', (err, client) => {
  client.logger.error(err);
});

process.once('SIGINT', () => {
  client.stop('SIGINT');
  client.db.end().then(() => {
    client.logger.info('Disconnected from Database');
  });
  client.commands.clear();
  client.cache.stop();
  client.manager.stop();
});
process.once('SIGTERM', () => {
  client.stop('SIGTERM');
  client.db.end().then(() => {
    client.logger.info('Disconnected from Database');
  });
  client.commands.clear();
  client.cache.stop();
  client.manager.stop();
});

client.catch((err, ctx) => {
  client.logger.error(err, ctx);
});

process.on('unhandledRejection', async (result, error) => {
  client.logger.error('[unhandledRejection]', error);
});

process.on('uncaughtException', (error) => {
  client.logger.error('[uncaughtException]', error);
});

global.sleep = function (s) {
  return new Promise((resolve) => setTimeout(resolve, s * 1000));
};
