import Lesson from "./Lesson.js";

export default class Timetable {
  constructor (data) {
    /**
     * ID
     * @type {number}
     */
    this.id = Number(data.id);
    /**
     * URL
     * @type {string}
     */
    this.url = data.url;
    /**
     * Дата
     * @type {{regular:string,string:string,day:string}}
     */
    this.date = data.date;
    /**
     * Расписание
     * @type {{group:string,lessons:Lesson[],id:string}[]}
     */
    this.lessonlists = data.lessonlists;
  }

  /**
   * Получить расписание группы
   * @param {string} group
   * @returns {TimetableTD}
   */
  getTimetable (group) {
    const timetable = this?.lessonlists?.find((l) => l.group === group);
    if (!timetable) return {
      id: Number(this.id),
      url: this.url, 
      cartId: null,
      date: this.date,
      group: group,
      lessons: []
    }
    return {
      id: Number(this.id),
      url: `${this.url}#${timetable.id}`,
      cartId: timetable.id,
      date: this.date,
      group: timetable.group,
      lessons: timetable.lessons
    }
  }
}

/**
 * @typedef {object} TimetableTD
 * @prop {number} id
 * @prop {string} url
 * @prop {string} cartId
 * @prop {{regular:string,string:string,day:string}} date
 * @prop {string} group
 * @prop {Lesson[]} lessons
 */