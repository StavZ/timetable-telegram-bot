import fetch from 'node-fetch';
import moment from 'moment-timezone';
import { JSDOM } from 'jsdom';
import Schedule from './Schedule.js';
import Lesson from './Lesson.js';
import logger from 'consola';
import constants from '../../constants.js';

export default class Parser {
  /**
   *
   * @param {string|null} url
   * @returns {Promise<Document>}
   */
  async getDocument(url) {
    return new Promise(async (resolve, reject) => {
      const page = await fetch(url ? url : 'https://ppkslavyanova.ru/lessonlist', {
        headers: {
          'Content-Type': 'text/html',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:96.0) Gecko/20100101 Firefox/96.0',
        },
      }).catch((e) => {
        logger.error(e);
        return null;
      });
      if (page.status !== 200) return null;
      const html = await page.text().catch((e) => {
        logger.error(e);
        return null;
      });
      const jsdom = new JSDOM(html);
      const document = jsdom.window.document;
      resolve(document);
    });
  }

  /**
   * @returns {Schedule[]}
   */
  async getAvailableSchedules() {
    const document = await this.getDocument().catch((e) => {
      logger.error(e);
    });
    if (!document) return null;
    const lessonList = document.getElementsByClassName('lesson_list').item(0).children;
    const schedules = [];
    for (const day of lessonList) {
      if (day.tagName === 'UL') continue;
      const url = `https://ppkslavyanova.ru/lessonlist${day.href}`;
      const id = /^\?day=([0-9]{4})$/.exec(day.href);
      const date = this.parseDate(day.textContent, Number(id));
      const lessonlists = await this.generateLessonlist(url);
      if (!lessonlists) return null;
      schedules.push(new Schedule({ date: date, url, id: Number(id), lessonlists }));
    }
    if (this.isSchedulesEmpty(schedules)) {
      return null;
    }
    return schedules;
  }

  /**
   * @param {Schedule[]} schedules
   */
  isSchedulesEmpty(schedules) {
    let results = [];
    for (let i = 0; i < schedules.length; i++) {
      const schedule = schedules[i];
      if (!schedule.lessonlists.length) {
        results.push(true);
      }
      let empty = 0;
      for (const s of schedule.lessonlists) {
        if (!s.lessonlist.length) {
          empty++;
        }
      }
      if (empty !== 0) {
        results.push(true);
      }
    }
    if (results.includes(true)) {
      return true;
    }
    return false;
  }

  /**
   * @param {Schedule[]} schedules
   * @returns {Map<string,Schedule>}
   */
  getSchedulesKeys(schedules) {
    const output = {};
    for (const schedule in schedules) {
      output[schedules[schedule].date.regular] = schedules[schedule];
    }
    return output;
  }

  /**
   * @param {string} string
   * @param {number} id
   * @returns {{toString():string,regular:string,day:string}}
   */
  parseDate(string, id) {
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
    const date = moment(`${id <= 2621 ? '2021' : '2022'}-${months[res[2]]}-${res[1].length === 1 ? `0${res[1]}` : res[1]}`);
    return {
      regular: date.format('DD/MM/YYYY'),
      toString: () => {
        return `${string} ${date.year()}`;
      },
      day: constants.days[date.day()],
    };
  }

  /**
   * Get groups
   * @returns {string[]}
   */
  async getGroups() {
    const document = await this.getDocument();
    const carts = document.getElementsByClassName('lesson_on_group').item(0).children;
    const groups = [];
    for (const cart of carts) {
      const group = cart.getElementsByClassName('title').item(0).textContent;
      groups.push(group)
    }
    return groups;
  }

  /**
   * @param {string} url
   * @param {parsedDate} date
   * @param {number} id
   * @returns {{group:string,lessonlist:Lesson[]}}
   */
  async generateLessonlist(url) {
    const document = await this.getDocument(url);
    const timetable = [];
    const carts = document.getElementsByClassName('lesson_on_group').item(0).children;
    const groupRegex = /(([А-Яа-я])?)-(\d{2})/;
    for (const cart of carts) {
      const id = cart.id;
      const group = cart.getElementsByClassName('title').item(0).textContent;
      if (!groupRegex.test(group)) return null;
      timetable.push({
        id,
        group,
        lessonlist: [],
      });
      const dlist = cart.getElementsByClassName('discepline_list').item(0).children;
      for (const lesson of dlist) {
        const number = Number(lesson.getElementsByClassName('index').item(0).textContent);
        const title = lesson.getElementsByClassName('discipline_name').item(0).textContent;
        const teacher = lesson.getElementsByClassName('teacher').item(0).textContent === '-' ? null : lesson.getElementsByClassName('teacher').item(0).textContent.trimEnd();
        const location = this.parseLocation(
          lesson.getElementsByClassName('location').item(0) ? lesson.getElementsByClassName('location').item(0).textContent.trimEnd() : null,
          lesson.getElementsByClassName('classroom').item(0) ? lesson.getElementsByClassName('classroom').item(0).textContent.trimEnd() : null
        );
        timetable.find((t) => t.group === group).lessonlist.push(new Lesson({ title: title, teacher: teacher, number: number, address: location.address, classroom: location.classroom }));
      }
    }
    return timetable;
  }

  parseLocation(location, classroom) {
    if (!location && !classroom)
      return {
        address: null,
        classroom: null,
      };
    if (classroom === 'Дистанционное' && location === 'обучение')
      return {
        address: 'Дистанционное обучение',
        classroom: null,
      };
    return {
      address: location,
      classroom: isNaN(classroom) ? classroom : Number(classroom),
    };
  }
}
