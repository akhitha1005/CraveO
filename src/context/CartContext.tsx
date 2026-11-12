import React, { createContext, useContext, useState, useEffect } from 'react';
import { FoodItem, CartItem, Restaurant } from '../types';

interface CartContextType {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  deliveryFee: number;
  subtotal: number;
  tax: number;
  tip: number;
  discount: number;
  appliedPromo: string | null;
  totalAmount: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (foodItem: FoodItem, restaurant: Restaurant) => boolean;
  updateQuantity: (foodItemId: string, delta: number) => void;
  removeFromCart: (foodItemId: string) => void;
  clearCart: () => void;
  applyPromo: (code: string) => { success: boolean; message: string };
  setTipAmount: (amount: number) => void;
  confirmReplaceModal: { isOpen: boolean; pendingItem?: FoodItem; pendingRestaurant?: Restaurant };
  setConfirmReplaceModal: (val: { isOpen: boolean; pendingItem?: FoodItem; pendingRestaurant?: Restaurant }) => void;
  replaceCartWithPending: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [deliveryFee, setDeliveryFee] = useState<number>(40);
  const [tip, setTip] = useState<number>(20);
  const [discount, setDiscount] = useState<number>(0);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [confirmReplaceModal, setConfirmReplaceModal] = useState<{
    isOpen: boolean;
    pendingItem?: FoodItem;
    pendingRestaurant?: Restaurant;
  }>({ isOpen: false });

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('craveo_cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setItems(parsed.items || []);
        setRestaurantId(parsed.restaurantId || null);
        setRestaurantName(parsed.restaurantName || null);
        setDeliveryFee(parsed.deliveryFee || 40);
      } catch (e) {
        console.error('Failed to load cart', e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem(
      'craveo_cart',
      JSON.stringify({ items, restaurantId, restaurantName, deliveryFee })
    );
  }, [items, restaurantId, restaurantName, deliveryFee]);

  const addToCart = (foodItem: FoodItem, restaurant: Restaurant): boolean => {
    if (restaurantId && restaurantId !== restaurant.id && items.length > 0) {
      setConfirmReplaceModal({
        isOpen: true,
        pendingItem: foodItem,
        pendingRestaurant: restaurant,
      });
      return false;
    }

    setRestaurantId(restaurant.id);
    setRestaurantName(restaurant.name);
    setDeliveryFee(restaurant.deliveryFee);

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.foodItem.id === foodItem.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prev, { foodItem, quantity: 1 }];
    });
    return true;
  };

  const replaceCartWithPending = () => {
    if (confirmReplaceModal.pendingItem && confirmReplaceModal.pendingRestaurant) {
      const item = confirmReplaceModal.pendingItem;
      const rest = confirmReplaceModal.pendingRestaurant;
      setRestaurantId(rest.id);
      setRestaurantName(rest.name);
      setDeliveryFee(rest.deliveryFee);
      setItems([{ foodItem: item, quantity: 1 }]);
    }
    setConfirmReplaceModal({ isOpen: false });
  };

  const updateQuantity = (foodItemId: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.foodItem.id === foodItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (foodItemId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.foodItem.id !== foodItemId);
      if (next.length === 0) {
        setRestaurantId(null);
        setRestaurantName(null);
        setAppliedPromo(null);
        setDiscount(0);
      }
      return next;
    });
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantName(null);
    setAppliedPromo(null);
    setDiscount(0);
  };

  const applyPromo = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'CRAVEO100' || clean === 'CRAVEO50') {
      const promoDiscount = 100.0;
      setDiscount(promoDiscount);
      setAppliedPromo('CRAVEO100');
      return { success: true, message: '🎉 ₹100 discount applied via CRAVEO100!' };
    }
    if (clean === 'FREESHIP') {
      const promoDiscount = deliveryFee;
      setDiscount(promoDiscount);
      setAppliedPromo('FREESHIP');
      return { success: true, message: '🚚 Free delivery applied via FREESHIP!' };
    }
    return { success: false, message: 'Invalid promo code. Try "CRAVEO100" or "FREESHIP"' };
  };

  const setTipAmount = (amount: number) => {
    setTip(Math.max(0, amount));
  };

  const subtotal = items.reduce((sum, item) => sum + item.foodItem.price * item.quantity, 0);
  const tax = subtotal > 0 ? Math.round(subtotal * 0.05) : 0; // 5% Restaurant GST
  const effectiveDeliveryFee = items.length > 0 ? deliveryFee : 0;
  const totalAmount = Math.max(
    0,
    Math.round(subtotal + effectiveDeliveryFee + tax + (items.length > 0 ? tip : 0) - discount)
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        restaurantId,
        restaurantName,
        deliveryFee: effectiveDeliveryFee,
        subtotal,
        tax,
        tip: items.length > 0 ? tip : 0,
        discount,
        appliedPromo,
        totalAmount,
        itemCount,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyPromo,
        setTipAmount,
        confirmReplaceModal,
        setConfirmReplaceModal,
        replaceCartWithPending,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
