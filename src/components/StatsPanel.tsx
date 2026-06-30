"use client";

import React, { useMemo } from "react";
import { usePlanStore } from "@/store/usePlanStore";
import { BarChart3, Flame, Clock, CheckCircle, Target, TrendingUp } from "lucide-react";
import { format, subDays, parseISO, differenceInDays } from "date-fns";
import { tr } from "date-fns/locale";

export function StatsPanel() {
  const { plan, goals } = usePlanStore();

  const stats = useMemo(() => {
    const items = plan.items;
    const totalItems = items.length;
    const completedItems = items.filter((i) => i.status === "tamamlandi").length;
    const totalMinutes = items.reduce((s, i) => s + i.durationMinutes, 0);

    const last7Days: { date: string; minutes: number; completed: number }[] = [];
    for (let d = 6; d >= 0; d--) {
      const date = format(subDays(new Date(), d), "yyyy-MM-dd");
      const dayItems = items.filter((i) => i.date === date);
      const minutes = dayItems.reduce((s, i) => s + i.durationMinutes, 0);
      const completed = dayItems.filter((i) => i.status === "tamamlandi").length;
      last7Days.push({ date, minutes, completed });
    }

    let streak = 0;
    for (let d = 0; d < 30; d++) {
      const date = format(subDays(new Date(), d), "yyyy-MM-dd");
      const dayCompleted = items.filter((i) => i.date === date && i.status === "tamamlandi").length;
      if (dayCompleted > 0) streak++;
      else break;
    }

    return { totalItems, completedItems, totalMinutes, last7Days, streak };
  }, [plan.items]);

  const maxMinutes = Math.max(1, ...stats.last7Days.map((d) => d.minutes), goals.dailyMinutes);

  return (
    <div className="bg-neutral-950/90 border border-neutral-900 rounded-2xl p-5 shadow-xl">
      <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-indigo-400" />
        İstatistikler
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-3 text-center">
          <div className="flex justify-center mb-1">
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">{stats.streak}</div>
          <div className="text-[10px] text-neutral-500">gün seri</div>
        </div>
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-3 text-center">
          <div className="flex justify-center mb-1">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">{stats.completedItems}/{stats.totalItems}</div>
          <div className="text-[10px] text-neutral-500">tamamlanan konu</div>
        </div>
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-3 text-center">
          <div className="flex justify-center mb-1">
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">{Math.round(stats.totalMinutes / 60)}</div>
          <div className="text-[10px] text-neutral-500">saat çalışma</div>
        </div>
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-3 text-center">
          <div className="flex justify-center mb-1">
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">{goals.dailyMinutes / 60}s</div>
          <div className="text-[10px] text-neutral-500">günlük hedef</div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-neutral-400 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            Son 7 Gün Çalışma Süresi
          </span>
          <span className="text-[10px] text-neutral-600">hedef: {goals.dailyMinutes / 60} saat/gün</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5 items-end h-32">
          {stats.last7Days.map((day) => {
            const heightPercent = Math.max(4, (day.minutes / maxMinutes) * 100);
            const isToday = day.date === format(new Date(), "yyyy-MM-dd");
            const dayName = format(parseISO(day.date), "EEE", { locale: tr });
            return (
              <div key={day.date} className="flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-[9px] font-bold text-neutral-400 font-mono">
                  {Math.round(day.minutes / 60)}s
                </span>
                <div
                  className={`w-full max-w-[32px] rounded-t-md transition-all ${
                    day.minutes >= goals.dailyMinutes
                      ? "bg-emerald-500"
                      : day.minutes > 0
                        ? "bg-indigo-500/70"
                        : "bg-neutral-800"
                  } ${isToday ? "ring-1 ring-white/20" : ""}`}
                  style={{ height: `${heightPercent}%` }}
                />
                <span className={`text-[9px] font-semibold ${isToday ? "text-white" : "text-neutral-500"}`}>
                  {dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
