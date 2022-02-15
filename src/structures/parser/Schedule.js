import Lesson from './Lesson.js';

export default class Schedule {
  constructor(data) {
    /**
     * @type {{regular:string,toString():string,day:string}}
     */
    this.date = data.date;
    /**
     * @type {string}
     */
    this.url = data.url;
    /**
     * @type {number}
     */
    this.id = data.id;
    /**
     * @type {{id:string,group:string,lessonlist:Lesson[]}[]}
     */
    this.lessonlists = data.lessonlists;
  }
  /**
   * @param {string} group
   * @return {schedule}
   */
  getLessonlistByGroup(group) {
    const groupLessonlist = this.lessonlists.find((l) => l.group === group);
    if (!groupLessonlist)
      return {
        id: this.id,
        cartId: null,
        group: group,
        url: this.url,
        date: this.date,
        lessons: [],
      };
    return {
      id: this.id,
      cartId: groupLessonlist.id,
      group: groupLessonlist.group,
      url: this.url,
      date: this.date,
      lessons: groupLessonlist.lessonlist,
    };
  }
}
/**
 * @typedef {Object} schedule
 * @prop {Lesson[]} lessons
 * @prop {string} url
 * @prop {{toString():string,regular:string,day:string}} date
 * @prop {string} group
 * @prop {number} id
 * @prop {string} cartId
 */
