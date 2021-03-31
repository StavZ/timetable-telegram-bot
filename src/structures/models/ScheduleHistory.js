const { Schema, model } = require('mongoose');

const ScheduleHistory = new Schema({
  week: [{}]
});
module.exports = model('history', ScheduleHistory);
