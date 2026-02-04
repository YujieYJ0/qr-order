import { getSupabaseClient } from "./supabaseClient";
import type { MenuItem } from "./menu";

export type OrderInput = {
  tableCode: string;
  items: Array<{ item: MenuItem; qty: number }>;
  total: number;
};

export async function createOrder(input: OrderInput) {
  const client = getSupabaseClient();
  if (!client) {
    return { ok: false, error: "Supabase 未配置" };
  }

  const { error: tableError } = await client
    .from("table_status")
    .upsert({
      table_code: input.tableCode,
      status: "pending",
    });
  if (tableError) {
    return { ok: false, error: tableError.message ?? "更新桌号状态失败" };
  }

  const { data: order, error: orderError } = await client
    .from("orders")
    .insert({
      table_code: input.tableCode,
      status: "pending",
      total: input.total,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { ok: false, error: orderError?.message ?? "创建订单失败" };
  }

  const orderItems = input.items.map(({ item, qty }) => ({
    order_id: order.id,
    item_id: item.id,
    name: item.name,
    price: item.price,
    qty,
  }));

  const { error: itemsError } = await client.from("order_items").insert(orderItems);
  if (itemsError) {
    return { ok: false, error: itemsError.message ?? "创建订单明细失败" };
  }

  return { ok: true, orderId: order.id as string };
}
