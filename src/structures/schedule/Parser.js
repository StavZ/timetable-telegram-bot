const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const zlib = require('zlib');
const Schedule = require('./Schedule');
const Lesson = require('./Lesson');
const Client = require('../client/Client');
class Parser {
  /**
   * @param {Client} client
   */
  constructor (client) {
    this.client = client;
    this.scheduleUploadedAt = null;
    this.lastUploadedSchedule = {};
  }
  /**
   * @returns {Promise<Document>}
   */
  async parsePage (today = false) {
    return new Promise(async (resolve, reject) => {
      const page = await fetch(today ? 'https://ppkslavyanova.ru/lessonlist?today=1' : 'https://ppkslavyanova.ru/lessonlist', { headers: { 'Content-Type': 'text/html' } });
      zlib.gunzip(page.body._handle.buffer, (e, buffer) => {
        if (e) return this.client.logger.error(e);
        const doc = new JSDOM(Buffer.from(buffer).toString('utf-8'));
        const document = doc.window.document;
        resolve(document);
      });
    });
  }
  async parseDate (today = false) {
    const document = await this.parsePage(today);
    let date;
    const divs = document.getElementsByTagName('div');
    for (let i = 0; i < (divs.length - 1); i++) {
      if (divs.item(i).textContent.startsWith('Расписание')) {
        date = divs.item(i).textContent; break;
      }
    }
    const res = /Расписание на дату ([0-9]{1,2}) ([а-я]+) ([0-9]{4})/gim.exec(date);
    if (res[1] === 0) {
      return null;
    }
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
    if (res[1] === 0) return;
    const day = res[1];
    const month = months[res[2]];
    const year = res[3];
    return this.client.moment(new Date(`${month}-${day}-${year} GMT+0500`));
  }

  /**
   * @param {string} group
   * @param {boolean} today
   * @returns {Schedule}
   */
  async getScheduleByGroup (group, today = false) {
    const schedule = await this.getScheduleForEachGroup(today);
    return schedule.find((s) => s.group === group);
  }
  async getScheduleForEachGroup (today = false) {
    const document = await this.parsePage(today);
    const timetable = [];
    const rows = document.getElementsByClassName('R8');
    for (let i = 0; i < rows.length; i++) {
      if (rows.item(i).childElementCount === 3) {
        const newGroup = rows.item(i).textContent.replace(/\n/g, '');
        timetable.push({ group: newGroup, timetable: [] });
        continue;
      }
      if (rows.item(i).childElementCount !== 3) {
        timetable[timetable.length - 1].timetable.push(this.parseLesson(rows.item(i).textContent.trim()));
      }
    }
    const date = await this.parseDate(today);
    return timetable.map((r) => new Schedule({ date: date, group: r.group, generatedAt: Date.now(), schedule: r.timetable }));
  }
  async getGroups () {
    const document = await this.parsePage();
    const groupsArray = Array.from(document.getElementsByClassName('R8C0'));
    const groups = [];
    groupsArray.forEach((c) => {
      groups.push(c.textContent);
    });
    return groups;
  }

  parseLesson (string) {
    const fullRegex = /^([0-9])\n\n([ЁёА-я0-9_\-,() ]*)\n([ЁёА-я0-9_ ]*)(\n([ЁёА-я0-9_" ]*))?/gm;
    const parsed = fullRegex.exec(string);
    const result = {};
    result.lessonNumber = parseInt(parsed[1], 10);
    result.lesson = parsed[2].trim();
    result.teacher = parsed[3] ? parsed[3].trim() : null;
    const parsedClassroomAdress = parseClassroomAddress(parsed[4]);
    result.classroom = parsedClassroomAdress.classroom;
    result.address = parsedClassroomAdress.address;
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
    return result;
  }
}
module.exports = Parser;
