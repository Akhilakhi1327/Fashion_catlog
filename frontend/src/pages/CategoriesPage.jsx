import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { FiChevronRight, FiSliders } from 'react-icons/fi';

const CATEGORIES = [
  { name: 'Sarees', icon: '🥻', desc: 'Silk, Cotton, Georgette & more', color: 'bg-rose-50 border-rose-200' },
  { name: 'Kurtis', icon: '👘', desc: 'Casual, Festive & Work wear', color: 'bg-amber-50 border-amber-200' },
  { name: 'Dresses', icon: '👗', desc: 'Designer & party dresses', color: 'bg-emerald-50 border-emerald-200' },
  { name: 'Lehengas', icon: '✨', desc: 'Bridal & festive lehengas', color: 'bg-indigo-50 border-indigo-200' },
  { name: 'Suits', icon: '🧥', desc: 'Salwar suits & dress material', color: 'bg-purple-50 border-purple-200' },
  { name: 'Tops', icon: '👚', desc: 'Casual & western tops', color: 'bg-teal-50 border-teal-200' },
  { name: 'Bottoms', icon: '👖', desc: 'Pants, palazzos & more', color: 'bg-sky-50 border-sky-200' },
  { name: 'Accessories', icon: '💎', desc: 'Jewelry, bags & more', color: 'bg-pink-50 border-pink-200' },
];

const OCCASIONS = [
  { name: 'Wedding', icon: '💒', color: 'bg-rose-50 border-rose-200' },
  { name: 'Festival', icon: '🎊', color: 'bg-amber-50 border-amber-200' },
  { name: 'Party', icon: '🎉', color: 'bg-purple-50 border-purple-200' },
  { name: 'Casual', icon: '☀️', color: 'bg-sky-50 border-sky-200' },
  { name: 'Formal', icon: '💼', color: 'bg-gray-50 border-gray-200' },
  { name: 'Daily Wear', icon: '🏡', color: 'bg-emerald-50 border-emerald-200' },
];

const CategoriesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
      <SEO title="Categories" description="Browse all fashion categories at IndhuVadhana" />

      {/* Header */}
      <div className="bg-primary px-4 pt-10 pb-6">
        <h1 className="text-white text-2xl font-bold font-display">Shop by Category</h1>
        <p className="text-cream/80 text-sm mt-1">Choose a category to explore</p>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Explore with Filters CTA */}
        <Link
          to="/products"
          className="flex items-center justify-between bg-white border-2 border-primary rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="bg-cream text-primary p-2.5 rounded-xl">
              <FiSliders className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-gray-800">Browse with Filters</p>
              <p className="text-xs text-gray-500">Filter by price, color, material & more</p>
            </div>
          </div>
          <FiChevronRight className="w-5 h-5 text-primary" />
        </Link>

        {/* Categories Grid */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1 mb-3">Categories</h2>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={`/products?category=${cat.name}`}
                className={`${cat.color} border-2 rounded-2xl p-4 flex flex-col items-center text-center gap-2 hover:shadow-md transition-all active:scale-95`}
              >
                <span className="text-4xl">{cat.icon}</span>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{cat.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Shop by Occasion */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1 mb-3">Shop by Occasion</h2>
          <div className="grid grid-cols-3 gap-3">
            {OCCASIONS.map((occ) => (
              <Link
                key={occ.name}
                to={`/products?occasion=${occ.name}`}
                className={`${occ.color} border-2 rounded-2xl p-3 flex flex-col items-center text-center gap-1.5 hover:shadow-md transition-all active:scale-95`}
              >
                <span className="text-3xl">{occ.icon}</span>
                <p className="font-bold text-gray-700 text-xs">{occ.name}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* All Products Link */}
        <Link
          to="/products"
          className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛍️</span>
            <div>
              <p className="font-bold text-gray-800">All Products</p>
              <p className="text-xs text-gray-500">Browse the entire catalog</p>
            </div>
          </div>
          <FiChevronRight className="w-5 h-5 text-gray-400" />
        </Link>
      </div>
    </div>
  );
};

export default CategoriesPage;
