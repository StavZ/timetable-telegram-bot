const User = require('../../models/User');

class UserManager {
  constructor (client) {
    this.client = client;
  }
  /**
 * @param {number} id
 * @param {string} group
 */
  async setGroup (id, group) {
    return this.updateUserSchema(id, 'group', group);
  }

  /**
   * @param {number} id
   * @param {boolean} bool
   */
  async enableNewsletter (id, bool) {
    return this.updateUserSchema(id, 'newsletter', bool);
  }

  async getAllUsers (options) {
    return await User.find(options);
  }

  /**
   * @param {number} id
   */
  async createUserSchema (id, chatId) {
    const newSchema = new User({
      id: id,
      selectedGroup: null,
      lastSentSchedule: {},
      role: 'student',
      chatId
    });
    return await newSchema.save();
  }

  /**
   * @param {number} id
   * @returns {Promise<Object>}
   */
  async getUserSchema (id) {
    const schema = await User.findOne({ id: id });
    if (!schema) {
      return (await this.createUserSchema(id));
    }
    return schema;
  }

  /**
   * @param {number} id
   * @param {Object} data
   */
  async updateUserSchema (id, name, value) {
    const schema = await User.findOne({ id });
    schema[name] = value;
    return schema.save();
  }
}
module.exports = UserManager;
