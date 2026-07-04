import React from 'react';
import { FiSliders } from 'react-icons/fi';

const SortBar = ({ sort, onSortChange, totalProducts, onOpenMobileFilters }) => {
  return (
    <div className="premium-panel px-5 sm:px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Total count display */}
      <div>
        <p className="text-sm text-gray-500 font-medium">
          Showing <span className="text-gray-900 font-bold">{totalProducts}</span>{' '}
          {totalProducts === 1 ? 'product' : 'products'}
        </p>
      </div>

      {/* Sorting options & Mobile Filter trigger */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile Filter Toggle */}
        <button
          onClick={onOpenMobileFilters}
          className="md:hidden flex items-center space-x-1.5 border border-[#e7d7c6] hover:bg-[#faf2e8] text-gray-700 px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all focus:outline-none bg-white"
          aria-label="Open Mobile Filters"
        >
          <FiSliders className="w-4 h-4" />
          <span>Filters</span>
        </button>

        {/* Sort Select */}
        <div className="flex items-center space-x-2">
          <label htmlFor="sort" className="hidden sm:inline text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Sort By:
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="border border-[#e7d7c6] rounded-full px-4 py-2.5 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-biscuit bg-white shadow-sm"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SortBar;
