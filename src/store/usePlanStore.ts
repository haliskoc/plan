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
  backgroundImage: string; // base64 data URL, empty if none
  backgroundOpacity: number; // 0-100, 100 = full, 0 = invisible
  backgroundColorAvg: string; // analyzed dominant color hex
  textColorLight: string; // recommended text color on dark bg
  textColorDark: string; // recommended text color on light bg
}

export interface PlanState {
  plan: Plan;
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
  pomodoro: {
    minutes: number;
    seconds: number;
    isRunning: boolean;
    isBreak: boolean;
    totalSessions: number;
    sessionMinutes: number;
  };
  undoStack: PlanItem[][];
  redoStack: PlanItem[][];

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
  startPomodoro: () => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;
  tickPomodoro: () => void;
  setPomodoroSession: (minutes: number) => void;
  setPdfSettings: (settings: Partial<PdfSettings>) => void;
  setPdfBackgroundImage: (dataUrl: string) => void;
}

const DEFAULT_EXAM_DATE = "2027-06-19";

const defaultPlan: Plan = {
  id: "yks-personal-plan",
  title: "2027 YKS Çalışma Planım",
  createdAt: new Date().toISOString(),
  examDate: DEFAULT_EXAM_DATE,
  items: [],
};

function pushUndo(state: PlanState) {
  const stack = [...state.undoStack, [...state.plan.items]];
  if (stack.length > 50) stack.shift();
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
      plan: { ...defaultPlan },
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
      pomodoro: { minutes: 25, seconds: 0, isRunning: false, isBreak: false, totalSessions: 0, sessionMinutes: 25 },
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
          id: `plan-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        set((state) => ({
          undoStack: pushUndo(state),
          redoStack: [],
          plan: {
            ...state.plan,
            items: [...state.plan.items, newItem],
          },
          plans: state.plans.map((p) =>
            p.id === state.activePlanId
              ? { ...p, items: [...p.items, newItem] }
              : p
          ),
        }));
      },

      removePlanItem: (id) => {
        set((state) => ({
          undoStack: pushUndo(state),
          redoStack: [],
          plan: {
            ...state.plan,
            items: state.plan.items.filter((item) => item.id !== id),
          },
          plans: state.plans.map((p) =>
            p.id === state.activePlanId
              ? { ...p, items: p.items.filter((item) => item.id !== id) }
              : p
          ),
        }));
      },

      updatePlanItem: (id, updates) => {
        set((state) => ({
          undoStack: pushUndo(state),
          redoStack: [],
          plan: {
            ...state.plan,
            items: state.plan.items.map((item) =>
              item.id === id ? { ...item, ...updates } : item
            ),
          },
          plans: state.plans.map((p) =>
            p.id === state.activePlanId
              ? {
                  ...p,
                  items: p.items.map((item) =>
                    item.id === id ? { ...item, ...updates } : item
                  ),
                }
              : p
          ),
        }));
      },

      undo: () => {
        const state = get();
        if (state.undoStack.length === 0) return;
        const previous = state.undoStack[state.undoStack.length - 1];
        set({
          undoStack: state.undoStack.slice(0, -1),
          redoStack: [...state.redoStack, [...state.plan.items]],
          plan: { ...state.plan, items: previous },
          plans: state.plans.map((p) =>
            p.id === state.activePlanId ? { ...p, items: previous } : p
          ),
        });
      },

      redo: () => {
        const state = get();
        if (state.redoStack.length === 0) return;
        const next = state.redoStack[state.redoStack.length - 1];
        set({
          undoStack: [...state.undoStack, [...state.plan.items]],
          redoStack: state.redoStack.slice(0, -1),
          plan: { ...state.plan, items: next },
          plans: state.plans.map((p) =>
            p.id === state.activePlanId ? { ...p, items: next } : p
          ),
        });
      },

      setExamDate: (date) => {
        set((state) => ({
          plan: { ...state.plan, examDate: date },
          plans: state.plans.map((p) =>
            p.id === state.activePlanId ? { ...p, examDate: date } : p
          ),
        }));
      },

      setPlanTitle: (title) => {
        set((state) => ({
          plan: { ...state.plan, title },
          plans: state.plans.map((p) =>
            p.id === state.activePlanId ? { ...p, title } : p
          ),
        }));
      },

      setSelectedDate: (date) => set({ selectedDate: date }),

      setSelectedExamType: (examType) =>
        set({ selectedExamType: examType, selectedSubject: "" }),

      setSelectedTrack: (track) =>
        set({ selectedTrack: track, selectedSubject: "" }),

      setSelectedSubject: (subject) => set({ selectedSubject: subject }),

      setViewMode: (viewMode) => set({ viewMode }),

      loadTemplate: (templateType) => {
        const state = get();
        const newItems = generateTemplateItems(templateType, state.selectedDate);
        set({
          undoStack: pushUndo(state),
          redoStack: [],
          plan: {
            ...state.plan,
            items: [...state.plan.items, ...newItems],
          },
          plans: state.plans.map((p) =>
            p.id === state.activePlanId
              ? { ...p, items: [...p.items, ...newItems] }
              : p
          ),
        });
      },

      clearPlan: () => {
        set((state) => ({
          undoStack: pushUndo(state),
          redoStack: [],
          plan: { ...state.plan, items: [] },
          plans: state.plans.map((p) =>
            p.id === state.activePlanId ? { ...p, items: [] } : p
          ),
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
          plan: newPlan,
          undoStack: [],
          redoStack: [],
        }));
      },

      switchPlan: (planId) => {
        const state = get();
        const target = state.plans.find((p) => p.id === planId);
        if (!target) return;
        set({
          activePlanId: planId,
          plan: target,
          undoStack: [],
          redoStack: [],
        });
      },

      deletePlan: (planId) => {
        const state = get();
        if (state.plans.length <= 1) return;
        const remaining = state.plans.filter((p) => p.id !== planId);
        const newActive =
          planId === state.activePlanId ? remaining[0] : state.plan;
        set({
          plans: remaining,
          activePlanId: newActive.id,
          plan: newActive,
          undoStack: [],
          redoStack: [],
        });
      },

      addRecurringItem: (item) => {
        const newItem: RecurringItem = {
          ...item,
          id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        };
        set((state) => ({
          recurringItems: [...state.recurringItems, newItem],
        }));
      },

      removeRecurringItem: (id) => {
        set((state) => ({
          recurringItems: state.recurringItems.filter((r) => r.id !== id),
        }));
      },

      toggleRecurringItem: (id) => {
        set((state) => ({
          recurringItems: state.recurringItems.map((r) =>
            r.id === id ? { ...r, active: !r.active } : r
          ),
        }));
      },

      startPomodoro: () => {
        const state = get();
        set({
          pomodoro: {
            ...state.pomodoro,
            isRunning: true,
            minutes: state.pomodoro.sessionMinutes,
            seconds: 0,
          },
        });
      },

      pausePomodoro: () => {
        set((s) => ({
          pomodoro: { ...s.pomodoro, isRunning: false },
        }));
      },

      resetPomodoro: () => {
        set((s) => ({
          pomodoro: {
            ...s.pomodoro,
            isRunning: false,
            isBreak: false,
            minutes: s.pomodoro.sessionMinutes,
            seconds: 0,
          },
        }));
      },

      tickPomodoro: () => {
        set((s) => {
          const p = { ...s.pomodoro };
          if (!p.isRunning) return { pomodoro: p };

          if (p.seconds > 0) {
            p.seconds -= 1;
          } else if (p.minutes > 0) {
            p.minutes -= 1;
            p.seconds = 59;
          } else {
            if (!p.isBreak) {
              p.totalSessions += 1;
              p.isBreak = true;
              p.minutes = 5;
              p.seconds = 0;
            } else {
              p.isBreak = false;
              p.minutes = p.sessionMinutes;
              p.seconds = 0;
            }
          }
          return { pomodoro: p };
        });
      },

      setPomodoroSession: (minutes) => {
        set((s) => ({
          pomodoro: {
            ...s.pomodoro,
            isRunning: false,
            isBreak: false,
            sessionMinutes: minutes,
            minutes,
            seconds: 0,
          },
        }));
      },

      setPdfSettings: (settings) => {
        set((s) => ({
          pdfSettings: { ...s.pdfSettings, ...settings },
        }));
      },

      setPdfBackgroundImage: (dataUrl) => {
        try {
          localStorage.setItem("yks-planner-bg", dataUrl);
        } catch {}
        set((s) => ({
          pdfSettings: { ...s.pdfSettings, backgroundImage: dataUrl },
        }));
      },
    }),
    {
      name: "yks-planner-storage",
      partialize: (state) => {
        try {
          const { pomodoro, undoStack, redoStack, ...rest } = state;
          const pdf = rest.pdfSettings || {};
          const { backgroundImage, ...pdfRest } = pdf;
          return { ...rest, pdfSettings: { ...pdfRest, backgroundImage: "" } };
        } catch {
          return state;
        }
      },
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) {
          console.warn("localStorage bozuk, varsayılan değerlerle başlatılıyor.");
          if (state) {
            state.setHasHydrated(true);
          }
          return;
        }
        try {
          if (state.plan && !state.plans) {
            state.plans = [state.plan];
            state.activePlanId = state.plan.id;
          }
          if (!state.goals) {
            state.goals = { dailyMinutes: 180, weeklyMinutes: 900 };
          }
          if (!state.theme) {
            state.theme = "dark";
          }
          if (!state.pomodoro) {
            state.pomodoro = { minutes: 25, seconds: 0, isRunning: false, isBreak: false, totalSessions: 0, sessionMinutes: 25 };
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
          if (!state.undoStack) state.undoStack = [];
          if (!state.redoStack) state.redoStack = [];
          try {
            const bg = localStorage.getItem("yks-planner-bg");
            if (bg) {
              state.pdfSettings.backgroundImage = bg;
            }
          } catch {}
          state.setHasHydrated(true);
        } catch {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
