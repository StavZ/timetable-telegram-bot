import mongoose from 'mongoose';
const { model, Schema } = mongoose;

const User = new Schema({
  id: Number,
  autoScheduler: { type: Boolean, default: true },
  sentSchedule: { type: Schema.Types.Mixed, default: null },
  supportMessages: { type: Array, default: null },
  teacher: { type: String, default: null },
  group: { type: String, default: null },
  course: { type: Number, default: null },
  role: { type: String, default: null },
  regDate: { type: Number, default: null },
});
export default model('user', User);
