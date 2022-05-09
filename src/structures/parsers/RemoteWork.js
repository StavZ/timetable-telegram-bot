export default class RemoteWork {
  constructor(data) {
    /**
     * Дисциплина
     * @type {string}
     */
    this.title = data.title;
    /**
     * Дата задания
     * @type {{toString():string,regular:string,day:string}|null}
     */
    this.date = data.date;
    /**
     * Тема задания
     * @type {string}
     */
    this.subject = data.taskSubject;
    /**
     * Текст задания
     * @type {string}
     */
    this.content = data.taskContent;
    /**
     * Ссылки
     * @type {string[]}
     */
    this.links = data.links;
    /**
     * Преподаватель
     * @type {string|null}
     */
    this.teacher = data.teacher;
    /**
     * Почта преподавателя
     * @type {string|null}
     */
    this.email = data.email;
    /**
     * Группа
     * @type {string}
     */
    this.group = data.group
    /**
     * Наличие сыллок на стороние сайты/сервисы
     * @type {boolean}
     */
    this.hasExternalLinks = !!data.hasExternalLinks;
  }
}
