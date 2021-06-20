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
    /**
     * @type
     */
    this.cache = {};
  }
  async runCacheManager () {
    this.client.logger.info('Starting cache manager...');
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

    if ((userSchedule ? userSchedule.id : 0) > (lastSentSchedule ? lastSentSchedule.id : 0)) {
      // const userSchedule = schedule.schedule.find((s) => s.group === user.group);
      if (userSchedule) {
        return this.emit('newSchedule', schedule, userSchedule, user);
      }
    } else if (userSchedule.id === lastSentSchedule.id) {
      this.isScheduleEdited(userSchedule, lastSentSchedule, user, schedule);
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
    // schedule.schedule.forEach((l) => {
    //   const keys = Object.keys(l);
    //   for (let i = 0; i < keys.length; i++) {
    //     console.log();
    //     // console.log(`${lastSentSchedule[keys[i]]} === ${schedule[keys[i]]}`);
    //     if (lastSentSchedule[keys[i]] !== schedule[keys[i]]) {
    //       result.push(false);
    //     } else {
    //       result.push(true);
    //     }
    //   }
    // });
    // for (let i = 0; i < schedule.schedule.length; i++) {
    //   const lesson = schedule.schedule[i];
    //   const keys = Object.keys(lesson);
    //   for (let x = 0; x < lastSentSchedule.schedule.length; x++) {
    //     for (let y = 0; y < keys.length; y++) {
    //       if (lastSentSchedule.schedule[x][keys[y]] !== lesson[keys[y]]) {
    //         console.log(`${lastSentSchedule.schedule[x][keys[y]]} = ${lesson[keys[y]]} - ${lastSentSchedule.schedule[x][keys[y]] === lesson[keys[y]]}`);
    //         result.push(false);
    //       } else {
    //         console.log(`${lastSentSchedule.schedule[x][keys[y]]} = ${lesson[keys[y]]} - ${lastSentSchedule.schedule[x][keys[y]] === lesson[keys[y]]}`);
    //         result.push(true);
    //       }
    //     }
    //   }
    // }
    const keys = ['title', 'subgroup', 'teacher', 'number', 'address', 'classroom'];
    if (schedule.schedule.length !== lastSentSchedule.schedule.length) {
      result.push(false);
    } else {
      for (let i = 0; i < lastSentSchedule.schedule.length; i++) {
        const lessonL = lastSentSchedule.schedule[i];
        const lessonN = schedule.schedule[i];
        for (let y = 0; y < keys.length; y++) {
          // console.log(`${lessonL[keys[y]]} = ${lessonN[keys[y]]}`);
          if (lessonL[keys[y]] !== lessonN[keys[y]]) {
            result.push(false);
          } else {
            result.push(true);
          }
        }
      }
    }
    // console.log(result);
    if (result.includes(false)) {
      return this.emit('editedSchedule', fullSchedule, schedule, user);
    }
  }

  async runChecker () {
    this.client.logger.info('Starting checker...');
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
    this.client.logger.info('Starting schedule-update-checker...');
    this.runChecker();
  }
}
module.exports = ScheduleManager;
/**
 * @typedef {object} CacheData
 * @property {Date} generatedAt
 * @property {AvailableSchedulesData} schedule
 */
