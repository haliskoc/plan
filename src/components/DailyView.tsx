"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePlanStore, PlanItem } from "@/store/usePlanStore";
import { YKS_TOPICS } from "@/data/topics";
import { formatFullDate } from "@/utils/dates";
import { getSubjectColor } from "@/utils/subjectColors";
import { 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Clock, 
  FileText, 
  Check, 
  Calendar,
  Download,
  AlertCircle
} from "lucide-react";
import { addDays, subDays, format, parseISO } from "date-fns";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { DailyPDF } from "./PlanPDF";
import confetti from "canvas-confetti";

export function DailyView() {
  const { 
    selectedDate, 
    setSelectedDate, 
    plan, 
    updatePlanItem, 
    removePlanItem,
    selectedTrack 
  } = usePlanStore();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const activeDate = parseISO(selectedDate);

  const handlePrevDay = useCallback(() => {
    setSelectedDate(format(subDays(activeDate, 1), "yyyy-MM-dd"));
  }, [activeDate, setSelectedDate]);

  const handleNextDay = useCallback(() => {
    setSelectedDate(format(addDays(activeDate, 1), "yyyy-MM-dd"));
  }, [activeDate, setSelectedDate]);

  const dayItems = plan.items.filter((item) => item.date === selectedDate);

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "tamamlandi" ? "yapilacak" : "tamamlandi";
    updatePlanItem(id, { status: nextStatus });
    if (nextStatus === "tamamlandi") {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.8 } });
    }
  };

  const handleChangeDuration = (id: string, amount: number) => {
    const item = plan.items.find((i) => i.id === id);
    if (!item) return;
    updatePlanItem(id, { durationMinutes: Math.max(15, item.durationMinutes + amount) });
  };

  const handleChangeNote = (id: string, note: string) => {
    updatePlanItem(id, { note });
  };

  const totalMinutes = dayItems.reduce((sum, item) => sum + item.durationMinutes, 0);

  return (
    <div className="flex flex-col h-full bg-neutral-950/60 border border-neutral-900 rounded-2xl p-4 sm:p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-900 pb-5 mb-5">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white tracking-tight">Günlük Çalışma Planı</h2>
        </div>
        
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-xl p-1">
            <button
              onClick={handlePrevDay}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-neutral-200 px-2 select-none min-w-[140px] text-center">
              {formatFullDate(selectedDate)}
            </span>
            <button
              onClick={handleNextDay}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {isClient && dayItems.length > 0 && (
            <PDFDownloadLink
              document={
                <DailyPDF
                  planTitle={plan.title}
                  examDateStr={plan.examDate}
                  dateStr={selectedDate}
                  items={dayItems}
                  selectedTrack={selectedTrack}
                />
              }
              fileName={`${selectedDate}-${plan.title.toLowerCase().replace(/\s+/g, "-")}-gunluk.pdf`}
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

      <div className="flex items-center justify-between text-xs text-neutral-400 mb-4 px-1">
        <span>Günün Ders Yükü: <strong className="text-white">{dayItems.length} konu</strong></span>
        <span>Planlanan Süre: <strong className="text-indigo-400 font-mono">{Math.round(totalMinutes / 60 * 10) / 10} saat</strong> ({totalMinutes} dk)</span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[calc(100vh-390px)] scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
        {dayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-neutral-850 rounded-2xl p-6 text-center">
            <AlertCircle className="w-8 h-8 text-neutral-600 mb-3" />
            <h3 className="text-sm font-bold text-neutral-300 mb-1">Planlanmış Çalışma Yok</h3>
            <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
              Bugün için eklenmiş bir konu bulunmamaktadır. Sol paneldeki ders listelerinden dilediğiniz konuyu takviminize ekleyerek başlayabilirsiniz.
            </p>
          </div>
        ) : (
          dayItems.map((item) => {
            const topic = YKS_TOPICS.find((t) => t.id === item.topicId);
            if (!topic) return null;
            const isCompleted = item.status === "tamamlandi";

            return (
              <div
                key={item.id}
                className={`relative border rounded-2xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isCompleted
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-neutral-900/30 border-neutral-850 hover:border-neutral-800"
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <button
                    onClick={() => handleToggleStatus(item.id, item.status)}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                      isCompleted
                        ? "bg-emerald-600 border-emerald-500 text-white"
                        : "border-neutral-700 hover:border-neutral-500 text-transparent"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                  </button>

                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getSubjectColor(topic.subject)}`}>
                        {topic.subject}
                      </span>
                      <span className="text-[10px] font-semibold text-neutral-500 font-mono">
                        {topic.examType}
                      </span>
                    </div>
                    <span className={`text-xs font-bold leading-normal transition-colors ${
                      isCompleted ? "text-neutral-500 line-through" : "text-white"
                    }`}>
                      {topic.name}
                    </span>
                    
                    <div className="flex items-center gap-1.5 mt-2 text-neutral-400 focus-within:text-white transition-colors">
                      <FileText className="w-3 h-3 text-neutral-500" />
                      <input
                        type="text"
                        placeholder="Not ekleyin (örn: Limit testi çözülecek...)"
                        value={item.note || ""}
                        onChange={(e) => handleChangeNote(item.id, e.target.value)}
                        className="bg-transparent text-[11px] placeholder-neutral-600 border-b border-transparent focus:border-neutral-800 focus:outline-hidden py-0.5 w-full text-neutral-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 border-t border-neutral-900 md:border-t-0 pt-3 md:pt-0 shrink-0">
                  <div className="flex items-center gap-1.5 bg-neutral-900/60 border border-neutral-800 rounded-lg p-0.5">
                    <button
                      onClick={() => handleChangeDuration(item.id, -15)}
                      className="px-1.5 py-0.5 text-xs text-neutral-500 hover:text-white transition-colors cursor-pointer font-bold select-none"
                      title="15 dk azalt"
                    >
                      -
                    </button>
                    <span className="text-[11px] font-bold text-neutral-200 font-mono min-w-[50px] text-center flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-500" />
                      {item.durationMinutes} dk
                    </span>
                    <button
                      onClick={() => handleChangeDuration(item.id, 15)}
                      className="px-1.5 py-0.5 text-xs text-neutral-500 hover:text-white transition-colors cursor-pointer font-bold select-none"
                      title="15 dk arttır"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removePlanItem(item.id)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
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
