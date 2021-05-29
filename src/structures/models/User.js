const { Schema, model } = require('mongoose');

const User = new Schema({
  id: Number,
  newsletter: Boolean,
  autoScheduler: { type: Boolean, default: false },
  lastSentSchedule: {
    date: { type: String, default: null },
    group: { type: String, default: '' },
    generatedAt: { type: Number, default: null },
    schedule: [{
      title: { type: String, default: null },
      teacher: { type: String, default: null },
      number: { type: Number, default: null },
      address: { type: String, default: null },
      classroom: { type: Number, default: null }
    }]
  },
  lastSupportMessage: { type: Number, default: null },
  teacher: { type: String, default: null },
  group: { type: String, default: null },
  role: { type: String, default: null },
  // constants: { type: Object, default: null },
  messageFormat: {type: String, default: null }
});
module.exports = model('user', User);
