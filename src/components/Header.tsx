import { ShieldAlert } from 'lucide-react';
import { useState, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { useI18n } from '../i18n/useI18n';

export function Header() {
    const { setAnswerSheetOpen, locale, setLocale, clearCompletedProblems } = useGameStore();
    const { t } = useI18n();
    const [, setClickCount] = useState(0);
    const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleLogoClick = () => {
        setClickCount((prev) => {
            const newCount = prev + 1;
            if (newCount >= 5) {
                setAnswerSheetOpen(true);
                return 0; // Reset after triggering
            }
            return newCount;
        });

        // Clear existing timeout
        if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
        }

        // Reset click count after 1 second of inactivity
        clickTimeoutRef.current = setTimeout(() => {
            setClickCount(0);
        }, 1000);
    };

    return (
        <header className="h-14 border-b border-slate-800 bg-slate-950 flex items-center px-6 shrink-0 z-10">
            <div
                className="flex items-center gap-2 text-blue-500 font-bold text-lg tracking-wide cursor-pointer select-none"
                onClick={handleLogoClick}
            >
                <ShieldAlert className="w-5 h-5" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                    Web Defense Academy
                </span>
            </div>
            <div className="ml-auto flex items-center gap-3">
                <button
                    onClick={clearCompletedProblems}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
                    title={t('resetProgress')}
                >
                    {t('resetProgress')}
                </button>
                <div className="text-xs font-semibold text-slate-400">{t('language')}</div>
                <div className="flex items-center rounded-full border border-slate-700 bg-slate-900 p-0.5">
                    <button
                        onClick={() => setLocale('en')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-full transition-colors ${locale === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        EN
                    </button>
                    <button
                        onClick={() => setLocale('ko')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-full transition-colors ${locale === 'ko' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        KO
                    </button>
                </div>
                <div className="text-sm font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">
                    {t('mvpEdition')}
                </div>
            </div>
        </header>
    );
}
