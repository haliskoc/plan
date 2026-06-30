"use client";

import React, { useEffect, useState } from "react";
import { differenceInSeconds, differenceInDays, parseISO } from "date-fns";

interface CountdownProps {
  targetDateStr: string;
  startDateStr?: string;
}

export function Countdown({ targetDateStr, startDateStr }: CountdownProps) {
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

    const calculateTimeLeft = () => {
      const now = new Date();
      const diffSeconds = differenceInSeconds(targetDate, now);

      if (diffSeconds <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const days = Math.floor(diffSeconds / (3600 * 24));
      const hours = Math.floor((diffSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((diffSeconds % 3600) / 60);
      const seconds = diffSeconds % 60;

      setTimeLeft({ days, hours, minutes, seconds, isOver: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  if (!mounted) {
    return (
      <div className="w-full h-24 bg-neutral-900/40 border border-neutral-800 rounded-2xl animate-pulse" />
    );
  }

  const targetDate = parseISO(targetDateStr);
  const startDate = startDateStr ? parseISO(startDateStr) : new Date();
  const totalDays = Math.max(1, differenceInDays(targetDate, startDate) + 1);
  const daysPassed = Math.max(0, differenceInDays(new Date(), startDate));
  const percentagePassed = Math.min(100, Math.round((daysPassed / totalDays) * 100));

  return (
    <div className="relative overflow-hidden w-full bg-linear-to-r from-neutral-900/90 to-neutral-950/90 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white mb-1">
            2027 YKS Hedef Geri Sayım
          </h2>
          <p className="text-sm text-neutral-400">
            Hedef Sınav Tarihi:{" "}
            <span className="font-semibold text-indigo-400">{targetDateStr}</span>
          </p>
        </div>

        {timeLeft.isOver ? (
          <div className="text-xl font-bold text-emerald-400 animate-bounce">
            YKS Zamanı Geldi! Başarılar Dileriz. 🎉
          </div>
        ) : (
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono bg-neutral-900/80 px-4 py-2 rounded-xl border border-neutral-800 shadow-inner w-20 sm:w-24 text-center">
                {timeLeft.days}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-neutral-500 uppercase mt-1 tracking-wider">
                Gün
              </span>
            </div>
            <div className="text-2xl font-bold text-neutral-700">:</div>
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-extrabold text-indigo-400 font-mono bg-neutral-900/80 px-4 py-2 rounded-xl border border-neutral-800 shadow-inner w-16 sm:w-20 text-center">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-neutral-500 uppercase mt-1 tracking-wider">
                Saat
              </span>
            </div>
            <div className="text-2xl font-bold text-neutral-700">:</div>
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-extrabold text-cyan-400 font-mono bg-neutral-900/80 px-4 py-2 rounded-xl border border-neutral-800 shadow-inner w-16 sm:w-20 text-center">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-neutral-500 uppercase mt-1 tracking-wider">
                Dakika
              </span>
            </div>
            <div className="text-2xl font-bold text-neutral-700">:</div>
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-extrabold text-pink-400 font-mono bg-neutral-900/80 px-4 py-2 rounded-xl border border-neutral-800 shadow-inner w-16 sm:w-20 text-center">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-neutral-500 uppercase mt-1 tracking-wider">
                Saniye
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-xs font-medium text-neutral-400 mb-1.5">
          <span>Hazırlık Süreci İlerlemesi</span>
          <span className="text-indigo-400 font-semibold">{percentagePassed}% tamamlandı</span>
        </div>
        <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800/80">
          <div
            className="h-full bg-linear-to-r from-indigo-500 via-cyan-500 to-indigo-500 bg-[length:200%_auto] animate-shimmer transition-all duration-1000"
            style={{ width: `${percentagePassed}%` }}
          />
        </div>
      </div>
    </div>
  );
}
