// prototypes
import '../protorypes/Array.js';

import { Context, Telegraf } from "telegraf";
import mongoose from 'mongoose';
import consola from 'consola';
import Parser from "../parser/Parser.js";
import UserManager from "./managers/UserManager.js";
import CommandHandler from './CommandHandler.js';
import User from '../models/User.js';
import moment from 'moment-timezone';
import TimetableManager from './managers/TimetableManager.js';
import Lesson from '../parser/Lesson.js';

export default class Client extends Telegraf {
  constructor (token, ...args) {
    super(token, ...args);
    this.owner = 408057291;
    this.logger = consola;
    this.botId = 1645143260;
    this.parser = new Parser();
    this.userManager = new UserManager(this.logger);
    this.commandHandler = new CommandHandler(this);
    this.manager = new TimetableManager(this);
  }

  async fetchBotConstants () {
    const bot = await User.findOne({ id: this.botId });
    const constants = bot.toObject().constants;
    this.constants = constants;
    setInterval(async () => {
      const bot = await User.findOne({ id: this.botId });
      const constants = bot.toObject().constants;
      this.constants = constants;
    }, 1.8e+6);
  }

  /**
   * @param {Context} ctx 
   * @returns {boolean}
   */
  isOwner (ctx) {
    return ctx.from.id === this.owner;
  }

  sendToOwner (message, ...options) {
    return this.telegram.sendMessage(this.owner, message, ...options);
  }

  getCurrentDate (unix = false) {
    if (unix) {
      return moment().set({ hours: 0, minutes: 0, seconds: 0 }).format('x');
    }
    return moment().set({ hours: 0, minutes: 0, seconds: 0 });
  }

  /**
   * @param {schedule} schedule 
   */
  generateBells (schedule) {
    const lessons = schedule.lessons.filter((s) => { return s.classroom !== 'Дистанционное обучение'; });
    if (!lessons.length) return null;
    return `Начало: \`${this.constants.bells[lessons[0].number] ? this.constants.bells[lessons[0].number].start : 'нет данных'}\`\nКонец: \`${this.constants.bells[lessons[lessons.length - 1].number] ? this.constants.bells[lessons[lessons.length - 1].number].end : 'нет данных'}`;
  }

  run () {
    if (process.env.NODE_ENV === 'development') {
      this.logger.warn('Development Version');
    }
    this.commandHandler.load();
    this.manager.run();

    this.manager.on('newSchedule', (user, schedule) => {
      let msg = `Новое расписание на ${schedule.date.toString()}\nГруппа: ${schedule.group}\n\`\`\`\n`;
      for (const lesson of schedule.lessons) {
        msg += `${lesson.error ? `${lesson.error}\n` : `${lesson.number} пара - ${lesson.title}${lesson.teacher ? ` у ${lesson.teacher}` : ''}${lesson.classroom && lesson.address ? ` • ${lesson.classroom} | ${lesson.address}` : (lesson.classroom && !lesson.address ? ` • ${lesson.classroom}` : (!lesson.classroom && lesson.address ? ` • ${lesson.address}` : ''))}\n`}`;
        if (lesson.error && msg.includes(lesson.error)) break;
      }
      msg += `\n\`\`\`${this.client.generateBells(schedule) ? `\n${this.client.generateBells(schedule)}` : ''}\n[Ссылка на сайт](${schedule.url})`;

      this.telegram.sendMessage(user.id, msg, { parse_mode: 'Markdown' }).then((r) => {
        this.userManager.setLastSentSchedule(user.id, schedule);
      }).catch(this.logger.error);
    });
    this.manager.on('editedSchedule', (user, schedule) => {
      let msg = `Изменения в расписании на ${schedule.date.toString()}\nГруппа: ${schedule.group}\n\`\`\`\n`;
      for (const lesson of schedule.lessons) {
        msg += `${lesson.error ? `${lesson.error}\n` : `${lesson.number} пара - ${lesson.title}${lesson.teacher ? ` у ${lesson.teacher}` : ''}${lesson.classroom && lesson.address ? ` • ${lesson.classroom} | ${lesson.address}` : (lesson.classroom && !lesson.address ? ` • ${lesson.classroom}` : (!lesson.classroom && lesson.address ? ` • ${lesson.address}` : ''))}\n`}`;
        if (lesson.error && msg.includes(lesson.error)) break;
      }
      msg += `\n\`\`\`${this.generateBells(schedule) ? `\n${this.generateBells(schedule)}` : ''}\n[Ссылка на сайт](${schedule.url})`;

      this.telegram.sendMessage(user.id, msg, { parse_mode: 'Markdown' }).then((r) => {
        this.userManager.setLastSentSchedule(user.id, schedule);
      }).catch(this.logger.error);
    });
    this.manager.on('scheduleNotFound', (user, schedule) => {
      this.telegram.sendMessage(user.id, `Расписание на ${schedule.date.toString()}\nГруппа: ${user.group}\n\`\`\`\nРасписание не найдено.\n\`\`\``).then((r) => {
        this.userManager.setLastSentSchedule(user.id, schedule);
      }).catch(this.logger.error);
    });

    this.launch({ allowedUpdates: true }).then(() => {
      this.logger.success(`Logged in as @${this.botInfo.username}`);
      this.fetchBotConstants();
    }).catch(this.logger.error);

    mongoose.connect(process.env.MONGOURI).then(() => {
      this.logger.success('Connected to Mongodb!');
    }).catch(this.logger.error);
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
