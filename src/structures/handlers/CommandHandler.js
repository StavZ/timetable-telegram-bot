import Collection from '@discordjs/collection';
import { resolve } from 'path';
import { walk } from 'walk';
import TelegrafClient from '../client/Client.js';
import Command from '../models/Command.js';

export default class CommandHandler {
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    this.client = client;
    this.commands = new Collection();
    this.aliases = new Collection();
  }

  loadAll() {
    const walker = walk('./src/commands/');
    return new Promise(async (res, rej) => {
      walker.on('file', async (root, stats, next) => {
        if (!stats.name.endsWith('.js')) next();
        const path = `file://${resolve(root)}\\${stats.name}`;
        const Command = await import(path);
        const command = new Command.default(this.client);
        const module = await this.client.remote.get(command.name, 'command', true);
        command.aliases.forEach((a) => {
          this.aliases.set(a, command.name);
        });
        this.commands.set(command.name, Object.assign(command, { config: module.config }));
        next();
      });

      walker.on('end', () => {
        this.client.logger.success('All commands loaded!');
        res(true)
      });
    });
  }

  /**
   * @param {string} query
   */
  async reload(query) {
    const command = this.getCommand(query);
    if (!command) return false;
    const module = await this.client.remote.get(command.name, 'command', false);
    command.config = module.config;
  }

  /**
   * @param {string} nameOrAlias
   * @returns {Command}
   */
  get(nameOrAlias) {
    if (this.commands.has(nameOrAlias)) {
      return this.commands.get(nameOrAlias);
    } else if (this.aliases.has(nameOrAlias)) {
      return this.commands.get(this.aliases.get(nameOrAlias));
    } else {
      return null;
    }
  }

  /**
   * @param {Collection} filter
   * @returns {Collection<string,Command>}
   */
  filter(filter) {
    return this.commands.filter(filter);
  }

  clear() {
    this.commands.clear()
    this.aliases.clear()
  }
}
