import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { useCustomerAuth } from './CustomerAuthContext';
import api from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const toast = useToast();
  const { customerInfo } = useCustomerAuth();

  // Load from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('elite_fashion_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (err) {
        console.error('Failed to parse cart data');
      }
    }
  }, []);

  // Sync cart when user logs in
  useEffect(() => {
    if (customerInfo) {
      syncCartWithDb();
    }
  }, [customerInfo]);

  const syncCartWithDb = async () => {
    try {
      const localCart = JSON.parse(localStorage.getItem('elite_fashion_cart')) || [];
      const mappedItems = localCart.map(i => ({
        product: i.product,
        name: i.name,
        price: i.price,
        image: i.image,
        quantity: i.qty,
        size: i.size,
        color: i.color
      }));
      const res = await api.post('/cart/sync', { cartItems: mappedItems });
      
      const dbItems = res.data.items.map(item => ({
        _id: item._id, // cart item id
        product: item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        qty: item.quantity,
        color: item.color,
        size: item.size
      }));
      setCartItems(dbItems);
      localStorage.setItem('elite_fashion_cart', JSON.stringify(dbItems));
    } catch (e) {
      console.error('Cart sync failed', e);
    }
  };

  // Save to local storage whenever cart changes (if not logged in, it acts as guest cart)
  useEffect(() => {
    localStorage.setItem('elite_fashion_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = async (product, qty = 1, color = '', size = '') => {
    if (customerInfo) {
      try {
        await api.post('/cart', {
          product: product._id,
          name: product.name,
          price: product.price,
          image: product.images[0]?.url,
          quantity: qty,
          size,
          color
        });
        await syncCartWithDb();
        toast.success(`${product.name} added to cart!`);
        return;
      } catch (e) {
        toast.error('Failed to add to cart');
        return;
      }
    }

    // Guest cart logic
    setCartItems((prevItems) => {
      const existItem = prevItems.find(
        (x) => x.product === product._id && x.color === color && x.size === size
      );

      if (existItem) {
        toast.success(`Updated ${product.name} quantity in cart!`);
        return prevItems.map((x) =>
          x.product === product._id && x.color === color && x.size === size
            ? { ...x, qty: x.qty + qty }
            : x
        );
      } else {
        toast.success(`${product.name} added to cart!`);
        return [
          ...prevItems,
          {
            product: product._id,
            name: product.name,
            image: product.images[0]?.url,
            price: product.price,
            qty,
            color,
            size,
            stock: product.stock,
          },
        ];
      }
    });
  };

  const removeFromCart = async (id, color, size, cartItemId) => {
    if (customerInfo && cartItemId) {
      try {
        await api.delete(`/cart/${cartItemId}`);
        await syncCartWithDb();
        return;
      } catch (e) {
        console.error(e);
      }
    }

    setCartItems((prevItems) =>
      prevItems.filter(
        (x) => !(x.product === id && x.color === color && x.size === size)
      )
    );
  };

  const updateCartQty = async (id, color, size, qty, cartItemId) => {
    if (customerInfo && cartItemId) {
      try {
        await api.put(`/cart/${cartItemId}`, { quantity: qty });
        await syncCartWithDb();
        return;
      } catch (e) {
        console.error(e);
      }
    }

    setCartItems((prevItems) =>
      prevItems.map((x) =>
        x.product === id && x.color === color && x.size === size
          ? { ...x, qty }
          : x
      )
    );
  };

  const clearCart = async () => {
    if (customerInfo) {
      try {
        await api.delete('/cart');
      } catch (e) {
        console.error(e);
      }
    }
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};
