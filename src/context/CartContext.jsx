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

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('oct9_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, size = '', color = '', quantity = 1, customImage = null) => {
    const finalSize = size || (Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes[0] : '');
    const finalColor = color || (Array.isArray(product.colors) && product.colors.length > 0 && product.colors[0]?.name ? product.colors[0].name : '');
    const finalQty = Math.max(1, Number(quantity) || 1);

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        item => item.product_id === product.id && item.size === finalSize && item.color === finalColor
      );

      const img = customImage || (Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : (product.image || ''));

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += finalQty;
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
            size: finalSize,
            color: finalColor,
            price: Number(product.price),
            original_price: Number(product.original_price || product.price),
            quantity: finalQty,
          }
        ];
      }
    });
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
  };

  // Calculations: Free shipping on all orders, no GST surcharge
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const discountAmount = 0;
  const shippingFee = 0; // Universal Free Shipping
  const grandTotal = Math.max(0, subtotal);
  const freeShippingRemaining = 0;
  const FREE_SHIPPING_LIMIT = 0;

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

