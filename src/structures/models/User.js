import TelegrafClient from "../client/Client.js";

export default class User {
  #client;
  /**
   * @param {TelegrafClient} client 
   */
  constructor(client, data) {
    this.#client = client;
    /**
     * ID
     * @type {number}
     */
    this.id = data.id;
    /**
     * Статус автоматической рассылки
     * @type {boolean}
     */
    this.autoScheduler = !!data.autoscheduler;
    /**
     * Дата регистрации
     * @type {number}
     */
    this.regDate = data.regdate ? Number(data.regdate) : null;
    /**
     * Последнее отправленное расписание
     * @type {import("../parsers/Timetable.js").TimetableTD}
     */
    this.sentTimetable = data.sentschedule;
    /**
     * Группа
     * @type {string}
     */
    this.group = data.usergroup;
    /**
     * Курс
     * @type {number}
     */
    this.course = data.course;
    /**
     * Преподаватель
     * @type {string}
     */
    this.teacher = data.teacher;
  }

  /**
   * Установить группу
   * @param {string} group
   * @returns {Promise<User>} 
   */
  async _setGroup (group) {
    const id = this.id;
    return await this.#client.users.setGroup(id, group);
  }

  /**
   * Установить последнее отправленное расписание
   * @param {import("../parsers/Timetable.js").TimetableTD} timetable
   */
  async _setSentTimetable (timetable) {
    // @ts-ignore
    return await this.#client.users.setSentTimetable(this.id, timetable)
  }

  /**
   * Установить статус автоматической рассылки
   * @param {boolean} state 
   */
  async _setAutoschedulerState (state) {
    return await this.#client.users.setAutoschedulerState(this.id, state)
  }
}
