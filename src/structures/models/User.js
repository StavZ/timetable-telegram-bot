const { Schema, model } = require('mongoose');

const User = new Schema({
  id: Number,
  newsletter: Boolean,
  autoScheduler: { type: Boolean, default: false },
  lastSentSchedule: { type: Schema.Types.Mixed, default: null },
  lastSupportMessage: { type: Number, default: null },
  teacher: { type: String, default: null },
  group: { type: String, default: null },
  role: { type: String, default: null },
  messageFormat: { type: String, default: null },
  notionDatabaseId: { type: String, default: null },
  chatId: { type: Number, default: null }
});
module.exports = model('user', User);
