import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiHeart } from 'react-icons/fi';
import Badge from '../ui/Badge';
import { getOptimizedImageUrl } from '../../utils/imageUtils';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useToast } from '../../context/ToastContext';

const ProductCard = ({ product }) => {
  const { _id, name, category, price, stock, images, material, occasion, colors } = product;
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, customerInfo } = useCustomerAuth();
  const toast = useToast();

  const isWishlisted = wishlist?.includes(_id);

  const mainImage = getOptimizedImageUrl(
    images && images.length > 0
      ? images[0].url
      : 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
    400
  );

  // Stock status
  let stockStatus = 'In Stock';
  if (stock === 0) {
    stockStatus = 'Out of Stock';
  } else if (stock <= 5) {
    stockStatus = 'Low Stock';
  }

  const goToDetail = () => navigate(`/products/${_id}`);

  const handleWishlistToggle = async (e) => {
    e.stopPropagation(); // Prevent card click
    if (!customerInfo) {
      toast.error('Please log in to add to wishlist');
      navigate('/login');
      return;
    }
    try {
      await toggleWishlist(_id);
      if (isWishlisted) toast.success('Removed from wishlist');
      else toast.success('Added to wishlist');
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <div
      onClick={goToDetail}
      className="card group flex flex-col h-full cursor-pointer bg-white/95"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && goToDetail()}
      aria-label={`View details for ${name}`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-[#f6e9dc] via-white to-[#f1dfcb]">
        <img
          src={mainImage}
          alt={name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-700 ease-out"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="absolute top-3 left-3 z-10">
          <span className="rounded-full bg-[#4b2c24]/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
            {category}
          </span>
        </div>

        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-gray-500 shadow-sm backdrop-blur transition-all hover:scale-110 hover:bg-white"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <FiHeart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
        </button>

        <div className="absolute bottom-3 left-3 z-10">
          <Badge status={stockStatus} />
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 p-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <span className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/95 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-primary shadow-xl">
            <FiEye className="w-4 h-4" />
            View Details
          </span>
        </div>
      </div>

      <div className="flex-grow p-4 sm:p-5 flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500 mb-2">
            {material && <span>{material}</span>}
            {material && occasion && <span className="text-gray-300">•</span>}
            {occasion && <span>{occasion}</span>}
          </div>

          <h3 className="text-[15px] sm:text-base font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug font-display">
            {name}
          </h3>

          {colors && colors.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {colors.slice(0, 3).map((color) => (
                <span key={color} className="rounded-full border border-[#ead9c5] bg-[#fcf6ef] px-2.5 py-1 text-[10px] font-semibold text-gray-600">
                  {color}
                </span>
              ))}
              {colors.length > 3 && (
                <span className="rounded-full border border-[#ead9c5] bg-[#fcf6ef] px-2.5 py-1 text-[10px] font-semibold text-gray-500">
                  +{colors.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-base font-bold text-primary">
            ₹{price.toLocaleString('en-IN')}
          </span>
          <span className="hidden sm:inline-flex items-center rounded-full bg-[#f8efe3] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
            Tap to view →
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
