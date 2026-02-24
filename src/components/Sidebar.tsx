import { Target, CheckCircle2 } from 'lucide-react';
import { curriculum } from '../data/curriculum';
import { useGameStore } from '../store/useGameStore';

export function Sidebar() {
    const { currentStageId, currentProblemId, completedProblems, selectProblem } = useGameStore();

    return (
        <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col shrink-0 z-10 relative">
            <div className="p-4 border-b border-slate-800/50">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Curriculum</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
                <nav className="space-y-4">
                    {curriculum.map((stage) => {
                        const isStageActive = stage.id === currentStageId;

                        return (
                            <div key={stage.id} className="space-y-1">
                                <div className="px-3 py-1 flex items-center gap-2">
                                    {isStageActive ? (
                                        <Target className="w-4 h-4 text-blue-400" />
                                    ) : (
                                        <div className="w-4 h-4 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center shrink-0">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                        </div>
                                    )}
                                    <div className="flex-1 overflow-hidden">
                                        <div className={`text-xs font-bold uppercase tracking-wider ${isStageActive ? 'text-blue-400' : 'text-slate-500'}`}>
                                            {stage.title}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-0.5 ml-4 border-l border-slate-800 pl-2">
                                    {stage.problems.map((problem) => {
                                        const isActive = problem.id === currentProblemId;
                                        const isCompleted = completedProblems.includes(problem.id);

                                        return (
                                            <button
                                                key={problem.id}
                                                onClick={() => selectProblem(stage.id, problem.id)}
                                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all relative group
                                                ${isActive
                                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-900 border border-transparent'}`}
                                            >
                                                {isActive && (
                                                    <div className="absolute left-0 top-1/2 -mt-2 w-0.5 h-4 bg-blue-500 rounded-r shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                                )}
                                                <div className="flex-1 overflow-hidden">
                                                    <div className="text-sm font-medium truncate group-hover:pl-0.5 transition-all">{problem.title}</div>
                                                </div>
                                                {isCompleted && (
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* Decorative gradient for a premium feel */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
        </aside>
    );
}
