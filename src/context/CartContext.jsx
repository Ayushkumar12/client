import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('oct9_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('oct9_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('oct9_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('oct9_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('oct9_coupon');
    }
  }, [appliedCoupon]);

  const addToCart = (product, size = 'M', color = 'Standard', quantity = 1) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        item => item.product_id === product.id && item.size === size && item.color === color
      );

      const img = Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : (product.image || '');

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            product_id: product.id,
            id: product.id,
            title: product.title,
            slug: product.slug,
            image: img,
            size,
            color,
            price: Number(product.price),
            original_price: Number(product.original_price || product.price),
            quantity: Number(quantity),
          }
        ];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (productId, size, color) => {
    setCart(prev => prev.filter(
      item => !(item.product_id === productId && item.size === size && item.color === color)
    ));
  };

  const updateQuantity = (productId, size, color, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.product_id === productId && item.size === size && item.color === color) {
        return { ...item, quantity };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code) => {
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await api.validateCoupon(code, subtotal);
      if (res.success) {
        setAppliedCoupon(res.coupon);
        setCouponError('');
        return true;
      }
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon');
      setAppliedCoupon(null);
      return false;
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      discountAmount = Math.min((subtotal * Number(appliedCoupon.discount_value)) / 100, 2000);
    } else {
      discountAmount = Math.min(Number(appliedCoupon.discount_value), subtotal);
    }
    discountAmount = Math.round(discountAmount);
  }

  const FREE_SHIPPING_LIMIT = 1999;
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_LIMIT - (subtotal - discountAmount));
  const shippingFee = cart.length === 0 ? 0 : (freeShippingRemaining === 0 ? 0 : 99);
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        couponError,
        couponLoading,
        subtotal,
        totalItems,
        discountAmount,
        shippingFee,
        grandTotal,
        freeShippingRemaining,
        FREE_SHIPPING_LIMIT,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
