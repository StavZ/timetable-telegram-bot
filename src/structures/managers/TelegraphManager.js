import TelegrafClient from '../client/Client.js';
import markdown from 'telegraph.md';
import RemoteWork from '../parsers/RemoteWork.js';

export default class TelegraphManager {
  #client
  /**
   * @param {TelegrafClient} client
   */
  constructor(client) {
    this.#client = client;
  }

  /**
   * Получить Telegraph пост
   * @param {RemoteWork} rw
   */
  async get(rw) {
    const all = await this.getAll();
    const title = `${rw.title} ${rw.group} (${rw.date.regular})`;
    const found = all.pages.find((p) => p.title === title);
    if (found) return found;
    return await this.create(rw);
  }

  /**
   * Создать Telegraph пост
   * @param {RemoteWork} rw
   */
  async create(rw) {
    const title = `${rw.title} ${rw.group} (${rw.date.regular})`;
    const content = markdown(
`## Тема задания
${rw.subject}

${rw.content}

## Ссылки
${rw.links.map((l, i) => `[Ссылка ${(i += 1)}](${l})`).join('\n')}

## Почта преподавателя
[${rw.email}](mailto:${rw.email}?subject=${encodeURI(rw.group)})${rw.hasExternalLinks ? `\n\n*Является ссылкой на сторонний сайт/сервис и не относится к колледжу или ППК Telegram Бот.` : ''}`);
    return await this.#client.tph.createPage(title, content, `${rw.teacher}`, 'https://t.me/ppkslavyanovabot', true);
  }

  /**
   * Получить все посты Telegraph
   */
  async getAll() {
    return await this.#client.tph.getPageList();
  }
}
