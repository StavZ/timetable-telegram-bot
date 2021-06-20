class Lesson {
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
     * @type {string}
     */
    this.address = data.address;
    /**
     * @type {number}
     */
    this.classroom = data.classroom;
  }
}
module.exports = Lesson;
