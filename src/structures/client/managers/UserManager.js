import consola from 'consola';
const { Consola } = consola;
import User from "../../models/User.js";
import Schedule from '../../parser/Schedule.js';

export default class UserManager {
  constructor (logger) {
    /**
     * @type {Consola}
     */
    this.logger = logger;
  }

  /**
   * @param {number} id
   * @param {string} group
   * @returns {user}
   */
  setGroup (id, group) {
    return this.updateUser(id, 'group', group);
  }

  /**
   * @param {number} id
   * @param {Schedule} schedule
   * @returns {user}
   */
  setLastSentSchedule (id, schedule) {
    return this.updateUser(id, 'sentSchedule', schedule);
  }

  /**
   * @param {number} id
   * @param {supportmessage} message 
   */
  async pushSupportMessage (id, message) {
    const user = await User.findOne({ id });
    user.supportMessages.push(message);
    return user.save();
  }

  /**
   * @param {number} id
   */
  createUser (id) {
    new User({
      id,
      group: null,
      lastSentSchedule: {},
      role: 'student'
    }).save();
  }

  /**
   * @param {number} id
   * @param {string} name
   * @param {any} value
   * @returns {user}
   */
  async updateUser (id, name, value) {
    // const schema = await User.updateOne({ id }, { [name]: value });
    return User.updateOne({ id }, { [name]: value });
  }

  /**
   * @param {number} id
   * @returns {Promise<user>}
   */
  async getUser (id) {
    const schema = await User.findOne({ id });
    if (!schema) return null;
    return schema;
  }

  /**
   * @param {any} options 
   * @returns {Promise<user[]>}
   */
  async getUsers (options) {
    const users = await User.find(options);
    return users;
  }

  /**
   * @returns {number}
   */
  async getUserCount () {
    const users = await User.find({});
    return users.length;
  }
}
/**
 * @typedef {object} user
 * @prop {number} id
 * @prop {string} group
 * @prop {boolean} autoScheduler
 */
/**
 * @typedef {object} supportmessage
 * @prop {number} date
 * @prop {string} message
 */
