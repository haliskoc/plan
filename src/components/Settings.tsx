"use client";

import React, { useState } from "react";
import { usePlanStore } from "@/store/usePlanStore";
import { X, SettingsIcon, Sun, Moon, Target } from "lucide-react";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Settings({ isOpen, onClose }: SettingsProps) {
  const { plan, setExamDate, setPlanTitle, setGoals, goals, theme, toggleTheme } = usePlanStore();
  const [examDateInput, setExamDateInput] = useState(plan.examDate);
  const [titleInput, setTitleInput] = useState(plan.title);
  const [dailyGoal, setDailyGoal] = useState(goals.dailyMinutes);
  const [weeklyGoal, setWeeklyGoal] = useState(goals.weeklyMinutes);

  if (!isOpen) return null;

  const handleSave = () => {
    if (titleInput.trim()) setPlanTitle(titleInput.trim());
    if (examDateInput) setExamDate(examDateInput);
    setGoals({ dailyMinutes: dailyGoal, weeklyMinutes: weeklyGoal });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
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
          <div>
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5 block">Plan Adı</label>
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-1.5 block">Hedef Sınav Tarihi</label>
            <input
              type="date"
              value={examDateInput}
              onChange={(e) => setExamDateInput(e.target.value)}
              min="2026-01-01"
              max="2030-12-31"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-hidden focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="border-t border-neutral-900 pt-5">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              Günlük/Haftalık Hedefler (dakika)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-neutral-500 block mb-1">Günlük Hedef</label>
                <input
                  type="number"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  min={30}
                  max={720}
                  step={30}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500 transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-500 block mb-1">Haftalık Hedef</label>
                <input
                  type="number"
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(Number(e.target.value))}
                  min={60}
                  max={5040}
                  step={60}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-hidden focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-900 pt-5">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3 block">Tema</label>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-indigo-500 transition-all w-full cursor-pointer"
            >
              {theme === "dark" ? (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm text-white">Koyu Tema</span>
                  <span className="text-xs text-neutral-500 ml-auto">Açık temaya geç ✨</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-white">Açık Tema</span>
                  <span className="text-xs text-neutral-500 ml-auto">Koyu temaya geç 🌙</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
