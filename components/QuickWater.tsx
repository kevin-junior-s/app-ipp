"use client";

import { useState, useTransition } from "react";
import { addWater } from "@/lib/actions/logs";
import { Ring } from "@/components/Ring";

export function QuickWater({ currentMl, goalMl }: { currentMl: number; goalMl: number }) {
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState(0);
  const shown = currentMl + optimistic;

  function add(ml: number) {
    setOptimistic((o) => o + ml);
    startTransition(async () => {
      await addWater(ml);
      setOptimistic(0);
    });
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <Ring progress={goalMl > 0 ? shown / goalMl : 0} color="var(--color-ios-teal)" size={68} />
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold num">
          {shown.toLocaleString("id-ID")} <span className="text-secondary font-normal">/ {goalMl.toLocaleString("id-ID")} ml</span>
        </p>
        <div className="flex gap-2 mt-2">
          <button type="button" onClick={() => add(250)} disabled={pending} className="btn-secondary flex-1 px-2 num">
            +250 ml
          </button>
          <button type="button" onClick={() => add(500)} disabled={pending} className="btn-secondary flex-1 px-2 num">
            +500 ml
          </button>
        </div>
      </div>
    </div>
  );
}
