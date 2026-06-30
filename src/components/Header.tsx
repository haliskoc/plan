"use client";

import React, { useState, useEffect } from "react";
import { usePlanStore } from "@/store/usePlanStore";
import { YKS_TOPICS } from "@/data/topics";
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
  FileJson
} from "lucide-react";

interface HeaderProps {
  onOpenTemplateModal: () => void;
}

export function Header({ onOpenTemplateModal }: HeaderProps) {
  const { plan, setPlanTitle, clearPlan, hasHydrated } = usePlanStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(plan.title);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (hasHydrated) {
      setTempTitle(plan.title);
    }
  }, [plan.title, hasHydrated]);

  const handleSaveTitle = () => {
    if (tempTitle.trim()) {
      setPlanTitle(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleClearPlan = () => {
    if (confirm("Tüm planınızı sıfırlamak istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      clearPlan();
    }
  };

  // Export plan as JSON
  const handleExportPlan = () => {
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
  };

  // Import plan from JSON
  const handleImportPlan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (importedData && Array.isArray(importedData.items)) {
          // Merge or replace
          if (confirm("Bu yedek dosyasını yüklemek mevcut planınızı silecektir. Devam etmek istiyor musunuz?")) {
            usePlanStore.setState({ plan: importedData });
            alert("Plan başarıyla yüklendi!");
          }
        } else {
          alert("Geçersiz dosya formatı. Lütfen doğru bir plan yedek dosyası seçin.");
        }
      } catch (err) {
        alert("Dosya okunurken bir hata oluştu.");
      }
    };
    reader.readAsText(file);
  };

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

  // Calculate statistics
  const totalItems = plan.items.length;
  const completedItems = plan.items.filter(item => item.status === "tamamlandi").length;
  const totalMinutes = plan.items.reduce((sum, item) => sum + item.durationMinutes, 0);
  const totalHours = Math.round(totalMinutes / 60);
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <header className="w-full bg-neutral-950/80 border-b border-neutral-900 sticky top-0 z-50 backdrop-blur-md px-4 sm:px-6 py-4 shadow-sm">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left Side: Brand and Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {isEditingTitle ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                    className="bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1 text-sm font-semibold text-white focus:outline-hidden focus:border-indigo-500 w-52 sm:w-64"
                    autoFocus
                  />
                  <button 
                    onClick={handleSaveTitle}
                    className="p-1 rounded-md bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {plan.title}
                  </h1>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="p-1 rounded-md text-neutral-500 hover:text-neutral-300 hover:bg-neutral-950/50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <span className="text-xs text-neutral-400 font-medium">YKS 2027 Kişisel Çalışma Odası</span>
          </div>
        </div>

        {/* Middle: Statistics summary */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-neutral-900/40 border border-neutral-800/80 px-3 py-2 rounded-xl backdrop-blur-xs max-w-md">
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

        {/* Right Side: Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Load template */}
          <button
            onClick={onOpenTemplateModal}
            className="text-xs font-semibold px-3 py-1.5 sm:py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/25 transition-all cursor-pointer flex items-center gap-1"
          >
            <span>Şablon Yükle</span>
          </button>

          {/* Backup Action Group */}
          <div className="flex items-center border border-neutral-800 rounded-lg bg-neutral-900/40">
            <button
              onClick={handleExportPlan}
              title="Yedek indir (JSON)"
              className="p-1.5 sm:p-2 text-neutral-400 hover:text-white transition-colors border-r border-neutral-800 hover:bg-neutral-850 rounded-l-lg cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
            <label
              title="Yedek yükle (JSON)"
              className="p-1.5 sm:p-2 text-neutral-400 hover:text-white hover:bg-neutral-850 rounded-r-lg cursor-pointer flex items-center justify-center"
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

          {/* Clear Plan */}
          <button
            onClick={handleClearPlan}
            title="Planı Temizle"
            className="p-1.5 sm:p-2 rounded-lg border border-neutral-800 hover:border-red-500/30 bg-neutral-900/40 hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
