import { create } from "zustand";

export interface PomodoroState {
  pomodoro: {
    minutes: number;
    seconds: number;
    isRunning: boolean;
    isBreak: boolean;
    totalSessions: number;
    sessionMinutes: number;
  };
  startPomodoro: () => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;
  tickPomodoro: () => void;
  setPomodoroSession: (minutes: number) => void;
}

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  pomodoro: {
    minutes: 25,
    seconds: 0,
    isRunning: false,
    isBreak: false,
    totalSessions: 0,
    sessionMinutes: 25,
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
}));
