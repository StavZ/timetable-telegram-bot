import EventEmitter from 'events';
import TelegrafClient from '../client/Client.js';
import Timetable from '../parsers/Timetable.js';
import TTimetable from '../parsers/TTimetable.js';

export default class CacheManager extends EventEmitter {
  #client;
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    super();
    this.#client = client;
    /**
     * @type {Timetable[]}
     */
    this.timetables;
    /**
     * @type {TTimetable[]}
     */
    this.ttimetables;
  }

  /**
   * Кеширование расписания студентов
   */
  async timetablesCache() {
    const timetables = await this.#client.timetable.getTimetables().catch(this.#client.logger.error);
    this.timetables = timetables;
    this.emit('timetableCache', timetables);
    this.timetableInterval = setInterval(async () => {
      const timetables = await this.#client.timetable.getTimetables().catch(this.#client.logger.error);
      this.timetables = timetables;
      this.emit('timetableCache', timetables);
    }, this.#client.interval);
  }

  /**
   * Кеширование расписания преподавателей
   */
  async ttimetablesCache() {
    this.ttimetableInterval = setInterval(async () => {
      const ttimetables = await this.#client.teachtimetable.getTimetables().catch(this.#client.logger.error);
      this.ttimetables = ttimetables;
    }, this.#client.interval);
  }

  /**
   * Запуск кеширования
   */
  start() {
    this.timetablesCache();
    this.ttimetablesCache();
    this.#client.logger.success('Launching cache manager...');
  }

  /**
   * Остановка кеширования и очистка
   */
  stop() {
    clearInterval(this.timetableInterval);
    clearInterval(this.ttimetableInterval);
    this.timetables = [];
    this.ttimetables = [];

    this.removeAllListeners('timetableCache');

    this.#client.logger.info('Stopping cache manager...');
  }
}
