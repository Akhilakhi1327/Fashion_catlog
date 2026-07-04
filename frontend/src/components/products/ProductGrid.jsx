import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, loading, limit = 12 }) => {
  if (loading) {
    const skeletons = Array.from({ length: limit });
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {skeletons.map((_, index) => (
          <div key={index} className="card border border-gray-100 flex flex-col h-full bg-white animate-pulse">
            <div className="aspect-[3/4] w-full bg-gray-200 skeleton" />
            <div className="p-5 flex-grow space-y-3">
              <div className="h-3 bg-gray-200 rounded w-1/3 skeleton" />
              <div className="h-5 bg-gray-200 rounded w-3/4 skeleton" />
              <div className="h-6 bg-gray-200 rounded w-1/4 skeleton" />
              <div className="h-10 bg-gray-200 rounded w-full skeleton mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-2xl shadow-sm border border-gray-100">
        <span className="text-5xl block mb-4">🔍</span>
        <h3 className="text-lg font-bold text-gray-900 font-display">No Products Found</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
          We couldn't find any products matching your filters. Try clearing some options or searching for something else.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <div key={product._id} className="animate-fade-in">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
