/**
 * libs
 */
import consola from 'consola';
import { Context, Telegraf } from 'telegraf';
import axios from 'axios';
import { createRequire } from 'module';
import moment from 'moment-timezone';
import pg from 'pg';
import Telegraph from 'telegra.ph';

/**
 * Managers / Handlers
 */
import CommandHandler from '../handlers/CommandHandler.js';
import RemoteControlManager from '../managers/RemoteControlManager.js';
import TimeManager from '../managers/TimeManager.js';
import UserManager from '../managers/UserManager.js';
import TimetableParser from '../parsers/TimetableParser.js';
import RemoteWorksParser from '../parsers/RemoteWorksParser.js';
import CacheManager from '../managers/CacheManager.js';
import TelegraphManager from '../managers/TelegraphManager.js';
import TTimetableParser from '../parsers/TTimetableParser.js';
import TimetableManager from '../managers/TimetableManager.js';
import constants from '../../constants.js';

/**
 * Prototypes
 */
import '../prototypes/Array.js';
import '../prototypes/String.js';

const require = createRequire(import.meta.url);

export default class TelegrafClient extends Telegraf {
  constructor(token, ...args) {
    super(token, ...args);
    /**
     * @type {string}
     * @description Префикс бота
     */
    this.prefix = '/';
    /**
     * @type {consola}
     * @description Логгер
     */
    this.logger = consola;
    /**
     * @type {axios}
     * @description HTTP(s) клиент
     */
    this.axios = axios;
    /**
     * @type {boolean}
     * @description Сборка разработчика
     */
    this.dev = false;
    /**
     * @type {number[]}
     * @description ID пользователей, которые являются разработчиками бота
     */
    this.owners = [408057291, 5152997877];
    /**
     * @type {number}
     * @description ID главного бота
     */
    this.botId = 1645143260;
    /**
     * @description Константы бота
     */
    this.constants = constants;
    /**
     * @type {CommandHandler}
     * @description Обработчик команд
     */
    this.commands = new CommandHandler(this);
    /**
     * @type {RemoteControlManager}
     * @description Менеджер удаленного управления - управление модулями бота из ТГ чата с ботом (для разработчика)
     */
    this.remote = new RemoteControlManager(this);
    /**
     * @type {TimetableManager}
     * @description Менеджер расписания - отвечает за автоматическую рассылку расписания
     */
    this.manager = new TimetableManager(this);
    /**
     * @type {TimeManager}
     * @description Менеджер времени - отвечает за взаимодействие с датой внутри бота с местным часовым поясом
     */
    this.time = new TimeManager();
    /**
     * @type {UserManager}
     * @description Менеджер пользователей
     */
    this.users = new UserManager(this);
    /**
     * @type {TimetableParser}
     * @description Парсер расписания студентов
     */
    this.timetable = new TimetableParser(this);
    /**
     * @type {TTimetableParser}
     * @description Парсер расписания преподавателей - работает от {@link TimetableParser}
     */
    this.teachtimetable = new TTimetableParser(this);
    /**
     * @type {RemoteWorksParser}
     * @description Парсер дистанцонных заданий
     */
    this.rw = new RemoteWorksParser(this);
    /**
     * @type {string}
     * @description Версия бота
     */
    this.version = require('../../../package.json').version;
    /**
     * @type {moment}
     * @description Библиотека для взаимодействия с датой
     */
    this.moment = moment;
    /**
     * @type {CacheManager}
     * @description Менеджер кеша
     */
    this.cache = new CacheManager(this);
    /**
     * @type {number}
     * @description Глобальный интервал. Используется в парсере, рассылке
     */
    this.interval = 15000;
    /**
     * @type {pg.Pool}
     * @description База данных
     */
    this.db = new pg.Pool({ host: process.env.DBHOST, port: process.env.DBPORT, user: process.env.DBUSER, password: process.env.DBPASS, database: 'tg_bot_db', ssl: { rejectUnauthorized: false } });
    /**
     * @type {Telegraph}
     * @description Telegraph
     */
    this.tph = new Telegraph(process.env.TELEGRAPH);
    /**
     * @type {TelegraphManager}
     * @description Менеджер Telegraph
     */
    this.telegraph = new TelegraphManager(this);
    /**
     * @type {number}
     * @description Количество запусков команд за сессию
     */
    this.cmdRuns = 0;
    /**
     * @type {number}
     * @description Последний перезапуск бота
     */
    this.lastRestart = 0;
  }

  /**
   * Проверка пользователя на разработчика
   * @param {Context} ctx
   * @returns {boolean}
   */
  isOwner(ctx) {
    return this.owners.includes(ctx.from.id);
  }

  /**
   * @param {string} message
   * @param {'all'|'user'} type
   * @param {number} userid
   */
  async sendMessage(message, type = 'all', userid) {
    switch (type) {
      case 'all': {
        const users = await this.users.getActive();
        users.forEach((u) => {
          this.telegram.sendMessage(u.id, `Сообщение от разработчика:\n\n${message}\nЧтобы не пропускать новости бота - подпишись на новостной канал https://t.me/ppkbotnews.`, {
            disable_notification: true,
            disable_web_page_preview: true,
            parse_mode: 'Markdown'
          }).catch(this.logger.error);
        });
        break;
      }
      case 'user': {
        this.telegram.sendMessage(userid, `Сообщение от разработчика:\n\n${message}\nЧтобы не пропускать новости бота - подпишись на новостной канал https://t.me/ppkbotnews.`, {
          disable_notification: true,
          disable_web_page_preview: true,
          parse_mode: 'Markdown'
        }).catch(this.logger.error);
        break;
      }
    }
  }

  /**
   * Запуск бота
   * @returns {void}
   */
  async run() {
    if (this.dev) {
      this.logger.warn('Development version');
    }

    this.db
      .connect()
      .then(() => {
        this.logger.success('Connected to Database');
        this.db.query("SELECT * FROM modules WHERE modulename = 'client'").then((r) => {
          this.interval = r.rows[0].config.interval;
        });
      })
      .catch(this.logger.error);

    this.launch({ allowedUpdates: true })
      .then(() => {
        this.logger.success(`Logged in as @${this.botInfo.username}`);
      })
      .catch(this.logger.error);

    this.manager.start();
    this.cache.start();

    this.lastRestart = Date.now();
  }
}
