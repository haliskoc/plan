"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Countdown } from "@/components/Countdown";
import { TopicSelector } from "@/components/TopicSelector";
import { PlannerViews } from "@/components/PlannerViews";
import { TemplateLoader } from "@/components/TemplateLoader";
import { usePlanStore } from "@/store/usePlanStore";

export default function PlanPage() {
  const { plan, hasHydrated, isSidebarOpen } = usePlanStore();
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-neutral-200 flex flex-col selection:bg-indigo-500/30 selection:text-white">
      {/* Navigation Header */}
      <Header onOpenTemplateModal={() => setIsTemplateModalOpen(true)} />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        
        {/* Countdown Banner */}
        <Countdown targetDateStr={hasHydrated ? plan.examDate : "2027-06-19"} />

        {/* Dashboard Panels */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Topic selector (accordion bank) */}
          <div className={`${isSidebarOpen ? "lg:col-span-3 block" : "hidden"} w-full h-full`}>
            <TopicSelector />
          </div>

          {/* Right Panel: Daily/Weekly/Monthly calendar views */}
          <div className={`${isSidebarOpen ? "lg:col-span-9" : "lg:col-span-12"} w-full h-full`}>
            <PlannerViews />
          </div>
        </div>
      </main>

      {/* Overlay Modals */}
      <TemplateLoader 
        isOpen={isTemplateModalOpen} 
        onClose={() => setIsTemplateModalOpen(false)} 
      />
    </div>
  );
}
