export default class Command {
  /**
   * @param {CommandOptions} options
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
    this.ownerOnly = Boolean(options.ownerOnly);
    this.path = options.path;
    this.includeInHelp = Boolean(options.includeInHelp);
  }
}

/**
 * @typedef {object} CommandOptions
 * @prop {string} name
 * @prop {string[]} aliases
 * @prop {string} category
 * @prop {boolean} ownerOnly
 * @prop {boolean} includeInHelp
 * @prop {string} description
 * @prop {string} usage
 */
