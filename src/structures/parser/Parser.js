import fetch from 'node-fetch';
import moment from 'moment-timezone';
import { JSDOM } from 'jsdom';
import Schedule from './Schedule.js';
import Lesson from './Lesson.js';
import logger from 'consola';

export default class Parser {
  /**
   * 
   * @param {string|null} url 
   * @returns {Document}
   */
  async getDocument (url) {
    return new Promise(async (resolve, reject) => {
      const page = await fetch(url ? url : 'https://ppkslavyanova.ru/lessonlist', { headers: { 'Content-Type': 'text/html' } }).catch((e) => {
        logger.error(e);
        return null;
      });
      const html = await page.text().catch((e) => {
        logger.error(e);
        return null;
      });
      const jsdom = new JSDOM(html);
      const document = jsdom.window.document;
      const trs = document.getElementsByTagName('tr');
      for (let i = 0; i < trs.length; i++) {
        if (trs.item(i).className === 'R7' || trs.item(i).className === 'R3') continue;
        if (trs.item(i).className !== 'R8') {
          trs.item(i).classList.replace(trs.item(i).className, 'R8');
        }
      }
      resolve(document);
    });
  }

  /**
   * @returns {Schedule[]}
   */
  async getAvailableSchedules () {
    const document = await this.getDocument().catch((e) => {
      logger.error(e);
      return null;
    });
    if (!document) return null;
    const lessonList = document.getElementsByClassName('lesson_list').item(0).querySelectorAll('a');
    const schedules = [];
    for (const day of lessonList) {
      const url = `https://ppkslavyanova.ru/lessonlist${day.href}`;
      const id = /^\?day=([0-9]{4})$/.exec(day.href)[1];
      const date = this.parseDate(day.textContent);
      schedules.push(new Schedule({ date: date, url, id: Number(id), lessonlists: await this.generateLessonlist(url) }));
    }
    return schedules;
  }

  /**
   * @param {Schedule[]} schedules
   * @returns {Map<string,Schedule>}
   */
  getSchedulesKeys (schedules) {
    const output = {};
    for (const schedule in schedules) {
      output[schedules[schedule].date.regular] = schedules[schedule];
    }
    return output;
  }

  /**
   * @param {string} string 
   * @returns {{toString():string,regular:string}}
   */
  parseDate (string) {
    const months = {
      'января': '01',
      'февраля': '02',
      'марта': '03',
      'апреля': '04',
      'мая': '05',
      'июня': '06',
      'июля': '07',
      'августа': '08',
      'сентября': '09',
      'октября': '10',
      'ноября': '11',
      'декабря': '12'
    };
    const regex = /([0-9]{1,2})? ?([а-я]+)?/gim;
    const res = regex.exec(string);
    const date = moment(`${moment().year()}-${months[res[2]]}-${res[1].length === 1 ? `0${res[1]}` : res[1]}`);
    return {
      regular: date.format('DD/MM/YYYY'),
      toString: () => { return `${string} ${moment().year()}`; }
    };
  }

  /**
   * Get groups
   * @returns {string[]}
   */
  async getGroups () {
    const document = await this.getDocument();
    const groupsArray = Array.from(document.getElementsByClassName('R8C0'));
    const groups = [];
    groupsArray.forEach((c) => {
      groups.push(c.textContent);
    });
    return groups;
  }

  /**
   * @param {string} url
   * @param {parsedDate} date
   * @param {number} id
   * @returns {{group:string,lessonlist:Lesson[]}}
   */
  async generateLessonlist (url) {
    const document = await this.getDocument(url);
    const timetable = [];
    const rows = document.getElementsByClassName('R8');
    for (let i = 0; i < rows.length; i++) {
      if (rows.item(i).childElementCount === 3) {
        // group
        timetable.push({ group: rows.item(i).textContent.replace(/\n/g, ''), lessonlist: [] });
        continue;
      } else {
        // lesson
        timetable[timetable.length - 1].lessonlist.push(await this.parseLesson(rows.item(i).textContent.trim()));
      }
    }
    return timetable;
  }

  parseLesson (string) {
    return new Promise((resolve, reject) => {
      const fullRegex = /^(.*)\n(.*)\n(.*)\n(.*)\n?(.*)$/gm;
      const parsed = fullRegex.exec(string);
      const result = {};
      try {
        if (!parsed) resolve(new Lesson({ error: 'Произошла ошибка во время обработки.' }));
        result.lessonNumber = parseInt(parsed[1], 10);
        result.subgroup = parsed[2] ? parsed[2] : null;
        result.lesson = parsed[3].trim();
        result.teacher = parsed[4] ? parsed[4].replace(/\-/g, '').trim() : null;
        const parsedClassroomAdress = parseClassroomAddress(parsed[5]);
        result.classroom = parsedClassroomAdress.classroom;
        result.address = parsedClassroomAdress.address;
      } catch (e) {
        reject(e);
      }

      /**
       * @param {string} str
       * @returns {{classroom:string|null,address:string|null}}
       */
      function parseClassroomAddress (str) {
        if (str) {
          str = str.replace(/\n/g, '');
        }
        const classroomRegex = /(([0-9]{1,3}([а-я]{1})?)\s)?([ЁёА-я0-9_" ]*)/gm;
        const remoteRegex = /Дистанционное обучение/;
        const result = { classroom: null, address: null };
        if (str && str.match(/^\d/)) {
          const parsedClassroom = classroomRegex.exec(str);
          result.classroom = parsedClassroom[1] ? parsedClassroom[1].trim() : null;
          result.address = parsedClassroom[4];
        } else if (str && str.match(remoteRegex)) {
          result.classroom = 'Дистанционное обучение';
          result.address = null;
        } else if (str && str !== undefined) {
          result.classroom = null;
          result.address = classroomRegex.exec(str)[4];
        }
        return result;
      }
      resolve(new Lesson(result));
    });
  }
}
