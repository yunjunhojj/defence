import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SandboxPreview() {
    const { code, stageState, setStageState } = useGameStore();
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (stageState === 'running' && iframeRef.current) {
            const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: system-ui, sans-serif; background: #fafafa; color: #333; padding: 2rem; }
            .comment-card { background: white; padding: 1.5rem; border-radius: 0.75rem; border-left: 4px solid #3b82f6; margin-top: 1.5rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
            h2 { margin-top: 0; color: #111827; }
            p { color: #4b5563; }
          </style>
          <script>
            // Intercept alert to send message to parent
            window.alert = function() {
              window.parent.postMessage({ type: 'XSS_SUCCESS' }, '*');
            };
            window.onerror = function(msg) {
              window.parent.postMessage({ type: 'XSS_ERROR', message: msg }, '*');
            }
          </script>
        </head>
        <body>
          <h2>Guestbook</h2>
          <p>Leave a comment below:</p>
          <div id="comments"></div>
          
          <script type="module">
            try {
              const userCode = \`${code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
              const encodedJs = encodeURIComponent(userCode);
              const dataUri = 'data:text/javascript;charset=utf-8,' + encodedJs;
              
              const module = await import(dataUri);
              if (module.default) {
                const payload = module.default();
                const commentsDiv = document.getElementById('comments');
                
                // VULNERABLE rendering: using innerHTML directly without sanitization
                commentsDiv.innerHTML = '<div class="comment-card">' + payload + '</div>';
              }
            } catch(e) {
              window.parent.postMessage({ type: 'XSS_ERROR', message: e.message }, '*');
            }
          </script>
        </body>
        </html>
      `;

            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            iframeRef.current.src = url;

            return () => URL.revokeObjectURL(url);
        } else if (stageState === 'idle') {
            if (iframeRef.current) iframeRef.current.src = 'about:blank';
        }
    }, [stageState, code]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'XSS_SUCCESS') setStageState('success');
            else if (event.data?.type === 'XSS_ERROR') setStageState('failure');
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [setStageState]);

    return (
        <div className="flex-1 flex flex-col relative bg-slate-900 min-w-[400px]">
            <div className="h-12 border-b border-slate-800 flex items-center px-4 bg-slate-900 shadow-sm shrink-0">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Application</div>
            </div>
            <div className="flex-1 relative bg-white/5 mx-4 mb-4 mt-4 rounded-lg overflow-hidden border border-slate-800 shadow-2xl">
                <iframe
                    ref={iframeRef}
                    className="w-full h-full bg-slate-50"
                    sandbox="allow-scripts allow-same-origin"
                    title="Sandbox Preview"
                />

                <AnimatePresence>
                    {stageState === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-10"
                        >
                            <div className="bg-slate-950 border border-emerald-500/50 rounded-2xl p-8 flex flex-col items-center shadow-[0_0_50px_rgba(16,185,129,0.2)] max-w-sm text-center">
                                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 text-emerald-400 ring-4 ring-emerald-500/10">
                                    <ShieldAlert className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Payload Executed!</h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-8">
                                    You successfully injected a script and triggered the alert function. This is a classic Cross-Site Scripting (XSS) vulnerability.
                                </p>
                                <button
                                    onClick={() => setStageState('idle')}
                                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors"
                                >
                                    Continue
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {stageState === 'failure' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute bottom-4 left-4 right-4 bg-slate-800/90 backdrop-blur border border-slate-700 text-slate-200 p-3 rounded-lg text-sm flex items-center gap-3 shadow-xl"
                        >
                            <div className="p-1.5 bg-slate-700/50 rounded-md text-slate-400">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div className="flex-1">Target is secure. Payload failed to execute.</div>
                            <button
                                onClick={() => setStageState('idle')}
                                className="text-xs font-semibold px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded transition"
                            >
                                Dismiss
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
