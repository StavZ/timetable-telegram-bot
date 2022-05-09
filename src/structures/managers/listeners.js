import { TelegramError } from 'telegraf';
import TelegrafClient from '../client/Client.js';
import User from '../models/User.js';

/**
 * @param {TelegrafClient} client
 * @param {User} user
 * @param {import("../parsers/Timetable.js").TimetableTD} timetable
 */
export function newTimetable(client, user, timetable) {
  const message = client.timetable.generateMessage(timetable, 'new');
  return client.telegram
    .sendMessage(user.id, message, { parse_mode: 'Markdown', disable_web_page_preview: true })
    .then((r) => {
      user._setSentTimetable(timetable);
    })
    .catch((e) => {
      if (e instanceof TelegramError) {
        if (e.code === 403) {
          client.logger.log(`403 FORBIDDEN: ${user.id}`);
          user._setAutoschedulerState(false);
          user._setSentTimetable(null);
        }
      }
    });
}
/**
 * @param {TelegrafClient} client
 * @param {User} user
 * @param {import("../parsers/Timetable.js").TimetableTD} timetable
 */
export function editedTimetable(client, user, timetable) {
  const message = client.timetable.generateMessage(timetable, 'edited');
  return client.telegram
    .sendMessage(user.id, message, { parse_mode: 'Markdown', disable_web_page_preview: true })
    .then((r) => {
      user._setSentTimetable(timetable);
    })
    .catch((e) => {
      if (e instanceof TelegramError) {
        if (e.code === 403) {
          client.logger.log(`403 FORBIDDEN: ${user.id}`);
          user._setAutoschedulerState(false);
          user._setSentTimetable(null);
        }
      }
    });
}
