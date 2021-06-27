const { Telegraf } = require('telegraf');
const CommandHandler = require('./CommandHandler');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const consola = require('consola');
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Yekaterinburg');
require('../prototypes/Array');
dotenv.config();

class Client extends Telegraf {
  constructor (token, ...args) {
    super(token, ...args);
    this.constants = {
      dayInMs: 8.64e+7,
      end2021: 1625011200000,
      start2021: 1630454400000
    };
    this.owner = 408057291;
    this.ownerChatID = 408057291;
    this.commandHandler = new CommandHandler(this);
    this.config = process.env;
    this.logger = consola;
    this.parser = new (require('../schedule/Parser.new'))(this);
    this.manager = new (require('./managers/TimetableManager'))(this);
    this.userManager = new (require('./managers/UserManager'))(this);
    this.moment = function (date, format) {
      const parsedDate = require('moment-timezone')(date);
      return parsedDate.format(format);
    };
    this.lastReload = Date.now();
  }

  isOwner (ctx) {
    return ctx.from.id === this.owner;
  }

  getCurrentDate () {
    return moment().set({ hours: 0, seconds: 0, minutes: 0 });
  }

  async run () {
    this.commandHandler.load();
    await this.manager.run();
    this.launch({ allowedUpdates: true }).then(() => {
      this.logger.success(`Logged in as @${this.botInfo.username}`);
    });
    mongoose.connect(this.config.MONGOURI, { useNewUrlParser: true, useUnifiedTopology: true }).then((e) => {
      this.logger.success('Connected to MongoBD!');
    }).catch((e) => {
      this.logger.error(e);
    });


    this.manager.on('newSchedule', (schedule, userSchedule, user) => {
      let msg = `Новое расписание на ${schedule.date.regular}\nГруппа: ${user.group}\n\`\`\`\n`;
      if (!userSchedule) return;
      for (const l of userSchedule.schedule) {
        msg += `${l.error ? `${l.error}\n` : `${l.number} пара - ${l.title}${l.teacher ? ` у ${l.teacher}` : ''}${l.classroom && l.address ? ` • ${l.classroom} | ${l.address}` : (l.classroom && !l.address ? ` • ${l.classroom}` : (!l.classroom && l.address ? ` • ${l.address}` : ''))}\n`}`;
        if (l.error && msg.includes(l.error)) break;
      }
      msg += `\n\`\`\`[Ссылка на сайт](${schedule.link})`;
      if (user.chatId) {
        this.telegram.sendMessage(user.chatId, msg, { parse_mode: 'Markdown' }).then((r) => {
          this.userManager.updateUserSchema(user.id, 'lastSentSchedule', userSchedule);
        }).catch((e) => {
          this.userManager.updateUserSchema(user.id, 'lastSentSchedule', null);
        });
      }
    });
    this.manager.on('editedSchedule', (schedule, userSchedule, user) => {
      let msg = `Обновленное расписание на ${schedule.date.regular}\nГруппа: ${user.group}\n\`\`\`\n`;
      if (!userSchedule) return;
      for (const l of userSchedule.schedule) {
        msg += `${l.error ? `${l.error}\n` : `${l.number} пара - ${l.title}${l.teacher ? ` у ${l.teacher}` : ''}${l.classroom && l.address ? ` • ${l.classroom} | ${l.address}` : (l.classroom && !l.address ? ` • ${l.classroom}` : (!l.classroom && l.address ? ` • ${l.address}` : ''))}\n`}`;
        if (l.error && msg.includes(l.error)) break;
      }
      msg += `\n\`\`\`[Ссылка на сайт](${schedule.link})`;
      if (user.chatId) {
        this.telegram.sendMessage(user.chatId, msg, { parse_mode: 'Markdown' }).then((r) => {
          this.userManager.updateUserSchema(user.id, 'lastSentSchedule', userSchedule);
        }).catch((e) => {
          this.userManager.updateUserSchema(user.id, 'lastSentSchedule', null);
        });
      }
    });
  }
}
module.exports = Client;
