export default class Lesson {
  constructor(data) {
    /**
     * @type {string|null}
     */
    this.error = data.error || null;
    /**
     * @type {string}
     */
    this.title = data.title;
    /**
     * @type {string}
     */
    this.teacher = data.teacher;
    /**
     * @type {number}
     */
    this.number = data.number;
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
