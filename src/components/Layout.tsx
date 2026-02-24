import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-900 border-t border-l border-slate-800 rounded-tl-xl m-0 shadow-2xl">
                    {children}
                </main>
            </div>
        </div>
    );
}
