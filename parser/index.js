const fetch = require('node-fetch');
const zlib = require('zlib');
const fs = require('fs');
const { JSDOM } = require('jsdom');

async function getTimetable () {
  const r = await fetch('https://ppkslavyanova.ru/lessonlist', { headers: { 'Content-Type': 'text/html' } });
  zlib.gunzip(r.body._handle.buffer, (e, buffer) => {
    if (e) return console.log(e);
    const doc = new JSDOM(Buffer.from(buffer).toString('utf-8'));
    const document = doc.window.document;
    let currentDate;
    date = currentDate;
    const divs = document.getElementsByTagName('div');
    const divsLength = document.getElementsByTagName('div').length;
    for (let i = 0; i < (divsLength - 1); i++) {
      if (divs.item(i).textContent.startsWith('Расписание')) { currentDate = divs.item(i).textContent; break; }
    }
    groups = document.getElementsByClassName('R8C0');
    const timetable = [];
    const rows = document.getElementsByClassName('R8');
    for (let i = 0; i < rows.length; i++) {
      if (rows.item(i).childElementCount === 3) {
        const newGroup = rows.item(i).textContent.replace(/\n/g, '');
        timetable.push({ group: newGroup, timetable: [] });
        continue;
      }
      if (rows.item(i).childElementCount !== 3) {
        timetable[timetable.length - 1].timetable.push(parse(rows.item(i).textContent.trim()));
      }
    }
  });
}
function parseTimetable (timetable, date) {
  return `${date}\n\n${(timetable.map(r => `${r.group}\n${r.timetable.map(p => `${p.lessonNumber}. ${p.lesson}${p.teacher ? ` - ${p.teacher}` : ''}${p.classroom ? ` - ${p.classroom === 'Дистанционное обучение' ? p.classroom : `Аудитория №${p.classroom}`}` : ''}${p.address ? ` - ${p.address}` : ''}`).join('\n')}`).join('\n\n'))}`;
}
function parse (string) {
  const fullRegex = /^([0-9])\n\n([ЁёА-я0-9_ ]*)\n([ЁёА-я0-9_ ]*)(\n([ЁёА-я0-9_" ]*))?/gm;
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
module.exports = {
  groups,
  date,
  getTimetable
};
