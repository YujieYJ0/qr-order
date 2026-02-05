"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TableSelectPage() {
  const router = useRouter();
  const tableOptions = ["1", "2", "3", "4", "5"];
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <main className="min-h-screen bg-transparent">
      <div className="fixed inset-0 z-50 grid place-items-center">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative w-[92%] max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-[#F3D9B5]">
          <div className="text-lg font-black">请选择桌号</div>
          <div className="text-xs text-neutral-500 mt-2">
            请选择桌号后进入点餐页面
          </div>
          <div className="mt-5 grid grid-cols-5 gap-2">
            {tableOptions.map((code) => (
              <button
                key={code}
                className="h-11 rounded-2xl border border-[#F3D9B5] bg-white font-black"
                onClick={() => {
                  window.localStorage.setItem("qr-order-table", code);
                  router.push(`/t/${code}`);
                }}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
