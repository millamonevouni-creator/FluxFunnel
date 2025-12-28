import React from 'react';
import { ArrowLeft, HelpCircle, Search, FileText, MessageCircle } from 'lucide-react';

interface HelpCenterProps {
    onBack: () => void;
}

const HelpCenter = ({ onBack }: HelpCenterProps) => {
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
                            <HelpCircle className="text-indigo-600 dark:text-indigo-400" />
                            <span className="font-bold text-xl">Central de Ajuda</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12">
                <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center mb-8">
                    <h1 className="text-3xl font-bold mb-6">Como podemos ajudar?</h1>
                    <div className="relative max-w-lg mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar artigos de ajuda..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-colors cursor-pointer group">
                        <FileText className="text-indigo-600 mb-4 group-hover:scale-110 transition-transform" size={32} />
                        <h3 className="text-xl font-bold mb-2">Tutoriais e Guias</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Aprenda a criar seu primeiro funil e dominar a plataforma.</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-colors cursor-pointer group">
                        <MessageCircle className="text-indigo-600 mb-4 group-hover:scale-110 transition-transform" size={32} />
                        <h3 className="text-xl font-bold mb-2">Suporte Técnico</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Entre em contato com nossa equipe para resolver problemas.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HelpCenter;
