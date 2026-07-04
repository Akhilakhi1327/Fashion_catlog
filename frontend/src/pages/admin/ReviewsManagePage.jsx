import React, { useEffect, useState } from 'react';
import { getProducts, deleteProductReview } from '../../services/productService';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { FiTrash2, FiStar, FiMessageSquare } from 'react-icons/fi';

const ReviewsManagePage = () => {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState(null); // { productId, reviewId }
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProductsWithReviews = async () => {
    setLoading(true);
    try {
      // Fetch products
      const res = await getProducts({ page, limit: 10 });
      if (res.success) {
        setProducts(res.data.products);
        setTotalProducts(res.data.totalProducts);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsWithReviews();
  }, [page]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const { productId, reviewId } = deleteTarget;
      const res = await deleteProductReview(productId, reviewId);
      if (res.success) {
        toast.success(res.message || 'Review deleted successfully');
        setDeleteTarget(null);
        // Refresh products list
        fetchProductsWithReviews();
      }
    } catch (err) {
      console.error('Error deleting review:', err);
      toast.error(err.response?.data?.message || 'Failed to delete review');
    } finally {
      setIsDeleting(false);
    }
  };

  // Extract all reviews from the fetched products
  const productsWithReviews = products.filter(p => p.reviews && p.reviews.length > 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">Product Reviews Moderation</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and moderate customer product feedback and ratings</p>
      </div>

      {loading ? (
        <Spinner />
      ) : productsWithReviews.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-2xl">
          <FiMessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500">No active reviews found on this page of products.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {productsWithReviews.map((prod) => (
            <div key={prod._id} className="bg-white border rounded-2xl shadow-sm overflow-hidden">
              {/* Product Header details */}
              <div className="bg-indigo-950/5 border-b px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={prod.images && prod.images.length > 0 ? prod.images[0].url : 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=100&q=80'}
                    alt={prod.name}
                    className="w-10 h-12 object-cover rounded-lg border bg-white"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{prod.name}</h3>
                    <p className="text-xs text-gray-500">Category: {prod.category} | Average Rating: {prod.rating.toFixed(1)} ★ ({prod.numReviews} reviews)</p>
                  </div>
                </div>
              </div>

              {/* Reviews table for this product */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider border-b">
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Rating</th>
                      <th className="px-6 py-3">Comment</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {prod.reviews.map((rev) => (
                      <tr key={rev._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-950">
                          {rev.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-amber-500 space-x-0.5">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                className={`w-4 h-4 ${i < rev.rating ? 'fill-amber-500' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-xs sm:max-w-md break-words text-gray-600 font-medium">
                          {rev.comment}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-xs font-semibold">
                          {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => setDeleteTarget({ productId: prod._id, reviewId: rev._id })}
                            className="p-2 border border-gray-200 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-all focus:outline-none"
                            title="Delete this review"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Review"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to delete this customer review? The product average rating and total reviews count will be recalculated. This action cannot be undone.
          </p>
          <div className="flex space-x-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setDeleteTarget(null)}
              className="btn-outline flex-1"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="bg-red-650 hover:bg-red-750 text-white font-semibold py-2.5 rounded-lg flex-1 disabled:opacity-50"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReviewsManagePage;
