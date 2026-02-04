"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import type { MenuItem } from "../lib/menu";
import { formatJPY } from "../lib/menu";
import { createOrder } from "../lib/order";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
  items: MenuItem[];
  tableCode?: string;
};

export default function CartDrawer({
  open,
  onClose,
  items,
  tableCode = "WEB",
}: CartDrawerProps) {
  const cart = useCart();
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const menuMap = useMemo(() => {
    const map = new Map<string, MenuItem>();
    items.forEach((item) => map.set(item.id, item));
    return map;
  }, [items]);

  const cartItems = Object.entries(cart.items);
  const total = cartItems.reduce((sum, [id, qty]) => {
    const item = menuMap.get(id);
    if (!item) return sum;
    return sum + item.price * qty;
  }, 0);

  const orderPayload = cartItems
    .map(([id, qty]) => {
      const item = menuMap.get(id);
      if (!item) return null;
      return { item, qty };
    })
    .filter(Boolean) as Array<{ item: MenuItem; qty: number }>;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="phone-bottom mx-auto max-w-md rounded-t-3xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="text-lg font-black">🧾 购物车</div>
          <button className="text-sm text-neutral-500 underline" onClick={onClose}>
            关闭
          </button>
        </div>

        <div className="mt-3 space-y-2 max-h-[45vh] overflow-auto pr-1">
          {cart.count === 0 ? (
            <div className="rounded-2xl border border-[#F3D9B5] p-4 text-sm text-neutral-500">
              还没选菜～点右侧橙色 + 试试
            </div>
          ) : (
            cartItems.map(([id, qty]) => {
              const item = menuMap.get(id);
              return (
                <div key={id} className="rounded-2xl border border-[#F3D9B5] p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-black">{item?.name ?? "已下架商品"}</div>
                      <div className="text-xs text-neutral-500 mt-0.5">
                        {item ? formatJPY(item.price) : "无法计价"}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        className="h-8 w-8 rounded-full border border-[#F3D9B5] bg-white active:scale-95"
                        onClick={() => cart.sub(id)}
                      >
                        −
                      </button>
                      <div className="min-w-6 text-center font-black">{qty}</div>
                      <button
                        className="h-8 w-8 rounded-full bg-[#F59E0B] text-white font-black active:scale-95"
                        onClick={() => cart.add(id)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 rounded-2xl bg-[#FFF1DD] p-4 border border-[#F3D9B5]">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600 font-semibold">合计</div>
            <div className="text-lg font-black">{formatJPY(total)}</div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              className="flex-1 h-11 rounded-2xl border border-[#F3D9B5] bg-white font-black active:scale-[0.99] disabled:opacity-50"
              onClick={cart.clear}
              disabled={cart.count === 0}
            >
              清空
            </button>
            <button
              className="flex-1 h-11 rounded-2xl bg-[#F59E0B] text-white font-black shadow-sm active:scale-[0.99] disabled:opacity-50"
              disabled={cart.count === 0}
              onClick={async () => {
                if (cart.count === 0 || submitting) return;
                setSubmitting(true);
                const result = await createOrder({
                  tableCode,
                  items: orderPayload,
                  total,
                });
                setSubmitting(false);
                if (result.ok) {
                  cart.clear();
                  onClose();
                  router.push(
                    `/order/success?orderId=${result.orderId}&table=${tableCode}`
                  );
                } else {
                  alert(`下单失败：${result.error}`);
                }
              }}
            >
              {submitting ? "提交中..." : "立即下单"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
