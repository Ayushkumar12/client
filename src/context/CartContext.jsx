import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, formatImageUrl } from '../services/api.js';
import { useToast } from './ToastContext.jsx';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { toast } = useToast();
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('oct9_cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(item => ({
        ...item,
        stock: item.stock !== undefined && item.stock !== null ? Number(item.stock) : 99,
        quantity: Math.max(1, Number(item.quantity) || 1)
      }));
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('oct9_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  // Synchronize cart items with live catalog stock & pricing on mount
  useEffect(() => {
    if (!cart || cart.length === 0) return;
    let isCancelled = false;

    const syncCartWithLiveCatalog = async () => {
      try {
        const res = await api.getProducts({ limit: 100 });
        if (isCancelled || !res || !res.success || !Array.isArray(res.products)) return;

        const liveMap = new Map();
        res.products.forEach(p => liveMap.set(p.id, p));

        setCart(prev => {
          let hasChanges = false;
          const updated = prev.map(item => {
            const live = liveMap.get(item.product_id || item.id);
            if (!live) return item;

            const liveStock = live.stock !== undefined && live.stock !== null ? Number(live.stock) : 99;
            // Cap quantity if it exceeds live available stock (when stock > 0)
            const clampedQty = liveStock > 0 ? Math.min(item.quantity, liveStock) : item.quantity;
            const livePrice = Number(live.price);

            if (
              item.stock !== liveStock ||
              item.quantity !== clampedQty ||
              item.price !== livePrice
            ) {
              hasChanges = true;
              return {
                ...item,
                stock: liveStock,
                price: livePrice,
                original_price: Number(live.original_price || live.price),
                quantity: clampedQty
              };
            }
            return item;
          });

          return hasChanges ? updated : prev;
        });
      } catch (err) {
        // Silently preserve cached cart
      }
    };

    syncCartWithLiveCatalog();
    return () => { isCancelled = true; };
  }, []);

  const addToCart = (product, size = '', color = '', quantity = 1, customImage = null) => {
    const finalSize = size || (Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes[0] : '');
    const finalColor = color || (Array.isArray(product.colors) && product.colors.length > 0 && product.colors[0]?.name ? product.colors[0].name : '');
    const finalQty = Math.max(1, Number(quantity) || 1);
    const maxStock = product.stock !== undefined && product.stock !== null ? Number(product.stock) : 99;

    // Reject out-of-stock additions
    if (maxStock <= 0) {
      if (toast?.error) toast.error('This item is currently out of stock.');
      return { success: false, message: 'This item is currently out of stock.' };
    }

    let addedSuccessfully = true;
    let alertMessage = '';

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        item => item.product_id === product.id && item.size === finalSize && item.color === finalColor
      );

      const rawImg = customImage || (Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : (product.image || ''));
      const img = formatImageUrl(rawImg) || rawImg;

      if (existingIndex > -1) {
        const existingItem = prevCart[existingIndex];
        const currentQty = existingItem.quantity;
        const availableStock = existingItem.stock !== undefined ? existingItem.stock : maxStock;

        if (currentQty >= availableStock) {
          addedSuccessfully = false;
          alertMessage = `Maximum available stock (${availableStock}) is already in your bag.`;
          return prevCart;
        }

        const newQty = Math.min(availableStock, currentQty + finalQty);
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...existingItem,
          stock: availableStock,
          quantity: newQty
        };
        return updated;
      } else {
        const newQty = Math.min(maxStock, finalQty);
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
            stock: maxStock,
            quantity: newQty,
          }
        ];
      }
    });

    if (!addedSuccessfully) {
      if (toast?.error) toast.error(alertMessage);
    } else {
      if (toast?.success) toast.success(`Added "${product.title || 'Item'}" to your shopping bag`);
    }

    return { success: addedSuccessfully, message: alertMessage };
  };

  const removeFromCart = (productId, size, color) => {
    setCart(prev => prev.filter(
      item => !(item.product_id === productId && item.size === size && item.color === color)
    ));
    if (toast?.info) toast.info('Item removed from shopping bag');
  };

  const updateQuantity = (productId, size, color, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.product_id === productId && item.size === size && item.color === color) {
        const itemStock = item.stock !== undefined && item.stock !== null ? Number(item.stock) : 99;
        const allowedQty = Math.max(1, Math.min(itemStock, Number(quantity) || 1));
        return { ...item, quantity: allowedQty };
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

  // Validation: true if cart is non-empty and every item is in stock with quantity <= stock
  const isCartStockValid = cart.length > 0 && cart.every(item => {
    if (item.stock === undefined || item.stock === null) return true;
    return item.stock > 0 && item.quantity <= item.stock;
  });

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
        isCartStockValid,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
