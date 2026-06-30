"use client";

import React, { useState, useMemo } from "react";
import { usePlanStore } from "@/store/usePlanStore";
import { YKS_TOPICS } from "@/data/topics";
import { ChevronDown, ChevronRight, Plus, Search, Check, Info } from "lucide-react";

export function TopicSelector() {
  const { 
    selectedDate, 
    addPlanItem, 
    plan,
    selectedExamType,
    setSelectedExamType,
    selectedTrack,
    setSelectedTrack,
    selectedSubject,
    setSelectedSubject
  } = usePlanStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({
    "Matematik": true,
  });

  const toggleSubject = (subjectName: string) => {
    setExpandedSubjects((prev) => ({
      ...prev,
      [subjectName]: !prev[subjectName],
    }));
  };

  const filteredTopics = useMemo(() => {
    return YKS_TOPICS.filter((topic) => {
      if (topic.examType !== selectedExamType) return false;
      if (selectedSubject && topic.subject !== selectedSubject) return false;

      if (selectedExamType === "AYT") {
        if (selectedTrack === "SAY") {
          if (topic.track !== "SAY" && topic.track !== "ORTAK") return false;
        } else if (selectedTrack === "EA") {
          if (topic.track !== "EA" && topic.track !== "ORTAK") return false;
        } else if (selectedTrack === "SOZ") {
          if (topic.track !== "SOZ" && topic.track !== "EA") return false;
        }
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = topic.name.toLowerCase().includes(query);
        const matchesSubject = topic.subject.toLowerCase().includes(query);
        return matchesName || matchesSubject;
      }

      return true;
    });
  }, [selectedExamType, selectedTrack, selectedSubject, searchQuery]);

  const groupedTopics = useMemo(() => {
    const groups: Record<string, typeof YKS_TOPICS> = {};
    filteredTopics.forEach((topic) => {
      if (!groups[topic.subject]) {
        groups[topic.subject] = [];
      }
      groups[topic.subject].push(topic);
    });
    return groups;
  }, [filteredTopics]);

  const topicScheduleCount = useMemo(() => {
    const counts: Record<string, number> = {};
    plan.items.forEach((item) => {
      counts[item.topicId] = (counts[item.topicId] || 0) + 1;
    });
    return counts;
  }, [plan.items]);

  const allSubjects = useMemo(() => {
    const set = new Set<string>();
    YKS_TOPICS.forEach((t) => {
      if (t.examType === selectedExamType) {
        if (selectedExamType === "AYT") {
          if (selectedTrack === "SAY" && (t.track === "SAY" || t.track === "ORTAK")) set.add(t.subject);
          else if (selectedTrack === "EA" && (t.track === "EA" || t.track === "ORTAK")) set.add(t.subject);
          else if (selectedTrack === "SOZ" && (t.track === "SOZ" || t.track === "EA")) set.add(t.subject);
        } else {
          set.add(t.subject);
        }
      }
    });
    return Array.from(set).sort();
  }, [selectedExamType, selectedTrack]);

  const handleAddTopic = (topicId: string) => {
    addPlanItem({
      date: selectedDate,
      topicId,
      durationMinutes: 90,
      status: "yapilacak",
      note: "Konu çalışması ve soru çözümü.",
    });
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950/90 border border-neutral-900 rounded-2xl p-4 sm:p-5 shadow-xl">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
          Konu Kütüphanesi
        </h2>

        <div className="grid grid-cols-2 p-1 bg-neutral-900 border border-neutral-800 rounded-xl mb-3">
          <button
            onClick={() => setSelectedExamType("TYT")}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              selectedExamType === "TYT"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            TYT Konuları
          </button>
          <button
            onClick={() => setSelectedExamType("AYT")}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              selectedExamType === "AYT"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            AYT Konuları
          </button>
        </div>

        {selectedExamType === "AYT" && (
          <div className="grid grid-cols-3 p-1 bg-neutral-900 border border-neutral-800 rounded-xl mb-3">
            <button
              onClick={() => setSelectedTrack("SAY")}
              className={`py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                selectedTrack === "SAY"
                  ? "bg-neutral-800 text-white shadow-xs"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Sayısal (SAY)
            </button>
            <button
              onClick={() => setSelectedTrack("EA")}
              className={`py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                selectedTrack === "EA"
                  ? "bg-neutral-800 text-white shadow-xs"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Eşit Ağırlık (EA)
            </button>
            <button
              onClick={() => setSelectedTrack("SOZ")}
              className={`py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                selectedTrack === "SOZ"
                  ? "bg-neutral-800 text-white shadow-xs"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Sözel (SÖZ)
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 mb-2">
          <button
            onClick={() => setSelectedSubject("")}
            className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
              !selectedSubject
                ? "bg-indigo-600 text-white"
                : "bg-neutral-900 text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Tümü
          </button>
          {allSubjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(selectedSubject === sub ? "" : sub)}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                selectedSubject === sub
                  ? "bg-indigo-600 text-white"
                  : "bg-neutral-900 text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

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

      <div className="flex items-start gap-2 bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-3 mb-4 text-neutral-400">
        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-[10px] leading-relaxed">
          Bir konuyu plana eklemek için yanındaki <span className="font-semibold text-neutral-200">Ekle (+)</span> butonuna tıklayın. Konu, sağ panelde seçili olan tarihe eklenecektir.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[calc(100vh-390px)] scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
        {Object.keys(groupedTopics).length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs">
            Aranan kriterlere uygun konu bulunamadı.
          </div>
        ) : (
          Object.keys(groupedTopics).sort().map((subjectName) => {
            const isExpanded = expandedSubjects[subjectName] || searchQuery.trim() !== "" || !!selectedSubject;
            const topicsInGroup = groupedTopics[subjectName];

            return (
              <div
                key={subjectName}
                className="border border-neutral-900 rounded-xl bg-neutral-900/10 overflow-hidden"
              >
                <button
                  onClick={() => toggleSubject(subjectName)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-neutral-900/30 hover:bg-neutral-900/50 transition-colors text-left cursor-pointer"
                >
                  <span className="text-xs font-bold text-neutral-300">
                    {subjectName}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] text-neutral-500 px-2 py-0.5 bg-neutral-900 rounded-full font-mono">
                      {topicsInGroup.length}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
                    )}
                  </span>
                </button>

                {isExpanded && (
                  <div className="divide-y divide-neutral-900/50 bg-neutral-950/20 max-h-80 overflow-y-auto">
                    {topicsInGroup.map((topic) => {
                      const count = topicScheduleCount[topic.id] || 0;
                      return (
                        <div
                          key={topic.id}
                          className="flex items-center justify-between px-4 py-2 hover:bg-neutral-900/20 group transition-all"
                        >
                          <div className="flex flex-col gap-0.5 pr-2">
                            <span className="text-xs text-neutral-300 group-hover:text-white transition-colors">
                              {topic.name}
                            </span>
                            {count > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-400 font-mono">
                                <Check className="w-2.5 h-2.5" />
                                {count} kez eklendi
                              </span>
                            )}
                          </div>
                          
                          <button
                            onClick={() => handleAddTopic(topic.id)}
                            className="p-1 rounded-md bg-neutral-900 hover:bg-indigo-600 text-neutral-400 hover:text-white border border-neutral-800 hover:border-indigo-500 cursor-pointer shadow-xs transition-all shrink-0"
                            title="Tarihe Ekle"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
