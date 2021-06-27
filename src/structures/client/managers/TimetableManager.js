/* eslint-disable guard-for-in */
const Schedule = require('../../schedule/Schedule');
const Client = require('../Client');
const EventEmitter = require('events');

class ScheduleManager extends EventEmitter {
  constructor (client) {
    super();
    /**
     * @type {Client}
     */
    this.client = client;
    this.cache = {};
  }
  async runCacheManager () {
    const schedule = await this.client.parser.getAvailableSchedules();
    this.cache = {
      generatedAt: Date.now(),
      schedule
    };
    setInterval(async () => {
      const schedule = await this.client.parser.getAvailableSchedules();
      this.cache = {
        generatedAt: Date.now(),
        schedule
      };
    }, 30000);
  }
  /**
   * @param {import('../../schedule/Parser.new').AvailableSchedulesData} schedule
   * @param {Schedule} lastSentSchedule
   */
  isScheduleNew (schedule, user) {
    if (!user || !user.group) return;
    const userSchedule = schedule.schedule.find((s) => s.group === user.group);
    const lastSentSchedule = user.lastSentSchedule ? new Schedule(user.lastSentSchedule) : null;
    if (userSchedule) {
      if ((userSchedule ? userSchedule.id : 0) > (lastSentSchedule ? lastSentSchedule.id : 0)) {
        return this.emit('newSchedule', schedule, userSchedule, user);
      } else if (userSchedule.id === lastSentSchedule.id) {
        this.isScheduleEdited(userSchedule, lastSentSchedule, user, schedule);
      }
    } else {
      return;
    }
  }

  /**
   * @param {Schedule} schedule
   * @param {Schedule} lastSentSchedule
   * @param {*} user
   */
  isScheduleEdited (schedule, lastSentSchedule, user, fullSchedule) {
    const result = [];
    const keys = ['title', 'subgroup', 'teacher', 'number', 'address', 'classroom'];
    if (schedule.schedule.length !== lastSentSchedule.schedule.length) {
      result.push(false);
    } else {
      for (let i = 0; i < lastSentSchedule.schedule.length; i++) {
        const lessonL = lastSentSchedule.schedule[i];
        const lessonN = schedule.schedule[i];
        for (let y = 0; y < keys.length; y++) {
          if (lessonL[keys[y]] !== lessonN[keys[y]]) {
            result.push(false);
          } else {
            result.push(true);
          }
        }
      }
    }
    if (result.includes(false)) {
      return this.emit('editedSchedule', fullSchedule, schedule, user);
    }
  }

  async runChecker () {
    setInterval(async () => {
      if (!this.cache.schedule) return;
      const users = await this.client.userManager.getAllUsers({ autoScheduler: true });
      users.forEach((u) => {
        this.isScheduleNew(this.cache.schedule[0], u);
      });
    }, 60000);
  }
  async run () {
    await this.runCacheManager();
    this.client.logger.info('Starting timetable-update-checker...');
    this.runChecker();
  }
}
module.exports = ScheduleManager;
/**
 * @typedef {object} CacheData
 * @property {Date} generatedAt
 * @property {AvailableSchedulesData} schedule
 */
