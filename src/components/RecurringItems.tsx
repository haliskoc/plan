"use client";

import React, { useState } from "react";
import { usePlanStore } from "@/store/usePlanStore";
import { YKS_TOPICS } from "@/data/topics";
import { getSubjectColor } from "@/utils/subjectColors";
import { Repeat, Plus, Trash2, Clock, RefreshCw, Power } from "lucide-react";

export function RecurringItems() {
  const { recurringItems, addRecurringItem, removeRecurringItem, toggleRecurringItem } = usePlanStore();
  const [topicId, setTopicId] = useState("");
  const [duration, setDuration] = useState(90);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const dayNames = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
  const dayIndexes = [0, 1, 2, 3, 4, 5, 6];

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleAdd = () => {
    if (!topicId) return;
    addRecurringItem({
      topicId,
      daysOfWeek: selectedDays,
      durationMinutes: duration,
      note: "Tekrarlayan oturum",
      active: true,
    });
    setTopicId("");
  };

  return (
    <div className="bg-neutral-950/60 border border-neutral-900 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
        <Repeat className="w-4 h-4 text-indigo-400" />
        Tekrarlayan Görevler
      </h2>

      <div className="space-y-3 mb-4">
        <div>
          <select
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500 transition-all"
          >
            <option value="">Konu seçin...</option>
            {YKS_TOPICS.map((t) => (
              <option key={t.id} value={t.id}>
                [{t.examType}] {t.subject} - {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-1">
          {dayIndexes.map((d) => (
            <button
              key={d}
              onClick={() => toggleDay(d)}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                selectedDays.includes(d)
                  ? "bg-indigo-600 text-white"
                  : "bg-neutral-900 text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {dayNames[d]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-neutral-500" />
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            min={15}
            max={300}
            step={15}
            className="w-20 bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1 text-xs text-white text-center focus:outline-hidden focus:border-indigo-500 transition-all"
          />
          <span className="text-xs text-neutral-500">dk</span>
          <button
            onClick={handleAdd}
            disabled={!topicId}
            className="ml-auto px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3 h-3" /> Ekle
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {recurringItems.length === 0 ? (
          <div className="text-center py-4 text-neutral-600 text-xs">
            Henüz tekrarlayan görev yok
          </div>
        ) : (
          recurringItems.map((item) => {
            const topic = YKS_TOPICS.find((t) => t.id === item.topicId);
            const daysStr = item.daysOfWeek.map((d) => dayNames[d]).join(", ");
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                  item.active
                    ? "bg-neutral-900/40 border-neutral-800"
                    : "bg-neutral-900/20 border-neutral-900 opacity-50"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {topic && (
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase ${getSubjectColor(topic.subject)}`}>
                        {topic.subject}
                      </span>
                    )}
                    <span className="text-xs text-white truncate">{topic?.name || "Konu"}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-neutral-500">{daysStr}</span>
                    <span className="text-[9px] text-neutral-500 font-mono">{item.durationMinutes}dk</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleRecurringItem(item.id)}
                    className={`p-1 rounded-md transition-all cursor-pointer ${
                      item.active ? "text-emerald-400 bg-emerald-500/10" : "text-neutral-600"
                    }`}
                    title={item.active ? "Aktif" : "Pasif"}
                  >
                    <Power className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeRecurringItem(item.id)}
                    className="p-1 rounded-md text-neutral-500 hover:text-red-400 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
