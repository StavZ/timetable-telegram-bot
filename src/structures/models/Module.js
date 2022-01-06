import mongoose from 'mongoose';
const { model, Schema } = mongoose;

const Module = new Schema({
  name: { type: String },
  type: { type: String },
  remoteConfig: { type: Schema.Types.Mixed, default: {} },
  runs: { type: Number, default: 0 },
});
export default model('module', Module);
