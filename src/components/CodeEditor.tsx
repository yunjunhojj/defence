import Editor from '@monaco-editor/react';
import { useGameStore } from '../store/useGameStore';
import { Play, RotateCcw } from 'lucide-react';
import { curriculum } from '../data/curriculum';
import { useMemo, useEffect } from 'react';

export function CodeEditor() {
    const { code, setCode, resetStage, setStageState, currentStageId, currentProblemId } = useGameStore();

    const currentStage = useMemo(() => curriculum.find(s => s.id === currentStageId), [currentStageId]);
    const currentProblem = useMemo(() => currentStage?.problems.find(p => p.id === currentProblemId), [currentStage, currentProblemId]);

    // Update code when problem changes
    useEffect(() => {
        if (currentProblem) {
            setCode(currentProblem.initialCode);
        }
    }, [currentProblem, setCode]);

    const handleRun = () => {
        setStageState('running');
    };

    if (!currentProblem || !currentStage) return null;

    return (
        <div className="flex-1 flex flex-col border-r border-slate-800 bg-[#1e1e1e] min-w-[400px]">
            <div className="h-12 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900 shadow-sm shrink-0">
                <div className="text-xs font-semibold text-slate-400 font-mono">
                    attack.js <span className="text-slate-600 px-2">|</span> {currentStage.title} - {currentProblem.title}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={resetStage}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
                        title="Reset Code"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleRun}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                    >
                        <Play className="w-3.5 h-3.5" fill="currentColor" />
                        Execute Payload
                    </button>
                </div>
            </div>

            <div className="bg-slate-900 border-b border-slate-800 p-4 shrink-0">
                <h3 className="text-sm font-semibold text-slate-300 mb-1">Problem Description:</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{currentProblem.description}</p>
            </div>

            <div className="flex-1 relative pt-2">
                <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => setCode(val || '')}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        padding: { top: 16 },
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                    }}
                />
            </div>
        </div>
    );
}
