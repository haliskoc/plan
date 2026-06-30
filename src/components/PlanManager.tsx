"use client";

import React, { useState } from "react";
import { usePlanStore } from "@/store/usePlanStore";
import { X, Plus, Trash2, Layers, Check } from "lucide-react";

interface PlanManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlanManager({ isOpen, onClose }: PlanManagerProps) {
  const { plans, activePlanId, createPlan, switchPlan, deletePlan } = usePlanStore();
  const [newPlanTitle, setNewPlanTitle] = useState("");

  if (!isOpen) return null;

  const handleCreate = () => {
    if (newPlanTitle.trim()) {
      createPlan(newPlanTitle.trim());
      setNewPlanTitle("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
      <div className="bg-neutral-950 border border-neutral-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 bg-neutral-900/40 border-b border-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Plan Yöneticisi</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newPlanTitle}
              onChange={(e) => setNewPlanTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Yeni plan adı..."
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-hidden focus:border-indigo-500 transition-all"
            />
            <button
              onClick={handleCreate}
              disabled={!newPlanTitle.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" /> Oluştur
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {plans.map((pl) => {
              const isActive = pl.id === activePlanId;
              const itemCount = pl.items.length;
              return (
                <div
                  key={pl.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isActive
                      ? "bg-indigo-500/10 border-indigo-500/30"
                      : "bg-neutral-900/30 border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  <button
                    onClick={() => {
                      if (!isActive) {
                        switchPlan(pl.id);
                        onClose();
                      }
                    }}
                    className="flex-1 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {isActive && <Check className="w-4 h-4 text-indigo-400" />}
                      <span className={`text-sm font-bold ${isActive ? "text-white" : "text-neutral-300"}`}>
                        {pl.title}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-1 ml-6">
                      {itemCount} konu · {pl.examDate} · {pl.id === activePlanId ? "Aktif" : ""}
                    </div>
                  </button>
                  {plans.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`"${pl.title}" planını silmek istediğinize emin misiniz?`)) {
                          deletePlan(pl.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
