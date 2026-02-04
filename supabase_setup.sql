-- Supabase setup (clean, non-duplicated)
-- Run this once in Supabase SQL Editor.

-- Orders
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "allow public insert orders" on public.orders;
drop policy if exists "allow public insert order_items" on public.order_items;
drop policy if exists "allow public select orders" on public.orders;
drop policy if exists "allow public select order_items" on public.order_items;

create policy "allow public insert orders"
on public.orders
for insert
to public
with check (true);

create policy "allow public insert order_items"
on public.order_items
for insert
to public
with check (true);

create policy "allow public select orders"
on public.orders
for select
to public
using (true);

create policy "allow public select order_items"
on public.order_items
for select
to public
using (true);

grant select, insert, update on public.orders to anon, authenticated;
grant select, insert, update on public.order_items to anon, authenticated;
grant usage on schema public to anon, authenticated;

-- Table status
create table if not exists public.table_status (
  table_code text primary key,
  status text not null default 'pending',
  updated_at timestamptz not null default now()
);

alter table public.table_status enable row level security;

drop policy if exists "allow public insert table_status" on public.table_status;
drop policy if exists "allow public update table_status" on public.table_status;
drop policy if exists "allow public select table_status" on public.table_status;

create policy "allow public insert table_status"
on public.table_status
for insert
to public
with check (true);

create policy "allow public update table_status"
on public.table_status
for update
to public
using (true)
with check (true);

create policy "allow public select table_status"
on public.table_status
for select
to public
using (true);

grant select, insert, update on public.table_status to anon, authenticated;

-- Daily stats
create table if not exists public.daily_stats (
  day date primary key,
  total int not null default 0
);

alter table public.daily_stats enable row level security;

drop policy if exists "allow public select daily_stats" on public.daily_stats;
drop policy if exists "allow public insert daily_stats" on public.daily_stats;
drop policy if exists "allow public update daily_stats" on public.daily_stats;

create policy "allow public select daily_stats"
on public.daily_stats
for select
to public
using (true);

create policy "allow public insert daily_stats"
on public.daily_stats
for insert
to public
with check (true);

create policy "allow public update daily_stats"
on public.daily_stats
for update
to public
using (true)
with check (true);

grant select, insert, update on public.daily_stats to anon, authenticated;

-- Daily total increment function
create or replace function public.add_daily_total(amount int)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.daily_stats(day, total)
  values (current_date, amount)
  on conflict (day) do update
  set total = public.daily_stats.total + excluded.total;
end;
$$;

grant execute on function public.add_daily_total(int) to anon, authenticated;
