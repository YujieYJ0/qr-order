import { MENU, type MenuItem } from "./menu";
import { getSupabaseClient } from "./supabaseClient";

export type MenuSource = "local" | "supabase";

export async function fetchMenuItems(): Promise<{
  items: MenuItem[];
  source: MenuSource;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { items: MENU, source: "local" };
  }

  const { data, error } = await client.from("menu_items").select("*");
  if (error || !data) {
    return { items: MENU, source: "local" };
  }

  const items = data.map((row: any) => ({
    id: String(row.id),
    cat: row.cat,
    name: row.name,
    price: Number(row.price ?? 0),
    sold: row.sold ?? undefined,
    desc: row.desc ?? undefined,
    img: row.img ?? undefined,
    calories: row.calories ?? undefined,
    rating: row.rating ?? undefined,
    time: row.time ?? undefined,
    ingredients: Array.isArray(row.ingredients) ? row.ingredients : undefined,
  })) as MenuItem[];

  return { items, source: "supabase" };
}
