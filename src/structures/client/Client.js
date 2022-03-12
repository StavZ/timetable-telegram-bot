// prototypes
import '../protorypes/Array.js';
import '../protorypes/String.js';

import { Context, Telegraf, TelegramError } from 'telegraf';
import mongoose from 'mongoose';
import consola from 'consola';
import Parser from '../parser/Parser.js';
import UserManager from './managers/UserManager.js';
import CommandHandler from './CommandHandler.js';
import moment from 'moment-timezone';
import TimetableManager from './managers/TimetableManager.js';
import Lesson from '../parser/Lesson.js';
import RemoteControlManager from './managers/RemoteControlManager.js';
import constants from '../../constants.js';
import RemoteWorksParser from '../parser/RWParser.js';
import TimeManager from './managers/TimeManager.js';
import axios from 'axios';
import Telegraph from 'telegra.ph';
import pg from 'pg';

export default class Client extends Telegraf {
  constructor(token, ...args) {
    super(token, ...args);
    this.prefix = '/';
    this.owner = 408057291;
    this.logger = consola;
    this.botId = 1645143260;
    this.parser = new Parser();
    this.time = new TimeManager();
    this.remoteWorks = new RemoteWorksParser(this);
    this.userManager = new UserManager(this);
    this.commandHandler = new CommandHandler(this);
    this.manager = new TimetableManager(this);
    this.constants = constants;
    this.remoteControl = new RemoteControlManager(this);
    this.moment = moment;
    this.mongoose = mongoose;
    this.telegraph = new Telegraph(process.env.TELEGRAPH);
    this.axios = axios;
    this.db = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  }

  /**
   * @param {Context} ctx
   * @returns {boolean}
   */
  isOwner(ctx) {
    return ctx.from.id === this.owner;
  }

  sendToOwner(message, ...options) {
    return this.telegram.sendMessage(this.owner, message, ...options);
  }

  getCurrentDate(unix = false) {
    if (unix) return moment().set({ hours: 0, minutes: 0, seconds: 0 }).format('x');
    return moment().set({ hours: 0, minutes: 0, seconds: 0 });
  }

  async manualSetLastSentSchedule() {
    const schedules = await this.parser.getAvailableSchedules();
    const users = await this.userManager.getUsers({ autoScheduler: true });
    users
      .filter((u) => u.group !== null)
      .forEach((user) => {
        const userSchedule = schedules[0].getLessonlistByGroup(user.group);
        this.userManager.setLastSentSchedule(user.id, userSchedule);
      });
  }

  /**
   * @param {schedule} schedule
   */
  generateBells(schedule) {
    const lessons = schedule.lessons.filter((s) => {
      return s.address !== 'Дистанционное обучение';
    });
    if (!lessons.length) return null;
    return `Начало: \`${this.constants.bells[lessons[0].number] ? this.constants.bells[lessons[0].number].start : 'нет данных'}\`\nКонец: \`${
      this.constants.bells[lessons[lessons.length - 1].number] ? this.constants.bells[lessons[lessons.length - 1].number].end : 'нет данных'
    }\``;
  }

  /**
   * @param {string} message
   * @param {'all'|'user'} type
   * @param {number|null} user
   */
  async sendMessageAsDeveloper(message, type = 'all', userID = null) {
    switch (type) {
      case 'all': {
        const users = (await this.userManager.getUsers({ autoScheduler: true })).filter((u) => u.group !== null);
        users.forEach((u) => {
          this.telegram
            .sendMessage(u.id, `Сообщение от разработчика\`*\`:\n${message}\n\n\`*\`_Сообщения от разработчика отправляются без звукового уведомления!_`, {
              parse_mode: 'Markdown',
              disable_notification: true,
            })
            .catch((e) => {
              if (e instanceof TelegramError) {
                if (e.code === 403) {
                  this.userManager.updateUser(u.id, 'autoScheduler', false);
                }
              }
            });
        });
        break;
      }
      case 'user': {
        if (!userID) return false;
        const user = await this.userManager.getUser(userID);
        if (!user) return false;
        this.telegram.sendMessage(user.id, message, {
          parse_mode: 'Markdown',
          disable_notification: true,
        });
        return true;
      }
    }
  }

  run() {
    if (process.env.NODE_ENV === 'development') {
      this.logger.warn('Development Version');
    }
    this.commandHandler.loadAll();
    this.manager.run();

    this.launch({ allowedUpdates: true })
      .then(() => {
        this.logger.success(`Logged in as @${this.botInfo.username}`);
      })
      .catch(this.logger.error);

    this.db
      .connect()
      .then(() => {
        this.logger.success('Connected to Postgres');
      })
      .catch(this.logger.error);
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
