import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart, FiHeart } from 'react-icons/fi';
import ReviewSection from '../components/products/ReviewSection';
import { getProductById } from '../services/productService';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import SEO from '../components/SEO';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import api from '../services/api';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { addToCart } = useCart();
  const { customerInfo, toggleWishlist, isProductWishlisted } = useCustomerAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminWhatsAppNumber, setAdminWhatsAppNumber] = useState('919182764294');

  // Gallery main image index
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // User selections
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [orderQuantity, setOrderQuantity] = useState(1);

  const isWishlisted = product ? isProductWishlisted(product._id) : false;

  // Fetch admin WhatsApp config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get('/config');
        if (res.data?.success && res.data.data?.whatsappNumber) {
          setAdminWhatsAppNumber(res.data.data.whatsappNumber);
        }
      } catch (err) {
        console.error('Error fetching config:', err);
      }
    };
    fetchConfig();
  }, []);

  // Compute available stock for current color+size selection
  const getSelectedVariantStock = () => {
    if (!product) return 0;
    if (product.variants && product.variants.length > 0 && selectedColor && selectedSize) {
      const v = product.variants.find((v) => v.color === selectedColor && v.size === selectedSize);
      return v ? v.stock : 0;
    }
    return product.stock;
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const res = await getProductById(id);
        if (res.success) {
          setProduct(res.data);
          // Auto-select first color/size if available
          if (res.data.colors?.length > 0) setSelectedColor(res.data.colors[0]);
          if (res.data.sizes?.length > 0) setSelectedSize(res.data.sizes[0]);
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err.response?.data?.message || 'Product details not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [id]);

  if (loading) return <Spinner fullScreen />;

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <span className="text-5xl block mb-4">⚠️</span>
        <h2 className="text-2xl font-bold font-display text-gray-900">{error}</h2>
        <Link to="/products" className="btn-primary mt-6 inline-flex items-center space-x-2">
          <FiArrowLeft />
          <span>Back to catalog</span>
        </Link>
      </div>
    );
  }

  if (!product) return null;

  const availableStock = getSelectedVariantStock();
  const stockStatus = availableStock > 0 ? 'In Stock' : 'Out Of Stock';

  // Make list of images safely
  const imgList = product.images && product.images.length > 0 ? product.images : [{ url: '/placeholder.png' }];

  const handleAddToCart = () => {
    if (product.colors?.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    addToCart(product, orderQuantity, selectedColor, selectedSize);
    toast.success(`${product.name} added to cart!`);
  };

  const handleWhatsAppEnquiry = () => {
    let msg = `Hi IndhuVadhana, I want to enquire about:\n\n`;
    msg += `*Product Name:* ${product.name}\n`;
    if (selectedColor) msg += `*Color:* ${selectedColor}\n`;
    if (selectedSize) msg += `*Size:* ${selectedSize}\n`;
    msg += `*Price:* ₹${product.price}\n`;
    msg += `*Link:* ${window.location.href}`;
    const url = `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleWishlistToggle = async () => {
    if (!customerInfo) {
      toast.error('Please login to update wishlist');
      navigate('/login');
      return;
    }
    try {
      await toggleWishlist(product._id);
      if (isWishlisted) toast.success('Removed from wishlist');
      else toast.success('Added to wishlist');
    } catch (err) {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in pb-28 md:pb-16">
      <SEO
        title={product.name}
        description={product.description.substring(0, 160)}
        image={imgList[0]?.url}
        type="product"
      />
      
      {/* Back link */}
      <div>
        <Link to="/products" className="inline-flex items-center space-x-2 text-sm font-semibold text-gray-500 hover:text-primary transition-colors">
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Collections</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Images Gallery with Thumbnail Strip */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[3/4] w-full bg-white border border-gray-150 rounded-3xl overflow-hidden shadow-sm relative flex items-center justify-center">
            <img
              src={getOptimizedImageUrl(imgList[activeImageIndex]?.url, 800)}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute top-4 left-4">
              <Badge status={stockStatus} />
            </div>
          </div>

          {/* Thumbnail Carousel */}
          {imgList.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {imgList.map((img, index) => (
                <button
                  key={img.publicId || index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative aspect-[3/4] w-20 border-2 rounded-2xl overflow-hidden flex-shrink-0 bg-white transition-all ${
                    activeImageIndex === index
                      ? 'border-primary ring-2 ring-cream shadow-sm scale-95'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img src={getOptimizedImageUrl(img.url, 150)} alt="Preview" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs bg-cream text-primary border border-biscuit font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                {product.category}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold font-display text-gray-900 mt-3 leading-tight">
                {product.name}
              </h1>
              <p className="text-2xl font-bold text-primary mt-2">
                ₹{product.price.toLocaleString('en-IN')}
              </p>
            </div>
            
            {/* Wishlist Toggle Button */}
            <button
              onClick={handleWishlistToggle}
              className="mt-2 w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-all transform active:scale-95"
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <FiHeart className={`w-6 h-6 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
            </button>
          </div>

          <hr className="border-gray-200" />

          {/* Details list */}
          <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-gray-200 text-sm shadow-sm">
            {product.material && (
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Fabric</p>
                <p className="font-bold text-gray-800 mt-0.5">{product.material}</p>
              </div>
            )}
            {product.occasion && (
              <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Best Wear</p>
                <p className="font-bold text-gray-800 mt-0.5">{product.occasion}</p>
              </div>
            )}
          </div>

          {/* Color list */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Select Color:
              </span>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-4 py-2 border rounded-xl text-xs font-semibold transition-all ${
                      selectedColor === c
                        ? 'border-primary bg-primary text-white shadow'
                        : 'border-gray-300 hover:border-gray-500 text-gray-700 bg-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size list */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Select Size:
              </span>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 border rounded-xl text-xs font-semibold transition-all ${
                      selectedSize === s
                        ? 'border-primary bg-primary text-white shadow'
                        : 'border-gray-300 hover:border-gray-500 text-gray-700 bg-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Product Description
            </span>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-white rounded-xl">
              {product.description}
            </p>
          </div>

          <hr className="border-gray-200" />

          {/* Desktop Actions */}
          <div className="hidden md:block space-y-4">
            {product.variants && product.variants.length > 0 && selectedColor && selectedSize && (
              <div className={`text-xs font-bold px-3 py-2 rounded-lg inline-block ${
                availableStock === 0 ? 'bg-red-50 text-red-600' :
                availableStock <= 5 ? 'bg-amber-50 text-amber-700' :
                'bg-green-50 text-green-700'
              }`}>
                {availableStock === 0 ? '❌ Out of Stock for this combination' :
                 availableStock <= 5 ? `⚠️ Only ${availableStock} left for ${selectedColor}/${selectedSize}` :
                 `✅ ${availableStock} units available`}
              </div>
            )}

            {availableStock > 0 && (
              <div className="flex items-center space-x-4 mb-4">
                <label htmlFor="qtySelect" className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Quantity:
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setOrderQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 hover:bg-gray-100 font-bold transition-colors"
                  >
                    -
                  </button>
                  <span id="qtySelect" className="px-4 py-1.5 text-sm font-bold text-gray-900 border-x">
                    {orderQuantity}
                  </span>
                  <button
                    onClick={() => setOrderQuantity((q) => Math.min(availableStock, q + 1))}
                    className="px-3 py-1.5 hover:bg-gray-100 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {availableStock > 0 ? (
              <div className="flex flex-col space-y-3">
                <div className="flex space-x-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 btn-primary flex items-center justify-center space-x-2.5 py-3.5 shadow-lg shadow-primary-500/20"
                  >
                    <FiShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
                <button
                  onClick={handleWhatsAppEnquiry}
                  className="w-full flex items-center justify-center space-x-2.5 py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', boxShadow: '0 4px 15px rgba(37,211,102,0.35)' }}
                >
                  <span>Enquire on WhatsApp</span>
                </button>
              </div>
            ) : (
              <button disabled className="w-full bg-red-100 border border-red-200 text-red-500 font-bold py-3.5 rounded-lg cursor-not-allowed text-center uppercase text-sm tracking-wider">
                Out Of Stock
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Buy/Cart Bar */}
      {availableStock > 0 ? (
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-cream border border-biscuit text-primary font-bold py-3.5 rounded-xl text-center text-sm shadow-sm active:scale-95 transition-transform flex items-center justify-center space-x-2"
          >
            <FiShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>
          <button
            onClick={handleWhatsAppEnquiry}
            className="flex-1 text-white font-bold py-3.5 rounded-xl text-center text-sm shadow-md active:scale-95 transition-transform flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }}
          >
            <span>Order on WhatsApp</span>
          </button>
        </div>
      ) : (
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
          <button disabled className="w-full bg-red-50 text-red-500 border border-red-100 font-bold py-3.5 rounded-xl text-center uppercase text-sm tracking-wider">
            Out Of Stock
          </button>
        </div>
      )}

      <ReviewSection product={product} setProduct={setProduct} />
    </div>
  );
};

export default ProductDetailPage;
