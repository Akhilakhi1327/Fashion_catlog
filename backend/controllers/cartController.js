const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.json(cart);
});

// @desc    Sync guest cart with user cart (Merge behavior)
// @route   POST /api/cart/sync
// @access  Private
const syncCart = asyncHandler(async (req, res) => {
  const { cartItems } = req.body; // Array of items from guest cart

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: cartItems || [] });
    return res.json(cart);
  }

  if (cartItems && cartItems.length > 0) {
    // Merge behavior: If item exists (same product, size, color), add quantities. Otherwise, push.
    cartItems.forEach(guestItem => {
      const existingItemIndex = cart.items.findIndex(
        item => 
          item.product.toString() === guestItem.product &&
          item.size === guestItem.size &&
          item.color === guestItem.color
      );

      if (existingItemIndex > -1) {
        // Add quantity
        cart.items[existingItemIndex].quantity += guestItem.quantity;
      } else {
        cart.items.push(guestItem);
      }
    });

    await cart.save();
  }

  res.json(cart);
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { product, name, price, image, quantity, size, color } = req.body;

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existingItemIndex = cart.items.findIndex(
    item => 
      item.product.toString() === product &&
      item.size === size &&
      item.color === color
  );

  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    cart.items.push({ product, name, price, image, quantity, size, color });
  }

  await cart.save();
  res.json(cart);
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = cart.items.id(req.params.itemId);
  if (!item) {
    res.status(404);
    throw new Error('Item not found in cart');
  }

  item.quantity = quantity;
  await cart.save();

  res.json(cart);
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
  await cart.save();

  res.json(cart);
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.json({ message: 'Cart cleared' });
});

module.exports = {
  getCart,
  syncCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
