import mongoose from 'mongoose';
const { model, Schema } = mongoose;

const Module = new Schema({
  name: { type: String },
  type: { type: String },
  remoteConfig: { type: Schema.Types.Mixed, default: {} },
});
export default model('module', Module);
