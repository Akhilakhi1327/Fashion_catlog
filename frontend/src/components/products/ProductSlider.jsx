import React, { useEffect, useRef } from 'react';
import ProductCard from './ProductCard';

const ProductSlider = ({ products, loading, limit = 8 }) => {
  const sliderRef = useRef(null);

  useEffect(() => {
    if (loading || !products || products.length === 0) return;

    const slider = sliderRef.current;
    if (!slider) return;

    let interval;
    const startAutoPlay = () => {
      interval = setInterval(() => {
        if (slider) {
          const maxScrollLeft = slider.scrollWidth - slider.clientWidth;
          if (Math.ceil(slider.scrollLeft) >= maxScrollLeft - 10) {
            // Reached end, smooth scroll back to start
            slider.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            // Scroll by width of one card + gap
            const firstChild = slider.children[0];
            const scrollAmount = firstChild ? firstChild.offsetWidth + 24 : 250;
            slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
          }
        }
      }, 2000); // slide every 2 seconds
    };

    startAutoPlay();

    const stopAutoPlay = () => clearInterval(interval);
    
    slider.addEventListener('mouseenter', stopAutoPlay);
    slider.addEventListener('mouseleave', startAutoPlay);
    slider.addEventListener('touchstart', stopAutoPlay, { passive: true });
    slider.addEventListener('touchend', startAutoPlay, { passive: true });

    return () => {
      clearInterval(interval);
      if (slider) {
        slider.removeEventListener('mouseenter', stopAutoPlay);
        slider.removeEventListener('mouseleave', startAutoPlay);
        slider.removeEventListener('touchstart', stopAutoPlay);
        slider.removeEventListener('touchend', startAutoPlay);
      }
    };
  }, [loading, products]);

  if (loading) {
    const skeletons = Array.from({ length: 4 });
    return (
      <div className="flex overflow-x-hidden gap-4 sm:gap-6 pb-4">
        {skeletons.map((_, index) => (
          <div key={index} className="flex-none w-[180px] sm:w-[250px] card border border-gray-100 flex flex-col h-full bg-white animate-pulse">
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
    return null;
  }

  return (
    <div className="relative group">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div 
        ref={sliderRef}
        className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 hide-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div key={product._id} className="flex-none w-[180px] sm:w-[250px] animate-fade-in">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      
      {/* Gradient overlays to indicate scrollability on desktop */}
      <div className="absolute top-0 right-0 bottom-6 w-12 bg-gradient-to-l from-white/90 to-transparent pointer-events-none opacity-0 md:group-hover:opacity-100 transition-opacity z-10" />
      <div className="absolute top-0 left-0 bottom-6 w-12 bg-gradient-to-r from-white/90 to-transparent pointer-events-none opacity-0 md:group-hover:opacity-100 transition-opacity z-10" />
    </div>
  );
};

export default ProductSlider;
