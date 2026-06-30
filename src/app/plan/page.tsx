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
import { NotebookModal } from "@/components/NotebookModal";
import { usePlanStore, useActivePlan } from "@/store/usePlanStore";
import { addDays, format, getDay } from "date-fns";
import { requestNotificationPermission, sendStudyReminder, registerServiceWorker } from "@/utils/notifications";
import { 
  Calendar, 
  BookOpen, 
  BarChart3, 
  Menu, 
  Settings as SettingsIcon, 
  Sparkles, 
  Layers, 
  Sun, 
  Moon, 
  Undo2, 
  Redo2, 
  Download, 
  Upload, 
  Trash2, 
  X 
} from "lucide-react";

function validatePlan(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  if (typeof d.id !== "string") return false;
  if (typeof d.title !== "string") return false;
  if (!Array.isArray(d.items)) return false;
  for (const item of d.items) {
    if (!item || typeof item !== "object") return false;
    const i = item as Record<string, unknown>;
    if (typeof i.id !== "string" || typeof i.date !== "string" || typeof i.topicId !== "string") return false;
  }
  return true;
}

export default function PlanPage() {
  const plan = useActivePlan();
  const hasHydrated = usePlanStore((s) => s.hasHydrated);
  const isSidebarOpen = usePlanStore((s) => s.isSidebarOpen);
  const theme = usePlanStore((s) => s.theme);
  const toggleTheme = usePlanStore((s) => s.toggleTheme);
  const recurringItems = usePlanStore((s) => s.recurringItems);
  const addPlanItems = usePlanStore((s) => s.addPlanItems);
  const clearPlan = usePlanStore((s) => s.clearPlan);
  const undo = usePlanStore((s) => s.undo);
  const redo = usePlanStore((s) => s.redo);
  const undoStack = usePlanStore((s) => s.undoStack);
  const redoStack = usePlanStore((s) => s.redoStack);
  const pdfSettings = usePlanStore((s) => s.pdfSettings);

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isPlanManagerOpen, setIsPlanManagerOpen] = useState(false);
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<"recurring" | null>(null);
  const recurringAppliedRef = useRef(false);

  // Mobile navigation and menu states
  const [mobileTab, setMobileTab] = useState<"plan" | "library" | "stats">("plan");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleClearPlan = useCallback(() => {
    if (confirm("Tüm planınızı sıfırlamak istediğinize emin misiniz? Bu işlem geri alınabilir.")) {
      setIsMobileMenuOpen(false);
      clearPlan();
    }
  }, [clearPlan]);

  const handleExportPlan = useCallback(() => {
    setIsMobileMenuOpen(false);
    const dataStr = JSON.stringify(plan, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${plan.title.toLowerCase().replace(/\s+/g, "-")}-yedek.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [plan]);

  const handleImportPlan = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIsMobileMenuOpen(false);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (!validatePlan(importedData)) {
          alert("Geçersiz dosya formatı. Plan şeması uygun değil (id, title, items gereklidir).");
          return;
        }
        if (confirm("Bu yedek dosyasını yüklemek mevcut planınızı silecektir. Devam etmek istiyor musunuz?")) {
          usePlanStore.setState((s) => ({ plans: [importedData], activePlanId: importedData.id }));
          alert("Plan başarıyla yüklendi!");
        }
      } catch {
        alert("Dosya okunurken bir hata oluştu. Lütfen geçerli bir JSON dosyası seçin.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, []);

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
        setIsMobileMenuOpen(false);
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
        onOpenNotebookModal={() => setIsNotebookModalOpen(true)}
      />

      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        
        {/* Countdown - Hide on mobile if library or stats tab is active */}
        <div className={mobileTab === "plan" ? "block" : "hidden lg:block"}>
          <Countdown targetDateStr={hasHydrated ? plan.examDate : "2027-06-19"} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20 lg:pb-0">
          
          {/* Sidebar (Topic selector) - Desktop Only */}
          {isSidebarOpen && (
            <div className="hidden lg:block lg:col-span-3 space-y-4">
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

          {/* Planner Views - Shown on mobile only under 'plan' tab */}
          <div className={`${
            isSidebarOpen ? "lg:col-span-6" : "lg:col-span-8"
          } w-full h-full flex flex-col gap-4 ${mobileTab === "plan" ? "block" : "hidden lg:block"}`}>
            <PlannerViews />
          </div>

          {/* Library (Topic Selector) - Mobile Only under 'library' tab */}
          <div className={`w-full space-y-4 lg:hidden ${mobileTab === "library" ? "block" : "hidden"}`}>
            <TopicSelector />
            <button
              onClick={() => setActivePanel(activePanel === "recurring" ? null : "recurring")}
              className={`w-full text-xs font-bold py-3.5 bg-neutral-900 border border-neutral-850 rounded-2xl text-neutral-400 hover:text-white transition-all cursor-pointer`}
            >
              {activePanel === "recurring" ? "🔁 Tekrarlayanları Gizle" : "🔁 Tekrarlayan Çalışmalar"}
            </button>
            {activePanel === "recurring" && <RecurringItems />}
          </div>

          {/* Stats Panel - Desktop default, Mobile under 'stats' tab */}
          <div className={`${
            isSidebarOpen ? "lg:col-span-3" : "lg:col-span-4"
          } space-y-4 ${mobileTab === "stats" ? "block" : "hidden lg:block"}`}>
            {!isStatsOpen && <StatsPanel />}
          </div>
        </div>
      </main>

      <TemplateLoader isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} />
      <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <PlanManager isOpen={isPlanManagerOpen} onClose={() => setIsPlanManagerOpen(false)} />
      <NotebookModal isOpen={isNotebookModalOpen} onClose={() => setIsNotebookModalOpen(false)} />

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

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/90 border-t border-neutral-900 backdrop-blur-md px-4 pb-[calc(8px+env(safe-area-inset-bottom,0px))] pt-2.5 flex items-center justify-around lg:hidden shadow-[0_-8px_30px_rgb(0,0,0,0.5)]">
        <button
          onClick={() => setMobileTab("plan")}
          className={`flex flex-col items-center gap-1.5 py-1 px-3 transition-colors cursor-pointer ${
            mobileTab === "plan" ? "text-indigo-400 font-bold" : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Planım</span>
        </button>

        <button
          onClick={() => setMobileTab("library")}
          className={`flex flex-col items-center gap-1.5 py-1 px-3 transition-colors cursor-pointer ${
            mobileTab === "library" ? "text-indigo-400 font-bold" : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Ders Ekle</span>
        </button>

        <button
          onClick={() => setMobileTab("stats")}
          className={`flex flex-col items-center gap-1.5 py-1 px-3 transition-colors cursor-pointer ${
            mobileTab === "stats" ? "text-indigo-400 font-bold" : "text-neutral-500 hover:text-neutral-300"
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] font-semibold">İstatistik</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1.5 py-1 px-3 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-semibold">İşlemler</span>
        </button>
      </div>

      {/* Mobile Menu Bottom Sheet */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex items-end justify-center">
          {/* Overlay background */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sheet container */}
          <div className="relative w-full bg-neutral-950 border-t border-neutral-900 rounded-t-3xl p-6 space-y-6 max-h-[85vh] overflow-y-auto z-10 shadow-2xl transition-all duration-300 transform translate-y-0 pb-[calc(24px+env(safe-area-inset-bottom,0px))]">
            
            {/* Grab handle/indicator bar */}
            <div className="w-12 h-1 bg-neutral-800 rounded-full mx-auto -mt-2 mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white tracking-tight">Hızlı İşlemler</h3>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-lg bg-neutral-900 border border-neutral-850 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action Grid */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsTemplateModalOpen(true); }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-neutral-900/60 border border-neutral-850 text-center hover:bg-neutral-900 hover:border-neutral-800 transition-all cursor-pointer gap-2"
              >
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-bold text-neutral-200">Şablon Yükle</span>
              </button>

              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsNotebookModalOpen(true); }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-neutral-900/60 border border-neutral-850 text-center hover:bg-neutral-900 hover:border-neutral-800 transition-all cursor-pointer gap-2"
              >
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold text-neutral-200">Defter Oluştur</span>
              </button>

              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsPlanManagerOpen(true); }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-neutral-900/60 border border-neutral-850 text-center hover:bg-neutral-900 hover:border-neutral-800 transition-all cursor-pointer gap-2"
              >
                <Layers className="w-5 h-5 text-cyan-400" />
                <span className="text-xs font-bold text-neutral-200">Plan Yöneticisi</span>
              </button>

              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsSettingsOpen(true); }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-neutral-900/60 border border-neutral-850 text-center hover:bg-neutral-900 hover:border-neutral-800 transition-all cursor-pointer gap-2"
              >
                <SettingsIcon className="w-5 h-5 text-pink-400" />
                <span className="text-xs font-bold text-neutral-200">Ayarlar</span>
              </button>

              <button
                onClick={() => { toggleTheme(); }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-neutral-900/60 border border-neutral-850 text-center hover:bg-neutral-900 hover:border-neutral-800 transition-all cursor-pointer gap-2"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold text-neutral-200">Gündüz Teması</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-bold text-neutral-200">Karanlık Tema</span>
                  </>
                )}
              </button>

              <button
                onClick={handleClearPlan}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 hover:border-red-500/20 text-center transition-all cursor-pointer gap-2"
              >
                <Trash2 className="w-5 h-5 text-red-400" />
                <span className="text-xs font-bold text-red-400">Planı Temizle</span>
              </button>
            </div>

            {/* Sub-group: Undo / Redo & Backup */}
            <div className="space-y-3 pt-2">
              {/* Undo / Redo Row */}
              <div className="flex items-center gap-3">
                <button
                  onClick={undo}
                  disabled={undoStack.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-neutral-850 bg-neutral-900/40 text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-xs font-bold"
                >
                  <Undo2 className="w-4 h-4 text-indigo-400" />
                  <span>Geri Al</span>
                </button>
                <button
                  onClick={redo}
                  disabled={redoStack.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-neutral-850 bg-neutral-900/40 text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer text-xs font-bold"
                >
                  <Redo2 className="w-4 h-4 text-indigo-400" />
                  <span>İleri Al</span>
                </button>
              </div>

              {/* JSON Backup Row */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportPlan}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-neutral-850 bg-neutral-900/40 text-neutral-300 hover:text-white transition-all cursor-pointer text-xs font-bold"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Yedek İndir (JSON)</span>
                </button>
                <label
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-neutral-850 bg-neutral-900/40 text-neutral-300 hover:text-white transition-all cursor-pointer text-xs font-bold text-center"
                >
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>Yedek Yükle</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportPlan}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
