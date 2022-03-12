import Client from '../Client.js';
const defaultCommandConfig = {
  includeInHelp: true,
  ownerOnly: false,
  isDisabled: false,
};
const defaultManagerConfig = {
  isDisabled: false,
};

export default class RemoteControlManager {
  /**
   * @param {Client} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * @param {string} module
   * @param {moduleType} moduleType
   * @param {boolean} [createIfNotFound=true]
   * @return {moduleObject|null}
   */
  async getModule(module, moduleType, createIfNotFound = true) {
    const moduleSchema = (await this.client.db.query('SELECT * FROM modules WHERE modulename = ($1) AND moduletype = ($2)', [module, moduleType])).rows[0];
    if (!moduleSchema && createIfNotFound) {
      return await this.createModule(module, moduleType);
    }
    return moduleSchema ? moduleSchema : null;
  }

  /**
   * @param {string} module
   * @param {moduleType} moduleType
   */
  async createModule(module, moduleType) {
    switch (moduleType) {
      case 'command': {
        return (await this.client.db.query('INSERT INTO modules (modulename, moduletype, config, runs) values ($1, $2, $3, $4) RETURNING *', [module, moduleType, defaultCommandConfig, 0])).rows[0];
      }
      case 'manager': {
        return (await this.client.db.query('INSERT INTO modules (modulename, moduletype, config) values ($1, $2, $3) RETURNING *', [module, moduleType, defaultManagerConfig])).rows[0];
      }
    }
  }

  /**
   *
   * @param {string} module
   * @param {moduleType} moduleType
   * @param {object} newConfig
   */
  async updateModuleConfig(module, moduleType, newConfig) {
    return (await this.client.db.query(`UPDATE modules SET config = ($1) WHERE modulename = '${module}' AND moduletype = '${moduleType}' RETURNING *`, [newConfig])).rows[0];
  }

  async addCommandRun(name) {
    let runs = Number((await this.getModule(name, 'command', false)).runs);
    return await this.client.db.query(`UPDATE modules SET runs = ($1) WHERE modulename = '${name}' AND moduletype = 'command' RETURNING *`, [runs++]);
  }
}

/**
 * @typedef {'command'|'manager'} moduleType
 */
/**
 * @typedef {object} moduleObject
 * @prop {string} modulename
 * @prop {moduleType} moduletype
 * @prop {{isDisabled:boolean,includeInHelp:boolean,ownerOnly:boolean}} config
 */
