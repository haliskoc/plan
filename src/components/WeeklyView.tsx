"use client";

import React, { useState, useEffect } from "react";
import { usePlanStore } from "@/store/usePlanStore";
import { YKS_TOPICS } from "@/data/topics";
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
import { PDFDownloadLink } from "@react-pdf/renderer";
import { WeeklyPDF } from "./PlanPDF";
import { getSubjectColor } from "@/utils/subjectColors";
import confetti from "canvas-confetti";

export function WeeklyView() {
  const { 
    selectedDate, 
    setSelectedDate, 
    plan, 
    updatePlanItem, 
    removePlanItem 
  } = usePlanStore();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const activeDate = parseISO(selectedDate);

  // Find start (Monday) and end (Sunday) of the active week
  const startOfActiveWeek = startOfWeek(activeDate, { weekStartsOn: 1 });
  const endOfActiveWeek = endOfWeek(activeDate, { weekStartsOn: 1 });

  const daysOfWeek = eachDayOfInterval({
    start: startOfActiveWeek,
    end: endOfActiveWeek
  });

  const handlePrevWeek = () => {
    const prevWeek = subWeeks(activeDate, 1);
    setSelectedDate(format(prevWeek, "yyyy-MM-dd"));
  };

  const handleNextWeek = () => {
    const nextWeek = addWeeks(activeDate, 1);
    setSelectedDate(format(nextWeek, "yyyy-MM-dd"));
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "tamamlandi" ? "yapilacak" : "tamamlandi";
    updatePlanItem(id, { status: nextStatus });

    if (nextStatus === "tamamlandi") {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.85 }
      });
    }
  };

  // Filter items that fall in this week's interval
  const weekStartStr = format(startOfActiveWeek, "yyyy-MM-dd");
  const weekEndStr = format(endOfActiveWeek, "yyyy-MM-dd");
  
  const weeklyItems = plan.items.filter((item) => {
    return item.date >= weekStartStr && item.date <= weekEndStr;
  });

  const weekRangeLabel = `${format(startOfActiveWeek, "d MMMM", { locale: tr })} - ${format(endOfActiveWeek, "d MMMM yyyy", { locale: tr })}`;

  return (
    <div className="flex flex-col h-full bg-neutral-950/60 border border-neutral-900 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md">
      {/* Date Header navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-b-neutral-900 pb-5 mb-5">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white tracking-tight">Haftalık Çalışma Planı</h2>
        </div>
        
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-xl p-1">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-neutral-200 px-2 select-none min-w-[170px] text-center">
              {weekRangeLabel}
            </span>
            <button
              onClick={handleNextWeek}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* PDF Download Link */}
          {isClient && weeklyItems.length > 0 && (
            <PDFDownloadLink
              document={
                <WeeklyPDF
                  planTitle={plan.title}
                  examDateStr={plan.examDate}
                  selectedDateStr={selectedDate}
                  items={weeklyItems}
                />
              }
              fileName={`haftalik-${weekStartStr}-to-${weekEndStr}.pdf`}
              className="text-xs font-bold px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-855 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {({ loading }) => (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>{loading ? "Hazırlanıyor..." : "PDF İndir"}</span>
                </>
              )}
            </PDFDownloadLink>
          )}
        </div>
      </div>

      {/* Grid columns */}
      <div className="flex-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
        <div className="grid grid-cols-7 gap-2 sm:gap-3 min-w-[740px] sm:min-w-[840px] h-[calc(100vh-340px)]">
          {daysOfWeek.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayItems = plan.items.filter((item) => item.date === dateStr);
            const totalMin = dayItems.reduce((sum, item) => sum + item.durationMinutes, 0);
            
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
                      : "bg-neutral-900/10 border-neutral-900 hover:border-neutral-800"
                }`}
              >
                {/* Day Header */}
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

                {/* Day list items */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 scrollbar-none">
                  {dayItems.map((item) => {
                    const topic = YKS_TOPICS.find((t) => t.id === item.topicId);
                    if (!topic) return null;
                    const isCompleted = item.status === "tamamlandi";

                    return (
                      <div
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation(); // Avoid triggering parent day selection
                        }}
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
                        <span className={`text-[10px] font-bold leading-tight ${isCompleted ? "line-through text-neutral-500" : ""}`}>
                          {topic.name}
                        </span>

                        <div className="flex items-center justify-between mt-1 text-[8px] text-neutral-500 font-semibold font-mono">
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {item.durationMinutes} dk
                          </span>
                          
                          {/* Toggle complete */}
                          <button
                            onClick={() => handleToggleStatus(item.id, item.status)}
                            className={`w-3.5 h-3.5 border rounded-sm flex items-center justify-center cursor-pointer transition-colors ${
                              isCompleted 
                                ? "bg-emerald-600 border-emerald-500 text-white" 
                                : "border-neutral-700 text-transparent hover:border-neutral-500"
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
}
