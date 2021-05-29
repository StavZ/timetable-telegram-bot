const User = require('../../models/User');
const Schedule = require('../../schedule/Schedule');
const Client = require('../Client');

class ScheduleManager {
  /**
   * @param {Client} client
   */
  constructor (client) {
    this.client = client;
  }
  /**
   * Compare
   * @param {Schedule} oldS
   * @param {Schedule} newS
   * @return {boolean}
   */
  compare (oldS, newS) {

  }

  /**
   * @param {Schedule} oldS
   * @param {Schedule} newS
   */
  isNew (oldS, newS) {
    return oldS.date === newS.date;
  }

  /**
   * @param {Schedule} oldS
   * @param {Schedule} newS
   */
  isEdited (oldS, newS) {
    //if ()
  }

  interval () {

  }

  async getSchedule (group, today = false) {
    return (await this.client.parser.getScheduleByGroup(group, today));
  }

  async run () {
    this.client.logger.success('Starting schedule manager...');
  }
}
module.exports = ScheduleManager;

