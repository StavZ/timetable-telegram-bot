import moment from 'moment-timezone';

export default class TimeManager {
  constructor() {}

  getCurrentTime(unix = false) {
    // return moment('2021-05-05T00:00:00+05:00').set({ hours: 0, minutes: 0, seconds: 0 });
    return unix
      ? moment().set({ hours: 0, minutes: 0, seconds: 0 }).format('x')
      : moment().set({ hours: 0, minutes: 0, seconds: 0 });
  }

  getStudYear() {
    const date = this.getCurrentTime();
    if (date.month() + 1 < 7) {
      return `${date.year() - 1}-${date.year()}`;
    } else {
      return `${date.year()}-${date.year() + 1}`;
    }
  }

  /**
   * @returns {Record<string:number>}
   */
  getCourseMap() {
    const studYear = Number(this.getStudYear().split('-')[0]);
    const data = {};

    for (let i = 0; i < 4; i++) {
      data[studYear - i] = i + 1;
    }
    return data;
  }

  /**
   * @param {string} year
   */
  getCourse(year) {
    const map = this.getCourseMap();
    return map[`20${year}`];
  }
}
