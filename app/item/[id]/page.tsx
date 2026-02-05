"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CATEGORIES, formatJPY } from "../../lib/menu";
import { useMenuData } from "../../lib/useMenuData";
import { useCart } from "../../components/CartProvider";
import CartDrawer from "../../components/CartDrawer";
import MenuImage from "../../components/MenuImage";

export default function ItemDetailPage() {
  const { items, loading, source } = useMenuData();
  const cart = useCart();
  const [openCart, setOpenCart] = useState(false);
  const params = useParams();
  const rawId = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const id = rawId ? String(rawId) : "";

  const item = useMemo(() => items.find((m) => m.id === id), [items, id]);
  const category = CATEGORIES.find((c) => c.key === item?.cat);
  const qty = item ? cart.items[item.id] ?? 0 : 0;

  if (loading) {
    return (
      <main className="min-h-screen bg-transparent text-neutral-900">
        <div className="max-w-md mx-auto px-5 pt-10 text-sm text-neutral-500">
          正在加载菜品...
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-transparent text-neutral-900">
        <div className="max-w-md mx-auto px-5 pt-10">
          <div className="rounded-3xl bg-white border border-[#F3D9B5] p-6 shadow-sm">
            <div className="text-lg font-black">找不到这个菜品</div>
            <Link href="/" className="inline-block mt-4 text-sm underline">
              返回首页
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent text-neutral-900">
      <div className="max-w-md mx-auto px-5 pt-6 pb-28">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm underline">
            ← 返回
          </Link>
          <div className="text-xs text-neutral-500">{category?.label ?? ""}</div>
        </div>

        <div className="mt-4 rounded-3xl overflow-hidden bg-white border border-[#F3D9B5] shadow-sm">
          <div className="aspect-[4/3] bg-neutral-100 grid place-items-center text-4xl">
            <MenuImage
              src={item.img}
              alt={item.name}
              className="h-full w-full object-cover"
              fallback="🥐"
            />
          </div>
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-black">{item.name}</div>
              <div className="flex items-center gap-2">
                <button
                  className="h-8 w-8 rounded-full border border-[#F3D9B5] bg-white"
                  onClick={() => cart.sub(item.id)}
                  disabled={qty === 0}
                >
                  −
                </button>
                <div className="text-sm font-black">{qty}</div>
                <button
                  className="h-8 w-8 rounded-full bg-[#F59E0B] text-white font-black"
                  onClick={() => cart.add(item.id)}
                >
                  +
                </button>
              </div>
            </div>
            <div className="text-xs text-neutral-500 mt-2">
              已售 {item.sold ?? 0} 份 · {item.desc ?? ""}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-[#FFF1DD] border border-[#F3D9B5] p-3 text-center">
                <div className="text-xs text-neutral-500">卡路里</div>
                <div className="font-black mt-1">{item.calories ?? 0}</div>
              </div>
              <div className="rounded-2xl bg-[#FFF1DD] border border-[#F3D9B5] p-3 text-center">
                <div className="text-xs text-neutral-500">评分</div>
                <div className="font-black mt-1">{item.rating ?? 0}</div>
              </div>
              <div className="rounded-2xl bg-[#FFF1DD] border border-[#F3D9B5] p-3 text-center">
                <div className="text-xs text-neutral-500">时间</div>
                <div className="font-black mt-1">{item.time ?? ""}</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm font-black">食材配方</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(item.ingredients ?? []).map((ing) => (
                  <span
                    key={ing}
                    className="px-3 py-1 rounded-full border border-[#F3D9B5] text-xs bg-white"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="text-sm font-black">做工介绍</div>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                这里是菜品介绍的占位文字，之后可以接 CMS 或数据库里的详情描述。
              </p>
            </div>

            <div className="mt-6 text-xs text-neutral-400">
              数据来源：{source === "supabase" ? "Supabase" : "本地示例"}
            </div>
          </div>
        </div>
      </div>

      <div className="phone-bottom bg-white/90 border-t border-[#F3D9B5]">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-500">价格</div>
            <div className="text-xl font-black">{formatJPY(item.price)}</div>
          </div>
          <button
            className="h-11 px-8 rounded-2xl bg-[#F59E0B] text-white font-black shadow-sm"
            onClick={() => setOpenCart(true)}
          >
            去购物车
          </button>
        </div>
      </div>

      <button
        onClick={() => setOpenCart(true)}
        className="phone-fixed z-40 h-14 w-14 rounded-full bg-white text-[#5A3A2E] border border-[#E7C9A4] shadow-xl active:scale-95"
        aria-label="购物车"
      >
        <span className="text-xl">🛒</span>
        {cart.count > 0 ? (
          <span className="absolute -top-1 -right-1 h-6 min-w-6 px-1 rounded-full bg-rose-500 text-white text-xs font-black grid place-items-center">
            {cart.count}
          </span>
        ) : null}
      </button>

      <CartDrawer open={openCart} onClose={() => setOpenCart(false)} items={items} />
    </main>
  );
}
