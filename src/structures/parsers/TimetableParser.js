const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:100.0) Gecko/20100101 Firefox/100.0';

import TelegrafClient from '../client/Client.js';
import { JSDOM } from 'jsdom';
import axios from 'axios';
import Lesson from './Lesson.js';
import Timetable from './Timetable.js';

export default class TimetableParser {
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Получить страницу сайта
   * @param {string} [url=null]
   * @returns {Promise<Document>}
   */
  async getPage(url = null) {
    return new Promise(async (res, rej) => {
      const page = await axios(url ? url : `https://ppkslavyanova.ru/lessonlist`, {
        headers: { 'Content-Type': 'text/html', 'User-Agent': USER_AGENT },
      }).catch((e) => {
        this.client.logger.error(e);
        rej(false);
      });

      // @ts-ignore
      if (page?.status !== 200) {
        rej(false);
      }

      // @ts-ignore
      if (!page?.data) return null;

      const jsdom = new JSDOM(page?.data);
      const document = jsdom.window.document;
      res(document);
    });
  }

  /**
   * Получить список групп
   * @returns {Promise<string[]>}
   */
  async getGroups() {
    const document = await this.getPage().catch(this.client.logger.error);
    if (!document) return [];
    const elements = document.getElementsByClassName('group_name');

    /**
     * @type {string[]}
     */
    const groups = [];
    for (let i = 0; i < elements.length; i++) {
      // @ts-ignore
      groups.push(elements.item(i).textContent.trimEnd().replaceSpaces());
    }
    return groups.sort((a, b) => a.localeCompare(b, 'ru', { sensitivity: 'base' }));
  }

  /**
   * Получить ключи (дата) расписаний
   * @param {Timetable[]} timetables
   * @returns {Record<string,Timetable>}
   */
  getKeys(timetables) {
    /**
     * @type {Record<string,Timetable>}
     */
    const output = {};
    for (const timetable of timetables) {
      output[timetable.date.regular] = timetable;
    }
    return output;
  }

  /**
   * Получить расписание
   * @returns {Promise<Timetable[]>}
   */
  getTimetables() {
    return new Promise(async (res, rej) => {
      const document = await this.getPage();
      if (!document) return null;

      const days = document.getElementsByClassName('lesson_list').item(0).children;
      const timetables = [];

      for (const day of days) {
        if (day.tagName === 'UL') continue;
        // @ts-ignore
        const url = `https://ppkslavyanova.ru/lessonlist${day?.href}`;
        // @ts-ignore
        const id = /^\?day=([0-9]{4})$/.exec(day.href)[1];
        const date = this.parseDate(day.textContent);
        const lessonlists = await this.generateLessonlist(url);
        timetables.push(new Timetable({ id, url, date, lessonlists }));
      }
      res(timetables);
    });
  }

  /**
   * Обработать дату
   * @param {string} string
   * @return {{regular:string,string:string,day:string}}
   */
  parseDate(string) {
    const months = {
      января: '01',
      февраля: '02',
      марта: '03',
      апреля: '04',
      мая: '05',
      июня: '06',
      июля: '07',
      августа: '08',
      сентября: '09',
      октября: '10',
      ноября: '11',
      декабря: '12',
    };

    const regex = /([0-9]{1,2})? ?([а-я]+)?/gim;
    const res = regex.exec(string);
    // @ts-ignore
    const date = this.client.moment(`${this.client.time.getCurrentTime().year()}-${months[res[2]]}-${res[1].length === 1 ? `0${res[1]}` : res[1]}`);
    return {
      regular: date.format('DD/MM/YYYY'),
      string: `${string} ${date.year()}`,
      day: this.client.constants.days[date.day()],
    };
  }

  /**
   * Сгенерировать расписание пар
   * @param {string} url
   * @returns {Promise<{id:string,group:string,lessons:Lesson[]}[]>}
   */
  generateLessonlist(url) {
    return new Promise(async (res, rej) => {
      const document = await this.getPage(url);
      const timetable = [];
      const carts = document.getElementsByClassName('lesson_on_group').item(0).children;
      const groupRegex = /(([А-Яа-я])?)-(\d{2})/;
      for (const cart of carts) {
        const id = cart.id;
        const group = cart.getElementsByClassName('title').item(0).textContent;
        if (!groupRegex.test(group)) return res(null);

        timetable.push({
          id,
          group,
          lessons: [],
        });

        const dlist = cart.getElementsByClassName('discepline_list').item(0).children;
        for (const lesson of dlist) {
          const number = Number(lesson.getElementsByClassName('index').item(0)?.textContent ?? 1);
          const title = lesson.getElementsByClassName('discipline_name').item(0)?.textContent;
          const teacher = (lesson.getElementsByClassName('teacher').item(0)?.textContent ?? null)?.trimEnd();
          const location = this.parseLocation(
            lesson.getElementsByClassName('location').item(0),
            lesson.getElementsByClassName('classroom').item(0),
            lesson.getElementsByClassName('location_string').item(0)
          );

          timetable.find((t) => t.group === group).lessons.push(new Lesson({ number, title, teacher, location, group }));
        }
      }
      res(timetable);
    });
  }

  /**
   * Обработать локацию
   * @param {Element} location
   * @param {Element} classroom
   * @param {Element} locationString
   * @returns {}
   */
  parseLocation(location, classroom, locationString) {
    if (!location && !classroom && !locationString) return { location: null, classroom: null };

    if (!location && !classroom && locationString) {
      return {
        location: locationString.textContent.trimEnd(),
        classroom: null,
      };
    }

    return {
      location: location.textContent.trimEnd(),
      classroom: Number(classroom.textContent),
    };
  }

  /**
   * Сгенерировать звонки
   * @param {import('./Timetable.js').TimetableTD} timetable
   * @returns {string|null}
   */
  generateBells(timetable) {
    if (!timetable.lessons.length || !timetable.lessons.filter((l) => !l.isRemote).length) return null;
    const lessons = timetable.lessons.filter((l) => !l.isRemote);
    return `Начало: \`${this.client.constants.bells[lessons.at(0).number]?.start ? this.client.constants.bells[lessons.at(0).number]?.start : 'Не известно'}\`\nКонец: \`${
      this.client.constants.bells[lessons.at(-1).number]?.end ? this.client.constants.bells[lessons.at(-1).number].end : 'Не известно'
    }\``;
  }

  /**
   * Сгенерировать сообщение
   * @param {import('./Timetable.js').TimetableTD} timetable
   * @param {'new'|'edited'|null} type
   * @returns {string}
   */
  generateMessage(timetable, type = null) {
    const message = this.client.commands.get('schedule').config.message;
    if (!timetable.lessons?.length)
      // @ts-ignore
      return `${type ? (type === 'edited' ? 'Изменения в расписании на' : 'Новое расписание на') : 'Расписание на'} ${timetable.date.string} (${timetable.date.day.toProperCase()})\nГруппа: \`${
        timetable.group
      }\`\n${message ? `\n${message}\n` : ''}\nНет пар.\n[t.me/ppkbotnews](https://t.me/ppkbotnews)`;
    // @ts-ignore
    let msg = `${type ? (type === 'edited' ? 'Изменения в расписании на' : 'Новое расписание на') : 'Расписание на'} ${timetable.date.string} (${timetable.date.day.toProperCase()})\nГруппа: \`${
      timetable.group
    }\`\n${message ? `\n${message}\n` : ''}\n\`\`\`\n`;
    for (const l of timetable.lessons) {
      msg += `${l.number} пара - ${l.title}${l.teacher ? ` у ${l.teacher}` : ''}${l.classroom ? ` • ${l.classroom} | ${l.location}` : !l.classroom && l.location ? ` • ${l.location}` : ''}\n`;
    }
    msg += `\`\`\`${this.generateBells(timetable) ? `\n${this.generateBells(timetable)}` : ''}\n\n[Ссылка на сайт](${timetable.url})\n[t.me/ppkbotnews](https://t.me/ppkbotnews)`;
    return msg;
  }
}
