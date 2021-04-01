
class Command {
  /**
   * @param {string} id
   * @param {ClientOptions} options
   */
  constructor (options = {
    name: '',
    aliases: [],
    category: '',
    description: '',
    ownerOnly: false,
    path: '',
    usage: '',
    includeInHelp: true
  }) {
    this.name = options.name;
    this.aliases = options.aliases;
    this.category = options.category;
    this.description = options.description;
    this.usage = options.usage;
    this.ownerOnly = typeof options.ownerOnly === 'boolean' ? options.ownerOnly : false;
    this.path = options.path;
    this.includeInHelp = typeof options.includeInHelp === 'boolean' ? options.includeInHelp : true;
  }
  exec () {
    return new Error('No exec function!');
  }
}
module.exports = Command;

/**
 * @typedef {object} ClientOptions
 * @prop {string} name
 * @prop {string[]} aliases
 * @prop {string} category
 * @prop {boolean} ownerOnly
 */
