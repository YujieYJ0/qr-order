"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { CATEGORIES, formatJPY, type CategoryKey } from "../../lib/menu";
import { useMenuData } from "../../lib/useMenuData";
import { useCart } from "../../components/CartProvider";
import CartDrawer from "../../components/CartDrawer";
import MenuImage from "../../components/MenuImage";

export default function TablePage() {
  const routeParams = useParams();
  const tableCodeParam = Array.isArray(routeParams?.tableCode)
    ? routeParams?.tableCode[0]
    : routeParams?.tableCode;
  const tableCode = tableCodeParam ? String(tableCodeParam) : "UNKNOWN";
  const searchParams = useSearchParams();
  const paramCat = searchParams.get("cat") as CategoryKey | null;
  const active = CATEGORIES.find((c) => c.key === paramCat) ?? CATEGORIES[0];
  const [q, setQ] = useState("");
  const { items, loading, source } = useMenuData();
  const cart = useCart();
  const [openCart, setOpenCart] = useState(false);
  const [showTablePrompt, setShowTablePrompt] = useState(false);
  const tableOptions = ["1", "2", "3", "4", "5"];

  const list = useMemo(() => {
    const base = items.filter((m) => m.cat === active.key);
    if (!q.trim()) return base;
    const kw = q.trim().toLowerCase();
    return base.filter(
      (m) =>
        m.name.toLowerCase().includes(kw) ||
        (m.desc ?? "").toLowerCase().includes(kw)
    );
  }, [active.key, q, items]);

  return (
    <main className="min-h-screen bg-transparent text-neutral-900">
      <div className="max-w-md mx-auto px-5 pt-8 pb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-[#B36B1E] font-semibold">
              桌号 {tableCode}
            </div>
            <h1 className="text-3xl font-black tracking-tight">
              早点 <span className="text-[#F59E0B]">earlier</span>
            </h1>
            <div className="text-xs text-neutral-500 mt-2">
              这是静态界面骨架，下一步会接入真实数据。
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              className="text-xs underline text-neutral-500"
              onClick={() => setShowTablePrompt(true)}
            >
              切换桌号
            </button>
            <div className="h-16 w-16 rounded-2xl bg-white shadow-sm border border-[#F3D9B5] grid place-items-center text-2xl">
              🥟
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 bg-white border border-[#F3D9B5] rounded-2xl px-4 py-3 shadow-sm">
          <span className="text-neutral-400">🔎</span>
          <input
            placeholder="搜索你喜欢的菜品"
            className="w-full outline-none text-sm bg-transparent"
            value={q}
            onChange={(event) => setQ(event.target.value)}
          />
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pb-24">
        <div className="flex gap-3">
          <aside className="w-24 shrink-0">
            <div className="rounded-3xl bg-white border border-[#F3D9B5] shadow-sm p-2">
              {CATEGORIES.map((c) => {
                const isActive = c.key === active.key;
                return (
                  <Link
                    key={c.key}
                    href={`/t/${tableCode}?cat=${c.key}`}
                    className={[
                      "block rounded-2xl px-2 py-3 mb-2 last:mb-0",
                      isActive
                        ? "bg-[#FFF1DD] border border-[#F3D9B5]"
                        : "text-neutral-600",
                    ].join(" ")}
                  >
                    <div className="text-lg">{c.icon}</div>
                    <div
                      className={[
                        "text-[11px] mt-1 leading-tight",
                        isActive ? "font-bold text-[#B36B1E]" : "text-neutral-600",
                      ].join(" ")}
                    >
                      {c.label}
                    </div>
                  </Link>
                );
              })}
            </div>
          </aside>

          <section className="flex-1">
            {loading ? (
              <div className="mt-6 text-sm text-neutral-500">
                正在加载菜品...
              </div>
            ) : (
              <div className="space-y-3">
                {list.map((m) => (
                  <div
                    key={m.id}
                    className="block rounded-3xl bg-white border border-[#F3D9B5] shadow-sm p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/item/${m.id}`}
                        className="h-14 w-14 rounded-2xl overflow-hidden bg-neutral-100 border border-[#F3D9B5] shrink-0 grid place-items-center text-xl"
                      >
                        <MenuImage
                          src={m.img}
                          alt={m.name}
                          className="h-full w-full object-cover"
                          fallback="🥟"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/item/${m.id}`}>
                          <div className="font-black truncate">{m.name}</div>
                          <div className="text-xs text-neutral-500 mt-0.5 truncate">
                            {m.desc ?? ""}
                          </div>
                        </Link>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-[#F59E0B] font-black">
                            {formatJPY(m.price)}
                            <span className="text-[11px] text-neutral-400 font-semibold ml-2">
                              已售 {m.sold ?? 0} 份
                            </span>
                          </div>
                          <button
                            className="h-8 w-8 rounded-full bg-[#F59E0B] text-white font-black grid place-items-center"
                            onClick={() => cart.add(m.id)}
                            aria-label="添加"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {list.length === 0 ? (
                  <div className="mt-6 text-sm text-neutral-500">
                    没找到相关菜品～换个关键词试试。
                  </div>
                ) : null}
              </div>
            )}

            <div className="mt-6 text-xs text-neutral-400">
              数据来源：{source === "supabase" ? "Supabase" : "本地示例"}
            </div>
          </section>
        </div>
      </div>

      <button
        onClick={() => setOpenCart(true)}
        className="phone-fixed z-40 h-14 w-14 rounded-full bg-[#111827] text-white shadow-xl active:scale-95"
        aria-label="购物车"
      >
        <span className="text-xl">🛒</span>
        {cart.count > 0 ? (
          <span className="absolute -top-1 -right-1 h-6 min-w-6 px-1 rounded-full bg-rose-500 text-white text-xs font-black grid place-items-center">
            {cart.count}
          </span>
        ) : null}
      </button>

      <CartDrawer
        open={openCart}
        onClose={() => setOpenCart(false)}
        items={items}
        tableCode={tableCode}
      />

      {showTablePrompt ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute left-0 right-0 top-1/3 mx-auto max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-[#F3D9B5]">
            <div className="text-lg font-black">请选择桌号</div>
            <div className="text-xs text-neutral-500 mt-2">当前桌号：{tableCode}</div>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {tableOptions.map((code) => (
                <Link
                  key={code}
                  href={`/t/${code}`}
                  className="h-10 rounded-2xl border border-[#F3D9B5] bg-white font-black grid place-items-center"
                  onClick={() => {
                    window.localStorage.setItem("qr-order-table", code);
                    setShowTablePrompt(false);
                  }}
                >
                  {code}
                </Link>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                className="flex-1 h-11 rounded-2xl border border-[#F3D9B5] bg-white text-sm"
                onClick={() => setShowTablePrompt(false)}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
