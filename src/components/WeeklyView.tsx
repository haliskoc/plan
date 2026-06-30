"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { usePlanStore, PlanItem, useActivePlan } from "@/store/usePlanStore";
import { TOPICS_MAP } from "@/data/topics";
import { getShortDate, formatDayName } from "@/utils/dates";
import { 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Clock, 
  Check, 
  Calendar,
  Download,
  AlertCircle
} from "lucide-react";
import { addWeeks, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval, format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { LazyWeeklyPDF } from "./LazyPDFButton";
import { getSubjectColor } from "@/utils/subjectColors";

let confettiFnW: any = null;
const loadConfettiW = async () => {
  if (!confettiFnW) { const mod = await import("canvas-confetti"); confettiFnW = mod.default; }
  return confettiFnW;
};

export const WeeklyView = React.memo(function WeeklyView() {
  const selectedDate = usePlanStore((s) => s.selectedDate);
  const setSelectedDate = usePlanStore((s) => s.setSelectedDate);
  const plan = useActivePlan();
  const updatePlanItem = usePlanStore((s) => s.updatePlanItem);
  const removePlanItem = usePlanStore((s) => s.removePlanItem);
  const selectedTrack = usePlanStore((s) => s.selectedTrack);
  const pdfSettings = usePlanStore((s) => s.pdfSettings);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const activeDate = useMemo(() => parseISO(selectedDate), [selectedDate]);

  const startOfActiveWeek = useMemo(() => startOfWeek(activeDate, { weekStartsOn: 1 }), [activeDate]);
  const endOfActiveWeek = useMemo(() => endOfWeek(activeDate, { weekStartsOn: 1 }), [activeDate]);

  const daysOfWeek = useMemo(() => eachDayOfInterval({
    start: startOfActiveWeek,
    end: endOfActiveWeek
  }), [startOfActiveWeek, endOfActiveWeek]);

  const handlePrevWeek = useCallback(() => {
    setSelectedDate(format(subWeeks(activeDate, 1), "yyyy-MM-dd"));
  }, [activeDate, setSelectedDate]);

  const handleNextWeek = useCallback(() => {
    setSelectedDate(format(addWeeks(activeDate, 1), "yyyy-MM-dd"));
  }, [activeDate, setSelectedDate]);

  const handleToggleStatus = useCallback((id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "tamamlandi" ? "yapilacak" : "tamamlandi";
    updatePlanItem(id, { status: nextStatus });
    if (nextStatus === "tamamlandi") {
      loadConfettiW().then((cf) => cf({ particleCount: 50, spread: 60, origin: { y: 0.85 } }));
    }
  }, [updatePlanItem]);

  const weekStartStr = useMemo(() => format(startOfActiveWeek, "yyyy-MM-dd"), [startOfActiveWeek]);
  const weekEndStr = useMemo(() => format(endOfActiveWeek, "yyyy-MM-dd"), [endOfActiveWeek]);
  
  const itemsByDateMap = useMemo(() => {
    const map = new Map<string, { items: PlanItem[]; minutes: number }>();
    for (const item of plan.items) {
      if (item.date >= weekStartStr && item.date <= weekEndStr) {
        if (!map.has(item.date)) map.set(item.date, { items: [], minutes: 0 });
        const entry = map.get(item.date)!;
        entry.items.push(item);
        entry.minutes += item.durationMinutes;
      }
    }
    return map;
  }, [plan.items, weekStartStr, weekEndStr]);

  const weeklyItems = useMemo(() => {
    const all: PlanItem[] = [];
    itemsByDateMap.forEach((v) => all.push(...v.items));
    return all;
  }, [itemsByDateMap]);

  const weekRangeLabel = useMemo(
    () => `${format(startOfActiveWeek, "d MMMM", { locale: tr })} - ${format(endOfActiveWeek, "d MMMM yyyy", { locale: tr })}`,
    [startOfActiveWeek, endOfActiveWeek]
  );

  const hasBg = !!pdfSettings.backgroundImage;

  return (
    <div className={`flex flex-col h-full border border-neutral-900 rounded-2xl p-4 sm:p-6 shadow-xl transition-all duration-300 ${
      hasBg ? "bg-neutral-950/80" : "bg-neutral-950/90"
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-b-neutral-900 pb-5 mb-5">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white tracking-tight">Haftalık Çalışma Planı</h2>
        </div>
        
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-xl p-1">
            <button onClick={handlePrevWeek} className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-neutral-200 px-2 select-none min-w-[170px] text-center">
              {weekRangeLabel}
            </span>
            <button onClick={handleNextWeek} className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {isClient && weeklyItems.length > 0 && (
            <LazyWeeklyPDF
              planTitle={plan.title}
              examDateStr={plan.examDate}
              selectedDateStr={selectedDate}
              items={weeklyItems}
              selectedTrack={selectedTrack}
              pdfSettings={pdfSettings}
              fileName={`haftalik-${weekStartStr}-to-${weekEndStr}.pdf`}
              className="text-xs font-bold px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-855 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            />
          )}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
        <div className="grid grid-cols-7 gap-2 sm:gap-3 min-w-[740px] sm:min-w-[840px] h-[calc(100vh-340px)]">
          {daysOfWeek.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayData = itemsByDateMap.get(dateStr);
            const dayItems = dayData ? dayData.items : [];
            const totalMin = dayData ? dayData.minutes : 0;
            
            const isToday = dateStr === format(new Date(), "yyyy-MM-dd");
            const isSelected = dateStr === selectedDate;

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex flex-col rounded-xl p-3 border transition-all cursor-pointer select-none ${
                  isSelected 
                    ? "bg-indigo-950/20 border-indigo-500/50 shadow-md shadow-indigo-500/5" 
                    : isToday
                      ? "bg-neutral-900/40 border-neutral-700 shadow-xs"
                      : hasBg
                        ? "bg-neutral-900/5 border-neutral-900/60 hover:border-neutral-800/80"
                        : "bg-neutral-900/10 border-neutral-900 hover:border-neutral-800"
                }`}
              >
                <div className="text-center border-b border-neutral-900 pb-2 mb-3 shrink-0">
                  <h3 className="text-xs font-bold text-white mb-0.5">
                    {format(day, "EEEE", { locale: tr })}
                  </h3>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-[10px] text-neutral-400 font-semibold font-mono">
                      {format(day, "d MMM", { locale: tr })}
                    </span>
                    {totalMin > 0 && (
                      <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-1 rounded-sm font-mono shrink-0">
                        {totalMin}dk
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 scrollbar-none">
                  {dayItems.map((item) => {
                    const topic = TOPICS_MAP.get(item.topicId);
                    if (!topic) return null;
                    const isCompleted = item.status === "tamamlandi";

                    return (
                      <div
                        key={item.id}
                        onClick={(e) => { e.stopPropagation(); }}
                        className={`group relative p-2.5 rounded-lg border transition-all flex flex-col gap-1.5 ${
                          isCompleted
                            ? "bg-emerald-500/5 border-emerald-500/20 text-neutral-400"
                            : "bg-neutral-950/40 border-neutral-900 hover:border-neutral-800 text-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className={`text-[8px] font-bold px-1 py-0.2 rounded-sm border uppercase leading-none shrink-0 ${getSubjectColor(topic.subject)}`}>
                            {topic.subject}
                          </span>
                          <button
                            onClick={() => removePlanItem(item.id)}
                            className="text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-0.5 rounded-sm hover:bg-neutral-900"
                            title="Konuyu Sil"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <span className={`text-[10px] font-bold leading-tight ${
                          isCompleted ? "line-through text-neutral-500" : "text-white"
                        }`}>
                          {topic.name}
                        </span>

                        <div className="flex items-center justify-between mt-1 text-[8px] text-neutral-500 font-semibold font-mono">
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {item.durationMinutes} dk
                          </span>
                          
                          <button
                            onClick={() => handleToggleStatus(item.id, item.status)}
                            className={`w-3.5 h-3.5 border rounded-sm flex items-center justify-center cursor-pointer transition-colors ${
                              isCompleted ? "bg-emerald-600 border-emerald-500 text-white" : "border-neutral-700 text-transparent hover:border-neutral-500"
                            }`}
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3px]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {dayItems.length === 0 && (
                    <div className="h-full flex items-center justify-center py-8 text-[10px] text-neutral-600 font-medium">
                      Boş
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
