const Lesson = require('./Lesson');

class Schedule {
  constructor (data) {
    /**
     * ID
     * @type {number}
     */
    this.id = data.id;
    /**
     * @type {string}
     */
    this.group = data.group;
    /**
     * @type {import('./Parser.new').parsedDate}
     */
    this.date = data.date;
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
