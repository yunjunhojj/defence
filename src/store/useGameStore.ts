import { create } from 'zustand';
import { curriculum } from '../data/curriculum';
import type { Locale } from '../i18n/strings';

export type StageState = 'idle' | 'running' | 'success' | 'failure';

interface GameState {
  code: string;
  stageState: StageState;
  isAnswerSheetOpen: boolean;
  locale: Locale;

  // Curriculum specific state
  currentStageId: string;
  currentProblemId: string;
  completedProblems: string[];

  // Actions
  setCode: (code: string) => void;
  setStageState: (state: StageState) => void;
  setAnswerSheetOpen: (isOpen: boolean) => void;
  setLocale: (locale: Locale) => void;
  selectProblem: (stageId: string, problemId: string) => void;
  markProblemCompleted: (problemId: string) => void;
  resetStage: () => void;
}

const defaultStage = curriculum[0];
const defaultProblem = defaultStage.problems[0];
const getInitialLocale = (): Locale => {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem('wda_locale');
    if (stored === 'en' || stored === 'ko') return stored;
    const browserLang = window.navigator?.language?.toLowerCase() || '';
    if (browserLang.startsWith('ko')) return 'ko';
  }
  return 'en';
};

export const useGameStore = create<GameState>((set, get) => ({
  code: defaultProblem.initialCode,
  stageState: 'idle',
  isAnswerSheetOpen: false,
  locale: getInitialLocale(),

  currentStageId: defaultStage.id,
  currentProblemId: defaultProblem.id,
  completedProblems: [],

  setCode: (code) => set({ code, stageState: 'idle' }),
  setStageState: (state) => set({ stageState: state }),
  setAnswerSheetOpen: (isOpen) => set({ isAnswerSheetOpen: isOpen }),
  setLocale: (locale) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('wda_locale', locale);
    }
    set({ locale });
  },

  selectProblem: (stageId, problemId) => {
    const stage = curriculum.find(s => s.id === stageId);
    if (!stage) return;
    const problem = stage.problems.find(p => p.id === problemId);
    if (!problem) return;

    set({
      currentStageId: stageId,
      currentProblemId: problemId,
      code: problem.initialCode,
      stageState: 'idle',
      isAnswerSheetOpen: false,
    });
  },

  markProblemCompleted: (problemId) => set((state) => ({
    completedProblems: state.completedProblems.includes(problemId)
      ? state.completedProblems
      : [...state.completedProblems, problemId]
  })),

  resetStage: () => {
    const { currentStageId, currentProblemId } = get();
    const stage = curriculum.find(s => s.id === currentStageId);
    const problem = stage?.problems.find(p => p.id === currentProblemId);

    set({
      code: problem?.initialCode || '',
      stageState: 'idle'
    });
  },
}));

if (typeof window !== 'undefined') {
  // @ts-ignore
  window.__GAME_STORE__ = useGameStore;
}
