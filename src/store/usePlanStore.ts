import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateTemplateItems } from "@/data/templates";
import { format } from "date-fns";

export interface Topic {
  id: string;
  examType: "TYT" | "AYT";
  subject: string;
  track: "ORTAK" | "SAY" | "EA" | "SOZ";
  name: string;
  order: number;
}

export interface PlanItem {
  id: string;
  date: string; // ISO format: "yyyy-MM-dd"
  topicId: string;
  durationMinutes: number;
  status: "yapilacak" | "tamamlandi" | "ertelendi";
  note?: string;
}

export interface Plan {
  id: string;
  title: string;
  createdAt: string;
  examDate: string; // Target YKS exam date: "yyyy-MM-dd"
  items: PlanItem[];
}

export interface PlanState {
  plan: Plan;
  selectedDate: string; // "yyyy-MM-dd"
  selectedExamType: "TYT" | "AYT";
  selectedTrack: "SAY" | "EA" | "SOZ";
  selectedSubject: string; // Active subject selected in filter
  viewMode: "gunluk" | "haftalik" | "aylik";
  isSidebarOpen: boolean;
  hasHydrated: boolean;

  // Actions
  setHasHydrated: (state: boolean) => void;
  addPlanItem: (item: Omit<PlanItem, "id">) => void;
  removePlanItem: (id: string) => void;
  updatePlanItem: (id: string, updates: Partial<PlanItem>) => void;
  setExamDate: (date: string) => void;
  setPlanTitle: (title: string) => void;
  setSelectedDate: (date: string) => void;
  setSelectedExamType: (examType: "TYT" | "AYT") => void;
  setSelectedTrack: (track: "SAY" | "EA" | "SOZ") => void;
  setSelectedSubject: (subject: string) => void;
  setViewMode: (mode: "gunluk" | "haftalik" | "aylik") => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  loadTemplate: (templateType: "SAY" | "EA" | "SOZ" | "TYT_YOGUN") => void;
  clearPlan: () => void;
}

const DEFAULT_EXAM_DATE = "2027-06-19"; // Target YKS 2027 date (approximate)

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      plan: {
        id: "yks-personal-plan",
        title: "2027 YKS Çalışma Planım",
        createdAt: new Date().toISOString(),
        examDate: DEFAULT_EXAM_DATE,
        items: [],
      },
      selectedDate: format(new Date(), "yyyy-MM-dd"),
      selectedExamType: "TYT",
      selectedTrack: "SAY",
      selectedSubject: "",
      viewMode: "gunluk",
      isSidebarOpen: true,
      hasHydrated: false,

      setHasHydrated: (state) => set({ hasHydrated: state }),
      setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),

      addPlanItem: (item) => {
        const newItem: PlanItem = {
          ...item,
          id: `plan-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        set((state) => ({
          plan: {
            ...state.plan,
            items: [...state.plan.items, newItem],
          },
        }));
      },

      removePlanItem: (id) => {
        set((state) => ({
          plan: {
            ...state.plan,
            items: state.plan.items.filter((item) => item.id !== id),
          },
        }));
      },

      updatePlanItem: (id, updates) => {
        set((state) => ({
          plan: {
            ...state.plan,
            items: state.plan.items.map((item) =>
              item.id === id ? { ...item, ...updates } : item
            ),
          },
        }));
      },

      setExamDate: (date) => {
        set((state) => ({
          plan: {
            ...state.plan,
            examDate: date,
          },
        }));
      },

      setPlanTitle: (title) => {
        set((state) => ({
          plan: {
            ...state.plan,
            title,
          },
        }));
      },

      setSelectedDate: (date) => set({ selectedDate: date }),
      
      setSelectedExamType: (examType) => set({ selectedExamType: examType, selectedSubject: "" }),
      
      setSelectedTrack: (track) => set({ selectedTrack: track, selectedSubject: "" }),
      
      setSelectedSubject: (subject) => set({ selectedSubject: subject }),
      
      setViewMode: (viewMode) => set({ viewMode }),

      loadTemplate: (templateType) => {
        const currentSelectedDate = get().selectedDate;
        const newItems = generateTemplateItems(templateType, currentSelectedDate);
        set((state) => ({
          plan: {
            ...state.plan,
            items: [...state.plan.items, ...newItems],
          },
        }));
      },

      clearPlan: () => {
        set((state) => ({
          plan: {
            ...state.plan,
            items: [],
          },
        }));
      },
    }),
    {
      name: "yks-planner-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
