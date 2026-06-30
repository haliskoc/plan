"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePlanStore } from "@/store/usePlanStore";
import { 
  BookOpen, 
  Calendar, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  BookMarked,
  Clock,
  Compass
} from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

export default function LandingPage() {
  const { plan, hasHydrated } = usePlanStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = mounted && hasHydrated ? plan.items.length : 0;
  const completedItems = mounted && hasHydrated ? plan.items.filter(item => item.status === "tamamlandi").length : 0;
  const totalMinutes = mounted && hasHydrated ? plan.items.reduce((sum, item) => sum + item.durationMinutes, 0) : 0;
  const totalHours = Math.round(totalMinutes / 60);

  // Target date YKS remaining
  const daysLeft = parseISO(plan?.examDate || "2027-06-19");
  const differenceDays = Math.max(0, differenceInDays(daysLeft, new Date()));

  return (
    <div className="min-h-screen bg-black text-neutral-200 overflow-hidden relative selection:bg-indigo-500/30 selection:text-white">
      {/* Decorative ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0c0c0c_1px,transparent_1px),linear-gradient(to_bottom,#0c0c0c_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

      {/* Landing Container */}
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-24 flex flex-col items-center justify-center relative min-h-screen">
        
        {/* Top Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-6 animate-pulse select-none">
          <Sparkles className="w-3.5 h-3.5" />
          <span>YKS 2027 Hedef Odaklı Çalışma</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-white text-center tracking-tight leading-tight max-w-3xl mb-6">
          Kendi Çalışma Planını{" "}
          <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-400 via-cyan-400 to-indigo-400 bg-[length:200%_auto] animate-shimmer">
            Kendin Yönet.
          </span>
        </h1>

        {/* Subhead Description */}
        <p className="text-base md:text-lg text-neutral-400 text-center max-w-xl mb-12 leading-relaxed font-medium">
          Soru-cevap sihirbazlarıyla vakit kaybetmeden doğrudan konuları seç, günlük/haftalık programını oluştur ve PDF çıktısını al. Tamamen ücretsiz ve tarayıcında saklanır.
        </p>

        {/* Interactive Stats Badge (if plan has items) */}
        {mounted && hasHydrated && totalItems > 0 ? (
          <div className="w-full max-w-lg bg-neutral-900/60 border border-neutral-800 rounded-3xl p-6 mb-12 backdrop-blur-md shadow-2xl">
            <h2 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-4 text-center">
              Planınızın Mevcut Özeti
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div className="flex flex-col items-center">
                <BookMarked className="w-5 h-5 text-indigo-400 mb-1" />
                <span className="text-lg font-bold text-white font-mono">{totalItems}</span>
                <span className="text-[10px] text-neutral-500 font-semibold uppercase">Konu Ekli</span>
              </div>
              <div className="flex flex-col items-center border-x border-neutral-800">
                <Clock className="w-5 h-5 text-cyan-400 mb-1" />
                <span className="text-lg font-bold text-white font-mono">{totalHours} sa</span>
                <span className="text-[10px] text-neutral-500 font-semibold uppercase">Toplam Süre</span>
              </div>
              <div className="flex flex-col items-center">
                <CheckCircle2 className="w-5 h-5 text-pink-400 mb-1" />
                <span className="text-lg font-bold text-white font-mono">{completedItems}</span>
                <span className="text-[10px] text-neutral-500 font-semibold uppercase">Tamamlandı</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/plan"
                className="inline-flex items-center justify-center gap-2 text-sm font-bold px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 transition-all cursor-pointer"
              >
                <span>Çalışma Odasına Git</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 items-center mb-16">
            <Link
              href="/plan"
              className="inline-flex items-center justify-center gap-2 text-sm font-bold px-8 py-4 rounded-2xl bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-xl shadow-indigo-600/15 hover:shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Plan Oluşturmaya Başla</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </Link>
          </div>
        )}

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl border-t border-neutral-900 pt-16">
          <div className="flex flex-col p-5 rounded-2xl border border-neutral-900 bg-neutral-950/40">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20">
              <Compass className="w-4.5 h-4.5 text-indigo-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Doğrudan Konu Seçimi</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Uzun ve yorucu soru-cevap anketleri yok. Sabit konu havuzundan eksik olduğunuz konuları doğrudan seçerek kendi takviminizi kendiniz tasarlayın.
            </p>
          </div>

          <div className="flex flex-col p-5 rounded-2xl border border-neutral-900 bg-neutral-950/40">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4 border border-cyan-500/20">
              <Calendar className="w-4.5 h-4.5 text-cyan-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Çoklu Plan Görünümü</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Hazırladığınız programı günlük detaylı yapılacaklar listesi, 7 günlük haftalık çalışma tablosu ve aylık özet takvim olmak üzere 3 farklı modda inceleyin.
            </p>
          </div>

          <div className="flex flex-col p-5 rounded-2xl border border-neutral-900 bg-neutral-950/40">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center mb-4 border border-pink-500/20">
              <Download className="w-4.5 h-4.5 text-pink-400" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Baskıya Hazır PDF Çıktısı</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Çalışmalarınızı kağıt üzerinde takip etmeyi seviyorsanız, tek tıkla günlük kontrol listesi veya haftalık ders programı şeklinde PDF olarak indirip yazdırın.
            </p>
          </div>
        </div>

        {/* Small countdown status at bottom */}
        {mounted && (
          <div className="text-[11px] text-neutral-500 font-semibold tracking-wider uppercase mt-16 flex items-center gap-1.5 select-none border border-neutral-900/60 bg-neutral-950/80 px-4 py-2 rounded-full">
            <span>2027 YKS Sınavına Son:</span>
            <span className="text-indigo-400 font-bold font-mono">{differenceDays} Gün</span>
          </div>
        )}

      </div>
    </div>
  );
}
