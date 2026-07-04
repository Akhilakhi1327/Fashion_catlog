import React, { useState, useEffect } from 'react';
import { FiUpload, FiX, FiPlus } from 'react-icons/fi';

// Preset colors with hex codes for visual swatches
const PRESET_COLORS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Pink', hex: '#ec4899' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Gold', hex: '#d4af37' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Teal', hex: '#14b8a6' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Navy', hex: '#1e3a5f' },
  { name: 'White', hex: '#f8fafc' },
  { name: 'Cream', hex: '#fef9ef' },
  { name: 'Beige', hex: '#f5f0e8' },
  { name: 'Brown', hex: '#92400e' },
  { name: 'Grey', hex: '#6b7280' },
  { name: 'Black', hex: '#111827' },
  { name: 'Silver', hex: '#c0c0c0' },
];

// Preset materials as selectable chips
const PRESET_MATERIALS = [
  'Pure Silk', 'Banarasi Silk', 'Kanchipuram Silk', 'Raw Silk',
  'Pure Cotton', 'Cotton Blend', 'Handloom Cotton',
  'Georgette', 'Chiffon', 'Crepe',
  'Linen', 'Velvet', 'Net',
  'Rayon', 'Polyester', 'Satin',
  'Organza', 'Tissue', 'Chanderi',
  'Tussar Silk', 'Art Silk', 'Modal',
];

const ProductForm = ({ initialData, onSubmit, loading, isEdit = false }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Sarees');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('');
  const [material, setMaterial] = useState('');
  const [occasion, setOccasion] = useState('Others');
  const [featured, setFeatured] = useState(false);

  // Colors state — selected from swatches or custom typed
  const [colors, setColors] = useState([]);
  const [customColorInput, setCustomColorInput] = useState('');

  // Sizes state
  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
  const [sizes, setSizes] = useState([]);

  // Variants (SKU-level) state
  const [variants, setVariants] = useState([]);
  const [useVariants, setUseVariants] = useState(false);

  // Images state
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removeImages, setRemoveImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const categories = ['Sarees', 'Kurtis', 'Dresses', 'Lehengas', 'Suits', 'Tops', 'Bottoms', 'Accessories', 'Others'];
  const occasions = ['Casual', 'Formal', 'Party', 'Wedding', 'Festival', 'Daily Wear', 'Sports', 'Others'];

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCategory(initialData.category || 'Sarees');
      setPrice(initialData.price || '');
      setDescription(initialData.description || '');
      setStock(initialData.stock || '');
      setMaterial(initialData.material || '');
      setOccasion(initialData.occasion || 'Others');
      setFeatured(!!initialData.featured);
      setColors(initialData.colors || []);
      setSizes(initialData.sizes || []);
      setExistingImages(initialData.images || []);
      if (initialData.variants && initialData.variants.length > 0) {
        setVariants(initialData.variants);
        setUseVariants(true);
      }
    }
  }, [initialData]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  // ── Color Handlers ──
  const togglePresetColor = (colorName) => {
    if (colors.includes(colorName)) {
      setColors(colors.filter((c) => c !== colorName));
    } else {
      setColors([...colors, colorName]);
    }
  };

  const addCustomColor = (e) => {
    e.preventDefault();
    const clean = customColorInput.trim();
    if (clean && !colors.includes(clean)) {
      setColors([...colors, clean]);
      setCustomColorInput('');
    }
  };

  const removeColor = (col) => setColors(colors.filter((c) => c !== col));

  // ── Size Handlers ──
  const toggleSize = (sz) => {
    if (sizes.includes(sz)) {
      setSizes(sizes.filter((s) => s !== sz));
    } else {
      setSizes([...sizes, sz]);
    }
  };

  // ── Variants: auto-generate rows when colors/sizes change ──
  const generateVariants = () => {
    if (colors.length === 0 || sizes.length === 0) return;
    const newVariants = [];
    colors.forEach((color) => {
      sizes.forEach((size) => {
        // Preserve existing stock for this combo
        const existing = variants.find((v) => v.color === color && v.size === size);
        newVariants.push({
          color,
          size,
          sku: `${color.slice(0, 3).toUpperCase()}-${size}`,
          stock: existing ? existing.stock : 0,
        });
      });
    });
    setVariants(newVariants);
  };

  useEffect(() => {
    if (useVariants && colors.length > 0 && sizes.length > 0) {
      setVariants((prev) => {
        const newVariants = [];
        colors.forEach((color) => {
          sizes.forEach((size) => {
            const existing = prev.find((v) => v.color === color && v.size === size);
            newVariants.push({
              color,
              size,
              sku: `${color.slice(0, 3).toUpperCase()}-${size}`,
              stock: existing ? existing.stock : 0,
            });
          });
        });
        return newVariants;
      });
    }
  }, [colors, sizes, useVariants]);

  const updateVariantStock = (index, value) => {
    const updated = [...variants];
    updated[index].stock = Math.max(0, parseInt(value) || 0);
    setVariants(updated);
  };

  // ── Material Handlers ──
  const selectMaterial = (mat) => {
    setMaterial(mat === material ? '' : mat); // toggle off if same
  };

  // ── Image Handlers ──
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles([...imageFiles, ...files]);
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...previews]);
    }
  };

  const handleRemoveNewImage = (index) => {
    const updated = [...imageFiles];
    updated.splice(index, 1);
    setImageFiles(updated);
    URL.revokeObjectURL(imagePreviews[index]);
    const updatedPreviews = [...imagePreviews];
    updatedPreviews.splice(index, 1);
    setImagePreviews(updatedPreviews);
  };

  const handleRemoveExistingImage = (publicId) => {
    setRemoveImages([...removeImages, publicId]);
    setExistingImages(existingImages.filter((img) => img.publicId !== publicId));
  };

  // ── Submit ──
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('stock', useVariants ? variants.reduce((acc, v) => acc + v.stock, 0) : stock);
    formData.append('material', material);
    formData.append('occasion', occasion);
    formData.append('featured', featured);
    formData.append('colors', JSON.stringify(colors));
    formData.append('sizes', JSON.stringify(sizes));
    formData.append('variants', JSON.stringify(useVariants ? variants : []));
    if (isEdit) formData.append('removeImages', JSON.stringify(removeImages));
    imageFiles.forEach((file) => formData.append('images', file));
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-4xl mx-auto">

      {/* ── Basic Details ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label" htmlFor="prodName">Product Name</label>
          <input id="prodName" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="e.g. Banarasi Silk Saree" />
        </div>
        <div>
          <label className="label" htmlFor="prodCategory">Category</label>
          <select id="prodCategory" value={category} onChange={(e) => setCategory(e.target.value)} className="input bg-white">
            {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="prodPrice">Price (INR ₹)</label>
          <input id="prodPrice" type="number" required min="0" value={price} onChange={(e) => setPrice(e.target.value)} className="input" placeholder="e.g. 2499" />
        </div>

        <div>
          <label className="label" htmlFor="prodOccasion">Occasion</label>
          <select id="prodOccasion" value={occasion} onChange={(e) => setOccasion(e.target.value)} className="input bg-white">
            {occasions.map((occ) => <option key={occ} value={occ}>{occ}</option>)}
          </select>
        </div>
      </div>

      {/* ── Description ── */}
      <div>
        <label className="label" htmlFor="prodDesc">Description</label>
        <textarea id="prodDesc" required rows="4" value={description} onChange={(e) => setDescription(e.target.value)} className="input" placeholder="Describe the product — length, thread count, care instructions..." />
      </div>

      {/* ── Material — Selectable Chips ── */}
      <div className="space-y-3">
        <label className="label">Material / Fabric</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_MATERIALS.map((mat) => (
            <button
              key={mat}
              type="button"
              onClick={() => selectMaterial(mat)}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                material === mat
                  ? 'bg-indigo-950 text-white border-indigo-950 shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:text-indigo-700'
              }`}
            >
              {mat}
            </button>
          ))}
        </div>
        {/* Custom material text input fallback */}
        <div className="flex items-center space-x-2 pt-1">
          <input
            type="text"
            placeholder="Or type a custom material..."
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="input max-w-xs text-sm"
          />
          {material && !PRESET_MATERIALS.includes(material) && (
            <span className="text-xs text-green-600 font-semibold">✓ Custom: {material}</span>
          )}
        </div>
      </div>

      {/* ── Colors — Swatches + Custom ── */}
      <div className="space-y-4">
        <label className="label">Available Colors</label>

        {/* Preset color swatches */}
        <div className="flex flex-wrap gap-3">
          {PRESET_COLORS.map((col) => {
            const isSelected = colors.includes(col.name);
            return (
              <button
                key={col.name}
                type="button"
                onClick={() => togglePresetColor(col.name)}
                title={col.name}
                className={`relative w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                  isSelected ? 'border-indigo-950 ring-2 ring-offset-1 ring-indigo-950 scale-110' : 'border-gray-300 hover:border-gray-500'
                }`}
                style={{ backgroundColor: col.hex }}
                aria-label={`Select color ${col.name}`}
              >
                {isSelected && (
                  <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold drop-shadow">✓</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected colors display */}
        {colors.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {colors.map((col) => {
              const preset = PRESET_COLORS.find((p) => p.name === col);
              return (
                <span key={col} className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border">
                  {preset && (
                    <span className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: preset.hex }} />
                  )}
                  <span>{col}</span>
                  <button type="button" onClick={() => removeColor(col)} className="text-gray-400 hover:text-red-500 focus:outline-none">
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Custom color input */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Add custom color name..."
            value={customColorInput}
            onChange={(e) => setCustomColorInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addCustomColor(e); }}
            className="input max-w-xs text-sm"
          />
          <button type="button" onClick={addCustomColor} className="bg-indigo-950 hover:bg-primary-600 text-white p-2.5 rounded-lg transition-colors">
            <FiPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Sizes ── */}
      <div className="space-y-3">
        <label className="label">Available Sizes</label>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => toggleSize(sz)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                sizes.includes(sz)
                  ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* ── SKU Variant Inventory ── */}
      {colors.length > 0 && sizes.length > 0 && (
        <div className="space-y-4 bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-indigo-900">SKU-Level Variant Inventory</p>
              <p className="text-xs text-indigo-600 mt-0.5">Track stock per Color + Size combination</p>
            </div>
            <div
              onClick={() => setUseVariants(!useVariants)}
              className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${useVariants ? 'bg-indigo-600' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${useVariants ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
          </div>
          {useVariants && (
            <>
              <button
                type="button"
                onClick={generateVariants}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
              >
                ⚡ Generate {colors.length * sizes.length} Variant Combinations
              </button>
              {variants.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-indigo-200">
                  <table className="w-full text-sm bg-white">
                    <thead className="bg-indigo-950 text-white">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-bold uppercase">Color</th>
                        <th className="px-4 py-2 text-left text-xs font-bold uppercase">Size</th>
                        <th className="px-4 py-2 text-left text-xs font-bold uppercase">SKU Code</th>
                        <th className="px-4 py-2 text-right text-xs font-bold uppercase">Stock Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-100">
                      {variants.map((v, idx) => (
                        <tr key={idx} className="hover:bg-indigo-50/50">
                          <td className="px-4 py-2"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{v.color}</span></td>
                          <td className="px-4 py-2"><span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">{v.size}</span></td>
                          <td className="px-4 py-2 font-mono text-xs text-gray-500">{v.sku}</td>
                          <td className="px-4 py-2 text-right">
                            <input
                              type="number" min="0" value={v.stock}
                              onChange={(e) => updateVariantStock(idx, e.target.value)}
                              className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-center text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-indigo-50 border-t">
                      <tr>
                        <td colSpan="3" className="px-4 py-2 text-xs font-bold text-indigo-700">Total Stock (auto-calculated)</td>
                        <td className="px-4 py-2 text-right text-xs font-bold text-indigo-900">{variants.reduce((acc, v) => acc + v.stock, 0)} units</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Overall Stock (only when no variants) ── */}
      {!useVariants && (
        <div>
          <label className="label" htmlFor="prodStock">Overall Stock Quantity</label>
          <input id="prodStock" type="number" required={!useVariants} min="0" value={stock} onChange={(e) => setStock(e.target.value)} className="input max-w-xs" placeholder="e.g. 25" />
        </div>
      )}

      {/* ── Featured ── */}
      <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
        <input id="featured" type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="text-primary-600 focus:ring-primary-500 w-5 h-5 rounded" />
        <label htmlFor="featured" className="text-sm font-semibold text-gray-700 cursor-pointer">Feature this product on the Home Page</label>
      </div>

      {/* ── Images ── */}
      <div className="space-y-4">
        <label className="label">Product Images</label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {existingImages.map((img) => (
            <div key={img.publicId} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-gray-200 group bg-gray-50">
              <img src={img.url} alt="Existing" className="w-full h-full object-cover" />
              <button type="button" onClick={() => handleRemoveExistingImage(img.publicId)} className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white p-1 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity">
                <FiX className="w-4 h-4" />
              </button>
            </div>
          ))}
          {imagePreviews.map((url, index) => (
            <div key={url} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-gray-200 group bg-gray-50">
              <img src={url} alt="Preview" className="w-full h-full object-cover" />
              <button type="button" onClick={() => handleRemoveNewImage(index)} className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white p-1 rounded-full shadow transition-opacity">
                <FiX className="w-4 h-4" />
              </button>
            </div>
          ))}
          <label className="flex flex-col items-center justify-center aspect-[3/4] border-2 border-dashed border-gray-300 rounded-xl hover:border-primary-500 hover:bg-primary-50/20 transition-all cursor-pointer">
            <FiUpload className="w-8 h-8 text-gray-400" />
            <span className="text-xs font-bold text-gray-500 mt-2 text-center px-2">Upload Images</span>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>
      </div>

      {/* ── Submit ── */}
      <div className="flex items-center justify-end pt-6 border-t border-gray-100">
        <button type="submit" disabled={loading} className="btn-primary px-10">
          {loading ? 'Processing...' : isEdit ? '✓ Update Product' : '✓ Publish Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
