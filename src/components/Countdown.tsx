"use client";

import React, { useEffect, useState, useMemo } from "react";
import { differenceInSeconds, differenceInDays, parseISO } from "date-fns";
import { usePlanStore } from "@/store/usePlanStore";

interface CountdownProps {
  targetDateStr: string;
  startDateStr?: string;
}

export const Countdown = React.memo(function Countdown({ targetDateStr, startDateStr }: CountdownProps) {
  const hasBg = usePlanStore((s) => s.hasHydrated && !!s.pdfSettings.backgroundImage);

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOver: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: false });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const targetDate = parseISO(targetDateStr);
    let interval: ReturnType<typeof setInterval> | null = null;

    const calculateTimeLeft = () => {
      const now = new Date();
      const diffSeconds = differenceInSeconds(targetDate, now);
      if (diffSeconds <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(diffSeconds / (3600 * 24)),
        hours: Math.floor((diffSeconds % (3600 * 24)) / 3600),
        minutes: Math.floor((diffSeconds % 3600) / 60),
        seconds: diffSeconds % 60,
        isOver: false,
      });
    };

    const startInterval = () => {
      calculateTimeLeft();
      interval = setInterval(calculateTimeLeft, 1000);
    };

    const stopInterval = () => {
      if (interval) { clearInterval(interval); interval = null; }
    };

    const handleVisibility = () => {
      if (document.hidden) stopInterval();
      else startInterval();
    };

    startInterval();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => { stopInterval(); document.removeEventListener("visibilitychange", handleVisibility); };
  }, [targetDateStr]);

  const { targetDate, startDate, totalDays } = useMemo(() => {
    const td = parseISO(targetDateStr);
    const sd = startDateStr ? parseISO(startDateStr) : new Date();
    return {
      targetDate: td,
      startDate: sd,
      totalDays: Math.max(1, differenceInDays(td, sd) + 1),
    };
  }, [targetDateStr, startDateStr]);

  if (!mounted) {
    return (
      <div className="w-full h-24 bg-neutral-900/40 border border-neutral-800 rounded-2xl animate-pulse" />
    );
  }

  const daysPassed = Math.max(0, differenceInDays(new Date(), startDate));
  const percentagePassed = Math.min(100, Math.round((daysPassed / totalDays) * 100));

  return (
    <div className={`relative overflow-hidden w-full border border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-xl transition-all duration-300 ${
      hasBg ? "bg-neutral-950/80" : "bg-linear-to-r from-neutral-900/90 to-neutral-950/90"
    }`}>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
        <div className="text-center md:text-left w-full md:w-auto">
          <h2 className="text-base sm:text-xl font-bold tracking-tight text-white mb-0.5 sm:mb-1">
            2027 YKS Hedef Geri Sayım
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Hedef Sınav Tarihi:{" "}
            <span className="font-semibold text-indigo-400">{targetDateStr}</span>
          </p>
        </div>

        {timeLeft.isOver ? (
          <div className="text-lg sm:text-xl font-bold text-emerald-400 animate-bounce text-center">
            YKS Zamanı Geldi! Başarılar Dileriz. 🎉
          </div>
        ) : (
          <div className="flex items-center gap-1.5 sm:gap-4 justify-center">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-4xl font-extrabold text-white font-mono px-2.5 py-1.5 rounded-xl border border-neutral-850 shadow-inner w-14 sm:w-24 text-center transition-all duration-300 bg-neutral-900/80">
                {timeLeft.days}
              </span>
              <span className="text-[9px] sm:text-xs font-bold text-neutral-500 uppercase mt-1 tracking-wider">
                Gün
              </span>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-neutral-800">:</div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-4xl font-extrabold text-indigo-400 font-mono px-2.5 py-1.5 rounded-xl border border-neutral-850 shadow-inner w-12 sm:w-20 text-center transition-all duration-300 bg-neutral-900/80">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[9px] sm:text-xs font-bold text-neutral-500 uppercase mt-1 tracking-wider">
                Saat
              </span>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-neutral-800">:</div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-4xl font-extrabold text-cyan-400 font-mono px-2.5 py-1.5 rounded-xl border border-neutral-850 shadow-inner w-12 sm:w-20 text-center transition-all duration-300 bg-neutral-900/80">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[9px] sm:text-xs font-bold text-neutral-500 uppercase mt-1 tracking-wider">
                Dakika
              </span>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-neutral-800">:</div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-4xl font-extrabold text-pink-400 font-mono px-2.5 py-1.5 rounded-xl border border-neutral-850 shadow-inner w-12 sm:w-20 text-center transition-all duration-300 bg-neutral-900/80">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-[9px] sm:text-xs font-bold text-neutral-500 uppercase mt-1 tracking-wider">
                Saniye
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 sm:mt-6">
        <div className="flex justify-between text-[10px] sm:text-xs font-medium text-neutral-400 mb-1.5">
          <span>Hazırlık Süreci İlerlemesi</span>
          <span className="text-indigo-400 font-semibold">{percentagePassed}% tamamlandı</span>
        </div>
        <div className="w-full h-1.5 sm:h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800/80">
          <div
            className="h-full bg-linear-to-r from-indigo-500 via-cyan-500 to-indigo-500 bg-[length:200%_auto] animate-shimmer transition-all duration-1000 motion-reduce:animate-none"
            style={{ width: `${percentagePassed}%` }}
          />
        </div>
      </div>
    </div>
  );
});
