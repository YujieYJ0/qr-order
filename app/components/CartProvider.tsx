"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type CartItems = Record<string, number>;

type CartContextValue = {
  items: CartItems;
  count: number;
  add: (id: string, qty?: number) => void;
  sub: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "qr-order-cart";

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}

export default function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<CartItems>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItems;
        setItems(parsed ?? {});
      }
    } catch {
      setItems({});
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }, [items]);

  const add = useCallback((id: string, qty = 1) => {
    setItems((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + qty }));
  }, []);

  const sub = useCallback((id: string, qty = 1) => {
    setItems((prev) => {
      const next = { ...prev };
      const value = (next[id] ?? 0) - qty;
      if (value <= 0) delete next[id];
      else next[id] = value;
      return next;
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  }, []);

  const clear = useCallback(() => setItems({}), []);

  const count = useMemo(
    () => Object.values(items).reduce((sum, n) => sum + n, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, count, add, sub, setQty, clear }),
    [items, count, add, sub, setQty, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
