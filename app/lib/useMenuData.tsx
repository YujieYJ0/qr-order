"use client";

import { useEffect, useState } from "react";
import type { MenuItem } from "./menu";
import { fetchMenuItems, type MenuSource } from "./menuData";

export function useMenuData() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<MenuSource>("local");

  useEffect(() => {
    let alive = true;
    fetchMenuItems()
      .then((result) => {
        if (!alive) return;
        setItems(result.items);
        setSource(result.source);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { items, loading, source };
}
