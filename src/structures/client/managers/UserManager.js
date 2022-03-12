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
    this.updateUser(id, 'usergroup', group);
    this.updateUser(id, 'course', this.calculateCourse(group));
  }

  /**
   * @param {string} group
   * @return {number}
   */
  calculateCourse(group) {
    const yearRegex = /\d{2}/;
    const result = yearRegex.exec(group);
    return this.client.time.getCourse(result[0]);
  }

  /**
   * @param {number} course
   * @returns {user[]}
   */
  async getUsersByCourse(course) {
    return (await this.client.db.query('SELECT * FROM users WHERE course = ($1)', [course])).rows;
  }

  /**
   * @param {number} id
   * @param {Schedule} schedule
   * @returns {user}
   */
  async setLastSentSchedule(id, schedule) {
    return (await this.client.db.query('UPDATE users SET sentschedule = ($2) WHERE id = ($1) RETURNING *', [id, schedule])).rows[0];
  }

  /**
   * @deprecated
   * @param {number} id
   * @param {supportmessage} message
   */
  async pushSupportMessage(id, message) {
    return true;
  }

  /**
   * @param {number} id
   */
  async createUser(id) {
    return (await this.client.db.query('INSERT INTO users (id, regdate) VALUES ($1, $2) RETURNING *', [id, this.client.time.getCurrentTime(true)])).rows[0];
  }

  /**
   * @param {number} id
   * @param {string} name
   * @param {any} value
   * @returns {user}
   */
  async updateUser(id, name, value) {
    return (await this.client.db.query(`UPDATE users SET ${name} = '${value}' WHERE id = ${id} RETURNING *`)).rows[0];
  }

  /**
   * @param {number} id
   * @returns {Promise<user>}
   */
  async getUser(id) {
    return (await this.client.db.query('SELECT * FROM users WHERE id = ($1)', [id])).rows[0];
  }

  /**
   * @param {any} options
   * @returns {Promise<user[]>}
   */
  async getUsers(options) {
    let query = `SELECT * FROM users`;
    if (options && Object.keys(options).length) {
      const keys = Object.keys(options);
      query += ` where ${keys.map((k) => `${k.toString()} = ${options[k]}`).join(' AND ')}`;
    }
    return (await this.client.db.query(query)).rows;
  }

  /**
   * @returns {number}
   */
  async getUserCount() {
    return (await this.client.db.query('SELECT * FROM users')).rows.length;
  }
}
/**
 * @typedef {object} user
 * @prop {number} id
 * @prop {string} group
 * @prop {boolean} autoscheduler
 * @prop {number} course
 * @prop {number} regdate
 * @prop {any} sentschedule
 */
/**
 * @typedef {object} supportmessage
 * @prop {number} date
 * @prop {string} message
 */
