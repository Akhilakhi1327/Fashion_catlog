import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiClock, FiStar, FiHeart, FiShoppingBag } from 'react-icons/fi';
import ProductGrid from '../components/products/ProductGrid';
import ProductSlider from '../components/products/ProductSlider';
import { getProducts } from '../services/productService';
import SEO from '../components/SEO';

const HomePage = () => {
  const [latestProducts, setLatestProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  // Hero carousel state
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  const categories = [
    { name: 'Sarees', icon: '🥻', banner: 'bg-rose-50 border-rose-100 text-rose-800' },
    { name: 'Kurtis', icon: '👘', banner: 'bg-amber-50 border-amber-100 text-amber-800' },
    { name: 'Dresses', icon: '👗', banner: 'bg-emerald-50 border-emerald-100 text-emerald-800' },
    { name: 'Lehengas', icon: '✨', banner: 'bg-indigo-50 border-indigo-100 text-indigo-800' },
    { name: 'Suits', icon: '🧥', banner: 'bg-purple-50 border-purple-100 text-purple-800' },
    { name: 'Accessories', icon: '💎', banner: 'bg-pink-50 border-pink-100 text-pink-800' },
    { name: 'Tops', icon: '👚', banner: 'bg-teal-50 border-teal-100 text-teal-800' },
    { name: 'Bottoms', icon: '👖', banner: 'bg-sky-50 border-sky-100 text-sky-800' },
  ];

  // Daily countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 }; // reset daily
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hero carousel effect
  useEffect(() => {
    if (latestProducts.length > 0) {
      const interval = setInterval(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % Math.min(latestProducts.length, 5));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [latestProducts]);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const refreshKey = Date.now();
        const res = await getProducts({ limit: 12, sort: 'newest', refreshKey });
        if (res.success) {
          setLatestProducts(res.data.products || []);
        }
      } catch (err) {
        console.error('Error fetching latest products:', err);
      } finally {
        setLoadingLatest(false);
      }
    };

    const fetchFeatured = async () => {
      try {
        const res = await getProducts({ limit: 8, featured: 'true' });
        if (res.success) {
          setFeaturedProducts(res.data.products || []);
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoadingFeatured(false);
      }
    };

    fetchLatest();
    fetchFeatured();
  }, []);

  const formatTime = (t) => String(t).padStart(2, '0');

  const trendingGridProducts = featuredProducts.length > 0 ? featuredProducts : latestProducts.slice(0, 4);
  const heroProducts = latestProducts.length > 0 ? latestProducts.slice(0, 5) : [{}]; // fallback empty object for placeholder

  return (
    <div className="space-y-10 pb-24 md:pb-16 animate-fade-in">
      <SEO
        title="Home"
        description="Discover House Of Induva's curated range of Sarees, Kurtis, designer Dresses and accessories. Uncompromised fabric quality."
      />

      <section className="relative overflow-hidden pt-4 sm:pt-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(184,137,95,0.16),_transparent_30%)]" />

        <div className="section-shell space-y-8">
          <div className="grid gap-6 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-7 premium-panel relative overflow-hidden p-6 sm:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(184,137,95,0.18),_transparent_28%),linear-gradient(135deg,_rgba(255,255,255,0.95),_rgba(249,240,231,0.8))]" />
              <div className="relative max-w-2xl space-y-6">
                <span className="premium-chip w-fit">Premium Collections 2026</span>
                <div className="space-y-4">
                  <p className="text-sm font-medium uppercase tracking-[0.32em] text-gray-500">House Of Induva</p>
                  <h1 className="max-w-xl text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.92] text-gray-900">
                    Elegance Designed for You
                  </h1>
                  <p className="max-w-xl text-base sm:text-lg leading-relaxed text-gray-600">
                    Explore sarees, kurtis, dresses and festive essentials in a rich, curated storefront built to feel premium on mobile and desktop.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/products" className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm shadow-lg shadow-primary/15">
                    <span>Shop Now</span>
                    <FiArrowRight />
                  </Link>
                  <Link to="/products?category=Sarees" className="inline-flex items-center justify-center rounded-full border border-[#e7d7c6] bg-white/80 px-7 py-3.5 text-sm font-bold text-primary shadow-sm hover:border-biscuit transition-colors">
                    Saree Edit
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-2 max-w-lg">
                  {[
                    { label: 'Products', value: `${latestProducts.length}+` },
                    { label: 'Collections', value: '10+' },
                    { label: 'Support', value: '24/7' },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-2xl bg-white/70 px-4 py-3 shadow-sm border border-white/70">
                      <p className="text-2xl font-bold text-primary">{stat.value}</p>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 grid gap-4">
              <div className="premium-panel overflow-hidden">
                <div className="relative aspect-[4/5] overflow-hidden">
                  {heroProducts.map((product, index) => (
                    <div 
                      key={product._id || index}
                      className={`absolute inset-0 transition-opacity duration-1000 ${
                        index === currentHeroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                      }`}
                    >
                      <img 
                        src={product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80'} 
                        alt={product.name || "Featured collection"} 
                        className="h-full w-full object-cover object-center" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-6 left-4 right-4 flex items-end justify-between gap-4 text-white">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-white/80">{product.name ? 'New Arrival' : 'Featured Look'}</p>
                          <p className="font-display text-2xl sm:text-3xl font-bold leading-tight line-clamp-2 mt-1">{product.name || 'Timeless glamour'}</p>
                        </div>
                        <Link to={product._id ? `/products/${product._id}` : '/products'} className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-primary shadow-md flex-shrink-0">
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                  
                  {/* Dots indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                    {heroProducts.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentHeroIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50 cursor-pointer'}`}
                        onClick={() => setCurrentHeroIndex(idx)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {categories.slice(0, 4).map((cat) => (
                  <Link
                    key={cat.name}
                    to={`/products?category=${cat.name}`}
                    className={`rounded-[1.5rem] border p-4 sm:p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${cat.banner}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-3xl">{cat.icon}</span>
                      <span className="text-xs font-bold uppercase tracking-[0.18em]">Browse</span>
                    </div>
                    <p className="mt-5 text-lg font-bold font-display">{cat.name}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <section className="premium-panel p-5 sm:p-6 overflow-hidden">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="section-title flex items-center gap-2">New Arrivals</h2>
                <p className="section-subtitle">Freshly added products, just for you.</p>
              </div>
              <Link to="/products" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                View All →
              </Link>
            </div>

            <ProductSlider products={latestProducts} loading={loadingLatest} limit={12} />
          </section>

          <section className="grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-7 premium-panel p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <span className="text-4xl">🔥</span>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Trending Now</p>
                  <h3 className="text-2xl font-bold text-gray-900">Featured picks</h3>
                  <p className="text-sm text-gray-500 mt-1">Items marked featured by admin show here first.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-bold text-red-600">
                <FiClock className="w-4 h-4 animate-pulse" />
                <span>{formatTime(timeLeft.hours)}h : {formatTime(timeLeft.minutes)}m : {formatTime(timeLeft.seconds)}s</span>
              </div>
            </div>

            <Link
              to="/products?occasion=Wedding"
              className="lg:col-span-5 premium-panel relative overflow-hidden p-6 sm:p-8 text-white"
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(75,44,36,0.96),_rgba(184,137,95,0.88))]" />
              <div className="relative space-y-4">
                <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em]">
                  Bridal Edit
                </span>
                <h3 className="text-3xl font-bold leading-tight">Wedding & festive essentials</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  Explore exquisite designer sarees and premium lehengas customized for celebration seasons.
                </p>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-primary shadow-lg">
                  Explore Bridal Range
                  <FiArrowRight />
                </span>
              </div>
            </Link>
          </section>

          <section className="premium-panel p-5 sm:p-6 overflow-hidden">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="section-title">Featured Picks</h2>
                <p className="section-subtitle">Top collections selected by our style experts.</p>
              </div>
              <Link to="/products" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                View All →
              </Link>
            </div>

            <ProductGrid products={trendingGridProducts} loading={loadingFeatured || loadingLatest} limit={4} />
          </section>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
