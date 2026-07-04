import React, { useEffect, useState } from 'react';
import { FiSave, FiAlertTriangle, FiSearch, FiChevronDown, FiChevronUp, FiPackage } from 'react-icons/fi';
import { getProducts, updateStock } from '../../services/productService';
import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';

const InventoryPage = () => {
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [localStocks, setLocalStocks] = useState({});
  const [variantStocks, setVariantStocks] = useState({});
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedProductId, setExpandedProductId] = useState(null);

  const fetchInventoryList = async () => {
    setLoading(true);
    try {
      const res = await getProducts({ limit: 100 });
      if (res.success) {
        setProducts(res.data.products);
        // Init overall stock map
        const stocksMap = {};
        const vStocksMap = {};
        res.data.products.forEach((p) => {
          stocksMap[p._id] = p.stock;
          // Init variant stocks map keyed by variantId
          if (p.variants && p.variants.length > 0) {
            p.variants.forEach((v) => {
              vStocksMap[v._id] = v.stock;
            });
          }
        });
        setLocalStocks(stocksMap);
        setVariantStocks(vStocksMap);
      }
    } catch (err) {
      console.error('Error fetching inventory items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventoryList(); }, []);

  const handleStockValueChange = (id, val) => {
    setLocalStocks({ ...localStocks, [id]: Math.max(0, parseInt(val) || 0) });
  };

  const handleVariantStockChange = (variantId, val) => {
    setVariantStocks({ ...variantStocks, [variantId]: Math.max(0, parseInt(val) || 0) });
  };

  const handleSaveStock = async (id) => {
    const qty = localStocks[id];
    setUpdatingId(id);
    try {
      const res = await updateStock(id, qty);
      if (res.success) {
        toast.success(`Stock updated to ${qty} items`);
        setProducts(products.map((p) => (p._id === id ? res.data : p)));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save stock update');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveVariantStock = async (productId, variantId, variantLabel) => {
    const qty = variantStocks[variantId];
    setUpdatingId(variantId);
    try {
      const res = await api.patch(
        `/products/${productId}/variants/${variantId}/stock`,
        { stock: qty }
      );
      if (res.data.success) {
        toast.success(`${variantLabel} stock updated to ${qty}`);
        setProducts(products.map((p) => (p._id === productId ? res.data.data : p)));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update variant stock');
    } finally {
      setUpdatingId(null);
    }
  };

  // Compute effective stock for display (variant-aware)
  const getEffectiveStock = (prod) => {
    if (prod.variants && prod.variants.length > 0) {
      return prod.variants.reduce((acc, v) => acc + v.stock, 0);
    }
    return prod.stock;
  };

  const getStockStatus = (prod) => {
    const s = getEffectiveStock(prod);
    if (s === 0) return 'Out of Stock';
    if (s <= 5) return 'Low Stock';
    return 'In Stock';
  };

  const filteredProducts = products.filter((prod) => {
    const searchClean = search.toLowerCase();
    const matchesSearch =
      prod.name.toLowerCase().includes(searchClean) ||
      prod.category.toLowerCase().includes(searchClean) ||
      (prod.material && prod.material.toLowerCase().includes(searchClean));
    if (!matchesSearch) return false;
    const effectiveStock = getEffectiveStock(prod);
    if (filterType === 'outOfStock') return effectiveStock === 0;
    if (filterType === 'lowStock') return effectiveStock > 0 && effectiveStock <= 5;
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display">Inventory Warehouse</h1>
        <p className="text-sm text-gray-500 mt-1">Manage product stock — including per-variant (Color/Size) SKU-level inventory</p>
      </div>

      {/* Controls row */}
      <div className="bg-white border p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search warehouse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 pr-4 py-2"
          />
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
        </div>

        <div className="flex bg-gray-100 p-1.5 rounded-xl border space-x-1 w-full sm:w-auto text-xs font-bold uppercase tracking-wider">
          {['all', 'lowStock', 'outOfStock'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-1.5 ${
                filterType === type
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {type !== 'all' && <FiAlertTriangle className="w-3.5 h-3.5" />}
              <span>{type === 'all' ? 'All Items' : type === 'lowStock' ? 'Low Stock' : 'Out of Stock'}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-2xl">
          <span className="text-4xl block mb-2">🏢</span>
          <p className="text-sm font-semibold text-gray-500">No products match current filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((prod) => {
            const defaultImage = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=200&q=80';
            const imageUrl = prod.images && prod.images.length > 0 ? prod.images[0].url : defaultImage;
            const hasVariants = prod.variants && prod.variants.length > 0;
            const effectiveStock = getEffectiveStock(prod);
            const stockStatus = getStockStatus(prod);
            const isExpanded = expandedProductId === prod._id;

            return (
              <div key={prod._id} className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                {/* Main product row */}
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4">
                  <img src={imageUrl} alt={prod.name} className="w-12 h-16 object-cover rounded-lg border bg-gray-50 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{prod.name}</p>
                    <p className="text-xs text-gray-400">{prod.category}</p>
                    {hasVariants && (
                      <p className="text-xs text-indigo-600 font-medium mt-0.5">
                        <FiPackage className="inline w-3 h-3 mr-1" />
                        {prod.variants.length} SKU Variants
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge status={stockStatus} />
                    <span className="text-sm font-bold text-gray-900 w-20 text-center">
                      {effectiveStock} {hasVariants ? 'total' : 'items'}
                    </span>

                    {/* Overall stock edit (only for non-variant products) */}
                    {!hasVariants && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          value={localStocks[prod._id] !== undefined ? localStocks[prod._id] : prod.stock}
                          onChange={(e) => handleStockValueChange(prod._id, e.target.value)}
                          disabled={updatingId === prod._id}
                          className="w-20 border border-gray-300 rounded-lg px-2.5 py-1.5 text-center text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveStock(prod._id)}
                          disabled={updatingId === prod._id || localStocks[prod._id] === prod.stock}
                          className="bg-indigo-950 hover:bg-primary-600 disabled:bg-gray-200 text-white disabled:text-gray-400 p-2 rounded-lg transition-all"
                          title="Save stock"
                        >
                          <FiSave className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Expand/Collapse for variants */}
                    {hasVariants && (
                      <button
                        onClick={() => setExpandedProductId(isExpanded ? null : prod._id)}
                        className="flex items-center space-x-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors"
                      >
                        <span>Edit Variants</span>
                        {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Variant rows */}
                {hasVariants && isExpanded && (
                  <div className="border-t bg-gray-50 p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">SKU-Level Variant Stock</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                            <th className="text-left pb-2">Color</th>
                            <th className="text-left pb-2">Size</th>
                            <th className="text-left pb-2">SKU</th>
                            <th className="text-left pb-2">Current Stock</th>
                            <th className="text-right pb-2">Update</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {prod.variants.map((variant) => {
                            const vLabel = `${variant.color || 'N/A'}/${variant.size || 'N/A'}`;
                            const currentVariantStock = variantStocks[variant._id] !== undefined ? variantStocks[variant._id] : variant.stock;
                            return (
                              <tr key={variant._id} className="hover:bg-white transition-colors">
                                <td className="py-2 pr-4">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                    {variant.color || '—'}
                                  </span>
                                </td>
                                <td className="py-2 pr-4">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                                    {variant.size || '—'}
                                  </span>
                                </td>
                                <td className="py-2 pr-4 font-mono text-xs text-gray-500">{variant.sku || '—'}</td>
                                <td className="py-2 pr-4">
                                  <span className={`font-bold ${variant.stock === 0 ? 'text-red-500' : variant.stock <= 5 ? 'text-amber-500' : 'text-green-600'}`}>
                                    {variant.stock} units
                                  </span>
                                </td>
                                <td className="py-2 text-right">
                                  <div className="inline-flex items-center space-x-2">
                                    <input
                                      type="number"
                                      min="0"
                                      value={currentVariantStock}
                                      onChange={(e) => handleVariantStockChange(variant._id, e.target.value)}
                                      disabled={updatingId === variant._id}
                                      className="w-20 border border-gray-300 rounded-lg px-2.5 py-1.5 text-center text-xs focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    />
                                    <button
                                      onClick={() => handleSaveVariantStock(prod._id, variant._id, vLabel)}
                                      disabled={updatingId === variant._id || currentVariantStock === variant.stock}
                                      className="bg-indigo-950 hover:bg-primary-600 disabled:bg-gray-200 text-white disabled:text-gray-400 p-2 rounded-lg transition-all"
                                      title="Save variant stock"
                                    >
                                      {updatingId === variant._id ? (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                                      ) : (
                                        <FiSave className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
