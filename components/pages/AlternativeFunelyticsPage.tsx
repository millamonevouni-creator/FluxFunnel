import React from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import { SEO } from '../SEO';

interface Props {
    onBack: () => void;
    onGetStarted: () => void;
}

const AlternativeFunelyticsPage: React.FC<Props> = ({ onBack, onGetStarted }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
            <SEO
                title="Melhor Alternativa ao Funelytics em Português | FluxFunnel vs Funelytics"
                description="Procurando uma alternativa ao Funelytics? Conheça o FluxFunnel: mais intuitivo, totalmente em português e com planos acessíveis em Reais. Compare agora."
                keywords="funelytics alternative, alternativa funelytics, funelytics vs fluxfunnel, concorrente funelytics, funil de vendas brasil, ferramenta de mapa de funil"
                url="https://fluxfunnel.fun/alternativa-funelytics"
            />

            <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={onBack} aria-label="Voltar" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <button onClick={onGetStarted} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors">
                        Testar FluxFunnel Grátis
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-slate-900 dark:text-white">
                        A Melhor Alternativa ao <span className="text-indigo-600">Funelytics</span>
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Por que pagar em Dólar por uma ferramenta complexa? O FluxFunnel foi feito pensando no mercado brasileiro.
                    </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl bg-white dark:bg-slate-800 mb-16">
                    <div className="grid grid-cols-3 bg-slate-50 dark:bg-slate-900/50 p-6 border-b border-slate-200 dark:border-slate-700 font-bold text-lg">
                        <div className="text-slate-500">Recurso</div>
                        <div className="text-center text-indigo-600">FluxFunnel 🇧🇷</div>
                        <div className="text-center text-slate-400">Outras Ferramentas 🇺🇸</div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        <div className="grid grid-cols-3 p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <div className="font-medium">Idioma</div>
                            <div className="text-center flex justify-center text-green-600 font-bold">100% Português</div>
                            <div className="text-center text-slate-500">Inglês</div>
                        </div>
                        <div className="grid grid-cols-3 p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <div className="font-medium">Moeda de Pagamento</div>
                            <div className="text-center flex justify-center text-green-600 font-bold">Reais (R$)</div>
                            <div className="text-center text-slate-500">Dólar (USD)</div>
                        </div>
                        <div className="grid grid-cols-3 p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <div className="font-medium">Facilidade de Uso</div>
                            <div className="text-center flex justify-center"><Check className="text-green-500" /></div>
                            <div className="text-center flex justify-center"><Check className="text-yellow-500" /></div>
                        </div>
                        <div className="grid grid-cols-3 p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <div className="font-medium">Suporte</div>
                            <div className="text-center flex justify-center text-sm">Nativo (BR)</div>
                            <div className="text-center text-sm text-slate-500">Internacional</div>
                        </div>
                        <div className="grid grid-cols-3 p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                            <div className="font-medium">Templates Brasileiros (PLR, Lançamento)</div>
                            <div className="text-center flex justify-center"><Check className="text-green-500" /></div>
                            <div className="text-center flex justify-center"><X className="text-red-400" /></div>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-6">Mude para o FluxFunnel hoje</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
                        Junte-se a milhares de estrategistas brasileiros que já estão economizando e produzindo mais.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={onGetStarted} className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/25">
                            Começar Gratuitamente
                        </button>
                        <button onClick={onBack} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                            Ver Funcionalidades
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AlternativeFunelyticsPage;
