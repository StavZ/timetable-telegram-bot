export default class Lesson {
  constructor(data) {
    /**
     * Является-ли дистанционным
     * @type {boolean}
     */
    this.isRemote = !!data.location?.location?.startsWith('Дистанционное');
    /**
     * Номер пары
     * @type {number}
     */
    this.number = data.number;
    /**
     * Дисциплина
     * @type {string}
     */
    this.title = data.title;
    /**
     * Преподаватель
     * @type {string}
     */
    this.teacher = data?.teacher;
    /**
     * Локация
     * @type {string}
     */
    this.location = data.location.location;
    /**
     * Аудитория
     * @type {string}
     */
    this.classroom = data.location.classroom;
    /**
     * Группа
     * @type {string}
     */
    this.group = data.group
  }
}
