import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { X, Key } from 'lucide-react';

export function AnswerSheetModal() {
    const { isAnswerSheetOpen, setAnswerSheetOpen } = useGameStore();

    return (
        <AnimatePresence>
            {isAnswerSheetOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/20 text-amber-500 rounded-lg">
                                    <Key className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Stage 1 Solution</h2>
                                    <p className="text-xs text-slate-400">Cross-Site Scripting (XSS)</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setAnswerSheetOpen(false)}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-slate-300">Explanation</h3>
                                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-sm text-slate-300 leading-relaxed">
                                    <p>
                                        The target application uses <code className="text-emerald-400 bg-emerald-400/10 px-1 py-0.5 rounded">innerHTML</code> to render the comments without any proper sanitization.
                                        This allows an attacker to inject arbitrary HTML, including <code className="text-emerald-400 bg-emerald-400/10 px-1 py-0.5 rounded">&lt;script&gt;</code> tags or elements with inline event handlers.
                                    </p>
                                    <p className="mt-3">
                                        Because Modern browsers do not execute <code className="text-emerald-400 bg-emerald-400/10 px-1 py-0.5 rounded">&lt;script&gt;</code> tags inserted via <code className="text-emerald-400 bg-emerald-400/10 px-1 py-0.5 rounded">innerHTML</code>, a robust approach is to use an element like <code className="text-emerald-400 bg-emerald-400/10 px-1 py-0.5 rounded">&lt;img&gt;</code> with an erroneous <code className="text-emerald-400 bg-emerald-400/10 px-1 py-0.5 rounded">src</code> attribute, chaining the <code className="text-emerald-400 bg-emerald-400/10 px-1 py-0.5 rounded">onerror</code> event to execute JavaScript.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-sm font-medium text-slate-300">Payload</h3>
                                <div className="relative group">
                                    <pre className="p-4 bg-[#1e1e1e] rounded-lg border border-slate-700 overflow-x-auto text-sm font-mono text-slate-300">
                                        <code className="block text-emerald-400">export default function getPayload() {'{'}</code>
                                        <code className="block ml-4 text-amber-300">return "&lt;img src=x onerror=alert(1)&gt;";</code>
                                        <code className="block text-emerald-400">{'}'}</code>
                                    </pre>
                                    <button
                                        onClick={() => navigator.clipboard.writeText('return "<img src=x onerror=alert(1)>";')}
                                        className="absolute top-3 right-3 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium border border-slate-600 shadow-sm"
                                    >
                                        Copy Code
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
