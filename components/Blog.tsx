import React from 'react';
import { ArrowLeft, BookOpen, Calendar, User } from 'lucide-react';

interface BlogProps {
    onBack: () => void;
}

const Blog = ({ onBack }: BlogProps) => {
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
                            <BookOpen className="text-indigo-600 dark:text-indigo-400" />
                            <span className="font-bold text-xl">Blog</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12">
                <div className="space-y-8">
                    {/* Featured placeholder */}
                    <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="text-indigo-600 dark:text-indigo-400" size={32} />
                        </div>
                        <h1 className="text-3xl font-bold mb-4">Blog do FluxFunnel</h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg mb-8">
                            Dicas, estratégias e novidades sobre funis de vendas e marketing digital.
                        </p>
                        <div className="inline-block px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium">
                            Em breve: Conteúdo exclusivo chegando!
                        </div>
                    </div>

                    {/* Placeholder Articles */}
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 opacity-60">
                            <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4 animate-pulse"></div>
                            <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2 animate-pulse"></div>
                            <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Blog;
