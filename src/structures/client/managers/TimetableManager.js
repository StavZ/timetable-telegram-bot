import EventEmitter from "events";
import Schedule from "../../parser/Schedule.js";
import Client from "../Client.js";

export default class TimetableManager extends EventEmitter {
  constructor (client) {
    super();
    /**
     * @type {Client}
     */
    this.client = client;
    /**
     * @type {{generatedAt:number,schedules:Schedule[]}}
     */
    this.cache = {};
  }

  async runCache () {
    const schedules = await this.client.parser.getAvailableSchedules();
    this.cache = {
      generatedAt: Date.now(),
      schedules
    };
    setInterval(async () => {
      const schedules = await this.client.parser.getAvailableSchedules();
      this.cache = {
        generatedAt: Date.now(),
        schedules
      };
    }, 30000);
  }

  /**
   * 
   * @param {user} user 
   * @param {schedule} userSchedule 
   * @param {schedule} lastSentSchedule 
   */
  isScheduleEdited (user, userSchedule, lastSentSchedule) {
    const result = [];
    const keys = ['title', 'subgroup', 'teacher', 'number', 'address', 'classroom'];
    const lessonsN = userSchedule.lessons;
    const lessonsL = lastSentSchedule.lessons;

    if (lessonsL.length !== lessonsN.length) {
      result.push(false);
    } else {
      for (let i = 0; i < lessonsL.length; i++) {
        const lessonN = lessonsN[i];
        const lessonL = lessonsL[i];
        for (let x = 0; x < keys.length; x++) {
          if (lessonL[keys[x]] !== lessonN[keys[x]]) {
            result.push(false);
          } else {
            result.push(true);
          }
        }
      }
    }

    if (result.includes(false)) {
      return this.emit('editedSchedule', user, userSchedule);
    }
  }

  /**
   * 
   * @param {Schedule} schedule 
   * @param {user} user 
   */
  isScheduleNew (user, schedule) {
    /**
     * @type {schedule|null}
     */
    const userSchedule = schedule.getLessonlistByGroup(user.group);
    if (!userSchedule.lessons.length) return this.emit('scheduleNotFound', user, userSchedule);
    /**
     * @type {schedule|null}
     */
    const lastSentSchedule = user.sentSchedule;
    if (userSchedule.id > (lastSentSchedule ? lastSentSchedule.id : 0)) {
      return this.emit('newSchedule', user, userSchedule);
    } else if (userSchedule.id === lastSentSchedule.id) {
      return this.isScheduleEdited(user, userSchedule, lastSentSchedule);
    }
  }

  runChecker () {
    setInterval(async () => {
      if (!this.cache.schedules) return;
      let users = await this.client.userManager.getUsers({ id: 408057291 });
      users.filter(u => u.group !== null).forEach((u) => {
        this.isScheduleNew(u, this.cache.schedules[0]);
      });
    }, 10000);
  }

  run () {
    if (process.env.NODE_ENV !== 'development') {
      this.client.logger.info('Starting Timetable manager');
      this.runCache();
      this.runChecker();
    } else {
      this.client.logger.info('Start of timetable manager aborted due to development version!')
    }
  }
}

/**
 * @typedef {Object} user
 * @prop {number} id
 * @prop {string} group
 * @prop {boolean} autoScheduler
 */
/**
 * @typedef {Object} schedule
 * @prop {Lesson[]} lessons
 * @prop {string} url
 * @prop {{toString():string,regular:string}} date
 * @prop {string} group
 * @prop {number} id
 */
