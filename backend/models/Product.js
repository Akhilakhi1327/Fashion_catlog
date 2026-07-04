const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Sarees', 'Kurtis', 'Dresses', 'Lehengas', 'Suits', 'Tops', 'Bottoms', 'Accessories', 'Others'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    default: 0,
    min: [0, 'Stock cannot be negative'],
  },
  colors: {
    type: [String],
    default: [],
  },
  sizes: {
    type: [String],
    default: [],
  },
  // SKU-level variant inventory tracking
  variants: [
    {
      color: { type: String, default: '' },
      size: { type: String, default: '' },
      sku: { type: String, default: '' },
      stock: { type: Number, default: 0, min: 0 },
    },
  ],
  material: {
    type: String,
    default: '',
    trim: true,
  },
  occasion: {
    type: String,
    enum: ['Casual', 'Formal', 'Party', 'Wedding', 'Festival', 'Daily Wear', 'Sports', 'Others'],
    default: 'Others',
  },
  images: [
    {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
  ],
  featured: {
    type: Boolean,
    default: false,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
      },
      name: { type: String, required: true },
      rating: { type: Number, required: true },
      comment: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  rating: {
    type: Number,
    required: true,
    default: 0,
  },
  numReviews: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtuals - account for both variant-level and product-level stock
productSchema.virtual('isInStock').get(function () {
  if (this.variants && this.variants.length > 0) {
    return this.variants.some((v) => v.stock > 0);
  }
  return this.stock > 0;
});

productSchema.virtual('isLowStock').get(function () {
  if (this.variants && this.variants.length > 0) {
    const totalVariantStock = this.variants.reduce((acc, v) => acc + v.stock, 0);
    return totalVariantStock > 0 && totalVariantStock <= 5;
  }
  return this.stock > 0 && this.stock <= 5;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Optimize catalog queries and search performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
