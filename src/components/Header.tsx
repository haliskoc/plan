"use client";

import React from "react";
import { usePlanStore, useActivePlan } from "@/store/usePlanStore";
import { 
  BookOpen, 
  Trash2, 
  Download, 
  Upload, 
  Edit2, 
  Check, 
  Clock, 
  CheckCircle,
  Layers,
  Undo2,
  Redo2,
  SettingsIcon,
  BarChart3
} from "lucide-react";

interface HeaderProps {
  onOpenTemplateModal: () => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  onOpenPlanManager: () => void;
  onOpenNotebookModal: () => void;
}

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

export const Header = React.memo(function Header({ onOpenTemplateModal, onOpenSettings, onOpenStats, onOpenPlanManager, onOpenNotebookModal }: HeaderProps) {
  const plan = useActivePlan();
  const setPlanTitle = usePlanStore((s) => s.setPlanTitle);
  const clearPlan = usePlanStore((s) => s.clearPlan);
  const hasHydrated = usePlanStore((s) => s.hasHydrated);
  const undo = usePlanStore((s) => s.undo);
  const redo = usePlanStore((s) => s.redo);
  const undoStack = usePlanStore((s) => s.undoStack);
  const redoStack = usePlanStore((s) => s.redoStack);

  const [isEditingTitle, setIsEditingTitle] = React.useState(false);
  const [tempTitle, setTempTitle] = React.useState(plan.title);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (hasHydrated && mounted) {
      setTempTitle(plan.title);
    }
  }, [plan.title, hasHydrated, mounted]);

  const handleSaveTitle = React.useCallback(() => {
    if (tempTitle.trim()) {
      setPlanTitle(tempTitle.trim());
    }
    setIsEditingTitle(false);
  }, [tempTitle, setPlanTitle]);

  const handleClearPlan = React.useCallback(() => {
    if (confirm("Tüm planınızı sıfırlamak istediğinize emin misiniz? Bu işlem geri alınabilir.")) {
      clearPlan();
    }
  }, [clearPlan]);

  const handleExportPlan = React.useCallback(() => {
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

  const handleImportPlan = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Keyboard shortcuts
  const handleKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    },
    [undo, redo]
  );

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const stats = React.useMemo(() => {
    const items = plan.items;
    const total = items.length;
    const completed = items.filter((item) => item.status === "tamamlandi").length;
    const minutes = items.reduce((sum, item) => sum + item.durationMinutes, 0);
    return {
      totalItems: total,
      completedItems: completed,
      totalHours: Math.round(minutes / 60),
      completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [plan.items]);

  if (!mounted || !hasHydrated) {
    return (
      <header className="w-full bg-neutral-950/80 border-b border-neutral-900 sticky top-0 z-50 backdrop-blur-md px-6 py-4 flex items-center justify-between h-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/20 rounded-xl animate-pulse" />
          <div className="w-48 h-6 bg-neutral-800 rounded animate-pulse" />
        </div>
      </header>
    );
  }

  const { totalItems, completedItems, totalHours, completionPercentage } = stats;

  return (
    <header className="w-full bg-neutral-950/80 border-b border-neutral-900 sticky top-0 z-50 backdrop-blur-md px-4 sm:px-6 py-3 shadow-sm lg:hidden">
      <div className="max-w-[1600px] mx-auto flex flex-row items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/10 shrink-0">
            <BookOpen className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              {isEditingTitle ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                    className="bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1 text-sm font-semibold text-white focus:outline-hidden focus:border-indigo-500 w-36 sm:w-64"
                    autoFocus
                  />
                  <button 
                    onClick={handleSaveTitle}
                    className="p-1 rounded-md bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group min-w-0">
                  <h1 className="text-sm sm:text-lg font-bold text-white tracking-tight truncate max-w-[150px] sm:max-w-xs">
                    {plan.title}
                  </h1>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="p-1 rounded-md text-neutral-500 hover:text-neutral-300 hover:bg-neutral-950/50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <span className="text-[10px] sm:text-xs text-neutral-400 font-medium truncate">YKS 2027 Çalışma Odası</span>
          </div>
        </div>

        <div className="hidden lg:grid grid-cols-3 gap-2 sm:gap-4 bg-neutral-900/40 border border-neutral-800/80 px-3 py-2 rounded-xl max-w-md">
          <div className="flex flex-col items-center justify-center px-2">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-medium text-neutral-400 mb-0.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Konular</span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-white font-mono">
              {completedItems}/{totalItems}
            </span>
          </div>
          
          <div className="flex flex-col items-center justify-center px-2 border-x border-neutral-850">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-medium text-neutral-400 mb-0.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Süre</span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-white font-mono">
              {totalHours} sa
            </span>
          </div>

          <div className="flex flex-col items-center justify-center px-2">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-medium text-neutral-400 mb-0.5">
              <CheckCircle className="w-3.5 h-3.5 text-pink-400" />
              <span>Tamamlanma</span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-white font-mono">
              {completionPercentage}%
            </span>
          </div>
        </div>

        {/* Mobile quick actions (Undo/Redo only) */}
        <div className="flex lg:hidden items-center gap-1.5 shrink-0">
          <button
            onClick={undo}
            disabled={undoStack.length === 0}
            className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Geri Al (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="İleri Al (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Desktop full action buttons */}
        <div className="hidden lg:flex flex-wrap items-center gap-2">
          <button
            onClick={undo}
            disabled={undoStack.length === 0}
            className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Geri Al (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="İleri Al (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenPlanManager}
            className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-white transition-all cursor-pointer"
            title="Plan Yöneticisi"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenStats}
            className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-white transition-all cursor-pointer"
            title="İstatistikler"
          >
            <BarChart3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:text-white transition-all cursor-pointer"
            title="Ayarlar"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenTemplateModal}
            className="text-xs font-semibold px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition-all cursor-pointer flex items-center gap-1"
          >
            <span>Şablon Yükle</span>
          </button>

          <button
            onClick={onOpenNotebookModal}
            className="text-xs font-semibold px-3 py-2 rounded-lg bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/25 transition-all cursor-pointer flex items-center gap-1.5"
            title="Kişisel Defter Oluştur"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Defter Oluştur</span>
          </button>

          <div className="flex items-center border border-neutral-800 rounded-lg bg-neutral-900/40">
            <button
              onClick={handleExportPlan}
              title="Yedek indir (JSON)"
              className="p-2 text-neutral-400 hover:text-white transition-colors border-r border-neutral-800 hover:bg-neutral-850 rounded-l-lg cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
            <label
              title="Yedek yükle (JSON)"
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-850 rounded-r-lg cursor-pointer flex items-center justify-center"
            >
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept=".json"
                onChange={handleImportPlan}
                className="hidden"
              />
            </label>
          </div>

          <button
            onClick={handleClearPlan}
            title="Planı Temizle"
            className="p-2 rounded-lg border border-neutral-800 hover:border-red-500/30 bg-neutral-900/40 hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
});
