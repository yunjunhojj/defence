import { create } from 'zustand';
import { curriculum } from '../data/curriculum';

export type StageState = 'idle' | 'running' | 'success' | 'failure';

interface GameState {
  code: string;
  stageState: StageState;
  isAnswerSheetOpen: boolean;

  // Curriculum specific state
  currentStageId: string;
  currentProblemId: string;
  completedProblems: string[];

  // Actions
  setCode: (code: string) => void;
  setStageState: (state: StageState) => void;
  setAnswerSheetOpen: (isOpen: boolean) => void;
  selectProblem: (stageId: string, problemId: string) => void;
  markProblemCompleted: (problemId: string) => void;
  resetStage: () => void;
}

const defaultStage = curriculum[0];
const defaultProblem = defaultStage.problems[0];

export const useGameStore = create<GameState>((set, get) => ({
  code: defaultProblem.initialCode,
  stageState: 'idle',
  isAnswerSheetOpen: false,

  currentStageId: defaultStage.id,
  currentProblemId: defaultProblem.id,
  completedProblems: [],

  setCode: (code) => set({ code, stageState: 'idle' }),
  setStageState: (state) => set({ stageState: state }),
  setAnswerSheetOpen: (isOpen) => set({ isAnswerSheetOpen: isOpen }),

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
