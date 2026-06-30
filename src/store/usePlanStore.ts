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
  date: string;
  topicId: string;
  durationMinutes: number;
  status: "yapilacak" | "tamamlandi" | "ertelendi";
  note?: string;
}

export interface Plan {
  id: string;
  title: string;
  createdAt: string;
  examDate: string;
  items: PlanItem[];
}

export interface RecurringItem {
  id: string;
  topicId: string;
  daysOfWeek: number[];
  durationMinutes: number;
  note?: string;
  active: boolean;
}

export interface StudyGoal {
  dailyMinutes: number;
  weeklyMinutes: number;
}

export interface PdfSettings {
  dailyOrientation: "portrait" | "landscape";
  weeklyOrientation: "portrait" | "landscape";
  monthlyOrientation: "portrait" | "landscape";
  backgroundImage: string;
  backgroundOpacity: number;
  backgroundColorAvg: string;
  textColorLight: string;
  textColorDark: string;
}

export interface PlanState {
  selectedDate: string;
  selectedExamType: "TYT" | "AYT";
  selectedTrack: "SAY" | "EA" | "SOZ";
  selectedSubject: string;
  viewMode: "gunluk" | "haftalik" | "aylik";
  isSidebarOpen: boolean;
  hasHydrated: boolean;
  theme: "dark" | "light";
  plans: Plan[];
  activePlanId: string;
  goals: StudyGoal;
  recurringItems: RecurringItem[];
  pdfSettings: PdfSettings;
  undoStack: PlanItem[][];
  redoStack: PlanItem[][];

  setHasHydrated: (state: boolean) => void;
  addPlanItem: (item: Omit<PlanItem, "id">) => void;
  addPlanItems: (items: Omit<PlanItem, "id">[]) => void;
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
  toggleTheme: () => void;
  setGoals: (goals: Partial<StudyGoal>) => void;
  undo: () => void;
  redo: () => void;
  createPlan: (title: string) => void;
  switchPlan: (planId: string) => void;
  deletePlan: (planId: string) => void;
  addRecurringItem: (item: Omit<RecurringItem, "id">) => void;
  removeRecurringItem: (id: string) => void;
  toggleRecurringItem: (id: string) => void;
  setPdfSettings: (settings: Partial<PdfSettings>) => void;
  setPdfBackgroundImage: (dataUrl: string) => void;
  updatePlanItemNote: (id: string, note: string) => void;
}

const DEFAULT_EXAM_DATE = "2027-06-19";

const defaultPlan: Plan = {
  id: "yks-personal-plan",
  title: "2027 YKS Çalışma Planım",
  createdAt: new Date().toISOString(),
  examDate: DEFAULT_EXAM_DATE,
  items: [],
};

function getActivePlan(state: PlanState): Plan {
  return state.plans.find((p) => p.id === state.activePlanId) || state.plans[0];
}

function updateActivePlan(state: PlanState, updateFn: (plan: Plan) => Plan): Plan[] {
  const active = getActivePlan(state);
  const updated = updateFn(active);
  return state.plans.map((p) => (p.id === updated.id ? updated : p));
}

function pushUndo(state: PlanState) {
  const active = getActivePlan(state);
  const stack = [...state.undoStack, [...active.items]];
  if (stack.length > 20) stack.shift();
  return stack;
}

function validatePlan(data: unknown): Plan | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (typeof d.id !== "string") return null;
  if (typeof d.title !== "string") return null;
  if (!Array.isArray(d.items)) return null;
  for (const item of d.items) {
    if (!item || typeof item !== "object") return null;
    const i = item as Record<string, unknown>;
    if (typeof i.id !== "string" || typeof i.date !== "string" || typeof i.topicId !== "string") return null;
  }
  return {
    id: d.id as string,
    title: d.title as string,
    createdAt: (d.createdAt as string) || new Date().toISOString(),
    examDate: (d.examDate as string) || DEFAULT_EXAM_DATE,
    items: d.items as PlanItem[],
  };
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      selectedDate: format(new Date(), "yyyy-MM-dd"),
      selectedExamType: "TYT",
      selectedTrack: "SAY",
      selectedSubject: "",
      viewMode: "gunluk",
      isSidebarOpen: true,
      hasHydrated: false,
      theme: "dark",
      plans: [{ ...defaultPlan }],
      activePlanId: defaultPlan.id,
      goals: { dailyMinutes: 180, weeklyMinutes: 900 },
      recurringItems: [],
      pdfSettings: {
        dailyOrientation: "portrait",
        weeklyOrientation: "landscape",
        monthlyOrientation: "portrait",
        backgroundImage: "",
        backgroundOpacity: 15,
        backgroundColorAvg: "#ffffff",
        textColorLight: "#ffffff",
        textColorDark: "#0f172a",
      },
      undoStack: [],
      redoStack: [],

      setHasHydrated: (state) => set({ hasHydrated: state }),
      setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),

      toggleTheme: () =>
        set((s) => ({
          theme: s.theme === "dark" ? "light" : "dark",
        })),

      setGoals: (goals) =>
        set((s) => ({
          goals: { ...s.goals, ...goals },
        })),

      addPlanItem: (item) => {
        const newItem: PlanItem = {
          ...item,
          id: `pi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        set((state) => ({
          undoStack: pushUndo(state),
          redoStack: [],
          plans: updateActivePlan(state, (p) => ({
            ...p,
            items: [...p.items, newItem],
          })),
        }));
      },

      addPlanItems: (items) => {
        const newItems = items.map((item) => ({
          ...item,
          id: `pi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 5)}`,
        }));
        set((state) => ({
          undoStack: pushUndo(state),
          redoStack: [],
          plans: updateActivePlan(state, (p) => ({
            ...p,
            items: [...p.items, ...newItems],
          })),
        }));
      },

      removePlanItem: (id) => {
        set((state) => ({
          undoStack: pushUndo(state),
          redoStack: [],
          plans: updateActivePlan(state, (p) => ({
            ...p,
            items: p.items.filter((item) => item.id !== id),
          })),
        }));
      },

      updatePlanItem: (id, updates) => {
        set((state) => ({
          undoStack: pushUndo(state),
          redoStack: [],
          plans: updateActivePlan(state, (p) => ({
            ...p,
            items: p.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
          })),
        }));
      },

      undo: () => {
        const state = get();
        if (state.undoStack.length === 0) return;
        const previous = state.undoStack[state.undoStack.length - 1];
        const active = getActivePlan(state);
        set({
          undoStack: state.undoStack.slice(0, -1),
          redoStack: [...state.redoStack, [...active.items]],
          plans: state.plans.map((p) =>
            p.id === active.id ? { ...p, items: previous } : p
          ),
        });
      },

      redo: () => {
        const state = get();
        if (state.redoStack.length === 0) return;
        const next = state.redoStack[state.redoStack.length - 1];
        const active = getActivePlan(state);
        set({
          undoStack: [...state.undoStack, [...active.items]],
          redoStack: state.redoStack.slice(0, -1),
          plans: state.plans.map((p) =>
            p.id === active.id ? { ...p, items: next } : p
          ),
        });
      },

      setExamDate: (date) => {
        set((state) => ({
          plans: updateActivePlan(state, (p) => ({ ...p, examDate: date })),
        }));
      },

      setPlanTitle: (title) => {
        set((state) => ({
          plans: updateActivePlan(state, (p) => ({ ...p, title })),
        }));
      },

      setSelectedDate: (date) => set({ selectedDate: date }),
      setSelectedExamType: (examType) => set({ selectedExamType: examType, selectedSubject: "" }),
      setSelectedTrack: (track) => set({ selectedTrack: track, selectedSubject: "" }),
      setSelectedSubject: (subject) => set({ selectedSubject: subject }),
      setViewMode: (viewMode) => set({ viewMode }),

      loadTemplate: (templateType) => {
        const state = get();
        const newItems = generateTemplateItems(templateType, state.selectedDate);
        set({
          undoStack: pushUndo(state),
          redoStack: [],
          plans: updateActivePlan(state, (p) => ({
            ...p,
            items: [...p.items, ...newItems],
          })),
        });
      },

      clearPlan: () => {
        set((state) => ({
          undoStack: pushUndo(state),
          redoStack: [],
          plans: updateActivePlan(state, (p) => ({ ...p, items: [] })),
        }));
      },

      createPlan: (title) => {
        const newPlan: Plan = {
          id: `plan-${Date.now()}`,
          title,
          createdAt: new Date().toISOString(),
          examDate: DEFAULT_EXAM_DATE,
          items: [],
        };
        set((state) => ({
          plans: [...state.plans, newPlan],
          activePlanId: newPlan.id,
          undoStack: [],
          redoStack: [],
        }));
      },

      switchPlan: (planId) => {
        const state = get();
        if (!state.plans.find((p) => p.id === planId)) return;
        set({
          activePlanId: planId,
          undoStack: [],
          redoStack: [],
        });
      },

      deletePlan: (planId) => {
        const state = get();
        if (state.plans.length <= 1) return;
        const remaining = state.plans.filter((p) => p.id !== planId);
        const newActiveId =
          planId === state.activePlanId ? remaining[0].id : state.activePlanId;
        set({
          plans: remaining,
          activePlanId: newActiveId,
          undoStack: [],
          redoStack: [],
        });
      },

      addRecurringItem: (item) => {
        const newItem: RecurringItem = {
          ...item,
          id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        };
        set((s) => ({ recurringItems: [...s.recurringItems, newItem] }));
      },

      removeRecurringItem: (id) => {
        set((s) => ({ recurringItems: s.recurringItems.filter((r) => r.id !== id) }));
      },

      toggleRecurringItem: (id) => {
        set((s) => ({
          recurringItems: s.recurringItems.map((r) =>
            r.id === id ? { ...r, active: !r.active } : r
          ),
        }));
      },

      setPdfSettings: (settings) => {
        set((s) => ({ pdfSettings: { ...s.pdfSettings, ...settings } }));
      },

      setPdfBackgroundImage: (dataUrl) => {
        try {
          localStorage.setItem("yks-planner-bg", dataUrl);
        } catch {}
        set((s) => ({ pdfSettings: { ...s.pdfSettings, backgroundImage: dataUrl } }));
      },

      updatePlanItemNote: (id, note) => {
        set((state) => ({
          plans: updateActivePlan(state, (p) => ({
            ...p,
            items: p.items.map((item) => (item.id === id ? { ...item, note } : item)),
          })),
        }));
      },
    }),
    {
      name: "yks-planner-storage",
      partialize: (state) => {
        const { undoStack, redoStack, pdfSettings, ...rest } = state;
        return {
          ...rest,
          pdfSettings: {
            ...pdfSettings,
            backgroundImage: "",
          },
        };
      },
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) {
          if (state) state.setHasHydrated(true);
          return;
        }
        try {
          if (!state.plans || state.plans.length === 0) {
            state.plans = [{ ...defaultPlan }];
            state.activePlanId = defaultPlan.id;
          }
          if (!state.activePlanId || !state.plans.find((p) => p.id === state.activePlanId)) {
            state.activePlanId = state.plans[0].id;
          }
          if (!state.goals) {
            state.goals = { dailyMinutes: 180, weeklyMinutes: 900 };
          }
          if (!state.theme) {
            state.theme = "dark";
          }
          if (!state.recurringItems) {
            state.recurringItems = [];
          }
          if (!state.pdfSettings) {
            state.pdfSettings = {
              dailyOrientation: "portrait",
              weeklyOrientation: "landscape",
              monthlyOrientation: "portrait",
              backgroundImage: "",
              backgroundOpacity: 15,
              backgroundColorAvg: "#ffffff",
              textColorLight: "#ffffff",
              textColorDark: "#0f172a",
            };
          }
          state.undoStack = [];
          state.redoStack = [];
          try {
            const bg = localStorage.getItem("yks-planner-bg");
            if (bg) state.pdfSettings.backgroundImage = bg;
          } catch {}
          state.setHasHydrated(true);
        } catch {
          state.setHasHydrated(true);
        }
      },
    }
  )
);

export function useActivePlan(): Plan {
  return usePlanStore((s) => {
    const p = s.plans.find((plan) => plan.id === s.activePlanId);
    return p || s.plans[0];
  });
}
