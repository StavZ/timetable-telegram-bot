const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:100.0) Gecko/20100101 Firefox/100.0';
const BASE_URL = 'https://ppkslavyanova.ru/teachtech';

import axios from 'axios';
import { JSDOM } from 'jsdom';
import TelegrafClient from '../client/Client.js';
import Timetable from './Timetable.js';
import TTimetable from './TTimetable.js';

export default class TTimetableParser {
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Получить страницу
   * @param {string} [url=null]
   * @returns {Promise<Document>}
   */
  async getPage(url = null) {
    return new Promise(async (res, rej) => {
      const page = await axios(url ? url : BASE_URL, {
        headers: { 'Content-Type': 'text/html', 'User-Agent': USER_AGENT },
      }).catch((e) => {
        this.client.logger.error(e);
        rej(false);
      });

      if (page?.status !== 200) {
        rej(false);
      }

      const jsdom = new JSDOM(page.data);
      const document = jsdom.window.document;
      res(document);
    });
  }

  /**
   * Получить преподавателей
   * @returns {string[]}
   */
  async getTeachers() {
    const document = await this.getPage().catch(this.client.logger.error);
    if (!document) return [];
    const lessonCart = document.getElementsByClassName('teacher_lesson_on_group').item(0);
    const elements = lessonCart.getElementsByClassName('title');

    /**
     * @type {string[]}
     */
    const teachers = [];
    for (let i = 0; i < elements.length; i++) {
      teachers.push(elements.item(i).textContent.trimEnd().replaceSpaces());
    }
    return teachers.sort((a, b) => a.localeCompare(b, 'ru', { sensitivity: 'base' }));
  }

  /**
   * Получить ключи (дата) расписаний
   * @param {TTimetable[]} timetables
   * @returns {Map<string,TTimetable>}
   */
  getKeys(timetables) {
    const output = {};
    for (const timetable of timetables) {
      output[timetable.date.regular] = timetable;
    }
    return output;
  }

  /**
   * Получить расписание
   * @param {string} url
   * @returns {Promise<TTimetable[]>}
   */
  getTimetables() {
    return new Promise(async (res, rej) => {
      const data = [];
      /**
       * @type {Timetable[]}
       */
      let timetables = this.client.cache.timetables;
      for (const tt of timetables) {
        const id = tt.id;
        const url = `https://ppkslavyanova.ru/teachtech?day=${id}`;
        const date = tt.date;
        const teachers = this.client.commands.get('email').config.emails.map((e) => e.teacherShort);
        const lessonlists = [];
        for (const teacher of teachers) {
          lessonlists.push({ teacher, lessons: [] });
          for (const ll of tt.lessonlists) {
            for (const lll of ll.lessons) {
              if (lll.teacher === teacher) {
                lessonlists.find((l) => l.teacher === teacher).lessons.push(lll);
              }
            }
          }
        }
        data.push(new TTimetable({ id, url, date, lessonlists }));
      }
      res(data);
    });
  }

  /**
   * Сгенерировать звонки
   * @param {import('./Timetable.js').TimetableTD} timetable
   * @returns {string|null}
   */
  generateBells(timetable) {
    if (!timetable.lessons.length || !timetable.lessons.filter((l) => !l.isRemote).length) return null;
    const lessons = timetable.lessons.filter((l) => !l.isRemote);
    return `Начало: \`${this.client.constants.bells[lessons.at(0).number].start}\`\nКонец: \`${this.client.constants.bells[lessons.at(-1).number].end}\``;
  }

  /**
   * Сгенерировать сообщение
   * @param {import('./TTimetable.js').TTimetableTD} timetable
   * @returns {string}
   */
  generateMessage(timetable) {
    const message = this.client.commands.get('schedule').config.message;
    if (!timetable.lessons.length)
      return `Расписание ${timetable.date.string} (${timetable.date.day.toProperCase()})\nПреподаватель: \`${timetable.teacher}\`\n${message ? `\n${message}\n` : ''}\nПар нет.`;
    let msg = `Расписание на ${timetable.date.string} (${timetable.date.day.toProperCase()})\nПреподаватель: \`${timetable.teacher}\`\n${message ? `\n${message}\n` : ''}\n\`\`\`\n`;
    for (const l of timetable.lessons.sort((a, b) => a.number - b.number)) {
      const group = l.group.split(' ').length > 1 ? l.group.split(' ')[0].slice(0, -1) : l.group;
      msg += `${l.number} пара - ${l.title}${l.group ? ` у ${group}` : ''}${l.classroom ? ` • ${l.classroom} | ${l.location}` : !l.classroom && l.location ? ` • ${l.location}` : ''}\n`;
    }
    msg += `\`\`\`${this.generateBells(timetable) ? `\n${this.generateBells(timetable)}` : ''}\n\n[Ссылка на сайт](${timetable.url})\n[t.me/ppkbotnews](https://t.me/ppkbotnews)`;
    return msg;
  }
}
