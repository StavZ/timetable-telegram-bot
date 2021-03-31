const Lesson = require('./Lesson');

class Schedule {
  constructor (data) {
    this.date = data.date;
    this.generatedAt = data.generatedAt;
    this.group = data.group;
    /**
     * @type {Lesson[]}
     */
    this.schedule = data.schedule.map((s) => new Lesson(s));
  }
  toString () {
    return '';
  }
}
module.exports = Schedule;
