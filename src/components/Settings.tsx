"use client";

import React, { useState, useRef } from "react";
import { usePlanStore, useActivePlan } from "@/store/usePlanStore";
import { X, SettingsIcon, Sun, Moon, Target, FileText, Image, Trash2, Link, Upload } from "lucide-react";
import { analyzeImageColor, fileToDataUrl, urlToDataUrl } from "@/utils/colorAnalyzer";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Settings = React.memo(function Settings({ isOpen, onClose }: SettingsProps) {
  const setExamDate = usePlanStore((s) => s.setExamDate);
  const setPlanTitle = usePlanStore((s) => s.setPlanTitle);
  const setGoals = usePlanStore((s) => s.setGoals);
  const goals = usePlanStore((s) => s.goals);
  const theme = usePlanStore((s) => s.theme);
  const toggleTheme = usePlanStore((s) => s.toggleTheme);
  const pdfSettings = usePlanStore((s) => s.pdfSettings);
  const setPdfSettings = usePlanStore((s) => s.setPdfSettings);
  const setPdfBackgroundImage = usePlanStore((s) => s.setPdfBackgroundImage);
  const plan = useActivePlan();
  const [examDateInput, setExamDateInput] = useState(plan.examDate);
  const [titleInput, setTitleInput] = useState(plan.title);
  const [dailyGoal, setDailyGoal] = useState(goals.dailyMinutes);
  const [weeklyGoal, setWeeklyGoal] = useState(goals.weeklyMinutes);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [bgTab, setBgTab] = useState<"file" | "url">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    if (titleInput.trim()) setPlanTitle(titleInput.trim());
    if (examDateInput) setExamDate(examDateInput);
    setGoals({ dailyMinutes: dailyGoal, weeklyMinutes: weeklyGoal });
    onClose();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Lütfen bir resim dosyası seçin.");
      return;
    }
    await processImage(fileToDataUrl(file));
    e.target.value = "";
  };

  const handleUrlSubmit = async () => {
    const url = urlInput.trim();
    if (!url) return;
    await processImage(urlToDataUrl(url));
    setUrlInput("");
  };

  const processImage = async (promise: Promise<string>) => {
    setUploading(true);
    try {
      const dataUrl = await promise;
      const analysis = await analyzeImageColor(dataUrl);
      setPdfSettings({
        backgroundImage: dataUrl,
        backgroundColorAvg: analysis.dominantColor,
        textColorDark: analysis.darkTextColors[0],
        textColorLight: analysis.lightTextColors[0],
      });
    } catch (err: any) {
      alert(err?.message || "Resim yüklenirken bir hata oluştu.");
    }
    setUploading(false);
  };

  const handleRemoveBg = () => {
    setPdfSettings({
      backgroundImage: "",
      backgroundColorAvg: "#ffffff",
      textColorLight: "#ffffff",
      textColorDark: "#0f172a",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-950 border border-neutral-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="px-6 py-4 bg-neutral-900/40 border-b border-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Ayarlar</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Plan Adı */}
          <div>
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5 block">Plan Adı</label>
            <input type="text" value={titleInput} onChange={(e) => setTitleInput(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-indigo-500 transition-all" />
          </div>

          {/* Hedef Sınav */}
          <div>
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5 block">Hedef Sınav Tarihi</label>
            <input type="date" value={examDateInput} onChange={(e) => setExamDateInput(e.target.value)} min="2026-01-01" max="2030-12-31"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-indigo-500 transition-all" />
          </div>

          {/* Hedefler */}
          <div className="border-t border-neutral-900 pt-5">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-400" /> Günlük/Haftalık Hedefler (dk)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-neutral-500 block mb-1">Günlük</label>
                <input type="number" value={dailyGoal} onChange={(e) => setDailyGoal(Number(e.target.value))} min={30} max={720} step={30}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500 transition-all" />
              </div>
              <div>
                <label className="text-[10px] text-neutral-500 block mb-1">Haftalık</label>
                <input type="number" value={weeklyGoal} onChange={(e) => setWeeklyGoal(Number(e.target.value))} min={60} max={5040} step={60}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500 transition-all" />
              </div>
            </div>
          </div>

          {/* Tema */}
          <div className="border-t border-neutral-900 pt-5">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 block">Tema</label>
            <button onClick={toggleTheme}
              className="flex items-center gap-3 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-indigo-500 transition-all w-full cursor-pointer">
              {theme === "dark" ? (
                <><Moon className="w-4 h-4 text-indigo-400" /><span className="text-sm text-white">Koyu Tema</span><span className="text-xs text-neutral-500 ml-auto">Açık temaya geç ✨</span></>
              ) : (
                <><Sun className="w-4 h-4 text-amber-400" /><span className="text-sm text-white">Açık Tema</span><span className="text-xs text-neutral-500 ml-auto">Koyu temaya geç 🌙</span></>
              )}
            </button>
          </div>

          {/* PDF Ayarları */}
          <div className="border-t border-neutral-900 pt-5">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" /> PDF Ayarları
            </label>

            {/* Yön Seçimi */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Günlük PDF Yönü</span>
                <div className="flex bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
                  <button onClick={() => setPdfSettings({ dailyOrientation: "portrait" })}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                      pdfSettings.dailyOrientation === "portrait" ? "bg-indigo-600 text-white" : "text-neutral-400 hover:text-neutral-200" }`}>
                    Dikey
                  </button>
                  <button onClick={() => setPdfSettings({ dailyOrientation: "landscape" })}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                      pdfSettings.dailyOrientation === "landscape" ? "bg-indigo-600 text-white" : "text-neutral-400 hover:text-neutral-200" }`}>
                    Yatay
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Haftalık PDF Yönü</span>
                <div className="flex bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
                  <button onClick={() => setPdfSettings({ weeklyOrientation: "portrait" })}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                      pdfSettings.weeklyOrientation === "portrait" ? "bg-indigo-600 text-white" : "text-neutral-400 hover:text-neutral-200" }`}>
                    Dikey
                  </button>
                  <button onClick={() => setPdfSettings({ weeklyOrientation: "landscape" })}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                      pdfSettings.weeklyOrientation === "landscape" ? "bg-indigo-600 text-white" : "text-neutral-400 hover:text-neutral-200" }`}>
                    Yatay
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Aylık PDF Yönü</span>
                <div className="flex bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
                  <button onClick={() => setPdfSettings({ monthlyOrientation: "portrait" })}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                      pdfSettings.monthlyOrientation === "portrait" ? "bg-indigo-600 text-white" : "text-neutral-400 hover:text-neutral-200" }`}>
                    Dikey
                  </button>
                  <button onClick={() => setPdfSettings({ monthlyOrientation: "landscape" })}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                      pdfSettings.monthlyOrientation === "landscape" ? "bg-indigo-600 text-white" : "text-neutral-400 hover:text-neutral-200" }`}>
                    Yatay
                  </button>
                </div>
              </div>
            </div>

            {/* Arka Plan Resmi */}
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5 text-indigo-400" /> Arka Plan Görseli
            </label>

            {pdfSettings.backgroundImage ? (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-neutral-800 h-24 bg-neutral-900">
                  <img src={pdfSettings.backgroundImage} alt="Arka plan önizleme" className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-neutral-700" style={{ backgroundColor: pdfSettings.backgroundColorAvg }} />
                  <span className="text-[10px] text-neutral-500 font-mono">{pdfSettings.backgroundColorAvg}</span>
                  <span className="text-[10px] text-neutral-500 ml-auto">
                    {(() => {
                      const bg = pdfSettings.backgroundColorAvg || "#ffffff";
                      try {
                        const r = parseInt(bg.slice(1, 3), 16);
                        const g = parseInt(bg.slice(3, 5), 16);
                        const b = parseInt(bg.slice(5, 7), 16);
                        const isDark = (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
                        return isDark ? "Koyu zemin → açık yazı" : "Açık zemin → koyu yazı";
                      } catch {
                        return "Açık zemin → koyu yazı";
                      }
                    })()}
                  </span>
                </div>
                <button onClick={handleRemoveBg}
                  className="w-full py-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> Arka Planı Kaldır
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Tab: File / URL */}
                <div className="grid grid-cols-2 p-1 bg-neutral-900 border border-neutral-800 rounded-lg">
                  <button onClick={() => setBgTab("file")}
                    className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      bgTab === "file" ? "bg-indigo-600 text-white" : "text-neutral-400 hover:text-neutral-200" }`}>
                    <Upload className="w-3 h-3" /> Dosya
                  </button>
                  <button onClick={() => setBgTab("url")}
                    className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      bgTab === "url" ? "bg-indigo-600 text-white" : "text-neutral-400 hover:text-neutral-200" }`}>
                    <Link className="w-3 h-3" /> Link
                  </button>
                </div>

                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

                {bgTab === "file" ? (
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="w-full py-3 border border-dashed border-neutral-700 rounded-xl text-xs text-neutral-500 hover:text-neutral-300 hover:border-neutral-600 transition-all cursor-pointer">
                    {uploading ? "Analiz ediliyor..." : "+ Bilgisayardan resim seç"}
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                      placeholder="https://ornek.com/arkaplan.jpg"
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-hidden focus:border-indigo-500 transition-all"
                    />
                    <button onClick={handleUrlSubmit} disabled={uploading || !urlInput.trim()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
                      {uploading ? "..." : "Yükle"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Opaklık */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-neutral-500">Arka Plan Saydamlığı</span>
                <span className="text-[10px] font-bold text-indigo-400">{pdfSettings.backgroundOpacity}%</span>
              </div>
              <input type="range" min={5} max={40} value={pdfSettings.backgroundOpacity}
                onChange={(e) => setPdfSettings({ backgroundOpacity: Number(e.target.value) })}
                className="w-full h-1.5 bg-neutral-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500" />
              <div className="flex justify-between text-[9px] text-neutral-600 mt-1">
                <span>%5 (soluk)</span><span>%40 (belirgin)</span>
              </div>
            </div>

            {/* Uygulama Rehberi */}
            <div className="border-t border-neutral-900 pt-4 mt-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Uygulama Rehberi</label>
              <button onClick={() => { usePlanStore.setState({ hasCompletedOnboarding: false }); onClose(); }}
                className="w-full py-2.5 bg-neutral-900 border border-neutral-800 hover:border-indigo-500 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
                Giriş Turunu Yeniden Başlat
              </button>
            </div>
          </div>

          <button onClick={handleSave}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all cursor-pointer shadow-lg shadow-indigo-600/20">
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
});
