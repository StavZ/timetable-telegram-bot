import EventEmitter from 'events';
import Schedule from '../../parser/Schedule.js';
import Client from '../Client.js';
import { editedSchedule, newSchedule } from './listeners.js';

export default class TimetableManager extends EventEmitter {
  constructor(client) {
    super();
    this.name = 'timetable';
    /**
     * @type {Client}
     */
    this.client = client;
    /**
     * @type {{generatedAt:number,schedules:Schedule[]}}
     */
    this.cache = { generatedAt: null, schedules: null };
    /**
     * @type {number}
     */
    this.interval = 30000;
    /**
     * @type {boolean}
     */
    this.isDisabled = false;
  }

  async caching() {
    const schedules = await this.client.parser.getAvailableSchedules().catch((e) => {
      this.client.logger.error(e);
    });
    this.cache = {
      generatedAt: Date.now(),
      schedules,
    };
    setInterval(async () => {
      const schedules = await this.client.parser.getAvailableSchedules().catch((e) => {
        this.client.logger.error(e);
      });
      this.cache = {
        generatedAt: Date.now(),
        schedules,
      };
    }, this.interval);
  }

  /**
   *
   * @param {user} user
   * @param {schedule} userSchedule
   * @param {schedule} lastSentSchedule
   */
  isScheduleEdited(user, userSchedule, lastSentSchedule) {
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
  isScheduleNew(user, schedule) {
    /**
     * @type {schedule|null}
     */
    const userSchedule = schedule.getLessonlistByGroup(user.usergroup);
    /**
     * @type {schedule|null}
     */
    const lastSentSchedule = user.sentschedule;
    if (userSchedule.id > (lastSentSchedule ? lastSentSchedule.id : 0)) {
      return this.emit('newSchedule', user, userSchedule);
    } else if (userSchedule.id === lastSentSchedule.id) {
      return this.isScheduleEdited(user, userSchedule, lastSentSchedule);
    }
  }

  checker() {
    setInterval(async () => {
      if (!this.cache.schedules) return;
      let users = await this.client.userManager.getUsers({
        autoscheduler: true,
        id: 408057291,
      });
      users
        .filter((u) => u.usergroup !== null)
        .forEach((u) => {
          if (!this.cache || !this.cache.schedules) return;
          this.isScheduleNew(u, this.cache.schedules[0]);
        });
    }, this.interval);
  }

  async run() {
    const module = await this.client.remoteControl.getModule(this.name, 'manager', false);
    if (process.env.NODE_ENV !== 'development') {
      this.client.logger.info('Starting Timetable manager');
      this.interval = module.config.interval ? module.config.interval : 180000;
      this.isDisabled = module.config.isDisabled;
      if (!module.config.isDisabled) {
        this.startListeners();
      }
      this.caching();
      this.checker();
    } else {
      this.interval = module.config.interval ? module.config.interval : 180000;
      this.caching();
      this.client.logger.info('Start of timetable manager aborted due to development version!');
    }
  }
  stopListeners() {
    this.client.logger.info('Stopping listeners...');
    this.removeAllListeners('editedSchedule');
    this.removeAllListeners('newSchedule');
  }

  startListeners() {
    this.client.logger.info('Starting listeners...');
    this.on('editedSchedule', (...args) => editedSchedule(this.client, ...args));
    this.on('newSchedule', (...args) => newSchedule(this.client, ...args));
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
