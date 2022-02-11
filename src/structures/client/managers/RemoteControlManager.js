import Module from '../../models/Module.js';
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
   *
   * @param {string} module
   * @param {moduleType} moduleType
   * @param {boolean} [createIfNotFound=true]
   * @return {moduleObject|null}
   */
  async getModule(module, moduleType, createIfNotFound = true) {
    const moduleSchema = await Module.findOne({
      name: module,
      type: moduleType,
    });
    if (!moduleSchema && createIfNotFound) {
      await this.createModule(module, moduleType);
      return await Module.findOne({ name: module, type: moduleType });
    }
    return moduleSchema ? moduleSchema.toObject() : null;
  }

  /**
   * @param {string} module
   * @param {moduleType} moduleType
   */
  createModule(module, moduleType) {
    switch (moduleType) {
      case 'command': {
        new Module({
          name: module,
          type: moduleType,
          remoteConfig: defaultCommandConfig,
        }).save();
        break;
      }
      case 'manager': {
        new Module({
          name: module,
          type: moduleType,
          remoteConfig: defaultManagerConfig,
        }).save();
        break;
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
    return Module.updateOne({ name: module, type: moduleType }, { remoteConfig: newConfig });
  }
}

/**
 * @typedef {'command'|'manager'} moduleType
 */
/**
 * @typedef {object} moduleObject
 * @prop {string} name
 * @prop {moduleType} type
 * @prop {{isDisabled:boolean,includeInHelp:boolean,ownerOnly:boolean}} remoteConfig
 */
