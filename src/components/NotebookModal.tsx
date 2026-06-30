"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { X, Book, Sparkles, CheckCircle2, ChevronRight, AlertCircle, FileText, User, HelpCircle } from "lucide-react";
import type { CoverStyle, TemplateStyle } from "./NotebookPDF";

// Lazy-load the NotebookPDF document generation and download link
const LazyNotebookPDFLink = dynamic(() => import("./NotebookPDF").then((mod) => {
  const { NotebookPDF } = mod;
  const { PDFDownloadLink } = require("@react-pdf/renderer");
  return { default: ({ title, ownerName, subjects, pageCount, coverStyle, templateStyle, fileName, className, children }: any) => (
    <PDFDownloadLink
      document={
        <NotebookPDF
          title={title}
          ownerName={ownerName}
          subjects={subjects}
          pageCount={pageCount}
          coverStyle={coverStyle}
          templateStyle={templateStyle}
        />
      }
      fileName={fileName}
      className={className}
    >
      {children}
    </PDFDownloadLink>
  )};
}), { ssr: false });

interface NotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_SUBJECTS = [
  "Matematik",
  "Geometri",
  "Fizik",
  "Kimya",
  "Biyoloji",
  "Türkçe",
  "Edebiyat",
  "Tarih",
  "Coğrafya",
  "Felsefe",
  "Din Kültürü",
];

const COVER_OPTIONS: { id: CoverStyle; name: string; desc: string; previewClass: string }[] = [
  {
    id: "modern-indigo",
    name: "Cyberpunk Grid",
    desc: "Kozmik karanlık arka plan üzerinde neon çizgiler ve fütüristik köşebentler.",
    previewClass: "bg-slate-950 border border-indigo-500/50 flex flex-col justify-between p-2 text-white relative after:content-[''] after:absolute after:inset-0 after:bg-[linear-gradient(rgba(99,102,241,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.07)_1px,transparent_1px)] after:bg-[size:8px_8px]",
  },
  {
    id: "creative-sunset",
    name: "Aurora Orbits",
    desc: "Midnight mor zemin üzerinde gün batımı renk küreleri ve yörünge halkaları.",
    previewClass: "bg-purple-950/90 border border-pink-500/20 relative overflow-hidden flex flex-col justify-between p-2 text-white",
  },
  {
    id: "minimalist-slate",
    name: "Japanese Zen Sun",
    desc: "Minimalist krem zemin üzerinde wabi-sabi kırmızı güneş tasarımı ve şık tipografi.",
    previewClass: "bg-amber-50 border border-stone-300 relative overflow-hidden flex flex-col justify-between p-2 text-stone-850",
  },
  {
    id: "academic-classic",
    name: "Gothic Academic",
    desc: "Koyu bordo kadife zemin üzerinde altın varaklı çerçeveler ve klasik şeritler.",
    previewClass: "bg-rose-950 border-2 border-amber-600 flex flex-col justify-between p-2 text-amber-100",
  },
  {
    id: "optical-clean",
    name: "Optical Techno",
    desc: "Teknik timing track kenar şeritleri ve veri baloncuk matrisleri.",
    previewClass: "bg-white border border-neutral-400 relative overflow-hidden flex flex-col justify-between p-2 text-black after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-1.5 after:bg-black after:bg-[repeating-linear-gradient(transparent,transparent_2px,white_2px,white_4px)]",
  },
  {
    id: "none",
    name: "Kapak Sayfası Yok",
    desc: "Doğrudan not sayfalarından başlar.",
    previewClass: "bg-neutral-900 border border-neutral-800 flex items-center justify-center p-2 text-neutral-500",
  },
];

const TEMPLATE_OPTIONS: { id: TemplateStyle; name: string; desc: string; previewHtml: React.ReactNode }[] = [
  {
    id: "cornell",
    name: "Cornell Kuralı (Varsayılan)",
    desc: "Sorular/Kavramlar, Notlar ve Özet kutusu olarak 3 bölümlü kanıtlanmış not tutma düzeni.",
    previewHtml: (
      <div className="w-full h-16 border border-neutral-705 flex flex-col rounded-md overflow-hidden bg-neutral-900/40">
        <div className="flex-1 flex border-b border-neutral-750">
          <div className="w-[30%] border-r border-neutral-750 bg-neutral-950/20" />
          <div className="flex-1 bg-[repeating-linear-gradient(transparent,transparent_6px,var(--color-neutral-800)_6px,var(--color-neutral-800)_7px)] bg-[size:100%_7px]" />
        </div>
        <div className="h-4 border-t border-neutral-700 bg-neutral-950/10" />
      </div>
    ),
  },
  {
    id: "optik",
    name: "Optik Şablon",
    desc: "Tarih, ders ve sayfa numarası kodlama baloncuklu, sağ kenarda zamanlama işaretleri.",
    previewHtml: (
      <div className="w-full h-16 border border-neutral-705 flex flex-col rounded-md overflow-hidden bg-neutral-900/40 relative">
        <div className="p-1 border-b border-neutral-750 flex justify-between bg-neutral-950/20">
          <div className="flex gap-0.5"><div className="w-1.5 h-1.5 rounded-full bg-neutral-700" /><div className="w-1.5 h-1.5 rounded-full bg-neutral-700" /><div className="w-1.5 h-1.5 rounded-full bg-neutral-700" /></div>
          <div className="flex gap-0.5"><div className="w-1 h-1 rounded-full bg-neutral-700" /><div className="w-1 h-1 rounded-full bg-neutral-700" /></div>
        </div>
        <div className="flex-1 bg-radial-[circle_at_center,var(--color-neutral-800)_1px,transparent_1px] bg-[size:6px_6px]" />
        <div className="absolute right-0 top-0 bottom-0 w-1 flex flex-col justify-between py-0.5 bg-neutral-950"><div className="w-full h-0.5 bg-white" /><div className="w-full h-0.5 bg-white" /><div className="w-full h-0.5 bg-white" /></div>
      </div>
    ),
  },
  {
    id: "ruled",
    name: "Çizgili Not Sayfası",
    desc: "Düzgün satırlar halinde standart çizgili okul defteri sayfası düzeni.",
    previewHtml: (
      <div className="w-full h-16 border border-neutral-705 rounded-md overflow-hidden bg-neutral-900/40 flex flex-col p-1.5 justify-between">
        <div className="w-full h-[0.5px] bg-neutral-800" />
        <div className="w-full h-[0.5px] bg-neutral-800" />
        <div className="w-full h-[0.5px] bg-neutral-800" />
        <div className="w-full h-[0.5px] bg-neutral-800" />
        <div className="w-full h-[0.5px] bg-neutral-800" />
      </div>
    ),
  },
  {
    id: "grid",
    name: "Kareli Sayfa (Matematik/Sayısal)",
    desc: "Grafik, formül çizimi ve matematiksel işlemler için optimize edilmiş kareli düzen.",
    previewHtml: (
      <div className="w-full h-16 border border-neutral-750 rounded-md overflow-hidden bg-neutral-900/40 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:6px_6px]" />
    ),
  },
  {
    id: "dotted",
    name: "Noktalı Sayfa (Serbest Tasarım)",
    desc: "Fikir haritaları, eskizler ve modern Bullet Journal tarzı not alma şablonu.",
    previewHtml: (
      <div className="w-full h-16 border border-neutral-750 rounded-md overflow-hidden bg-neutral-900/40 bg-radial-[circle_at_center,var(--color-neutral-800)_1.2px,transparent_1.2px] bg-[size:8px_8px]" />
    ),
  },
];

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

export const NotebookModal = React.memo(function NotebookModal({ isOpen, onClose }: NotebookModalProps) {
  const [title, setTitle] = useState("Çalışma Defterim");
  const [ownerName, setOwnerName] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState(20);
  const [coverStyle, setCoverStyle] = useState<CoverStyle>("modern-indigo");
  const [templateStyle, setTemplateStyle] = useState<TemplateStyle>("cornell");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen) return null;

  const handleToggleSubject = (subject: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const handlePageCountChange = (val: number) => {
    const clamped = Math.max(1, Math.min(120, val));
    setPageCount(clamped);
  };

  // Build the dynamic PDF filename based on the notebook title
  const getPdfFileName = () => {
    return `${slugify(title || "defter")}.pdf`;
  };

  const fileName = getPdfFileName();

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-xs">
      <div className="bg-neutral-950 border border-neutral-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-900/40 border-b border-neutral-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Book className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">YKS Defter Oluşturucu</h2>
              <p className="text-[10px] text-neutral-400">Yazdırılabilir konu özeti ve Cornell çalışma defteri hazırlayın</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Section 1: General Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <span>1. Temel Bilgiler</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Defter Adı</label>
                <div className="relative flex items-center">
                  <FileText className="absolute left-3 w-4 h-4 text-neutral-600" />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Matematik Defterim"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-neutral-400 uppercase block mb-1">Öğrenci Adı Soyadı</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 w-4 h-4 text-neutral-600" />
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Ahmet Yılmaz (Kapakta görünür)"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-hidden focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Subject Selector */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <span>2. Ders Seçimi</span>
              </h3>
              <span className="text-[9px] text-neutral-500 italic">Dosya adı derslere göre güncellenir</span>
            </div>
            <div className="flex flex-wrap gap-1.5 bg-neutral-900/30 border border-neutral-900 p-3.5 rounded-2xl">
              {AVAILABLE_SUBJECTS.map((sub) => {
                const isSelected = selectedSubjects.includes(sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleToggleSubject(sub)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer flex items-center gap-1 select-none ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-sm"
                        : "bg-neutral-900/60 border-neutral-800/80 text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    {isSelected && <span className="text-emerald-400 text-[10px]">✓</span>}
                    <span>{sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Notebook Page Template Style */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <span>3. Sayfa Şablon Türü</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {TEMPLATE_OPTIONS.map((opt) => {
                const isSelected = templateStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTemplateStyle(opt.id)}
                    className={`flex flex-col gap-2 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500/5 border-emerald-500/40 text-white"
                        : "bg-neutral-900/20 border-neutral-900 text-neutral-400 hover:border-neutral-850"
                    }`}
                  >
                    {opt.previewHtml}
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs font-bold text-white">{opt.name}</span>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                    </div>
                    <span className="text-[10px] text-neutral-500 leading-normal">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Cover Designs */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <span>4. Hazır Kapak Şablonları</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {COVER_OPTIONS.map((opt) => {
                const isSelected = coverStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCoverStyle(opt.id)}
                    className={`flex flex-col rounded-xl border overflow-hidden text-left transition-all cursor-pointer h-32 ${
                      isSelected
                        ? "bg-emerald-500/5 border-emerald-500/40"
                        : "bg-neutral-900/20 border-neutral-900 hover:border-neutral-850"
                    }`}
                  >
                    {/* Visual Card Representation */}
                    <div className={`h-16 ${opt.previewClass} shrink-0`}>
                      {opt.id !== "none" && (
                        <>
                          <div className="text-[7px] font-bold tracking-widest leading-none">DERS DEFTERİ</div>
                          <div className="text-[9px] font-extrabold truncate w-[90%] leading-tight">{title || "ÖZEL NOTLAR"}</div>
                          <div className="text-[6px] border-t border-current pt-1 flex justify-between leading-none">
                            <span>{ownerName ? "M. YILMAZ" : "YKS 2027"}</span>
                            <span>2026</span>
                          </div>
                        </>
                      )}
                      {opt.id === "none" && <X className="w-5 h-5 opacity-40" />}
                    </div>
                    
                    {/* Content Detail */}
                    <div className="p-2 flex flex-col justify-between flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-white">{opt.name}</span>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                      </div>
                      <span className="text-[8px] text-neutral-500 truncate leading-none mt-0.5">{opt.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Page Count Selection */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex justify-between items-center">
              <span>5. Defter Sayfa Sayısı</span>
              <span className="text-xs font-mono font-bold text-emerald-400">{pageCount} Sayfa</span>
            </h3>
            <div className="flex flex-col gap-3 bg-neutral-900/30 border border-neutral-900 p-4 rounded-2xl">
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={1}
                  max={120}
                  value={pageCount}
                  onChange={(e) => handlePageCountChange(Number(e.target.value))}
                  className="flex-1 h-1.5 bg-neutral-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500"
                />
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={pageCount}
                  onChange={(e) => handlePageCountChange(Number(e.target.value))}
                  className="w-16 bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-1.5 text-center text-xs text-white font-bold font-mono focus:outline-hidden focus:border-emerald-500"
                />
              </div>
              
              {/* Presets */}
              <div className="grid grid-cols-5 gap-1.5">
                {[5, 10, 24, 48, 80].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setPageCount(preset)}
                    className={`py-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                      pageCount === preset
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                        : "bg-neutral-900 border-neutral-850 text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    {preset} S.
                  </button>
                ))}
              </div>

              {pageCount > 80 && (
                <div className="flex items-center gap-2 text-[10px] text-amber-500/90 bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>80 sayfa üzeri defterlerin oluşturulup indirilmesi bilgisayarınızın performansına bağlı olarak birkaç saniye sürebilir.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-4 bg-neutral-900/60 border-t border-neutral-900 flex flex-col sm:flex-row justify-between gap-3 shrink-0 items-center">
          <div className="text-[10px] text-neutral-500">
            Dosya Adı: <span className="font-mono text-neutral-400 font-bold">{fileName}</span>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-400 hover:text-white transition-all cursor-pointer"
            >
              İptal
            </button>

            {mounted && (
              <LazyNotebookPDFLink
                title={title}
                ownerName={ownerName}
                subjects={selectedSubjects}
                pageCount={pageCount}
                coverStyle={coverStyle}
                templateStyle={templateStyle}
                fileName={fileName}
                className="flex-1 sm:flex-initial"
              >
                {({ loading }: { loading: boolean }) => (
                  <span className={`w-full text-center inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer ${
                    loading 
                      ? "bg-neutral-900 border border-neutral-800 text-neutral-500 cursor-not-allowed" 
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-[0.98]"
                  }`}>
                    <span>⬇</span>
                    <span>{loading ? "Hazırlanıyor..." : "Defteri İndir"}</span>
                  </span>
                )}
              </LazyNotebookPDFLink>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
