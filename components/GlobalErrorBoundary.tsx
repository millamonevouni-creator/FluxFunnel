import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        // Here allows hooking into a logging service (e.g. Sentry) in the future
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 font-sans text-white">
                    <div className="max-w-md w-full bg-[#0f172a] border border-red-900/30 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <ShieldAlert size={40} className="text-red-500" />
                        </div>
                        <h1 className="text-2xl font-black mb-2 tracking-tight">Ops! Algo deu errado.</h1>
                        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                            Encontramos um erro inesperado na interface. Nossa equipe foi notificada.
                            Tente recarregar a página para continuar.
                        </p>
                        <div className="bg-slate-950 p-4 rounded-xl w-full mb-8 border border-slate-800 text-left overflow-auto max-h-32">
                            <code className="text-[10px] text-red-400 font-mono break-all">
                                {this.state.error?.toString()}
                            </code>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                        >
                            <RefreshCw size={18} />
                            Recarregar Sistema
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
