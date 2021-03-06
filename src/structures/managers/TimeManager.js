import moment from 'moment-timezone';

export default class TimeManager {
  /**
   * Получить текущее время
   * @param {boolean} [unix=false]
   * @returns {string|moment.Moment}
   */
  getCurrentTime(unix = false) {
    return unix ? moment().format('x') : moment();
  }

  /**
   * Получить текущий учебный год (год-год)
   * @returns {string}
   */
  getStudYear() {
    const date = this.getCurrentTime();
    // @ts-ignore
    if (date.month() + 1 < 7) {
      // @ts-ignore
      return `${date.year() - 1}-${date.year()}`;
    } else {
      // @ts-ignore
      return `${date.year()}-${date.year() + 1}`;
    }
  }

  /**
   * Карта курсов (год-курс)
   * @returns {Record<string,number>}
   */
  getCourseMap() {
    const studYear = Number(this.getStudYear().split('-')[0]);
    /**
     * @type {Record<string,number>}
     */
    const data = {};

    for (let i = 0; i < 4; i++) {
      data[studYear - i] = i + 1;
    }
    return data;
  }

  /**
   * Получить курс по группе
   * @param {string} group
   * @returns {number}
   */
  getCourse(group) {
    const map = this.getCourseMap();
    const yearRegex = /\d{2}/;
    const year = yearRegex.exec(group)[0];
    return map[`20${year}`];
  }
}
