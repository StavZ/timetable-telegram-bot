const { Telegraf } = require('telegraf');
const CommandHandler = require('./CommandHandler');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const consola = require('consola');
require('../prototypes/Array');

class Client extends Telegraf {
  constructor (token, ...args) {
    super(token, ...args);
    this.constants = {
      dayInMs: 8.64e+7
    };
    this.owner = 408057291;
    this.ownerChatID = 408057291;
    this.commandHandler = new CommandHandler(this);
    this.config = process.env.NODE_ENV === 'heroku' ? process.env : dotenv.config().parsed;
    this.logger = consola;
    this.parser = new (require('../schedule/Parser'))(this);
    this.manager = new (require('../schedule/ScheduleManager'))(this);
    this.userManager = new (require('../schedule/UserManager'))(this);
    this.moment = function (date, format) {
      const parsedDate = require('moment')(date);
      return parsedDate.format(format);
    };
    this.lastReload = Date.now();
  }

  isOwner(ctx) {
    return ctx.from.id === this.owner;
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
  }
}
module.exports = Client;
