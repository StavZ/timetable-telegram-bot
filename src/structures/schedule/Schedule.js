const Lesson = require('./Lesson');

class Schedule {
  constructor (data) {
    /**
     * @type {string}
     */
    this.group = data.group;
    /**
     * @type {Lesson[]}
     */
    this.schedule = data.schedule;
  }
  toString () {
    return '';
  }
}
module.exports = Schedule;
