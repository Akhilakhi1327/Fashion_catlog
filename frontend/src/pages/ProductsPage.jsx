import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import FilterSidebar from '../components/products/FilterSidebar';
import SortBar from '../components/products/SortBar';
import ProductGrid from '../components/products/ProductGrid';
import Pagination from '../components/ui/Pagination';
import FlipkartFilterPanel from '../components/products/FlipkartFilterPanel';
import { getProducts } from '../services/productService';
import { FiX } from 'react-icons/fi';
import SEO from '../components/SEO';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State variables for products query
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Mobile Flipkart filter panel
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync state with URL params
  const category = searchParams.get('category') || '';
  const occasion = searchParams.get('occasion') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const color = searchParams.get('color') || '';
  const size = searchParams.get('size') || '';
  const material = searchParams.get('material') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page')) || 1;

  const currentFilters = { category, occasion, minPrice, maxPrice, color, size, material, search };

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const res = await getProducts({ category, occasion, minPrice, maxPrice, color, size, material, search, sort, page, limit: 12 });
        if (res.success) {
          setProducts(res.data.products);
          setTotalProducts(res.data.totalProducts);
          setCurrentPage(res.data.currentPage);
          setTotalPages(res.data.totalPages);
        }
      } catch (err) {
        console.error('Error fetching catalog products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, [category, occasion, minPrice, maxPrice, color, size, material, search, sort, page]);

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', '1');
    if (value) { newParams.set(key, value); } else { newParams.delete(key); }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => setSearchParams(new URLSearchParams());

  const handlePageChange = (pageNum) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(pageNum));
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (sortVal) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', sortVal);
    setSearchParams(newParams);
  };

  // Apply all filters from FlipkartFilterPanel at once
  const handleApplyMobileFilters = (draft) => {
    const newParams = new URLSearchParams();
    newParams.set('page', '1');
    if (draft.sort && draft.sort !== 'newest') newParams.set('sort', draft.sort);
    if (draft.category) newParams.set('category', draft.category);
    if (draft.occasion) newParams.set('occasion', draft.occasion);
    if (draft.minPrice) newParams.set('minPrice', draft.minPrice);
    if (draft.maxPrice) newParams.set('maxPrice', draft.maxPrice);
    if (draft.size) newParams.set('size', draft.size);
    if (draft.color) newParams.set('color', draft.color);
    if (draft.material) newParams.set('material', draft.material);
    if (search) newParams.set('search', search); // preserve search
    setSearchParams(newParams);
    setShowMobileFilters(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Active filter chips
  const activeChips = [];
  if (category) activeChips.push({ key: 'category', label: `Category: ${category}` });
  if (occasion) activeChips.push({ key: 'occasion', label: `Occasion: ${occasion}` });
  if (minPrice || maxPrice) {
    const minText = minPrice ? `₹${minPrice}` : '₹0';
    const maxText = maxPrice ? `₹${maxPrice}` : '∞';
    activeChips.push({ key: 'price', label: `Price: ${minText} – ${maxText}`, isPrice: true });
  }
  if (color) activeChips.push({ key: 'color', label: `Color: ${color}` });
  if (size) activeChips.push({ key: 'size', label: `Sizes: ${size}` });
  if (material) activeChips.push({ key: 'material', label: `Material: ${material}` });
  if (search) activeChips.push({ key: 'search', label: `"${search}"` });

  return (
    <div className="section-shell py-6 sm:py-8 space-y-5 animate-fade-in">
      <SEO
        title={category ? `${category} Collection` : 'All Collections'}
        description={`Browse our premium catalog of ${category || 'fashion items'} at IndhuVadhana.`}
      />

      <div className="premium-panel p-5 sm:p-6">
        <div className="inline-flex items-center rounded-full bg-[#f8efe3] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
          Premium Catalog
        </div>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-gray-900 font-display">
          {category ? `${category}` : 'All Collections'}
        </h1>
        <p className="mt-2 text-sm text-gray-500">{totalProducts} products found. Refined layout, same filters, same routes.</p>
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 py-1">
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/85 text-primary border border-[#ead9c5] shadow-sm"
            >
              <span>{chip.label}</span>
              <button
                onClick={() => {
                  if (chip.isPrice) {
                    const p = new URLSearchParams(searchParams);
                    p.delete('minPrice'); p.delete('maxPrice');
                    setSearchParams(p);
                  } else {
                    handleFilterChange(chip.key, '');
                  }
                }}
                className="hover:text-red-500"
              >
                <FiX className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button onClick={handleClearFilters} className="text-xs text-red-500 font-semibold underline ml-1">
            Clear All
          </button>
        </div>
      )}

      {/* Main grid + sidebar */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-72 flex-shrink-0">
          <FilterSidebar
            filters={currentFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Product panel */}
        <div className="flex-1 space-y-4">
          <SortBar
            sort={sort}
            onSortChange={handleSortChange}
            totalProducts={totalProducts}
            onOpenMobileFilters={() => setShowMobileFilters(true)}
          />
          <ProductGrid products={products} loading={loading} limit={12} />
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>

      {/* Mobile Flipkart-style full-screen filter panel */}
      {showMobileFilters && (
        <FlipkartFilterPanel
          filters={{ ...currentFilters, sort }}
          onApply={handleApplyMobileFilters}
          onClose={() => setShowMobileFilters(false)}
        />
      )}
    </div>
  );
};

export default ProductsPage;
