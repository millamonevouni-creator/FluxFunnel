import React from 'react';
import { ArrowLeft, DollarSign, Users, Globe } from 'lucide-react';
import { SEO } from './SEO';

interface AffiliatesPageProps {
    onBack: () => void;
}

const AffiliatesPage = ({ onBack }: AffiliatesPageProps) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
            <SEO
                title="Programa de Afiliados FluxFunnel: Ganhe Recorrência"
                description="Torne-se parceiro do FluxFunnel e ganhe comissões recorrentes indicando a melhor ferramenta de funis do Brasil."
                keywords="afiliados fluxfunnel, programa de parceria, comissão recorrente, renda extra saas"
                url="https://www.fluxfunnel.fun/afiliados"
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
                        <span className="font-bold text-xl">Afiliados</span>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-20 text-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                    <DollarSign size={40} />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
                    Ganhe Comissões Recorrentes com o <span className="text-indigo-600">FluxFunnel</span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
                    Indique a ferramenta que está revolucionando o mercado de funis no Brasil e construa uma fonte de renda passiva.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-16 text-left">
                    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <DollarSign className="text-indigo-600 mb-4" size={32} />
                        <h3 className="text-xl font-bold mb-2">alta Comissão</h3>
                        <p className="text-slate-600 dark:text-slate-400">Ganhe até 40% de comissão recorrente por cada assinatura ativa.</p>
                    </div>
                    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <Users className="text-purple-600 mb-4" size={32} />
                        <h3 className="text-xl font-bold mb-2">Para Consultores</h3>
                        <p className="text-slate-600 dark:text-slate-400">Ideal para agências e consultores que já implementam funis para clientes.</p>
                    </div>
                    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <Globe className="text-emerald-600 mb-4" size={32} />
                        <h3 className="text-xl font-bold mb-2">Material de Apoio</h3>
                        <p className="text-slate-600 dark:text-slate-400">Receba criativos, copys e funis prontos para ajudar na divulgação.</p>
                    </div>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-2xl">
                    <h3 className="text-2xl font-bold mb-4">Interessado em ser um parceiro?</h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-6">Nosso programa de afiliados está em fase de pré-lançamento exclusivo.</p>
                    <a
                        href="mailto:parceiros@fluxfunnel.fun?subject=Interesse%20Afiliado"
                        className="inline-flex items-center justify-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
                    >
                        Solicitar Acesso Antecipado
                    </a>
                </div>
            </main>
        </div>
    );
};

export default AffiliatesPage;
