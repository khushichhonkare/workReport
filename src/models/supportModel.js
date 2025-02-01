import { Schema, model } from 'mongoose';

const supportSchema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Support = model('Support', supportSchema);

export default Support;
