const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const { gunzip } = require('zlib');
const Schedule = require('./Schedule');
const Lesson = require('./Lesson');
const Client = require('../client/Client');
const moment = require('moment');
class Parser {
  /**
   * @param {Client} client
   */
  constructor (client) {
    this.client = client;
  }

  /**
   * Get document
   * @param {string} [url=null]
   * @returns {Document}
   */
  async getDocument (url) {
    return new Promise(async (resolve, reject) => {
      const page = await fetch(url ? url : 'https://ppkslavyanova.ru/lessonlist', { headers: { 'Content-Type': 'text/html' } });
      gunzip(page.body._handle.buffer, (error, buffer) => {
        if (error) return reject(error);
        const jsdom = new JSDOM(Buffer.from(buffer).toString('utf-8'));
        const document = jsdom.window.document;
        resolve(document);
      });
    });
  }

  /**
   * Parses date
   * @param {string} string
   * @param {number} id
   * @returns {{regular:string,parsed:Date}}
   */
  parseDate (string, id) {
    const months = {
      'января': 1,
      'февраля': 2,
      'марта': 3,
      'апреля': 4,
      'мая': 5,
      'июня': 6,
      'июля': 7,
      'августа': 8,
      'сентября': 9,
      'октября': 10,
      'ноября': 11,
      'декабря': 12
    };
    const GMT = new Date(); GMT.setUTCHours(0); GMT.setUTCMinutes(0); GMT.setUTCSeconds(0); GMT.setUTCMilliseconds(0);
    const regex = /Расписание на ([0-9]{1,2})? ?([а-я]+)?/gim;
    const res = regex.exec(string);
    const date = moment(new Date(`${months[res[2]]}-${res[1]}-${GMT.getUTCFullYear()} GMT`));
    return {
      regular: date.format('DD/MM/YYYY'),
      parsed: date,
      id
    };
  }

  /**
   * Get available schedules
   * @returns {Promise<AvailableSchedulesData[]>}
   */
  async getAvailableSchedules () {
    const document = await this.getDocument();
    const schedules = document.getElementsByClassName('lesson_list').item(0).querySelectorAll('a');
    const a = [];
    for (const schedule of schedules) {
      const url = `https://ppkslavyanova.ru/lessonlist${schedule.href}`;
      const id = /^\?day=([0-9]{4})$/.exec(schedule.href)[1];
      const date = this.parseDate(schedule.textContent, id);
      a.push({ dateString: `${schedule.textContent} ${new Date().getUTCFullYear()}`, link: url, date: date, id: Number(id), schedule: await this.generateSchedule(url, date, Number(id)) });
    }
    return a;
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
   * @returns
   */
  async generateSchedule (url, date, id) {
    const document = await this.getDocument(url);
    const timetable = [];
    const rows = document.getElementsByClassName('R8');
    for (let i = 0; i < rows.length; i++) {
      if (rows.item(i).childElementCount === 3) {
        // group
        timetable.push({ group: rows.item(i).textContent.replace(/\n/g, ''), timetable: [] });
        continue;
      } else {
        // lesson
        timetable[timetable.length - 1].timetable.push(await this.parseLesson(rows.item(i).textContent.trim()));
      }
    }
    return timetable.map((r) => new Schedule({ id: id, group: r.group, schedule: r.timetable, date }));
  }
  /**
   * @param {string} string
   * @returns {Lesson}
   */
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
/**
 * @typedef {object} AvailableSchedulesData
 * @property {string} dateString
 * @property {string} link
 * @property {parsedDate} date
 * @property {number} id
 * @property {Schedule[]} schedule
 */
/**
 * @typedef {object} parsedDate
 * @property {moment.Moment} parsed
 * @property {string} regular
 */
module.exports = Parser;
