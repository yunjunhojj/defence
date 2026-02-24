import { ShieldAlert } from 'lucide-react';

export function Header() {
    return (
        <header className="h-14 border-b border-slate-800 bg-slate-950 flex items-center px-6 shrink-0 z-10">
            <div className="flex items-center gap-2 text-blue-500 font-bold text-lg tracking-wide">
                <ShieldAlert className="w-5 h-5" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                    Web Defense Academy
                </span>
            </div>
            <div className="ml-auto flex items-center gap-4 text-sm font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                MVP Edition
            </div>
        </header>
    );
}
