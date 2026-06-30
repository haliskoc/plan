"use client";

import React from "react";
import { usePlanStore } from "@/store/usePlanStore";
import { DailyView } from "./DailyView";
import { WeeklyView } from "./WeeklyView";
import { MonthlyView } from "./MonthlyView";
import { Calendar, CalendarDays, CalendarRange, PanelLeftClose, PanelLeftOpen } from "lucide-react";

export const PlannerViews = React.memo(function PlannerViews() {
  const viewMode = usePlanStore((s) => s.viewMode);
  const setViewMode = usePlanStore((s) => s.setViewMode);
  const isSidebarOpen = usePlanStore((s) => s.isSidebarOpen);
  const setIsSidebarOpen = usePlanStore((s) => s.setIsSidebarOpen);

  const tabs = [
    { id: "gunluk" as const, name: "Günlük", icon: Calendar },
    { id: "haftalik" as const, name: "Haftalık", icon: CalendarRange },
    { id: "aylik" as const, name: "Aylık", icon: CalendarDays },
  ];

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between gap-4 shrink-0">
        <div className="flex p-1 bg-neutral-950/90 border border-neutral-900 rounded-2xl w-max">
          {tabs.map((tab) => {
            const isActive = viewMode === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-neutral-950/90 border border-neutral-900 text-neutral-400 hover:text-neutral-200 hover:border-neutral-850 transition-all cursor-pointer shadow-xs select-none"
          title={isSidebarOpen ? "Konu Kütüphanesini Kapat" : "Konu Kütüphanesini Aç"}
        >
          {isSidebarOpen ? (
            <>
              <PanelLeftClose className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Kütüphaneyi Gizle</span>
            </>
          ) : (
            <>
              <PanelLeftOpen className="w-4 h-4 text-indigo-400" />
              <span>Konu Kütüphanesi</span>
            </>
          )}
        </button>
      </div>

      <div className="flex-1 min-h-0">
        {viewMode === "gunluk" && <DailyView />}
        {viewMode === "haftalik" && <WeeklyView />}
        {viewMode === "aylik" && <MonthlyView />}
      </div>
    </div>
  );
});

export default PlannerViews;
