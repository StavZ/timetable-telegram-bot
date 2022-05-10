import EventEmitter from 'events';
import TelegrafClient from '../client/Client.js';
import User from '../models/User.js';
import { editedTimetable, newTimetable } from './listeners.js';

export default class TimetableManager extends EventEmitter {
  #client;
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    super();
    this.#client = client;
    this.checkInterval;
    this.isDisabled = false;
  }
  checkForEdit(user, timetable) {
    const result = [];
    const keys = ['title', 'teacher', 'number', 'location', 'classroom', 'group'];
    const lessonsN = timetable.lessons;
    const lessonsL = user.sentTimetable.lessons;

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
      return this.emit('onEdit', user, timetable);
    }
  }

  /**
   * @param {User} user
   */
  checkForNew(user) {
    if (!this.#client.cache.timetables) return;
    const cache = this.#client.cache.timetables[0];
    const newTimetable = cache.getTimetable(user.group);
    const lastSent = user.sentTimetable;
    if (newTimetable.id > (lastSent ? lastSent?.id : 0)) {
      return this.emit('onNew', user, newTimetable);
    } else if (newTimetable.id === lastSent.id) {
      return this.checkForEdit(user, newTimetable);
    }
  }

  check() {
    this.checkInterval = setInterval(async () => {
      const users = await this.#client.users.getActive();
      
      users.forEach((u) => {
        this.checkForNew(u);
      });
    }, this.#client.interval);
  }

  async start() {
    const module = await this.#client.remote.get('timetable', 'manager', false);
    if (process.env.NODE_ENV !== 'development') {
      this.#client.logger.info('Starting Timetable manager...');
      this.interval = module.config.interval ? module.config.interval : 180000;
      this.isDisabled = module.config.isDisabled;
      if (!module.config.isDisabled) {
        this.startListeners();
        this.check();
      }
    } else {
      this.interval = module.config.interval ? module.config.interval : 180000;
      this.#client.logger.info('Start of timetable manager aborted due to development version!');
    }
  }

  stop() {
    clearInterval(this.checkInterval);
    this.stopListeners();
    this.#client.logger.info('Stoping timetable manager...');
  }

  startListeners() {
    this.#client.logger.info('Starting listeners...');
    this.on('onNew', (...args) => newTimetable(this.#client, ...args));
    this.on('onEdit', (...args) => editedTimetable(this.#client, ...args));
  }
  stopListeners() {
    this.#client.logger.info('Stopping listeners...');
    this.removeAllListeners('onNew');
    this.removeAllListeners('onEdit');
  }
}
