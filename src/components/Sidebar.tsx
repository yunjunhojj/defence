import { Target, Lock } from 'lucide-react';

export function Sidebar() {
    return (
        <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col shrink-0 z-10 relative">
            <div className="p-4 border-b border-slate-800/50">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Curriculum</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
                <nav className="space-y-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 bg-blue-500/10 text-blue-400 rounded-lg text-left transition-all border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                        <Target className="w-4 h-4 shrink-0" />
                        <div className="flex-1 overflow-hidden">
                            <div className="text-sm font-semibold truncate">Stage 1: XSS</div>
                            <div className="text-[11px] opacity-70 truncate mt-0.5">Cross-Site Scripting</div>
                        </div>
                    </button>

                    <button disabled className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 rounded-lg text-left cursor-not-allowed opacity-60 hover:bg-slate-900/50 transition-colors border border-transparent">
                        <Lock className="w-4 h-4 shrink-0" />
                        <div className="flex-1 overflow-hidden">
                            <div className="text-sm font-medium truncate">Stage 2: SQLi</div>
                            <div className="text-[11px] truncate mt-0.5">SQL Injection</div>
                        </div>
                    </button>
                </nav>
            </div>

            {/* Decorative gradient for a premium feel */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
        </aside>
    );
}
