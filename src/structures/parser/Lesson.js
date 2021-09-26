export default class Lesson {
  constructor (data) {
    /**
     * @type {string|null}
     */
    this.error = data.error || null;
    /**
     * @type {string}
     */
    this.title = data.lesson;
    /**
     * @type {number}
     */
    this.subgroup = data.subgroup;
    /**
     * @type {string}
     */
    this.teacher = data.teacher;
    /**
     * @type {number}
     */
    this.number = data.lessonNumber;
    /**
     * @type {string|null}
     */
    this.address = data.address;
    /**
     * @type {number|string}
     */
    this.classroom = data.classroom;
  }
}
