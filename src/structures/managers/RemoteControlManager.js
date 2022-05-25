import TelegrafClient from '../client/Client.js';

const defaultCommandConfig = {
  includeInHelp: true,
  ownerOnly: false,
  isDisabled: false,
};
const defaultManagerConfig = {
  isDisabled: false,
};

export default class RemoteControlManager {
  #client;
  /**
   *
   * @param {TelegrafClient} client
   */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Получить конфигурацию модуля
   * @param {string} module
   * @param {moduleType} moduleType
   * @param {boolean} [createIfNotFound=true]
   * @return {Promise<moduleObject|null>}
   */
  async get(module, moduleType, createIfNotFound = true) {
    const moduleSchema = await this.#client.db.query('SELECT * FROM modules WHERE modulename = ($1) AND moduletype = ($2)', [module, moduleType]);
    if (!moduleSchema.rows[0] && createIfNotFound) {
      return await this.create(module, moduleType);
    }
    return moduleSchema.rows[0] ? moduleSchema.rows[0] : null;
  }

  /**
   * Создать модуль
   * @param {string} module
   * @param {moduleType} moduleType
   */
  async create(module, moduleType) {
    let createdModule;
    switch (moduleType) {
      case 'command': {
        createdModule = await this.#client.db.query('INSERT INTO modules (modulename, moduletype, config) values ($1,$2,$3) RETURNING *', [module, moduleType, defaultCommandConfig]);
        break;
      }
      case 'manager': {
        createdModule = await this.#client.db.query('INSERT INTO modules (modulename, moduletype, config) values ($1,$2,$3) RETURNING *', [module, moduleType, defaultManagerConfig]);
        break;
      }
    }
    this.#client.logger.info(`Module ${module} created with ${moduleType} type`);
    return createdModule.rows[0];
  }

  /**
   * Обновить конфигурацию модуля
   * @param {string} module
   * @param {moduleType} moduleType
   * @param {object} newConfig
   */
  async updateConfig(module, moduleType, newConfig) {
    return (await this.#client.db.query('UPDATE modules SET config = ($1) WHERE modulename = ($2) AND moduletype = ($3)', [newConfig, module, moduleType])).rows[0];
  }

  /**
   * Удалить модуль
   * @param {string} module
   * @param {string} moduleType
   */
  async delete(module, moduleType) {
    return await this.#client.db.query('DELETE FROM modules WHERE modulename = ($1) AND moduletype = ($2)', [module, moduleType]);
  }
}

/**
 * @typedef {('command'|'manager')} moduleType
 */

/**
 * @typedef {object} moduleObject
 * @prop {string} modulename
 * @prop {moduleType} moduletype
 * @prop {{isDisabled:boolean,includeInHelp:boolean,ownerOnly:boolean}} config
 */
