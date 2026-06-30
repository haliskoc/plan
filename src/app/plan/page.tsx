"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "@/components/Header";
import { Countdown } from "@/components/Countdown";
import { TopicSelector } from "@/components/TopicSelector";
import { PlannerViews } from "@/components/PlannerViews";
import { TemplateLoader } from "@/components/TemplateLoader";
import { Settings } from "@/components/Settings";
import { StatsPanel } from "@/components/StatsPanel";
import { RecurringItems } from "@/components/RecurringItems";
import { PlanManager } from "@/components/PlanManager";
import { usePlanStore, useActivePlan } from "@/store/usePlanStore";
import { addDays, format, getDay } from "date-fns";
import { requestNotificationPermission, sendStudyReminder, registerServiceWorker } from "@/utils/notifications";

export default function PlanPage() {
  const plan = useActivePlan();
  const hasHydrated = usePlanStore((s) => s.hasHydrated);
  const isSidebarOpen = usePlanStore((s) => s.isSidebarOpen);
  const theme = usePlanStore((s) => s.theme);
  const recurringItems = usePlanStore((s) => s.recurringItems);
  const addPlanItems = usePlanStore((s) => s.addPlanItems);
  const pdfSettings = usePlanStore((s) => s.pdfSettings);

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isPlanManagerOpen, setIsPlanManagerOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<"recurring" | null>(null);
  const recurringAppliedRef = useRef(false);

  const processRecurringItems = useCallback(() => {
    if (!hasHydrated || recurringAppliedRef.current) return;
    recurringAppliedRef.current = true;
    const today = new Date();
    const itemsToAdd: Parameters<typeof addPlanItems>[0] = [];

    const scheduledIndex = new Set<string>();
    for (const item of plan.items) {
      scheduledIndex.add(`${item.date}|${item.topicId}`);
    }

    for (let d = 0; d < 28; d++) {
      const date = addDays(today, d);
      const dayOfWeek = getDay(date);
      const dateStr = format(date, "yyyy-MM-dd");

      recurringItems.forEach((rec) => {
        if (!rec.active) return;
        if (rec.daysOfWeek.includes(dayOfWeek)) {
          const key = `${dateStr}|${rec.topicId}`;
          const alreadyScheduled = scheduledIndex.has(key) || itemsToAdd.some(
            (item) => item.date === dateStr && item.topicId === rec.topicId
          );
          if (!alreadyScheduled) {
            itemsToAdd.push({
              date: dateStr,
              topicId: rec.topicId,
              durationMinutes: rec.durationMinutes,
              status: "yapilacak",
              note: rec.note || "Tekrarlayan oturum",
            });
          }
        }
      });
    }

    if (itemsToAdd.length > 0) {
      addPlanItems(itemsToAdd);
    }
  }, [hasHydrated, recurringItems, plan.items, addPlanItems]);

  useEffect(() => {
    const timer = setTimeout(processRecurringItems, 1000);
    return () => clearTimeout(timer);
  }, [processRecurringItems]);

  // PWA + Notifications
  useEffect(() => {
    registerServiceWorker();
    requestNotificationPermission();
    const reminderInterval = setInterval(sendStudyReminder, 60000);
    return () => clearInterval(reminderInterval);
  }, []);

  // Theme class management
  useEffect(() => {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === "Escape") {
        setIsStatsOpen(false);
        setIsSettingsOpen(false);
        setIsPlanManagerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen text-neutral-200 flex flex-col selection:bg-indigo-500/30 selection:text-white relative">
      {hasHydrated && pdfSettings.backgroundImage && (
        <div 
          className="fixed inset-0 w-full h-full -z-50 pointer-events-none transition-opacity duration-300"
          style={{
            backgroundImage: `url(${pdfSettings.backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: (pdfSettings.backgroundOpacity || 15) / 100,
          }}
        />
      )}

      <Header
        onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenPlanManager={() => setIsPlanManagerOpen(true)}
      />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        <Countdown targetDateStr={hasHydrated ? plan.examDate : "2027-06-19"} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {isSidebarOpen && (
            <div className="lg:col-span-3 space-y-4">
              <TopicSelector />
              <button
                onClick={() => setActivePanel(activePanel === "recurring" ? null : "recurring")}
                className={`w-full text-xs font-bold py-2 rounded-xl transition-all cursor-pointer ${
                  activePanel === "recurring" ? "bg-indigo-600 text-white" : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                🔁 Tekrarlayan Çalışmalar
              </button>
              {activePanel === "recurring" && <RecurringItems />}
            </div>
          )}

          <div className={`${isSidebarOpen ? "lg:col-span-6" : "lg:col-span-8"} w-full h-full flex flex-col gap-4`}>
            <PlannerViews />
          </div>

          <div className={`${isSidebarOpen ? "lg:col-span-3" : "lg:col-span-4"} space-y-4`}>
            {!isStatsOpen && <StatsPanel />}
          </div>
        </div>
      </main>

      <TemplateLoader isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} />
      <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <PlanManager isOpen={isPlanManagerOpen} onClose={() => setIsPlanManagerOpen(false)} />

      {isStatsOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <StatsPanel />
            <button
              onClick={() => setIsStatsOpen(false)}
              className="mt-4 w-full py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-neutral-400 hover:text-white transition-all cursor-pointer"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
