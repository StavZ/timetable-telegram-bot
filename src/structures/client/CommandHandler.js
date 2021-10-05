import { Collection } from "@discordjs/collection";
import path, { resolve } from "path";
import { walk } from "walk";
import Client from "./Client.js";
import Command from "./Command.js";

export default class CommandHandler {
  /**
   * @param {Client} client 
   */
  constructor (client) {
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

  load () {
    const walker = walk('./src/commands');
    walker.on('file', async (root, stats, next) => {
      if (!stats.name.endsWith('.js')) return;
      const path = `file://${resolve(root)}\\${stats.name}`;
      const Command = await import(path);
      const command = new Command.default(this.client);
      const module = await this.client.remoteControl.getModule(command.name, 'command');
      command.aliases.forEach((a) => {
        this.aliases.set(a, command.name);
      });
      this.commands.set(command.name, Object.assign(command, { path: path, config: module.remoteConfig }));
      next();
    });
    walker.on('end', () => {
      this.client.logger.success('All commands loaded!')
    })
  }

  /**
   * @param {string} command
   * @returns {Promise<boolean|Command>}
   */
  reload (input) {
    return new Promise(async (resolve, reject) => {
      const command = this.getCommand(input);
      if (!command) return reject(false);
      var commandCache = command;
      try {
        const cmd = new ((await import(commandCache.path)).default)(this.client);
        this.commands.delete(cmd.name);
        this.aliases.forEach((cmda, alias) => {
          if (cmda.name === cmd.name) this.aliases.delete(alias);
        });
        const module = await this.client.remoteControl.getModule(cmd.name, 'command');
        this.commands.set(cmd.name, Object.assign(cmd, {config: module.remoteConfig}));
        cmd.aliases.forEach((alias) => {
          this.aliases.set(alias, cmd.name);
        });
        this.client.logger.success(`Command ${cmd.name} reloaded!`);
        commandCache = null;
        resolve(cmd);
      } catch (e) {
        this.client.logger.info(`Failed to reload ${commandCache.name}`);
        this.client.logger.error(e);
        reject(e);
      }
    });
  }

  /**
   * @param {string} command
   * @returns {Command}
   */
  getCommand (command) {
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
  hasCommand (command) {
    return this.commands.has(command) || this.aliases.has(command);
  }
}