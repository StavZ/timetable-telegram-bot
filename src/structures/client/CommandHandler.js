/* eslint-disable prefer-promise-reject-errors */
const walk = require('walk');
const { resolve } = require('path');
const Command = require('./Command');
const Collection = require('./Collection');

class CommandHandler {
  constructor (client) {
    this.client = client;
    this.commands = new Collection();
    this.aliases = new Collection();
  }

  load () {
    const walker = walk.walk('./src/commands');
    walker.on('file', (root, stats, next) => {
      if (!stats.name.endsWith('.js')) return;
      const Command = require(`${resolve(root)}/${stats.name}`);
      const command = new Command(this.client);
      command.aliases.forEach((r) => {
        this.aliases.set(r, command.name);
      });
      this.commands.set(command.name, command);
      next();
    });
  }
  /**
   * @param {string} command
   */
  reload (input) {
    return new Promise((resolve, reject) => {
      const command = this.getCommand(input);
      if (!command) return reject(false);
      try {
        delete require.cache[command.path];
        const cmd = new (require(command.path))(this.client);
        this.commands.delete(cmd.name);
        this.aliases.forEach((cmda, alias) => {
          if (cmda.name == command.name) this.aliases.delete(alias);
        });
        this.commands.set(command.name, cmd);
        cmd.aliases.forEach((alias) => {
          this.aliases.set(alias, cmd.name);
        });
        this.client.logger.success(`Command ${command.name} reloaded!`);
        resolve(cmd);
      } catch (e) {
        this.client.logger.info(`Failed to reload \`${command.name}\` command...`);
        this.client.logger.error(e);
        reject(e);
      }
    });
  }

  /**
   * @param {string} command
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
}
module.exports = CommandHandler;
