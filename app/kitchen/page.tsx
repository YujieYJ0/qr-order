"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "../lib/supabaseClient";
import { formatJPY } from "../lib/menu";

type OrderItem = {
  id: string;
  order_id: string;
  item_id: string;
  name: string;
  price: number;
  qty: number;
};

type Order = {
  id: string;
  table_code: string;
  status: "pending" | "preparing" | "done";
  total: number;
  created_at: string;
  order_items?: OrderItem[];
};

type TableStatus = {
  table_code: string;
  status: "pending" | "preparing" | "done";
  updated_at: string;
};

const STATUS_LABEL: Record<Order["status"], string> = {
  pending: "待处理",
  preparing: "制作中",
  done: "已完成",
};

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [dailyTotal, setDailyTotal] = useState(0);
  const client = getSupabaseClient();
  const adminCode = process.env.NEXT_PUBLIC_ADMIN_CODE ?? "";
  const tableCode = useMemo(() => {
    if (typeof window === "undefined") return "1";
    return window.localStorage.getItem("qr-order-table") || "1";
  }, []);

  const todayKey = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  const localKey = useMemo(() => `qr-order-daily-${todayKey}`, [todayKey]);

  const readLocalTotal = useCallback(() => {
    if (typeof window === "undefined") return 0;
    const raw = window.localStorage.getItem(localKey);
    return raw ? Number(raw) || 0 : 0;
  }, [localKey]);

  const writeLocalTotal = useCallback(
    (value: number) => {
      if (typeof window === "undefined") return;
      window.localStorage.setItem(localKey, String(value));
    },
    [localKey]
  );

  const fetchOrders = useCallback(async () => {
    if (!client) {
      setError("Supabase 未配置");
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: ordersData, error: ordersError } = await client
      .from("orders")
      .select(
        "id,table_code,status,total,created_at,order_items(id,order_id,item_id,name,price,qty)"
      )
      .order("created_at", { ascending: false });

    if (ordersError) {
      setError(ordersError.message);
      setLoading(false);
      return;
    }

    const { data: tableData, error: tableError } = await client
      .from("table_status")
      .select("table_code,status,updated_at")
      .order("updated_at", { ascending: false });

    if (tableError) {
      setError(tableError.message);
      setLoading(false);
      return;
    }
    const localTotal = readLocalTotal();
    setDailyTotal((prev) => (prev === 0 ? localTotal : prev));

    const { data: dailyData, error: dailyError } = await client
      .from("daily_stats")
      .select("total")
      .eq("day", todayKey)
      .single();

    if (dailyError && dailyError.code !== "PGRST116") {
      setError(dailyError.message);
      setLoading(false);
      return;
    }
    setOrders((ordersData ?? []) as Order[]);
    setTables((tableData ?? []) as TableStatus[]);
    if (dailyData?.total !== undefined) {
      const dbTotal = dailyData.total ?? 0;
      const next = dbTotal >= localTotal ? dbTotal : localTotal;
      setDailyTotal(next);
      if (dbTotal < localTotal) {
        await client.from("daily_stats").upsert({ day: todayKey, total: localTotal });
      }
    }
    setError(null);
    setLoading(false);
  }, [client, todayKey, readLocalTotal]);

  useEffect(() => {
    const saved = window.localStorage.getItem("qr-order-admin");
    if (saved && saved === adminCode) {
      setIsAdmin(true);
    }
  }, [adminCode]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchOrders();
  }, [fetchOrders, isAdmin]);

  useEffect(() => {
    if (!client || !isAdmin) return;
    const channel = client
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchOrders()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_items" },
        () => fetchOrders()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "table_status" },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [client, fetchOrders, isAdmin]);

  const refreshDailyTotal = async () => {
    if (!client) return;
    const localTotal = readLocalTotal();
    const { data, error: readError } = await client
      .from("daily_stats")
      .select("total")
      .eq("day", todayKey)
      .single();
    if (readError && readError.code !== "PGRST116") {
      setNotice(`刷新失败：${readError.message}`);
      return;
    }
    if (data?.total !== undefined) {
      const dbTotal = data.total ?? 0;
      const next = dbTotal >= localTotal ? dbTotal : localTotal;
      setDailyTotal(next);
      if (dbTotal < localTotal) {
        await client.from("daily_stats").upsert({ day: todayKey, total: localTotal });
      }
      setNotice("金额已刷新");
      return;
    }
    const { data: latest, error: latestError } = await client
      .from("daily_stats")
      .select("total")
      .order("day", { ascending: false })
      .limit(1)
      .single();
    if (latestError && latestError.code !== "PGRST116") {
      setNotice(`刷新失败：${latestError.message}`);
      return;
    }
    const latestTotal = latest?.total ?? 0;
    const next = latestTotal >= localTotal ? latestTotal : localTotal;
    setDailyTotal(next);
    if (latestTotal < localTotal) {
      await client.from("daily_stats").upsert({ day: todayKey, total: localTotal });
    }
    setNotice("金额已刷新");
  };

  const updateStatus = async (
    tableCode: string,
    status: Order["status"],
    tableOrders: Order[],
    tableTotal: number
  ) => {
    if (!client) return;
    if (status === "done") {
      setDailyTotal((prev) => {
        const next = prev + tableTotal;
        writeLocalTotal(next);
        return next;
      });
      const { error: dailyError } = await client.rpc("add_daily_total", {
        amount: tableTotal,
      });
      if (dailyError) {
        const { data: current, error: readError } = await client
          .from("daily_stats")
          .select("total")
          .eq("day", todayKey)
          .single();
        if (readError && readError.code !== "PGRST116") {
          setNotice(`更新失败：${dailyError.message}`);
          return;
        }
        const nextTotal = (current?.total ?? 0) + tableTotal;
        const { error: upsertError } = await client
          .from("daily_stats")
          .upsert({ day: todayKey, total: nextTotal });
        if (upsertError) {
          setNotice(`更新失败：${upsertError.message}`);
          return;
        }
      }
      const { error: updateError } = await client
        .from("table_status")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("table_code", tableCode);
      if (updateError) {
        setNotice(`更新失败：${updateError.message}`);
        return;
      }
      setNotice(`已完成（+${formatJPY(tableTotal)}）`);
      fetchOrders();
      refreshDailyTotal();
      return;
    }

    const { error: updateError } = await client
      .from("table_status")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("table_code", tableCode);
    if (updateError) {
      setNotice(`更新失败：${updateError.message}`);
      return;
    }
    setNotice(`已更新为：${STATUS_LABEL[status]}`);
    fetchOrders();
  };

  const deleteOrderItem = async (itemId: string, orderId: string) => {
    if (!client) return;
    const { error: deleteError } = await client
      .from("order_items")
      .delete()
      .eq("id", itemId);
    if (deleteError) {
      setNotice(`删除失败：${deleteError.message}`);
      return;
    }
    const { data: remaining, error: remainingError } = await client
      .from("order_items")
      .select("price,qty")
      .eq("order_id", orderId);
    if (remainingError) {
      setNotice(`删除成功，但重新计算失败：${remainingError.message}`);
      fetchOrders();
      return;
    }
    const nextTotal = (remaining ?? []).reduce(
      (sum, row) => sum + (row.price ?? 0) * (row.qty ?? 0),
      0
    );
    if (nextTotal === 0) {
      await client.from("orders").delete().eq("id", orderId);
    } else {
      await client.from("orders").update({ total: nextTotal }).eq("id", orderId);
    }
    setNotice("已删除商品");
    fetchOrders();
  };

  const deleteTable = async (tableCode: string) => {
    if (!client) return;
    // Optimistic UI: remove immediately
    setTables((prev) => prev.filter((t) => t.table_code !== tableCode));
    setOrders((prev) => prev.filter((o) => o.table_code !== tableCode));
    const { error: deleteOrders } = await client
      .from("orders")
      .delete()
      .eq("table_code", tableCode);
    if (deleteOrders) {
      setNotice(`删除失败：${deleteOrders.message}`);
      fetchOrders();
      return;
    }
    const { error: deleteTableStatus } = await client
      .from("table_status")
      .delete()
      .eq("table_code", tableCode);
    if (deleteTableStatus) {
      setNotice(`删除失败：${deleteTableStatus.message}`);
      fetchOrders();
      return;
    }
    setNotice(`已删除桌号 ${tableCode}`);
  };

  const resetDailyTotal = async () => {
    if (!client) return;
    const { error: resetError } = await client
      .from("daily_stats")
      .upsert({ day: todayKey, total: 0 });
    if (resetError) {
      setNotice(`清零失败：${resetError.message}`);
      return;
    }
    setDailyTotal(0);
    writeLocalTotal(0);
    setNotice("今日金额已清零");
  };

  const ordersByTable = useMemo(() => {
    const map = new Map<string, Order[]>();
    orders.forEach((order) => {
      const list = map.get(order.table_code) ?? [];
      list.push(order);
      map.set(order.table_code, list);
    });
    return map;
  }, [orders]);

  const totalCount = useMemo(
    () => orders.reduce((sum, order) => sum + (order.order_items?.length ?? 0), 0),
    [orders]
  );

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-transparent text-neutral-900">
        <div className="max-w-md mx-auto px-5 pt-12">
          <div className="rounded-3xl bg-white border border-[#F3D9B5] p-6 shadow-sm text-center relative">
            <div className="text-xl font-black">后台登录</div>
            <div className="text-xs text-neutral-500 mt-2">
              请输入管理员口令
            </div>
            <input
              className="mt-4 w-full h-11 rounded-2xl border border-[#F3D9B5] px-3 text-sm"
              placeholder="管理员口令"
              value={passcode}
              onChange={(event) => setPasscode(event.target.value)}
            />
            <button
              className="mt-4 w-full h-11 rounded-2xl bg-[#F59E0B] text-white font-black"
              onClick={() => {
                if (!adminCode || passcode !== adminCode) {
                  alert("口令错误");
                  return;
                }
                window.localStorage.setItem("qr-order-admin", passcode);
                setIsAdmin(true);
              }}
            >
              进入后台
            </button>
            <Link
              href={`/t/${tableCode}`}
              className="absolute left-6 bottom-6 text-xs underline text-neutral-500"
            >
              返回
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent text-neutral-900">
      <div className="max-w-md mx-auto px-5 pt-8 pb-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-neutral-500">后厨 / 店员</div>
            <h1 className="text-2xl font-black tracking-tight">订单列表</h1>
            <div className="text-xs text-neutral-400 mt-1">
              共 {orders.length} 单 · {totalCount} 项
            </div>
          </div>
          <Link href="/" className="text-sm underline">
            返回首页
          </Link>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              className="h-9 px-3 rounded-xl border border-[#F3D9B5] bg-white text-sm"
              type="button"
            >
              刷新
            </button>
            <button
              onClick={() => {
                window.localStorage.removeItem("qr-order-admin");
                setIsAdmin(false);
                setPasscode("");
              }}
              className="h-9 px-3 rounded-xl border border-[#F3D9B5] bg-white text-sm"
              type="button"
            >
              退出
            </button>
          </div>
          {notice ? (
            <div className="mt-2 text-xs text-neutral-500">{notice}</div>
          ) : null}
        </div>

        {loading ? (
          <div className="mt-6 text-sm text-neutral-500">正在加载订单...</div>
        ) : error ? (
          <div className="mt-6 text-sm text-rose-600">错误：{error}</div>
        ) : tables.length === 0 ? (
          <div className="mt-6 text-sm text-neutral-500">暂无订单</div>
        ) : (
          <div className="mt-6 space-y-4">
            {tables.map((table) => {
              const tableOrders = ordersByTable.get(table.table_code) ?? [];
              const tableTotal = tableOrders.reduce(
                (sum, order) => sum + order.total,
                0
              );
              return (
              <div
                key={table.table_code}
                className="rounded-3xl bg-white border border-[#F3D9B5] shadow-sm p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs text-neutral-500">
                      桌号 {table.table_code}
                    </div>
                    <div className="font-black">{STATUS_LABEL[table.status]}</div>
                    <div className="text-xs text-neutral-400 mt-1">
                      共 {tableOrders.length} 单
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-neutral-500">合计</div>
                    <div className="text-lg font-black">
                      {formatJPY(tableTotal)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <button
                    className="text-sm underline text-neutral-500"
                    onClick={() =>
                      setExpanded((prev) => ({
                        ...prev,
                        [table.table_code]: !prev[table.table_code],
                      }))
                    }
                    type="button"
                  >
                    {expanded[table.table_code] ? "收起详情" : "展开详情"}
                  </button>
                  {expanded[table.table_code]
                    ? tableOrders.map((order) => (
                        <div
                          key={order.id}
                          className="rounded-2xl border border-[#F3D9B5] p-3"
                        >
                          <div className="text-xs text-neutral-500">
                            订单 {order.id}
                          </div>
                          <div className="mt-2 space-y-1">
                              {order.order_items?.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between text-sm"
                                >
                                  <div className="text-neutral-700">
                                    {item.name} × {item.qty}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-neutral-500">
                                      {formatJPY(item.price * item.qty)}
                                    </div>
                                    <button
                                      className="text-xs underline text-neutral-400"
                                      onClick={() =>
                                        deleteOrderItem(item.id, item.order_id)
                                      }
                                      type="button"
                                    >
                                      删除
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))
                    : null}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() =>
                      updateStatus(table.table_code, "pending", tableOrders, tableTotal)
                    }
                    className="flex-1 h-9 rounded-xl border border-[#F3D9B5] bg-white text-sm"
                    type="button"
                  >
                    待处理
                  </button>
                  <button
                    onClick={() =>
                      updateStatus(table.table_code, "preparing", tableOrders, tableTotal)
                    }
                    className="flex-1 h-9 rounded-xl border border-[#F3D9B5] bg-white text-sm"
                    type="button"
                  >
                    制作中
                  </button>
                  <button
                    onClick={() =>
                      updateStatus(table.table_code, "done", tableOrders, tableTotal)
                    }
                    className="flex-1 h-9 rounded-xl bg-[#F59E0B] text-white text-sm font-black"
                    type="button"
                  >
                    已完成
                  </button>
                  <button
                    onClick={() => deleteTable(table.table_code)}
                    className="flex-1 h-9 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 text-sm font-black"
                    type="button"
                  >
                    删除
                  </button>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>

      <div className="phone-fixed daily-mini bg-white border border-[#F3D9B5] shadow-sm">
        <div className="text-xs text-neutral-500">今日已完成金额</div>
        <div className="text-lg font-black">{formatJPY(dailyTotal)}</div>
        <div className="mt-2 flex items-center gap-3">
          <button
            className="text-xs underline text-neutral-500"
            onClick={resetDailyTotal}
            type="button"
          >
            清零
          </button>
          <button
            className="text-xs underline text-neutral-500"
            onClick={refreshDailyTotal}
            type="button"
          >
            刷新
          </button>
        </div>
      </div>
    </main>
  );
}
