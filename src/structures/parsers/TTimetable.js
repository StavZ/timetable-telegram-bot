import Lesson from "./Lesson.js";

export default class TTimetable {
  constructor(data) {
    /**
     * ID
     * @type {number}
     */
    this.id = data.id;
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
     * @type {{teacher:string,lessons:Lesson[],id:string}[]}
     */
    this.lessonlists = data.lessonlists;
  }

  /**
   * Получить расписание преподавателя
   * @param {string} teacher
   * @returns {TTimetableTD}
   */
  getTimetable(teacher) {
    const timetable = this.lessonlists.find((l) => l.teacher === teacher);
    if (!timetable)
      return {
        id: this.id,
        url: this.url,
        date: this.date,
        teacher: teacher,
        lessons: [],
      };
    return {
      id: this.id,
      url: this.url,
      date: this.date,
      teacher: timetable.teacher,
      lessons: timetable.lessons,
    };
  }
}

/**
 * @typedef {object} TTimetableTD
 * @prop {number} id
 * @prop {string} url
 * @prop {{regular:string,string:string,day:string}} date
 * @prop {string} teacher
 * @prop {Lesson[]} lessons
 */
