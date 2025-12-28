import React from 'react';
import { ArrowLeft, Zap, BarChart, Users, Lock, MousePointer, Share2 } from 'lucide-react';
import { SEO } from './SEO';


interface FeaturesPageProps {
    onBack: () => void;
}

const FeaturesPage = ({ onBack }: FeaturesPageProps) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
            <SEO
                title="Funcionalidades - FluxFunnel"
                description="Conheça todas as funcionalidades do FluxFunnel: Editor Drag & Drop, Simulação de Conversão, Colaboração em Tempo Real e muito mais."
                keywords="editor de funil, simulador de tráfego, gestão de equipe, templates de funil, segurança de dados, funcionalidades fluxfunnel"
            />
            <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">

                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            aria-label="Voltar"
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div className="flex items-center gap-2">
                            <Zap className="text-indigo-600 dark:text-indigo-400" />
                            <span className="font-bold text-xl">Funcionalidades</span>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <button onClick={onBack} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-colors">
                            Começar Agora
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                        Tudo o que você precisa para planejar funis
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Do esboço inicial à análise de conversão. O FluxFunnel é a ferramenta completa para estrategistas digitais.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-6">
                            <MousePointer className="text-indigo-600 dark:text-indigo-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Editor Drag & Drop</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Construa fluxos complexos em segundos. Arraste elementos, conecte etapas e visualize a jornada do cliente com clareza absoluta.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-6">
                            <BarChart className="text-green-600 dark:text-green-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Simulação de Conversão</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Planeje cenários de tráfego e venda. Estime ROI, CPC e faturamento antes mesmo de lançar sua campanha.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center mb-6">
                            <Users className="text-violet-600 dark:text-violet-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Colaboração em Equipe</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Convide sua equipe, defina permissões e trabalhem juntos no mesmo projeto em tempo real.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-6">
                            <Share2 className="text-amber-600 dark:text-amber-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Compartilhamento Público</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Envie links de visualização para clientes sem que eles precisem criar conta. Aprovação de projetos mais rápida.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-6">
                            <Lock className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Segurança Enterprise</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Seus dados protegidos com criptografia de ponta a ponta e infraestrutura robusta na nuvem.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center mb-6">
                            <Zap className="text-rose-600 dark:text-rose-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Biblioteca de Modelos</h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Comece com o pé direito usando dezenas de templates prontos validados pelo mercado.
                        </p>
                    </div>
                </div>

                <div className="bg-indigo-900 rounded-3xl p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <h2 className="text-3xl font-bold mb-6 relative z-10">Pronto para escalar suas estratégias?</h2>
                    <button onClick={onBack} className="bg-white text-indigo-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-50 transition-colors relative z-10">
                        Criar Conta Gratuita
                    </button>
                </div>
            </main>
        </div>
    );
};

export default FeaturesPage;
