import { create } from 'zustand';

export type StageState = 'idle' | 'running' | 'success' | 'failure';

interface GameState {
  code: string;
  stageState: StageState;
  isAnswerSheetOpen: boolean;
  setCode: (code: string) => void;
  setStageState: (state: StageState) => void;
  setAnswerSheetOpen: (isOpen: boolean) => void;
  resetStage: () => void;
}

export const DEFAULT_XSS_CODE = `// Stage 1: XSS (Cross-Site Scripting)
// The Guestbook below displays user comments without escaping HTML.
// Your goal: Inject a script to trigger an alert() function.

// Return your malicious comment payload:
export default function getPayload() {
  return "Hello, nice site!";
}
`;

export const useGameStore = create<GameState>((set) => ({
  code: DEFAULT_XSS_CODE,
  stageState: 'idle',
  isAnswerSheetOpen: false,
  setCode: (code) => set({ code, stageState: 'idle' }), // Reset state on code edit
  setStageState: (state) => set({ stageState: state }),
  setAnswerSheetOpen: (isOpen) => set({ isAnswerSheetOpen: isOpen }),
  resetStage: () => set({ code: DEFAULT_XSS_CODE, stageState: 'idle' }),
}));
