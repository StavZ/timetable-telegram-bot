import TelegrafClient from '../client/Client.js';
import User from '../models/User.js';

export default class UserManager {
  #client;
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    this.#client = client;
    this.cache = [];
  }

  /**
   * Получить пользователя
   * @param {number} id
   * @returns {Promise<User>}
   */
  async get(id) {
    const user = await this.#client.db.query('SELECT * FROM users WHERE id = ($1)', [id]);
    if (!user.rows[0]) return null;
    return new User(this.#client, user.rows[0]);
  }

  /**
   * Удалить пользователя
   * @param {number} id
   */
  async delete(id) {
    this.#client.logger.info(`Delete user ${id} profile`);
    return (await this.#client.db.query('DELETE FROM users WHERE id = ($1)', [id])).rows[0];
  }
  /**
   * Создать пользователя
   * @param {number} id
   * @returns {Promise<User>}
   */
  async create(id) {
    this.#client.logger.info(`Created user ${id}`);
    return new User(
      this.#client,
      (await this.#client.db.query('INSERT INTO users (id,autoscheduler,regdate) values ($1,$2,$3) RETURNING *', [id, true, this.#client.time.getCurrentTime(true)])).rows[0]
    );
  }
  /**
   * Установить параметр пользователю
   * @param {number} id
   * @param {string} prop
   * @param {any} value
   * @returns {Promise<User>}
   */
  async set(id, prop, value) {
    const user = (await this.#client.db.query(`UPDATE users SET ${prop} = '${value}' WHERE id = ${id}`)).rows[0];
    return user ? new User(this.#client, user) : null;
  }
  /**
   * Установить группу пользоватю
   * @param {number} id
   * @param {string} group
   * @returns {Promise<User>}
   */
  async setGroup(id, group) {
    this.#client.logger.info(`User ${id} group changed to ${group} [${this.#client.time.getCourse(group)}]`);
    const user = (await this.#client.db.query(`UPDATE users SET usergroup = '${group}', course = ${this.#client.time.getCourse(group)} WHERE id = ${id}`)).rows[0];
    return user ? new User(this.#client, user) : null;
  }

  /**
   * Установить преподавателя пользователю
   * @param {number} id
   * @param {string} teacher
   * @returns {Promise<User>}
   */
  async setTeacher(id, teacher) {
    this.#client.logger.info(`User ${id} teacher changed to ${teacher}`);
    const user = (await this.#client.db.query(`UPDATE users SET teacher = '${teacher}' WHERE id = ${id}`)).rows[0];
    return user ? new User(this.#client, user) : null;
  }

  /**
   * Количество всех пользователей
   * @returns {number}
   */
  async size() {
    return (await this.#client.db.query('SELECT * FROM users')).rows.length;
  }

  /**
   * Фильтр пользователей
   * @param {FilterOptions} options
   * @returns {User[]}
   */
  async filter(options) {
    let query = `SELECT * FROM users`;
    if (options && Object.keys(options).length) {
      const keys = Object.keys(options);
      query += ` WHERE ${keys.map((k) => `${k.toString()} = ${options[k]}`).join(' AND ')}`;
    }
    return (await this.#client.db.query(query)).rows.map((user) => new User(this.#client, user));
  }
  /**
   * Установить статус автоматической рассылки
   * @param {number} id
   * @param {boolean} state
   * @returns
   */
  async setAutoschedulerState(id, state) {
    return await this.#client.db.query('UPDATE users SET autoscheduler = ($1) WHERE id = ($2)', [state, id]);
  }

  /**
   * Получить только активных пользователей (выбрана группа и включена рассылка)
   * @returns {User[]}
   */
  async getActive() {
    return (await this.#client.db.query('SELECT * FROM users WHERE autoscheduler = true AND usergroup IS NOT NULL')).rows.map((u) => new User(this.#client, u));
  }

  /**
   * @param {number} id
   * @param {import('../parsers/Timetable.js').TimetableTD} timetable
   * @returns
   */
  async setSentTimetable(id, timetable) {
    return this.#client.db.query('UPDATE users SET sentschedule = ($1) WHERE id = ($2)', [timetable, id]);
  }

  /**
   * Получить всех пользователей
   * @returns {User[]}
   */
  async getAll() {
    return (await this.#client.db.query('SELECT * FROM users')).rows.map((r) => new User(this.#client, r));
  }
}

/**
 * @typedef {object} FilterOptions
 * @property {boolean} autoscheduler
 * @property {number} course
 * @property {string} usergroup
 * @property {number} id
 * @property {number} regdate
 * @property {string} teacher
 */
