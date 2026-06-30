"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { usePlanStore, PlanItem } from "@/store/usePlanStore";
import { TOPICS_MAP } from "@/data/topics";
import { formatMonthName, formatFullDate } from "@/utils/dates";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Check, 
  Calendar,
  Download,
  X,
  FileText,
  Trash2,
  CheckCircle,
  Plus
} from "lucide-react";
import { 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  parseISO,
  isSameMonth
} from "date-fns";
import { tr } from "date-fns/locale";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { MonthlyPDF } from "./PlanPDF";
import { getSubjectColor } from "@/utils/subjectColors";
import confetti from "canvas-confetti";

export function MonthlyView() {
  const { 
    selectedDate, 
    setSelectedDate, 
    plan, 
    updatePlanItem, 
    removePlanItem,
    selectedTrack,
    pdfSettings 
  } = usePlanStore();

  const [isClient, setIsClient] = useState(false);
  const [popoverDate, setPopoverDate] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);

    // Close popover when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setPopoverDate(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeDate = parseISO(selectedDate);

  // Month navigation helpers
  const handlePrevMonth = () => {
    const prevMonth = subMonths(activeDate, 1);
    setSelectedDate(format(prevMonth, "yyyy-MM-dd"));
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(activeDate, 1);
    setSelectedDate(format(nextMonth, "yyyy-MM-dd"));
  };

  // Calendar Grid Mathematics
  const monthStart = startOfMonth(activeDate);
  const monthEnd = endOfMonth(activeDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday of starting week
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 }); // Sunday of ending week

  const calendarDays = eachDayOfInterval({
    start: gridStart,
    end: gridEnd
  });

  const weekDayLabels = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  // Toggle status inside popover
  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "tamamlandi" ? "yapilacak" : "tamamlandi";
    updatePlanItem(id, { status: nextStatus });

    if (nextStatus === "tamamlandi") {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 }
      });
    }
  };

  // Duration editor inside popover
  const handleChangeDuration = (id: string, amount: number) => {
    const item = plan.items.find((i) => i.id === id);
    if (!item) return;
    updatePlanItem(id, { durationMinutes: Math.max(15, item.durationMinutes + amount) });
  };

  // Notes editor inside popover
  const handleChangeNote = (id: string, note: string) => {
    updatePlanItem(id, { note });
  };

  // Pre-compute items by date for O(1) lookups
  const itemsByDateMap = useMemo(() => {
    const map = new Map<string, { items: PlanItem[]; completed: number; duration: number }>();
    for (const item of plan.items) {
      if (!map.has(item.date)) map.set(item.date, { items: [], completed: 0, duration: 0 });
      const entry = map.get(item.date)!;
      entry.items.push(item);
      if (item.status === "tamamlandi") entry.completed++;
      entry.duration += item.durationMinutes;
    }
    return map;
  }, [plan.items]);

  // Filter items that fall in this active month
  const monthStartStr = format(monthStart, "yyyy-MM-01");
  const monthEndStr = format(monthEnd, "yyyy-MM-dd");
  const monthlyItems = useMemo(() => {
    return plan.items.filter((item) => item.date >= monthStartStr && item.date <= monthEndStr);
  }, [plan.items, monthStartStr, monthEndStr]);

  // Items for currently opened popover date
  const popoverItems = popoverDate
    ? plan.items.filter((item) => item.date === popoverDate)
    : [];

  return (
    <div className="flex flex-col h-full bg-neutral-950/60 border border-neutral-900 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md relative">
      {/* Date Header navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-b-neutral-900 pb-5 mb-5">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white tracking-tight">Aylık Çalışma Planı</h2>
        </div>
        
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-xl p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-neutral-200 px-2 select-none min-w-[140px] text-center capitalize">
              {formatMonthName(selectedDate)}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* PDF Download Link */}
          {isClient && monthlyItems.length > 0 && (
            <PDFDownloadLink
              document={
                <MonthlyPDF
                  planTitle={plan.title}
                  examDateStr={plan.examDate}
                  selectedMonthStr={selectedDate}
                  items={monthlyItems}
                  selectedTrack={selectedTrack}
                  pdfSettings={pdfSettings}
                />
              }
              fileName={`aylik-${format(activeDate, "yyyy-MM")}.pdf`}
              className="text-xs font-bold px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-850 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
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

      {/* Week day label header */}
      <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2 shrink-0">
        {weekDayLabels.map((lbl) => (
          <div key={lbl} className="py-1">
            {lbl}
          </div>
        ))}
      </div>

      {/* Monthly Grid */}
      <div className="flex-1 grid grid-cols-7 gap-2 min-h-[350px] md:min-h-[400px]">
        {calendarDays.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isCurrentMonth = isSameMonth(day, activeDate);
          
          const dayData = itemsByDateMap.get(dateStr);
          const dayItems = dayData ? dayData.items : [];
          const completedItemsCount = dayData ? dayData.completed : 0;
          const hasItems = dayData && dayData.items.length > 0;
          const allCompleted = hasItems && completedItemsCount === dayItems.length;
          const totalDuration = dayData ? dayData.duration : 0;

          const isToday = dateStr === format(new Date(), "yyyy-MM-dd");
          const isSelected = dateStr === selectedDate;

          return (
            <div
              key={dateStr}
              onClick={() => {
                setSelectedDate(dateStr);
                setPopoverDate(dateStr);
              }}
              className={`rounded-xl p-2 border flex flex-col text-left transition-all cursor-pointer relative select-none group min-h-[60px] md:min-h-[70px] ${
                !isCurrentMonth
                  ? "opacity-25 bg-transparent border-transparent"
                  : isSelected
                    ? "bg-indigo-950/20 border-indigo-500 shadow-md shadow-indigo-500/5"
                    : isToday
                      ? "bg-neutral-900 border-neutral-700 hover:border-neutral-500"
                      : allCompleted
                        ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40"
                        : "bg-neutral-900/10 border-neutral-900 hover:border-neutral-800"
              }`}
            >
              {/* Day Number */}
              <span className={`text-xs font-bold leading-none mb-1 ${
                isToday 
                  ? "text-indigo-400 font-extrabold" 
                  : isCurrentMonth 
                    ? "text-neutral-400 group-hover:text-white" 
                    : "text-neutral-700"
              }`}>
                {format(day, "d")}
              </span>

              {/* Day summaries inside cell */}
              {hasItems && (
                <div className="mt-auto space-y-1">
                  {allCompleted ? (
                    <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md leading-none">
                      <Check className="w-2.5 h-2.5 stroke-[2.5px] shrink-0" />
                      <span className="hidden sm:inline">Bitti</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-1 py-0.5 rounded-md leading-none w-max block">
                        {dayItems.length} ders
                      </span>
                      <span className="text-[8px] font-semibold text-neutral-500 font-mono block leading-none">
                        ⏱️ {totalDuration}dk
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Popover / Modal detailed view of a selected day */}
      {popoverDate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div
            ref={popoverRef}
            className="w-full max-w-lg bg-neutral-950 border border-neutral-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            {/* Popover Header */}
            <div className="px-5 py-4 border-b border-neutral-900 bg-neutral-900/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {formatFullDate(popoverDate)} Planı
                </h3>
              </div>
              <button
                onClick={() => setPopoverDate(null)}
                className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-900 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Popover Items list */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {popoverItems.length === 0 ? (
                <div className="text-center py-10 text-neutral-500 text-xs flex flex-col items-center gap-2">
                  <CheckCircle className="w-8 h-8 text-neutral-700" />
                  <span>Bu güne eklenmiş bir çalışma bulunmamaktadır.</span>
                  <button 
                    onClick={() => setPopoverDate(null)}
                    className="text-xs text-indigo-400 font-semibold hover:underline mt-1"
                  >
                    Ders Eklemek İçin Kapat
                  </button>
                </div>
              ) : (
                popoverItems.map((item) => {
                  const topic = TOPICS_MAP.get(item.topicId);
                  if (!topic) return null;
                  const isCompleted = item.status === "tamamlandi";

                  return (
                    <div
                      key={item.id}
                      className={`border rounded-xl p-3 flex flex-col gap-2 transition-all ${
                        isCompleted
                          ? "bg-emerald-500/5 border-emerald-500/10"
                          : "bg-neutral-900/30 border-neutral-900 hover:border-neutral-850"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          {/* Complete Checkbox */}
                          <button
                            onClick={() => handleToggleStatus(item.id, item.status)}
                            className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer ${
                              isCompleted
                                ? "bg-emerald-600 border-emerald-500 text-white"
                                : "border-neutral-700 hover:border-neutral-500 text-transparent"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3px]" />
                          </button>

                          <div className="flex flex-col gap-0.5">
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-sm border uppercase w-max mb-1 ${getSubjectColor(topic.subject)}`}>
                              {topic.subject}
                            </span>
                            <span className={`text-xs font-bold leading-normal ${isCompleted ? "line-through text-neutral-500" : "text-white"}`}>
                              {topic.name}
                            </span>
                          </div>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={() => removePlanItem(item.id)}
                          className="p-1 rounded-md text-neutral-500 hover:text-red-400 hover:bg-neutral-900 transition-colors cursor-pointer shrink-0"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Not Ekleme */}
                      <div className="flex items-center gap-1.5 pl-6 text-neutral-500 focus-within:text-white">
                        <FileText className="w-3 h-3 text-neutral-600" />
                        <input
                          type="text"
                          placeholder="Not ekleyin..."
                          value={item.note || ""}
                          onChange={(e) => handleChangeNote(item.id, e.target.value)}
                          className="bg-transparent text-[10px] text-neutral-300 placeholder-neutral-700 border-b border-transparent focus:border-neutral-800 focus:outline-hidden py-0.5 w-full"
                        />
                      </div>

                      {/* Süre Ayarlama */}
                      <div className="flex items-center justify-end gap-1.5 pl-6">
                        <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-850 rounded p-0.5">
                          <button
                            onClick={() => handleChangeDuration(item.id, -15)}
                            className="px-1 text-[10px] text-neutral-500 hover:text-white font-bold select-none cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-[10px] font-bold text-neutral-300 font-mono min-w-[45px] text-center flex items-center justify-center gap-0.5">
                            <Clock className="w-2.5 h-2.5 text-neutral-500" />
                            {item.durationMinutes} dk
                          </span>
                          <button
                            onClick={() => handleChangeDuration(item.id, 15)}
                            className="px-1 text-[10px] text-neutral-500 hover:text-white font-bold select-none cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
