import React from 'react';
import { ArrowLeft, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

interface SystemStatusProps {
    onBack: () => void;
}

const SystemStatus = ({ onBack }: SystemStatusProps) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
            <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            aria-label="Voltar"
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div className="flex items-center gap-2">
                            <Activity className="text-indigo-600 dark:text-indigo-400" />
                            <span className="font-bold text-xl">Status do Sistema</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12">
                <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">

                    <div className="flex items-center gap-4 mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                        <CheckCircle className="text-green-600" size={32} />
                        <div>
                            <h2 className="font-bold text-green-800 dark:text-green-100">Todos os sistemas operacionais</h2>
                            <p className="text-sm text-green-700 dark:text-green-300">Última atualização: {new Date().toLocaleTimeString()}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700">
                            <span className="font-medium">API Principal</span>
                            <span className="flex items-center text-sm text-green-600 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full"><div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>Operacional</span>
                        </div>
                        <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700">
                            <span className="font-medium">Banco de Dados</span>
                            <span className="flex items-center text-sm text-green-600 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full"><div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>Operacional</span>
                        </div>
                        <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700">
                            <span className="font-medium">Autenticação</span>
                            <span className="flex items-center text-sm text-green-600 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full"><div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>Operacional</span>
                        </div>
                        <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-700">
                            <span className="font-medium">Pagamentos (Stripe)</span>
                            <span className="flex items-center text-sm text-green-600 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full"><div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>Operacional</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SystemStatus;
