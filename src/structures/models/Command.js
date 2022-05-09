import { Context } from 'telegraf';

export default class Command {
  /**
   * @param {CommandOptions} options
   */
  constructor(
    options = {
      name: '',
      aliases: [],
      description: '',
      priority: false,
    }
  ) {
    /**
     * Название команды
     * @type {string}
     */
    this.name = options.name;
    /**
     * Псевдонимы команды
     * @type {string[]}
     */
    this.aliases = options.aliases;
    /**
     * Описание команды
     * @type {string}
     */
    this.description = options.description;
    /**
     * Является-ли приоритетной командой
     * @type {boolean}
     */
    this.priority = options.priority;
    /**
     * Конфигурация команды
     */
    this.config = {};
  }
}

/**
 * @typedef {object} CommandOptions
 * @prop {string} name
 * @prop {string[]} aliases
 * @prop {string} description
 * @prop {string} priority
 */
