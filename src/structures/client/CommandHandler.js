import { Collection } from '@discordjs/collection';
import { resolve } from 'path';
import { walk } from 'walk';
import Client from './Client.js';
import Command from './Command.js';

export default class CommandHandler {
  /**
   * @param {Client} client
   */
  constructor(client) {
    this.client = client;
    /**
     * @type {Collection<string,Command>}
     */
    this.commands = new Collection();
    /**
     * @type {Collection<string,Command>}
     */
    this.aliases = new Collection();
  }

  loadAll() {
    const walker = walk('./src/commands');
    walker.on('file', async (root, stats, next) => {
      if (!stats.name.endsWith('.js')) return;
      const path = `file://${resolve(root)}\\${stats.name}`;
      const Command = await import(path);
      const command = new Command.default(this.client);
      const module = await this.client.remoteControl.getModule(command.name, 'command', true);
      command.aliases.forEach((a) => {
        this.aliases.set(a, command.name);
      });
      this.commands.set(command.name, Object.assign(command, { path, config: module.config }));
      next();
    });
    walker.on('end', () => {
      this.client.logger.success('All commands loaded!');
    });
  }

  /**
   * @param {string} query
   */
  async reload(query) {
    const command = this.getCommand(query);
    if (!command) return false;
    const module = await this.client.remoteControl.getModule(command.name, 'command', false);
    command.config = module.config;
  }

  /**
   * @param {string} command
   * @returns {Command}
   */
  getCommand(command) {
    if (this.commands.has(command)) {
      return this.commands.get(command);
    } else if (this.aliases.has(command)) {
      return this.commands.get(this.aliases.get(command));
    } else {
      return null;
    }
  }

  /**
   * @param {string} command
   * @returns {boolean}
   */
  hasCommand(command) {
    return this.commands.has(command) || this.aliases.has(command);
  }
}
