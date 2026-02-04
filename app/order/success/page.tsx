"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

function OrderSuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId") ?? "";
  const table = params.get("table");
  const backHref = table ? `/t/${table}` : "/";

  return (
    <main className="min-h-screen bg-transparent text-neutral-900">
      <div className="max-w-md mx-auto px-5 pt-12">
        <div className="rounded-3xl bg-white border border-[#F3D9B5] p-6 shadow-sm text-center">
          <div className="text-2xl font-black">下单成功</div>
          <div className="text-xs text-neutral-500 mt-2">订单号</div>
          <div className="mt-2 font-mono text-sm break-all">{orderId}</div>

          <div className="mt-6 flex flex-col gap-2">
            <Link
              href={backHref}
              className="h-11 rounded-2xl bg-[#F59E0B] text-white font-black grid place-items-center shadow-sm"
            >
              继续点餐
            </Link>
            <Link href="/kitchen" className="text-sm underline text-neutral-500">
              查看订单列表
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-transparent" />}>
      <OrderSuccessContent />
    </Suspense>
  );
}
