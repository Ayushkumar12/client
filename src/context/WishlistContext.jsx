import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, formatImageUrl, extractProductImage } from '../services/api.js';
import { useToast } from './ToastContext.jsx';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { toast } = useToast();
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('oct9_wishlist');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(item => {
        const itemImg = extractProductImage(item);
        const imagesList = Array.isArray(item.images) && item.images.length > 0
          ? item.images
          : [itemImg];
        return {
          ...item,
          stock: item.stock !== undefined && item.stock !== null ? Number(item.stock) : 1,
          image: itemImg,
          images: imagesList
        };
      });
    } catch (e) {
      return [];
    }
  });

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    try {
      localStorage.setItem('oct9_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      // Storage quota or private mode fallback
    }
  }, [wishlist]);

  // Synchronize wishlist items with live catalog stock & images on mount
  useEffect(() => {
    if (!wishlist || wishlist.length === 0) return;
    let isCancelled = false;

    const syncWishlistWithLiveCatalog = async () => {
      try {
        const res = await api.getProducts({ limit: 100 });
        if (isCancelled || !res || !res.success || !Array.isArray(res.products)) return;

        const liveMap = new Map();
        res.products.forEach(p => liveMap.set(p.id, p));

        setWishlist(prev => {
          let hasChanges = false;
          const updated = prev.map(item => {
            const live = liveMap.get(item.id);
            if (!live) return item;

            const liveStock = live.stock !== undefined && live.stock !== null ? Number(live.stock) : 1;
            const liveImg = extractProductImage(live);
            const liveImages = Array.isArray(live.images) && live.images.length > 0 ? live.images : [liveImg];

            if (
              item.stock !== liveStock ||
              item.price !== Number(live.price) ||
              item.image !== liveImg ||
              !item.images || item.images.length === 0
            ) {
              hasChanges = true;
              return {
                ...item,
                ...live,
                stock: liveStock,
                price: Number(live.price),
                original_price: Number(live.original_price || live.price),
                discount_percent: live.discount_percent,
                image: liveImg,
                images: liveImages
              };
            }
            return item;
          });

          return hasChanges ? updated : prev;
        });
      } catch (err) {
        // Silently preserve cached items if catalog fetch is interrupted
      }
    };

    syncWishlistWithLiveCatalog();
    return () => { isCancelled = true; };
  }, []);

  const toggleWishlist = (product) => {
    const exists = wishlist.some(item => item.id === product.id);
    if (exists) {
      setWishlist(prev => prev.filter(item => item.id !== product.id));
      if (toast?.info) toast.info(`Removed "${product.title || 'Item'}" from wishlist`);
    } else {
      const img = extractProductImage(product);
      const imagesList = Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : [img];
      const stock = product.stock !== undefined && product.stock !== null ? Number(product.stock) : 1;

      const newItem = {
        ...product,
        id: product.id,
        title: product.title,
        slug: product.slug,
        price: Number(product.price),
        original_price: Number(product.original_price || product.price),
        discount_percent: product.discount_percent,
        rating: product.rating,
        stock: stock,
        image: img,
        images: imagesList,
        category_slug: product.category_slug,
        sub_category: product.sub_category || ''
      };
      setWishlist(prev => [...prev, newItem]);
      if (toast?.success) toast.success(`Saved "${product.title || 'Item'}" to wishlist`);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
