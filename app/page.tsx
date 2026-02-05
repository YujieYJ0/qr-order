"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TableSelectPage() {
  const router = useRouter();
  const tableOptions = ["1", "2", "3", "4", "5"];
  const peopleOptions = ["1", "2", "3", "4", "5"];
  const [ready, setReady] = useState(false);
  const [tableCode, setTableCode] = useState<string | null>(null);
  const [peopleCount, setPeopleCount] = useState<string | null>(null);

  useEffect(() => {
    setReady(true);
  }, []);

  const tryEnter = (nextTable: string | null, nextPeople: string | null) => {
    if (!nextTable || !nextPeople) return;
    window.localStorage.setItem("qr-order-table", nextTable);
    window.localStorage.setItem("qr-order-people", nextPeople);
    router.push(`/t/${nextTable}`);
  };

  if (!ready) return null;

  return (
    <main className="min-h-screen bg-transparent">
      <div className="fixed inset-0 z-50 grid place-items-center p-6">
        <div className="absolute inset-0 bg-[#CFC6BF] opacity-90" />
        <div className="relative translate-y-[300px] w-full max-w-sm rounded-3xl bg-[#FFFDF9] p-6 shadow-2xl border border-[#E7C9A4] text-[#5A3A2E]">
          <div className="text-lg font-black">请选择桌号</div>
          <div className="text-xs text-[#8B6A5A] mt-2">
            请选择桌号后进入点餐页面
          </div>
          <div className="mt-5 grid grid-cols-5 gap-2">
            {tableOptions.map((code) => (
              <button
                key={code}
                className={`h-11 rounded-2xl border font-black ${
                  tableCode === code
                    ? "border-[#C76A00] bg-[#FFF2E1] text-[#C76A00]"
                    : "border-[#E7C9A4] bg-white text-[#5A3A2E]"
                }`}
                onClick={() => {
                  setTableCode(code);
                  tryEnter(code, peopleCount);
                }}
              >
                {code}
              </button>
            ))}
          </div>
          <div className="mt-6 text-lg font-black">请选择人数</div>
          <div className="text-xs text-[#8B6A5A] mt-2">
            请选择人数后进入点餐页面
          </div>
          <div className="mt-5 grid grid-cols-5 gap-2">
            {peopleOptions.map((count) => (
              <button
                key={count}
                className={`h-11 rounded-2xl border font-black ${
                  peopleCount === count
                    ? "border-[#C76A00] bg-[#FFF2E1] text-[#C76A00]"
                    : "border-[#E7C9A4] bg-white text-[#5A3A2E]"
                }`}
                onClick={() => {
                  setPeopleCount(count);
                  tryEnter(tableCode, count);
                }}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
