import Client from "../Client.js";
import { TelegramError } from 'telegraf';
/**
 * 
 * @param {Client} client 
 * @param {import("./UserManager.js").user} user 
 * @param {import("../../parser/Schedule.js").schedule} schedule 
 */
export function newSchedule (client, user, schedule) {
  let msg = `Новое расписание на ${schedule.date.toString()}\nГруппа: ${schedule.group}\n\`\`\`\n`;
  if (schedule.lessons.length) {
    for (const lesson of schedule.lessons) {
      msg += `${lesson.error ? `${lesson.error}\n` : `${lesson.number} пара - ${lesson.title}${lesson.teacher ? ` у ${lesson.teacher}` : ''}${lesson.classroom && lesson.address ? ` • ${lesson.classroom} | ${lesson.address}` : (lesson.classroom && !lesson.address ? ` • ${lesson.classroom}` : (!lesson.classroom && lesson.address ? ` • ${lesson.address}` : ''))}\n`}`;
      if (lesson.error && msg.includes(lesson.error)) break;
    }
    msg += `\n\`\`\`${client.generateBells(schedule) ? `\n${client.generateBells(schedule)}` : ''}\n[Ссылка на сайт](${schedule.url})`;
  } else {
    msg += `Расписание не найдено*\`\`\`\n\`*\`_Расписание не найдено - значит, что пары не были поставлены._`;
  }

  client.telegram.sendMessage(user.id, msg, { parse_mode: 'Markdown' }).then((r) => {
    client.userManager.setLastSentSchedule(user.id, schedule);
  }).catch(e => {
    if (e instanceof TelegramError) {
      if (e.code === 403) {
        client.logger.log(`${user.id} : 403 Forbidden`);
        client.userManager.setLastSentSchedule(user.id, null);
        client.userManager.updateUser(user.id, 'autoScheduler', false);
      }
    }
  });
}

/**
 * 
 * @param {Client} client 
 * @param {import("./UserManager.js").user} user 
 * @param {import("../../parser/Schedule.js").schedule} schedule 
 */
export function editedSchedule (client, user, schedule) {
  let msg = `Изменения в расписании на ${schedule.date.toString()}\nГруппа: ${schedule.group}\n\`\`\`\n`;
  if (schedule.lessons.length) {
    for (const lesson of schedule.lessons) {
      msg += `${lesson.error ? `${lesson.error}\n` : `${lesson.number} пара - ${lesson.title}${lesson.teacher ? ` у ${lesson.teacher}` : ''}${lesson.classroom && lesson.address ? ` • ${lesson.classroom} | ${lesson.address}` : (lesson.classroom && !lesson.address ? ` • ${lesson.classroom}` : (!lesson.classroom && lesson.address ? ` • ${lesson.address}` : ''))}\n`}`;
      if (lesson.error && msg.includes(lesson.error)) break;
    }
    msg += `\n\`\`\`${client.generateBells(schedule) ? `\n${client.generateBells(schedule)}` : ''}\n[Ссылка на сайт](${schedule.url})`;
  } else {
    msg += `Расписание не найдено*\`\`\`\n\`*\`_Расписание не найдено - значит, что пары не были поставлены._`;
  }

  client.telegram.sendMessage(user.id, msg, { parse_mode: 'Markdown' }).then((r) => {
    client.userManager.setLastSentSchedule(user.id, schedule);
  }).catch(e => {
    if (e instanceof TelegramError) {
      if (e.code === 403) {
        client.logger.log(`${user.id} : 403 Forbidden`);
        client.userManager.setLastSentSchedule(user.id, null);
        client.userManager.updateUser(user.id, 'autoScheduler', false);
      }
    }
  });
}
