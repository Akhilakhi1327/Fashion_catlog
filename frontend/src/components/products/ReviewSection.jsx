import React, { useState } from 'react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const ReviewSection = ({ product, setProduct }) => {
  const { customerInfo } = useCustomerAuth();
  const toast = useToast();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!customerInfo) {
      toast.error('You must be logged in to leave a review.');
      return;
    }
    if (!comment.trim()) {
      toast.error('Review comment cannot be empty.');
      return;
    }

    setSubmitting(true);
    try {
      // POST /api/products/:id/reviews
      const res = await api.post(`/products/${product._id}/reviews`, { rating, comment });
      toast.success(res.data.message || 'Review submitted successfully!');

      // Add local state update
      setProduct((prev) => {
        const newReview = {
          user: customerInfo._id,
          name: customerInfo.name,
          rating,
          comment,
          createdAt: new Date().toISOString()
        };
        const updatedReviews = [newReview, ...prev.reviews];
        const newRating = updatedReviews.reduce((acc, item) => item.rating + acc, 0) / updatedReviews.length;

        return {
          ...prev,
          reviews: updatedReviews,
          numReviews: updatedReviews.length,
          rating: newRating
        };
      });
      setComment('');
      setRating(5);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12 bg-white rounded-2xl border p-6 sm:p-8 animate-fade-in">
      <h3 className="text-2xl font-bold font-display text-gray-900 mb-6">Customer Reviews</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Write a Review */}
        <div>
          <h4 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h4>
          {customerInfo ? (
            <form onSubmit={submitHandler} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="input w-full max-w-xs"
                >
                  <option value="5">5 - Excellent 🌟🌟🌟🌟🌟</option>
                  <option value="4">4 - Very Good 🌟🌟🌟🌟</option>
                  <option value="3">3 - Good 🌟🌟🌟</option>
                  <option value="2">2 - Fair 🌟🌟</option>
                  <option value="1">1 - Poor 🌟</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Comment</label>
                <textarea
                  rows="3"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="input w-full resize-none"
                  placeholder="Share your thoughts about this product..."
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm">
              Please <a href="/login" className="font-bold underline">Login</a> to write a review.
            </div>
          )}
        </div>

        {/* Existing Reviews */}
        <div>
          <h4 className="text-lg font-bold text-gray-900 mb-4">
            {product.numReviews} {product.numReviews === 1 ? 'Review' : 'Reviews'}
            {product.numReviews > 0 && ` (Avg: ${product.rating.toFixed(1)} 🌟)`}
          </h4>

          {reviews.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {reviews.map((r, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900 text-sm">{r.name}</span>
                    <span className="text-yellow-500 text-xs">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{r.comment}</p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewSection;
