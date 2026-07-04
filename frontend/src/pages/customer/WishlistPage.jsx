import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import ProductCard from '../../components/products/ProductCard';
import Spinner from '../../components/ui/Spinner';
import { FiHeart, FiShoppingBag } from 'react-icons/fi';

const WishlistPage = () => {
  const { customerInfo } = useCustomerAuth();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await api.get('/users/wishlist');
        setWishlistProducts(res.data.data);
      } catch (err) {
        toast.error('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };

    if (customerInfo) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [customerInfo, toast]);

  if (!customerInfo) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 text-center animate-fade-in">
        <FiHeart className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">Your Wishlist</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Please log in to save your favorite products and access them from any device.
        </p>
        <Link to="/login" className="btn-primary py-3 px-8 text-lg font-medium">
          Log In or Sign Up
        </Link>
      </div>
    );
  }

  if (loading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <FiHeart className="w-8 h-8 text-rose-500 fill-current" />
        <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 tracking-tight">
          My Wishlist
        </h1>
        <span className="bg-gray-100 text-gray-700 text-sm font-semibold px-3 py-1 rounded-full ml-auto">
          {wishlistProducts.length} Items
        </span>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 animate-fade-in">
          <div className="mx-auto w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
            <FiHeart className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 font-display">Your wishlist is empty</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Looks like you haven't saved any favorites yet. Explore our collection and find something you love.
          </p>
          <Link to="/products" className="btn border border-gray-300 text-gray-700 hover:bg-gray-100 inline-flex items-center space-x-2 px-6 py-3">
            <FiShoppingBag />
            <span>Start Shopping</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
          {wishlistProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
