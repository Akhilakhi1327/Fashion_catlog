import React from 'react';
import { FiX, FiRefreshCw } from 'react-icons/fi';

const PRESET_COLORS = [
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

const PRESET_MATERIALS = [
  'Pure Silk', 'Banarasi Silk', 'Cotton', 'Georgette',
  'Chiffon', 'Linen', 'Velvet', 'Net', 'Rayon', 'Polyester',
  'Organza', 'Chanderi', 'Crepe', 'Satin', 'Tussar Silk',
];

const FilterSidebar = ({ filters, onFilterChange, onClearFilters, onCloseMobile }) => {
  const categories = [
    'Sarees',
    'Kurtis',
    'Dresses',
    'Lehengas',
    'Suits',
    'Tops',
    'Bottoms',
    'Accessories',
    'Others',
  ];

  const occasions = [
    'Casual',
    'Formal',
    'Party',
    'Wedding',
    'Festival',
    'Daily Wear',
    'Sports',
    'Others',
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

  const handleCheckboxChange = (size) => {
    const currentSizes = filters.size ? filters.size.split(',') : [];
    let updatedSizes;

    if (currentSizes.includes(size)) {
      updatedSizes = currentSizes.filter((s) => s !== size);
    } else {
      updatedSizes = [...currentSizes, size];
    }

    onFilterChange('size', updatedSizes.join(','));
  };

  return (
    <div className="premium-panel p-6 space-y-6 h-fit">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/70">
        <h3 className="text-lg font-bold text-gray-900 font-display">Filters</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 text-xs text-primary hover:text-primary/80 font-semibold transition-all focus:outline-none"
            aria-label="Clear All Filters"
          >
            <FiRefreshCw className="w-3 h-3" />
            <span>Clear All</span>
          </button>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden text-gray-500 hover:text-gray-700"
              aria-label="Close Filters Panel"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-800 tracking-wide uppercase">Category</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          <label className="flex items-center space-x-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={!filters.category}
              onChange={() => onFilterChange('category', '')}
              className="text-primary-600 focus:ring-primary-500 w-4 h-4 border-gray-300"
            />
            <span>All Categories</span>
          </label>
          {categories.map((cat) => (
            <label
              key={cat}
              className="flex items-center space-x-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 cursor-pointer"
            >
              <input
                type="radio"
                name="category"
                checked={filters.category === cat}
                onChange={() => onFilterChange('category', cat)}
                className="text-primary-600 focus:ring-primary-500 w-4 h-4 border-gray-300"
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-800 tracking-wide uppercase">Price Range (₹)</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="sr-only" htmlFor="minPrice">Min Price</label>
            <input
              id="minPrice"
              type="number"
              placeholder="Min"
              value={filters.minPrice || ''}
              onChange={(e) => onFilterChange('minPrice', e.target.value)}
              className="w-full text-xs border border-[#e7d7c6] rounded-2xl px-3 py-2.5 focus:ring-2 focus:ring-biscuit focus:outline-none bg-white/95"
            />
          </div>
          <div>
            <label className="sr-only" htmlFor="maxPrice">Max Price</label>
            <input
              id="maxPrice"
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ''}
              onChange={(e) => onFilterChange('maxPrice', e.target.value)}
              className="w-full text-xs border border-[#e7d7c6] rounded-2xl px-3 py-2.5 focus:ring-2 focus:ring-biscuit focus:outline-none bg-white/95"
            />
          </div>
        </div>
      </div>

      {/* Occasion Filter */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-800 tracking-wide uppercase">Occasion</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          <label className="flex items-center space-x-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 cursor-pointer">
            <input
              type="radio"
              name="occasion"
              checked={!filters.occasion}
              onChange={() => onFilterChange('occasion', '')}
              className="text-primary-600 focus:ring-primary-500 w-4 h-4 border-gray-300"
            />
            <span>All Occasions</span>
          </label>
          {occasions.map((occ) => (
            <label
              key={occ}
              className="flex items-center space-x-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 cursor-pointer"
            >
              <input
                type="radio"
                name="occasion"
                checked={filters.occasion === occ}
                onChange={() => onFilterChange('occasion', occ)}
                className="text-primary-600 focus:ring-primary-500 w-4 h-4 border-gray-300"
              />
              <span>{occ}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Size Filter */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-800 tracking-wide uppercase">Sizes</h4>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const isChecked = (filters.size ? filters.size.split(',') : []).includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() => handleCheckboxChange(size)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${isChecked
                    ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Filter — Color Swatches */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-800 tracking-wide uppercase">Color</h4>
        <div className="flex flex-wrap gap-2.5">
          {PRESET_COLORS.map((col) => (
            <button
              key={col.name}
              type="button"
              onClick={() => onFilterChange('color', filters.color === col.name ? '' : col.name)}
              title={col.name}
              className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${filters.color === col.name
                  ? 'border-indigo-950 ring-2 ring-offset-1 ring-indigo-950 scale-110'
                  : 'border-gray-300 hover:border-gray-500'
                }`}
              style={{ backgroundColor: col.hex }}
              aria-label={col.name}
            >
              {filters.color === col.name && (
                <span className="flex items-center justify-center w-full h-full text-white text-[10px] font-bold drop-shadow">✓</span>
              )}
            </button>
          ))}
        </div>
        {filters.color && (
          <p className="text-xs text-primary-600 font-semibold">Selected: {filters.color}</p>
        )}
      </div>

      {/* Material Filter — Chip Buttons */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold text-gray-800 tracking-wide uppercase">Material</h4>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_MATERIALS.map((mat) => (
            <button
              key={mat}
              type="button"
              onClick={() => onFilterChange('material', filters.material === mat ? '' : mat)}
              className={`px-2.5 py-1 rounded-full border text-xs font-semibold transition-all ${filters.material === mat
                  ? 'bg-indigo-950 text-white border-indigo-950'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:text-indigo-700'
                }`}
            >
              {mat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
