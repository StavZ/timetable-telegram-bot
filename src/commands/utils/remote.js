import { Context } from 'telegraf';
import Client from '../../structures/client/Client.js';
import Command from '../../structures/client/Command.js';

export default class RemoteControlCommand extends Command {
  /**
   * @param {Client} client
   */
  constructor(client) {
    super({
      name: 'remote',
      aliases: [],
      category: 'utils',
      description: 'Удаленное управление модулями.',
      usage: 'remote `[module] [type] [setting] [value]`',
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx
   * @param {string[]} args
   */
  async exec(ctx, args) {
    if (!args.length || args.length < 2)
      return ctx.reply(
        'Использование: /remote `[module] [type] [setting] [value]`'
      );
    const module = args[0];
    const moduleType = args[1].toLowerCase();
    const moduleSchema = await this.client.remoteControl.getModule(
      module,
      moduleType,
      false
    );
    if (!moduleSchema) return ctx.reply('Модуль не найден.');
    if (args.length === 2) {
      const keys = Object.keys(moduleSchema.remoteConfig);
      let config = '';
      for (const key of keys) {
        // if (typeof moduleSchema.remoteConfig[key] !== 'boolean') continue;
        config += `• ${key}: \`${moduleSchema.remoteConfig[key]}\`\n`;
      }
      ctx.replyWithMarkdown(
        `Модуль: \`${moduleSchema.name}\`\nТип: \`${moduleSchema.type}\`\nКонфиг:\n${config}`
      );
      return;
    }
    const setting = args[2];
    let value = this.getValue(args.slice(3).join(' '));

    let config = moduleSchema.remoteConfig;
    config[setting] = value;
    this.client.remoteControl
      .updateModuleConfig(module, moduleType, config)
      .then(() => {
        ctx
          .replyWithMarkdown(
            `Модуль ${moduleSchema.name} \`[${
              moduleSchema.type
            }]\` был обновлен.\nЗначение \`${setting}\` было изменено на \`${value} [${typeof value}]\`.`
          )
          .then(() => {
            this.performChanges(moduleSchema.name, moduleSchema.type, config);
          });
      })
      .catch(this.client.logger.error);
  }

  /**
   * @param {string} value
   * @returns {string|boolean|number}
   */
  getValue(value) {
    const booleanRegex = /^(true|false)$/;
    const stringRegex = /[a-zа-я]{0,}\D/gi;
    const numberRegex = /^\d+$/g;

    if (booleanRegex.test(value)) {
      switch (value) {
        case 'true': {
          return true;
        }
        case 'false': {
          return false;
        }
      }
    }

    if (numberRegex.test(value)) {
      return Number(value);
    }

    if (stringRegex.test(value)) {
      return value;
    }
  }

  performChanges(module, moduleType, config) {
    switch (moduleType) {
      case 'command': {
        this.client.commandHandler
          .reload(module)
          .catch(this.client.logger.error);
        break;
      }
      case 'manager': {
        if (config.cacheInterval !== this.client.manager.interval) {
          this.client.manager.interval = config.cacheInterval;
        }
        if (config.isDisabled === true) {
          this.client.manager.stopListeners();
        } else {
          this.client.manager.startListeners();
        }
        break;
      }
    }
  }
}
