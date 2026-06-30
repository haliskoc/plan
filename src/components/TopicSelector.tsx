"use client";

import React, { useState, useMemo, useCallback } from "react";
import { usePlanStore, useActivePlan } from "@/store/usePlanStore";
import { YKS_TOPICS } from "@/data/topics";
import { getSubjectColor } from "@/utils/subjectColors";
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Search, 
  Check, 
  Info,
  Compass, 
  Layers, 
  PenTool, 
  Zap, 
  FlaskConical, 
  Heart,
  Globe, 
  Map, 
  HelpCircle, 
  Star,
  BookOpen
} from "lucide-react";

const SUBJECT_AESTHETICS: Record<string, { gradient: string; border: string; text: string; bg: string; icon: React.ComponentType<any> }> = {
  "Matematik": { gradient: "from-blue-500 to-indigo-500", border: "border-t-blue-500", text: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: Compass },
  "Geometri": { gradient: "from-cyan-500 to-teal-500", border: "border-t-cyan-500", text: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", icon: Layers },
  "Türkçe": { gradient: "from-amber-500 to-orange-500", border: "border-t-amber-500", text: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: PenTool },
  "Fizik": { gradient: "from-violet-500 to-purple-500", border: "border-t-violet-500", text: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", icon: Zap },
  "Kimya": { gradient: "from-emerald-500 to-green-500", border: "border-t-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: FlaskConical },
  "Biyoloji": { gradient: "from-rose-500 to-pink-500", border: "border-t-rose-500", text: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", icon: Heart },
  "Tarih": { gradient: "from-red-500 to-rose-600", border: "border-t-red-500", text: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: Globe },
  "Coğrafya": { gradient: "from-green-500 to-emerald-600", border: "border-t-green-500", text: "text-green-400", bg: "bg-green-500/10 border-green-500/20", icon: Map },
  "Felsefe": { gradient: "from-fuchsia-500 to-purple-600", border: "border-t-fuchsia-500", text: "text-fuchsia-400", bg: "bg-fuchsia-500/10 border-fuchsia-500/20", icon: HelpCircle },
  "Din Kültürü": { gradient: "from-yellow-500 to-amber-600", border: "border-t-yellow-500", text: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", icon: Star }
};

const DEFAULT_AESTHETIC = { gradient: "from-neutral-500 to-neutral-600", border: "border-t-neutral-500", text: "text-neutral-400", bg: "bg-neutral-500/10 border-neutral-500/20", icon: BookOpen };

export const TopicSelector = React.memo(function TopicSelector() {
  const selectedDate = usePlanStore((s) => s.selectedDate);
  const addPlanItem = usePlanStore((s) => s.addPlanItem);
  const selectedExamType = usePlanStore((s) => s.selectedExamType);
  const setSelectedExamType = usePlanStore((s) => s.setSelectedExamType);
  const selectedTrack = usePlanStore((s) => s.selectedTrack);
  const setSelectedTrack = usePlanStore((s) => s.setSelectedTrack);
  const selectedSubject = usePlanStore((s) => s.selectedSubject);
  const setSelectedSubject = usePlanStore((s) => s.setSelectedSubject);
  const plan = useActivePlan();

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({
    "Matematik": true,
  });

  const toggleSubject = useCallback((subjectName: string) => {
    setExpandedSubjects((prev) => ({ ...prev, [subjectName]: !prev[subjectName] }));
  }, []);

  const filteredTopics = useMemo(() => {
    return YKS_TOPICS.filter((topic) => {
      if (topic.examType !== selectedExamType) return false;
      if (selectedSubject && topic.subject !== selectedSubject) return false;

      if (selectedExamType === "AYT") {
        if (selectedTrack === "SAY" && topic.track !== "SAY" && topic.track !== "ORTAK") return false;
        if (selectedTrack === "EA" && topic.track !== "EA" && topic.track !== "ORTAK") return false;
        if (selectedTrack === "SOZ" && topic.track !== "SOZ" && topic.track !== "EA") return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return topic.name.toLowerCase().includes(query) || topic.subject.toLowerCase().includes(query);
      }

      return true;
    });
  }, [selectedExamType, selectedTrack, selectedSubject, searchQuery]);

  const groupedTopics = useMemo(() => {
    const groups: Record<string, typeof YKS_TOPICS> = {};
    filteredTopics.forEach((topic) => {
      if (!groups[topic.subject]) groups[topic.subject] = [];
      groups[topic.subject].push(topic);
    });
    return groups;
  }, [filteredTopics]);

  const topicScheduleCount = useMemo(() => {
    const counts: Record<string, number> = {};
    plan.items.forEach((item) => { counts[item.topicId] = (counts[item.topicId] || 0) + 1; });
    return counts;
  }, [plan.items]);

  const allSubjects = useMemo(() => {
    const set = new Set<string>();
    YKS_TOPICS.forEach((t) => {
      if (t.examType !== selectedExamType) return;
      if (selectedExamType === "AYT") {
        if (selectedTrack === "SAY" && (t.track === "SAY" || t.track === "ORTAK")) set.add(t.subject);
        else if (selectedTrack === "EA" && (t.track === "EA" || t.track === "ORTAK")) set.add(t.subject);
        else if (selectedTrack === "SOZ" && (t.track === "SOZ" || t.track === "EA")) set.add(t.subject);
      } else {
        set.add(t.subject);
      }
    });
    return Array.from(set).sort();
  }, [selectedExamType, selectedTrack]);

  // Calculate unique scheduled topics per subject for progress tracking
  const subjectStats = useMemo(() => {
    const stats: Record<string, { total: number; scheduledTopics: Set<string> }> = {};
    
    YKS_TOPICS.forEach((t) => {
      if (t.examType !== selectedExamType) return;
      if (selectedExamType === "AYT") {
        if (selectedTrack === "SAY" && t.track !== "SAY" && t.track !== "ORTAK") return;
        if (selectedTrack === "EA" && t.track !== "EA" && t.track !== "ORTAK") return;
        if (selectedTrack === "SOZ" && t.track !== "SOZ" && t.track !== "EA") return;
      }

      if (!stats[t.subject]) {
        stats[t.subject] = { total: 0, scheduledTopics: new Set() };
      }
      stats[t.subject].total++;
    });

    plan.items.forEach((item) => {
      const topic = YKS_TOPICS.find((t) => t.id === item.topicId);
      if (topic && topic.examType === selectedExamType) {
        if (stats[topic.subject]) {
          stats[topic.subject].scheduledTopics.add(item.topicId);
        }
      }
    });

    const finalStats: Record<string, { total: number; scheduled: number; percentage: number }> = {};
    Object.keys(stats).forEach((sub) => {
      const total = stats[sub].total;
      const scheduled = stats[sub].scheduledTopics.size;
      finalStats[sub] = {
        total,
        scheduled,
        percentage: total > 0 ? Math.round((scheduled / total) * 100) : 0
      };
    });

    return finalStats;
  }, [selectedExamType, selectedTrack, plan.items]);

  const handleAddTopic = useCallback((topicId: string) => {
    addPlanItem({
      date: selectedDate,
      topicId,
      durationMinutes: 90,
      status: "yapilacak",
      note: "Konu çalışması ve soru çözümü.",
    });
  }, [addPlanItem, selectedDate]);

  return (
    <div id="tour-topic-selector" className="flex flex-col h-full bg-neutral-950/90 border border-neutral-900 rounded-2xl p-4 sm:p-5 shadow-xl transition-all duration-300">
      
      {/* Upper Filters section */}
      <div className="mb-4 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Konu Kütüphanesi</h2>
          <div className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
            Seçili Tarihe Eklenecek
          </div>
        </div>

        {/* TYT / AYT Selector */}
        <div className="grid grid-cols-2 p-1 bg-neutral-900 border border-neutral-850 rounded-xl">
          <button 
            onClick={() => setSelectedExamType("TYT")} 
            className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${selectedExamType === "TYT" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-neutral-500 hover:text-neutral-300"}`}
          >
            TYT Konuları
          </button>
          <button 
            onClick={() => setSelectedExamType("AYT")} 
            className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${selectedExamType === "AYT" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "text-neutral-500 hover:text-neutral-300"}`}
          >
            AYT Konuları
          </button>
        </div>

        {/* AYT Track selection */}
        {selectedExamType === "AYT" && (
          <div className="grid grid-cols-3 p-1 bg-neutral-900 border border-neutral-850 rounded-xl">
            <button onClick={() => setSelectedTrack("SAY")} className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${selectedTrack === "SAY" ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300"}`}>
              Sayısal (SAY)
            </button>
            <button onClick={() => setSelectedTrack("EA")} className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${selectedTrack === "EA" ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300"}`}>
              Eşit Ağırlık (EA)
            </button>
            <button onClick={() => setSelectedTrack("SOZ")} className={`py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${selectedTrack === "SOZ" ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300"}`}>
              Sözel (SÖZ)
            </button>
          </div>
        )}

        {/* Swipeable / Scrollable Subject Badges */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none select-none -mx-1 px-1">
          <button 
            onClick={() => setSelectedSubject("")} 
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer shrink-0 border ${
              !selectedSubject 
                ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/10" 
                : "bg-neutral-900 text-neutral-400 hover:text-neutral-200 border-neutral-850"
            }`}
          >
            Tümü
          </button>
          {allSubjects.map((sub) => (
            <button 
              key={sub} 
              onClick={() => setSelectedSubject(selectedSubject === sub ? "" : sub)} 
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer shrink-0 border ${
                selectedSubject === sub 
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/10" 
                  : "bg-neutral-900 text-neutral-400 hover:text-neutral-200 border-neutral-850"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Ders veya konu ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900/60 border border-neutral-850 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-indigo-500 focus:bg-neutral-900 transition-all"
          />
        </div>
      </div>

      {/* Main Subjects / Topics container */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[calc(100vh-390px)] scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
        {searchQuery.trim() !== "" ? (
          /* Search Results: Flat list of topics */
          filteredTopics.length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-xs">Aranan kriterlere uygun konu bulunamadı.</div>
          ) : (
            <div className="space-y-1.5">
              {filteredTopics.map((topic) => {
                const count = topicScheduleCount[topic.id] || 0;
                return (
                  <div 
                    key={topic.id} 
                    className="flex items-center justify-between p-3 rounded-xl border border-neutral-900 bg-neutral-900/10 hover:bg-neutral-900/30 hover:border-neutral-800 transition-all gap-2"
                  >
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-sm border uppercase leading-none ${getSubjectColor(topic.subject)}`}>
                          {topic.subject}
                        </span>
                        <span className="text-[9px] font-bold text-neutral-500 font-mono leading-none">{topic.examType}</span>
                      </div>
                      <span className="text-xs font-bold text-neutral-200 truncate pr-1">{topic.name}</span>
                    </div>
                    <button
                      onClick={() => handleAddTopic(topic.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                        count > 0 
                          ? "bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600/20" 
                          : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10"
                      }`}
                    >
                      {count > 0 ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{count} Kez</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Ekle</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Grouped list of subjects as Accordion Progress Cards */
          Object.keys(groupedTopics).length === 0 ? (
            <div className="text-center py-8 text-neutral-500 text-xs">Aranan kriterlere uygun konu bulunamadı.</div>
          ) : (
            Object.keys(groupedTopics).sort().map((subjectName) => {
              const isExpanded = expandedSubjects[subjectName] || !!selectedSubject;
              const topicsInGroup = groupedTopics[subjectName];
              
              const aes = SUBJECT_AESTHETICS[subjectName] || DEFAULT_AESTHETIC;
              const Icon = aes.icon;
              const stats = subjectStats[subjectName] || { total: 0, scheduled: 0, percentage: 0 };

              return (
                <div 
                  key={subjectName} 
                  className={`border border-neutral-900 rounded-2xl bg-neutral-950/40 hover:bg-neutral-950/70 overflow-hidden transition-all duration-300 border-t-4 ${aes.border}`}
                >
                  {/* Subject card header */}
                  <button 
                    onClick={() => toggleSubject(subjectName)} 
                    className="w-full flex flex-col p-4 bg-neutral-900/10 hover:bg-neutral-900/20 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg bg-linear-to-tr ${aes.gradient} text-white`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-neutral-200">{subjectName}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[9px] text-neutral-400 font-bold bg-neutral-900 border border-neutral-850 px-2 py-0.5 rounded-md font-mono">
                          {stats.scheduled}/{stats.total} Konu
                        </span>
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-neutral-500" /> : <ChevronRight className="w-4 h-4 text-neutral-500" />}
                      </div>
                    </div>
                    
                    {/* Completion progress bar */}
                    <div className="w-full">
                      <div className="flex items-center justify-between text-[9px] text-neutral-500 font-bold mb-1">
                        <span>Konu İlerlemesi</span>
                        <span className={`${aes.text}`}>{stats.percentage}%</span>
                      </div>
                      <div className="w-full bg-neutral-900 h-1 rounded-full overflow-hidden border border-neutral-850/55">
                        <div className={`h-full bg-linear-to-r ${aes.gradient}`} style={{ width: `${stats.percentage}%` }} />
                      </div>
                    </div>
                  </button>

                  {/* Accordion topics list */}
                  {isExpanded && (
                    <div className="divide-y divide-neutral-900/50 bg-neutral-950/30 max-h-80 overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-neutral-800">
                      {topicsInGroup.map((topic) => {
                        const count = topicScheduleCount[topic.id] || 0;
                        return (
                          <div key={topic.id} className="flex items-center justify-between px-4 py-3.5 hover:bg-neutral-900/20 transition-all gap-2">
                            <span className={`text-xs leading-normal flex-1 pr-1 ${count > 0 ? "text-neutral-500 line-through font-medium" : "text-neutral-200 font-semibold"}`}>
                              {topic.name}
                            </span>
                            <button 
                              onClick={() => handleAddTopic(topic.id)} 
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 shrink-0 border ${
                                count > 0 
                                  ? "bg-emerald-600/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-600/20" 
                                  : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 hover:scale-[1.02]"
                              }`}
                            >
                              {count > 0 ? (
                                <>
                                  <Check className="w-3.5 h-3.5 stroke-[2.5px]" />
                                  <span>{count} Kez</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Ekle</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )
        )}
      </div>

      {/* Helper Info badge at bottom */}
      <div className="flex items-start gap-2 bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3 mt-4 shrink-0 text-neutral-400">
        <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-[10px] leading-relaxed">
          Bir konuyu plana eklemek için yanındaki <span className="font-semibold text-neutral-200">Ekle (+)</span> butonuna tıklayın. Konu, sağ panelde seçili olan tarihe eklenecektir.
        </p>
      </div>

    </div>
  );
});

export default TopicSelector;
