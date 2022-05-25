const URL = 'https://ppkslavyanova.ru/no_html_index.php';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:100.0) Gecko/20100101 Firefox/100.0';
const dateRegex = /(\d+)\s(января|февраля|марта|апреля|мая|июня|сентября|октября|ноября|декабря)\s(\d{2,4})/;

import axios from 'axios';
import FormData from 'form-data';
import { JSDOM } from 'jsdom';

import TelegrafClient from '../client/Client.js';
import RemoteWork from './RemoteWork.js';

export default class RemoteWorksParser {
  /**
   *
   * @param {TelegrafClient} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   *
   * @param {string} group
   * @returns {Promise<RemoteWork[]>}
   */
  async get(group) {
    const id = this.#getGroupId(group);
    if (!id) return [];
    const form = new FormData();
    form.append('date_work', '');
    form.append('group_id', `${id}`);
    form.append('edu_edit', '1');
    form.append('get_remote_work', '1');

    const res = await axios.post(`${URL}`, form, { headers: { 'Content-Type': `multipart/form-data; boundary=${form.getBoundary()}`, 'User-Agent': USER_AGENT } });
    if (res?.status !== 200) {
      return [];
    }

    const jsdom = new JSDOM(res.data);
    const data = await this.#parse(jsdom.window.document, group);

    return data;
  }

  /**
   * @param {string} group
   * @param {string} date - Формат DD-MM-YY
   */
  async getByDate(group, date) {
    const rw = await this.get(group);
    return rw.filter((r) => r.date.regular === date);
  }

  /**
   * @param {Document} document
   * @returns {Promise<RemoteWork[]>}
   */
  async #parse(document, group) {
    const data = [];
    const list = document.getElementsByTagName('li');
    for (let i = 0; i < list.length; i++) {
      data.push(this.#parseWork(list.item(i), group));
    }
    return data;
  }

  /**
   * @param {HTMLLIElement} task
   * @param {string} group
   * @returns {RemoteWork}
   */
  #parseWork(task, group) {
    const date = this.#parseDate(task.getElementsByClassName('title').item(0).textContent);
    let shouldBeContentButNot = '';
    const title = () => {
      const matches = task
        .getElementsByClassName('title')
        .item(0)
        .textContent.split(/(?=[А-Я])/g);

      // @ts-ignore
      shouldBeContentButNot = matches.slice(1).join('\n').replaceSpaces().replace(date, '');
      // @ts-ignore
      return matches[0].replaceSpaces().replace(date, '').trim();
    };

    // @ts-ignore
    const taskSubject = this.#removeRandomUnderscores(task.getElementsByClassName('subtitle').item(0).textContent.trim().replaceSpaces());
    const taskText = this.#removeRandomUnderscores(
      task
        .getElementsByClassName('remote_task_text')
        .item(0)
        .textContent.trim()
        .replace(/http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/g, (x) => `[${x}](${x}) `)
    );

    const linkDiv = task.getElementsByClassName('links');
    const links = [];
    if (linkDiv.length) {
      for (let x = 0; x < linkDiv.length; x++) {
        const linksa = linkDiv.item(x).getElementsByTagName('a');
        for (let y = 0; y < linksa.length; y++) {
          links.push(linksa.item(y).href);
        }
      }
    }

    // @ts-ignore
    const teacher = task.getElementsByClassName('prepod').item(0).textContent.replaceSpaces().toProperCase();
    let email = null;
    for (let y = 0; y < task.getElementsByTagName('div').length; y++) {
      const div = task.getElementsByTagName('div').item(y);
      if (div?.textContent.startsWith('Почта преподавателя')) {
        const text = div.textContent.replace(/(Почта преподавателя)/gm, '');
        email = text.trim();
      }
    }
    const linkRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
    const hasExternalLinks = linkRegex.test(`${shouldBeContentButNot ? `${shouldBeContentButNot}\n` : ''}${taskText}`);
    const content = `${shouldBeContentButNot ? `${shouldBeContentButNot}\n` : ''}${taskText}`.replace(linkRegex, (x) => x.includes('ppkslavyanova') ? `[${x}](${x})` : `[${x}](${x})*`);

    return new RemoteWork({
      title: title(),
      date: date,
      taskSubject,
      taskContent: content,
      links,
      teacher,
      email,
      group,
      hasExternalLinks,
    });
  }

  /**
   * @param {string} content
   * @returns {string}
   */
  #removeRandomUnderscores(content) {
    return content.replace(/(\_+)([А-Яа-я]|\s|\d)/g, (x) => {
      return x.replace(/\_/g, ' ');
    });
  }

  /**
   * @param {string} string
   * @returns {{toString():string,regular:string,day:string}}
   */
  #parseDate(string) {
    // @ts-ignore
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
    const regex = /([0-9]{1,2}) ([а-я]+) (\d+)/gim;
    const res = regex.exec(string);
    if (!res) return null;
    if (!dateRegex.test(`${res[1]} ${res[2]} ${res[3]}`)) return null;

    const date = this.client.moment(`${res[3]}-${months[res[2]]}-${res[1].length === 1 ? `0${res[1]}` : res[1]}`);
    return {
      regular: date.format('DD-MM-YY'),
      toString: () => {
        return `${res[1]} ${res[2]} ${res[3]}`;
      },
      day: this.client.constants.days[date.day()],
    };
  }

  /**
   * @param {string} group
   * @returns {string}
   */
  #getGroupPrefix(group) {
    return group.match(/([А-Яа-яA-Za-z]){1,2}/g)[0].toUpperCase();
  }

  /**
   *
   * @param {string} group
   * @returns {string}
   */
  #getGroupId(group) {
    group = group.split(' ')[0].replace(',', '');

    const prefix = this.#getGroupPrefix(group);
    const groupO = this.client.constants.gids.find((g) => g.prefix === prefix);
  
    return groupO?.groups.find((g) => JSON.stringify(g.group) === JSON.stringify(group))?.id;
  }

  /**
   * @todo
   * @returns {Promise<{group:string,works:RemoteWork[]}[]>}
   */
  async #getAll() {
    const data = [];
    this.client.constants.gids.forEach((gid) => {
      gid.groups.forEach((g) => {
        if (!data.find((d) => d.group === g.group)) data.push({ group: g.group, works: [] });
        setTimeout(async () => {
          data.find((d) => d.group === g.group).works = await this.get(g.group);
        }, 300);
      });
    });
    return data;
  }
}
