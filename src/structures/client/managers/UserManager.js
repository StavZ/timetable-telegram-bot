import User from '../../models/User.js';
import Schedule from '../../parser/Schedule.js';
import Client from '../Client.js';

export default class UserManager {
  constructor(client) {
    this.name = 'user';
    /**
     * @type {Client}
     */
    this.client = client;
  }

  /**
   * @param {number} id
   * @param {string} group
   * @returns {user}
   */
  setGroup(id, group) {
    this.updateUser(id, 'group', group);
    this.updateUser(id, 'course', this.calculateCourse(group));
  }

  /**
   * @param {string} group
   * @return {number}
   */
  calculateCourse(group) {
    const yearRegex = /\d{2}/;
    const result = yearRegex.exec(group);
    if (!result || !result.length) return 1;
    const course = this.client.constants.courses[result[0]];
    return course;
  }

  /**
   * @param {number} course
   * @returns {user[]}
   */
  async getUsersByCourse(course) {
    const users = await this.getUsers({ course });
    return users;
  }

  /**
   * @param {number} id
   * @param {Schedule} schedule
   * @returns {user}
   */
  setLastSentSchedule(id, schedule) {
    return this.updateUser(id, 'sentSchedule', schedule);
  }

  /**
   * @param {number} id
   * @param {supportmessage} message
   */
  async pushSupportMessage(id, message) {
    const user = await User.findOne({ id });
    user.supportMessages.push(message);
    return user.save();
  }

  /**
   * @param {number} id
   */
  createUser(id) {
    new User({
      id,
      group: null,
      course: null,
      sentSchedule: {},
      role: 'student',
    }).save();
  }

  /**
   * @param {number} id
   * @param {string} name
   * @param {any} value
   * @returns {user}
   */
  async updateUser(id, name, value) {
    // const schema = await User.updateOne({ id }, { [name]: value });
    return User.updateOne({ id }, { [name]: value });
  }

  /**
   * @param {number} id
   * @returns {Promise<user>}
   */
  async getUser(id) {
    const schema = await User.findOne({ id });
    if (!schema) return null;
    return schema;
  }

  /**
   * @param {any} options
   * @returns {Promise<user[]>}
   */
  async getUsers(options) {
    const users = await User.find(options);
    return users;
  }

  /**
   * @returns {number}
   */
  async getUserCount() {
    const users = (await User.find({})).filter((u) => u.group !== 'bot');
    return users.length;
  }
}
/**
 * @typedef {object} user
 * @prop {number} id
 * @prop {string} group
 * @prop {boolean} autoScheduler
 * @prop {number} course
 */
/**
 * @typedef {object} supportmessage
 * @prop {number} date
 * @prop {string} message
 */
