// src/models/review.model.js
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  rating: Number,
  comment: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  futsal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Futsal',
  },
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
