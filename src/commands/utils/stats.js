import { Context } from "telegraf";
import Client from "../../structures/client/Client.js";
import Command from "../../structures/client/Command.js";

export default class StatsCommand extends Command {
  /**
   * @param {Client} client 
   */
  constructor (client) {
    super({
      name: 'stats',
      aliases: ['статистика'],
      description: 'Статистика бота',
      usage: 'stats',
    });
    this.client = client;
  }

  /**
   * @param {Context} ctx 
   * @param {string[]} args 
   */
  async exec (ctx, args) {
    const userCount = await this.client.userManager.getUserCount();
    const activeUsers = (await this.client.userManager.getUsers({ autoScheduler: true })).filter(u => u.group !== null);
    const graph = this.sortByGroup(activeUsers);
    let msg = `Количество пользователей: \`${userCount}\`\nКол-во активных пользователей\`*\`: \`${activeUsers.length}\`\n\n*Таблица пользователей по группам*\n\`\`\`\nГруппа    | Кол-во пользователей\n\n`;
    for (const group of Object.keys(graph)) {
      const spaces = (9 - group.split(',')[0].trim().length);
      msg += `${group.split(',')[0].trim().length !== 9 ? `${group.split(',')[0].trim()}${' '.repeat(spaces)}` : `${group.split(',')[0].trim()}`} | ${graph[group].users}\n`;
    }
    msg += `\`\`\`\n\`*\`Активным пользователем считается тот, кто выбрал группу и включил автоматическую рассылку.`;
    ctx.replyWithMarkdown(msg);
  }

  /**
   * @param {import("../../structures/client/managers/UserManager.js").user[]} users 
   */
  sortByGroup (users) {
    /**
     * @type {Object<string, {users: number}>}
     */
    let _ = {};
    for (const u of users) {
      if (!u.group) continue;
      if (!_[u.group]) {
        _[u.group] = { users: 0 };
      }
      _[u.group].users += 1;
    }
    let sortedByKeys;
    sortedByKeys = Object.keys(_).sort((a, b) => { return _[b].users - _[a].users; });
    let sorted = {};
    sortedByKeys.forEach((k) => { return sorted[k] = { users: _[k].users }; });
    return sorted;
  }
}
