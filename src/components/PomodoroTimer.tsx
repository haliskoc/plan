"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { usePlanStore } from "@/store/usePlanStore";
import { Play, Pause, RotateCcw, Clock, Coffee, SettingsIcon } from "lucide-react";

export function PomodoroTimer() {
  const { pomodoro, startPomodoro, pausePomodoro, resetPomodoro, tickPomodoro, setPomodoroSession } = usePlanStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (pomodoro.isRunning) {
      intervalRef.current = setInterval(tickPomodoro, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [pomodoro.isRunning, tickPomodoro, clearTimer]);

  const formatTime = () => {
    const m = String(pomodoro.minutes).padStart(2, "0");
    const s = String(pomodoro.seconds).padStart(2, "0");
    return `${m}:${s}`;
  };

  const sessionOptions = [25, 30, 45, 50, 60];

  return (
    <div className="bg-neutral-950/60 border border-neutral-900 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-indigo-400" />
        Pomodoro Sayacı
        {pomodoro.isBreak && (
          <span className="text-[10px] font-normal text-amber-400 ml-auto">
            <Coffee className="w-3 h-3 inline mr-1" />Mola
          </span>
        )}
      </h2>

      <div className="text-center mb-4">
        <div className="text-5xl font-extrabold font-mono text-white tracking-wider mb-2">
          {formatTime()}
        </div>
        <div className="text-xs text-neutral-500">
          {pomodoro.isBreak ? "Mola süresi - 5 dk" : `Çalışma - ${pomodoro.sessionMinutes} dk`}
        </div>
        <div className="text-[10px] text-indigo-400 mt-1 font-semibold">
          {pomodoro.totalSessions} oturum tamamlandı
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mb-3">
        {pomodoro.isRunning ? (
          <button
            onClick={pausePomodoro}
            className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Pause className="w-4 h-4" /> Duraklat
          </button>
        ) : (
          <button
            onClick={startPomodoro}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4" /> Başlat
          </button>
        )}
        <button
          onClick={resetPomodoro}
          className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <SettingsIcon className="w-3 h-3 text-neutral-600 shrink-0" />
        <div className="flex gap-1 flex-wrap">
          {sessionOptions.map((min) => (
            <button
              key={min}
              onClick={() => setPomodoroSession(min)}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                pomodoro.sessionMinutes === min
                  ? "bg-indigo-600 text-white"
                  : "bg-neutral-900 text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {min}dk
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
