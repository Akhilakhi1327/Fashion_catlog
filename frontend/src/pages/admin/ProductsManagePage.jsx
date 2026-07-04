import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
import { getProducts, deleteProduct } from '../../services/productService';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';

const ProductsManagePage = () => {
  const toast = useToast();
  
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Search & pagination state
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Deletion modal target
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProductsList = async () => {
    setLoading(true);
    try {
      const res = await getProducts({ search, page, limit: 10 });
      if (res.success) {
        setProducts(res.data.products);
        setTotalProducts(res.data.totalProducts);
        setCurrentPage(res.data.currentPage);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Error loading products list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsList();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProductsList();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;

    setIsDeleting(true);
    try {
      const res = await deleteProduct(deleteTargetId);
      if (res.success) {
        toast.success(res.message || 'Product removed from catalog');
        setDeleteTargetId(null);
        // If current page is empty now, go back 1 page if possible
        if (products.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          fetchProductsList();
        }
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error(err.response?.data?.message || 'Failed to delete product from catalog');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">Manage Products</h1>
          <p className="text-sm text-gray-500 mt-1">Total {totalProducts} items published in store catalog</p>
        </div>
        <Link
          to="/admin/products/add"
          className="btn-primary flex items-center space-x-1.5 px-4 py-2.5 text-sm self-start sm:self-auto"
        >
          <FiPlus className="w-4 h-4" />
          <span>Publish Product</span>
        </Link>
      </div>

      {/* Control bar */}
      <div className="bg-white border p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search by name, category, fabric..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 pr-4 py-2"
          />
          <button
            type="submit"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            aria-label="Search Catalog"
          >
            <FiSearch className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>

      {/* Main product catalog list table */}
      {loading ? (
        <Spinner />
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-2xl">
          <span className="text-4xl block mb-2">📦</span>
          <p className="text-sm font-semibold text-gray-500">No products match search queries or exist in catalog.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-indigo-950 text-white text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Product Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                {products.map((prod) => {
                  const defaultImage = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=200&q=80';
                  const imageUrl = prod.images && prod.images.length > 0
                    ? prod.images[0].url
                    : defaultImage;

                  let stockStatus = 'In Stock';
                  if (prod.stock === 0) stockStatus = 'Out of Stock';
                  else if (prod.stock <= 5) stockStatus = 'Low Stock';

                  return (
                    <tr key={prod._id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Image */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={imageUrl}
                          alt={prod.name}
                          className="w-12 h-16 object-cover rounded-lg border bg-gray-50"
                        />
                      </td>

                      {/* Details */}
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 line-clamp-1">{prod.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Fabric: {prod.material || 'N/A'} • Wear: {prod.occasion}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">{prod.category}</td>

                      {/* Price */}
                      <td className="px-6 py-4 font-bold text-gray-900">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-bold text-gray-900">{prod.stock} items</p>
                          <Badge status={stockStatus} />
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2.5">
                          <Link
                            to={`/admin/products/${prod._id}/edit`}
                            className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:text-indigo-650 hover:bg-indigo-50 transition-all"
                            title="Edit details"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteTargetId(prod._id)}
                            className="p-2 border border-gray-200 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-all focus:outline-none"
                            title="Delete product"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination component */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you absolutely sure you want to delete this product from the catalog database? This action is permanent and will delete the images from Cloudinary storage.
          </p>
          <div className="flex space-x-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => setDeleteTargetId(null)}
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

export default ProductsManagePage;
