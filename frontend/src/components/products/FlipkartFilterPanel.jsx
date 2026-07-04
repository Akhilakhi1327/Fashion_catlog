import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';

/* ── Data ─────────────────────────────────────────── */
const PRICE_RANGES = [
  { label: 'Under ₹300', min: '', max: '300' },
  { label: '₹300 – ₹500', min: '300', max: '500' },
  { label: '₹500 – ₹800', min: '500', max: '800' },
  { label: '₹800 – ₹1500', min: '800', max: '1500' },
  { label: '₹1500 – ₹3000', min: '1500', max: '3000' },
  { label: 'Above ₹3000', min: '3000', max: '' },
];

const CATEGORIES = ['Sarees', 'Kurtis', 'Dresses', 'Lehengas', 'Suits', 'Tops', 'Bottoms', 'Accessories'];

const OCCASIONS = ['Casual', 'Formal', 'Party', 'Wedding', 'Festival', 'Daily Wear', 'Sports'];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

const COLORS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Gold', hex: '#d4af37' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Navy', hex: '#1e3a5f' },
  { name: 'White', hex: '#f8fafc' },
  { name: 'Cream', hex: '#fef9ef' },
  { name: 'Brown', hex: '#92400e' },
  { name: 'Black', hex: '#111827' },
  { name: 'Grey', hex: '#6b7280' },
];

const MATERIALS = [
  'Pure Silk', 'Banarasi Silk', 'Cotton', 'Georgette',
  'Chiffon', 'Linen', 'Velvet', 'Net', 'Rayon', 'Polyester',
  'Organza', 'Chanderi', 'Crepe', 'Satin', 'Tussar Silk',
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Most Popular', value: 'popular' },
  { label: 'Top Rated', value: 'rating' },
];

const FILTER_TABS = [
  { key: 'sort', label: 'Sort' },
  { key: 'category', label: 'Category' },
  { key: 'occasion', label: 'Occasion' },
  { key: 'price', label: 'Price' },
  { key: 'size', label: 'Size' },
  { key: 'color', label: 'Color' },
  { key: 'material', label: 'Material' },
];

/* ── Component ────────────────────────────────────── */
const FlipkartFilterPanel = ({ filters, onApply, onClose }) => {
  const [activeTab, setActiveTab] = useState('sort');

  // Local draft state — only apply on "Apply Filters" click
  const [draft, setDraft] = useState({
    sort: filters.sort || 'newest',
    category: filters.category || '',
    occasion: filters.occasion || '',
    minPrice: filters.minPrice || '',
    maxPrice: filters.maxPrice || '',
    size: filters.size ? filters.size.split(',') : [],
    color: filters.color || '',
    material: filters.material || '',
  });

  const toggleSize = (s) => {
    setDraft(prev => {
      const arr = prev.size.includes(s) ? prev.size.filter(x => x !== s) : [...prev.size, s];
      return { ...prev, size: arr };
    });
  };

  const setPriceRange = (range) => {
    setDraft(prev => ({
      ...prev,
      minPrice: range.min,
      maxPrice: range.max,
    }));
  };

  const activePriceLabel = PRICE_RANGES.find(r => r.min === draft.minPrice && r.max === draft.maxPrice)?.label;

  const handleApply = () => {
    onApply({
      ...draft,
      size: draft.size.join(','),
    });
  };

  const handleClearAll = () => {
    setDraft({ sort: 'newest', category: '', occasion: '', minPrice: '', maxPrice: '', size: [], color: '', material: '' });
  };

  /* ── Right panel content based on activeTab ── */
  const renderRightPanel = () => {
    switch (activeTab) {
      case 'sort':
        return (
          <div className="space-y-0 divide-y divide-gray-100">
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setDraft(p => ({ ...p, sort: opt.value }))}
                className={`w-full flex items-center justify-between px-5 py-3.5 text-sm transition-colors ${
                  draft.sort === opt.value
                    ? 'bg-blue-50 text-primary font-bold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{opt.label}</span>
                {draft.sort === opt.value && <FiCheck className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        );

      case 'category':
        return (
          <div className="space-y-0 divide-y divide-gray-100">
            <button
              onClick={() => setDraft(p => ({ ...p, category: '' }))}
              className={`w-full flex items-center justify-between px-5 py-3.5 text-sm transition-colors ${
                !draft.category ? 'bg-blue-50 text-primary font-bold' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>All Categories</span>
              {!draft.category && <FiCheck className="w-4 h-4 text-primary" />}
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setDraft(p => ({ ...p, category: cat }))}
                className={`w-full flex items-center justify-between px-5 py-3.5 text-sm transition-colors ${
                  draft.category === cat ? 'bg-blue-50 text-primary font-bold' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{cat}</span>
                {draft.category === cat && <FiCheck className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        );

      case 'occasion':
        return (
          <div className="divide-y divide-gray-100">
            <button
              onClick={() => setDraft(p => ({ ...p, occasion: '' }))}
              className={`w-full flex items-center justify-between px-5 py-3.5 text-sm transition-colors ${
                !draft.occasion ? 'bg-blue-50 text-primary font-bold' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>All Occasions</span>
              {!draft.occasion && <FiCheck className="w-4 h-4 text-primary" />}
            </button>
            {OCCASIONS.map(occ => (
              <button
                key={occ}
                onClick={() => setDraft(p => ({ ...p, occasion: occ }))}
                className={`w-full flex items-center justify-between px-5 py-3.5 text-sm transition-colors ${
                  draft.occasion === occ ? 'bg-blue-50 text-primary font-bold' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{occ}</span>
                {draft.occasion === occ && <FiCheck className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        );

      case 'price':
        return (
          <div className="divide-y divide-gray-100">
            <button
              onClick={() => setDraft(p => ({ ...p, minPrice: '', maxPrice: '' }))}
              className={`w-full flex items-center justify-between px-5 py-3.5 text-sm transition-colors ${
                !draft.minPrice && !draft.maxPrice ? 'bg-blue-50 text-primary font-bold' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>Any Price</span>
              {!draft.minPrice && !draft.maxPrice && <FiCheck className="w-4 h-4 text-primary" />}
            </button>
            {PRICE_RANGES.map(range => {
              const isActive = draft.minPrice === range.min && draft.maxPrice === range.max;
              return (
                <button
                  key={range.label}
                  onClick={() => setPriceRange(range)}
                  className={`w-full flex items-center justify-between px-5 py-3.5 text-sm transition-colors ${
                    isActive ? 'bg-blue-50 text-primary font-bold' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{range.label}</span>
                  {isActive && <FiCheck className="w-4 h-4 text-primary" />}
                </button>
              );
            })}
          </div>
        );

      case 'size':
        return (
          <div className="px-5 pt-4 pb-2 flex flex-wrap gap-3">
            {SIZES.map(s => {
              const isActive = draft.size.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSize(s)}
                  className={`min-w-[50px] px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                    isActive
                      ? 'border-primary bg-cream text-primary'
                      : 'border-gray-300 text-gray-700 hover:border-primary'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        );

      case 'color':
        return (
          <div className="px-5 pt-4 pb-2">
            <div className="grid grid-cols-3 gap-3">
              {COLORS.map(col => {
                const isActive = draft.color === col.name;
                return (
                  <button
                    key={col.name}
                    onClick={() => setDraft(p => ({ ...p, color: isActive ? '' : col.name }))}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${
                      isActive ? 'border-primary bg-cream' : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <span
                      className={`w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center ${
                        isActive ? 'ring-2 ring-offset-1 ring-primary' : ''
                      }`}
                      style={{ backgroundColor: col.hex }}
                    >
                      {isActive && <FiCheck className="w-4 h-4 text-white drop-shadow" />}
                    </span>
                    <span className="text-[10px] font-semibold text-gray-700 truncate w-full text-center">{col.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'material':
        return (
          <div className="px-5 pt-4 pb-2 flex flex-wrap gap-2">
            {MATERIALS.map(mat => {
              const isActive = draft.material === mat;
              return (
                <button
                  key={mat}
                  onClick={() => setDraft(p => ({ ...p, material: isActive ? '' : mat }))}
                  className={`px-3 py-1.5 rounded-full border-2 text-xs font-semibold transition-all ${
                    isActive
                      ? 'border-primary bg-cream text-primary'
                      : 'border-gray-300 text-gray-700 hover:border-primary'
                  }`}
                >
                  {mat}
                </button>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0">
        <button onClick={onClose} className="flex items-center gap-2 text-gray-700">
          <FiArrowLeft className="w-5 h-5" />
          <span className="text-base font-bold">Filters</span>
        </button>
        <button onClick={handleClearAll} className="text-sm font-bold text-primary">
          Clear All Filters
        </button>
      </div>

      {/* Two-column body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Tab list */}
        <div className="w-28 flex-shrink-0 bg-gray-50 border-r border-gray-200 overflow-y-auto">
          {FILTER_TABS.map(tab => {
            const isActive = activeTab === tab.key;
            // Dot indicator if this tab has a selection
            const hasDot =
              (tab.key === 'sort' && draft.sort !== 'newest') ||
              (tab.key === 'category' && draft.category) ||
              (tab.key === 'occasion' && draft.occasion) ||
              (tab.key === 'price' && (draft.minPrice || draft.maxPrice)) ||
              (tab.key === 'size' && draft.size.length > 0) ||
              (tab.key === 'color' && draft.color) ||
              (tab.key === 'material' && draft.material);

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full text-left px-4 py-4 text-xs font-semibold border-l-4 transition-colors flex items-center justify-between ${
                  isActive
                    ? 'border-primary text-primary bg-white'
                    : 'border-transparent text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{tab.label}</span>
                {hasDot && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Options panel */}
        <div className="flex-1 overflow-y-auto bg-white">
          {renderRightPanel()}
        </div>
      </div>

      {/* Apply Button */}
      <div className="px-4 py-3 border-t border-gray-200 bg-white flex-shrink-0">
        <button
          onClick={handleApply}
          className="w-full bg-primary text-white font-bold py-3.5 rounded-xl text-base shadow-md active:scale-95 transition-transform"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FlipkartFilterPanel;
