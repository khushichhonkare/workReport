import mongoose, { Schema, model } from 'mongoose';

const categorySchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  mainCategory: {
    type: [mongoose.Types.ObjectId],
    ref: 'Category',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Category = model('Category', categorySchema);

export default Category;
