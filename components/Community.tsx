import React from 'react';
import { ArrowLeft, Users, MessageSquare, Globe } from 'lucide-react';

interface CommunityProps {
    onBack: () => void;
}

const Community = ({ onBack }: CommunityProps) => {
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
                            <Users className="text-indigo-600 dark:text-indigo-400" />
                            <span className="font-bold text-xl">Comunidade</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12">
                <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                    <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="text-indigo-600 dark:text-indigo-400" size={40} />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Junte-se à Comunidade FluxFunnel</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 max-w-lg mx-auto">
                        Conecte-se com outros estrategistas, compartilhe funis e cresça junto com milhares de usuários.
                    </p>

                    <div className="space-y-4 max-w-md mx-auto">
                        <a href="#" className="flex items-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors group">
                            <svg className="w-8 h-8 mr-4 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 3.903 3.903 0 0 0-.74 1.543 18.253 18.253 0 0 0-5.23 0 3.882 3.882 0 0 0-.737-1.543.072.072 0 0 0-.08-.037 19.824 19.824 0 0 0-4.887 1.513.068.068 0 0 0-.03.023C1.66 8.788.665 14.502 1.957 20.076a.071.071 0 0 0 .028.05c3.55 2.642 7.02 2.65 10.33 2.648a.075.075 0 0 0 .044-.025 13.903 13.903 0 0 1-1.63-2.73.076.076 0 0 1 .054-.112 10.45 10.45 0 0 0 2.22-.872.071.071 0 0 1 .077.012c4.015 1.867 8.356.593 10.364-2.61a.072.072 0 0 0 .028-.052c1.37-5.918-.28-11.474-1.95-15.688a.066.066 0 0 0-.028-.024zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                            </svg>
                            <div className="text-left">
                                <h3 className="font-bold text-indigo-900 dark:text-indigo-100">Servidor no Discord</h3>
                                <p className="text-sm text-indigo-700 dark:text-indigo-300">Chat em tempo real e voice.</p>
                            </div>
                        </a>

                        <a href="#" className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors group">
                            <MessageSquare className="w-8 h-8 mr-4 text-green-600" />
                            <div className="text-left">
                                <h3 className="font-bold text-green-900 dark:text-green-100">Grupo no WhatsApp</h3>
                                <p className="text-sm text-green-700 dark:text-green-300">Avisos e networking rápido.</p>
                            </div>
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Community;
