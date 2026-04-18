"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthContext } from "@/lib/auth/auth-provider";
import { apiFetch } from "@/lib/api-client";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string;
  quantity: number;
  listingId: string;
  listing: {
    title: string;
    price: number;
    images?: string[];
    storeId: string;
    stock: number;
  };
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  isLoading: boolean;
  addToCart: (listingId: string, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await apiFetch("/api/v1/cart");
      if (res.success && res.data) {
        setItems(res.data.items || []);
      }
    } catch (err) {
      console.error("Failed to fetch cart", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (listingId: string, quantity: number = 1) => {
    if (!user) {
      // Force login route
      router.push("/login?redirect=/marketplace");
      return;
    }

    try {
      const res = await apiFetch("/api/v1/cart/items", {
        method: "POST",
        body: JSON.stringify({ listingId, quantity }),
      });
      if (res.success && res.data) {
        setItems(res.data.items || []);
      } else {
        throw new Error(res.error?.message || "Failed to add to cart");
      }
    } catch (err) {
      console.error("Add to cart error", err);
      throw err; // Re-throw to let component show error
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) return;
    try {
      const res = await apiFetch(`/api/v1/cart/items/${itemId}`, {
        method: "DELETE",
      });
      if (res.success) {
        setItems((prev) => prev.filter((item) => item.id !== itemId));
      }
    } catch (err) {
      console.error("Remove from cart error", err);
      throw err;
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, itemCount, isLoading, addToCart, removeFromCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
