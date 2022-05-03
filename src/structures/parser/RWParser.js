const URL = 'https://ppkslavyanova.ru/no_html_index.php';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:96.0) Gecko/20100101 Firefox/96.0';

import FormData from 'form-data';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import moment from 'moment-timezone';

import Client from '../client/Client.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const groups = require('./groups.json');
import constants from '../../constants.js';

const dateRegex = /(\d+)\s(января|февраля|марта|апреля|мая|июня|сентября|октября|ноября|декабря)\s(\d{2,4})/;

export default class RemoteWorksParser {
  /**
   * @param {Client} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * @param {string} group
   * @returns {task[]}
   */
  async getRemoteWorks(group) {
    const data = [];
    const id = this.getGroupId(group);
    const form = new FormData();
    form.append('date_work', '');
    form.append('group_id', `${id}`);
    form.append('edu_edit', '1');
    form.append('get_remote_work', '1');
    await axios
      .post(URL, form, {
        headers: {
          'Content-Type': `multipart/form-data; boundary=${form.getBoundary()}`,
          'User-Agent': USER_AGENT,
        },
      })
      .then((res) => {
        const jsdom = new JSDOM(res.data);
        const document = jsdom.window.document;
        const lis = document.getElementsByTagName('li');
        for (let i = 0; i < lis.length; i++) {
          const li = lis.item(i);
          const date = () => {
            const matches = li.textContent.replaceSpaces().match(dateRegex);
            if (!matches) {
              return null;
            }
            return `${matches[1]} ${matches[2]} ${matches[3]}`;
          };
          let shouldBeContentButNot = '';
          const title = () => {
            const matches = li
              .getElementsByClassName('title')
              .item(0)
              .textContent.split(/(?=[А-Я])/g);

            shouldBeContentButNot = matches.slice(1).join('\n').replaceSpaces().replace(date(), '');
            return matches[0].replaceSpaces().replace(date(), '').trim();
          };
          const taskSubject = li.getElementsByClassName('subtitle').item(0).textContent.trim();
          const remoteTaskText = this.removeRandomUnderscores(
            li
              .getElementsByClassName('remote_task_text')
              .item(0)
              .textContent.trim()
              .replace(/http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/g, (x) => `[${x}](${x}) `)
          );
          const linkDiv = li?.getElementsByClassName('links');
          const links = [];
          if (linkDiv) {
            for (let x = 0; x < linkDiv.length; x++) {
              const linksa = linkDiv.item(x).getElementsByTagName('a');
              for (let y = 0; y < linksa.length; y++) {
                links.push(linksa.item(y).href)
              }
            }
          }
          const teacher = li.getElementsByClassName('prepod').item(0).textContent.replaceSpaces().toProperCase();
          let email;
          for (let y = 0; y < li.getElementsByTagName('div').length; y++) {
            const div = li.getElementsByTagName('div').item(y);
            if (div?.textContent.startsWith('Почта преподавателя')) {
              const text = div.textContent.replace(/(Почта преподавателя)/gm, '');
              email = text.trim();
            }
          }
          data.push({
            title: title(),
            date: this.parseDate(date()),
            taskSubject,
            taskContent: `${shouldBeContentButNot ? `${shouldBeContentButNot}\n` : ''}${remoteTaskText}`,
            links,
            teacher,
            email,
          });
        }
      });
    return data;
  }

  /**
   * @param {string} content
   * @returns {string}
   */
  removeRandomUnderscores(content) {
    return content.replace(/(\_+)([А-Яа-я]|\s|\d)/g, (x) => {
      return x.replace(/\_/g, ' ');
    });
  }

  /**
   * @param {string} string
   * @returns {{toString():string,regular:string,day:string}}
   */
  parseDate(string) {
    if (!string) return null;
    string = string.replaceSpaces();
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
    const regex = /^([0-9]{1,2})? ?([а-я]+)? (\d+)?/gim;
    const res = regex.exec(string);
    const date = moment(`${res[3]}-${months[res[2]]}-${res[1].length === 1 ? `0${res[1]}` : res[1]}`);
    return {
      regular: date.format('DD-MM-YY'),
      toString: () => {
        return `${string}`;
      },
      day: constants.days[date.day()],
    };
  }

  /**
   * @param {string} group
   */
  getGroupPrefix(group) {
    return group.match(/([А-Яа-я]{1,2})/g)[0].toUpperCase();
  }

  getGroupId(group) {
    group = group.split(' ')[0].replace(',', '');
    const prefix = this.getGroupPrefix(group);
    const groupO = groups.find((g) => g.prefix === prefix);
    return groupO?.groups.find((g) => String(g.group === group))?.id;
  }
}

/**
 * @typedef {object} task
 * @prop {string} title
 * @prop {{toString():string,regular:string,day:string}} date
 * @prop {string} taskSubject
 * @prop {string} taskContent
 * @prop {string[]} links
 * @prop {string} teacher
 * @prop {string} email
 */
