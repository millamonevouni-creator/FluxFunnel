import React from 'react';
import { ArrowLeft, ArrowRight, Eye, Map, CheckCircle } from 'lucide-react';
import { SEO } from '../SEO';

interface Props {
    onBack: () => void;
    onGetStarted: () => void;
}

const VisualFunnelPage: React.FC<Props> = ({ onBack, onGetStarted }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
            <SEO
                title="Funil de Vendas Visual: Entenda o Fluxo Antes de Escalar | FluxFunnel"
                description="Pare de perder dinheiro com estratégias cegas. O Funil de Vendas Visual te dá clareza total sobre jornadas, gargalos e oportunidades de otimização."
                keywords="funil visual, mapeamento de funil, fluxograma de vendas, jornada visual do cliente, blueprinte de funil, planejamento visual"
                url="https://www.fluxfunnel.fun/funil-visual"
            />

            <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={onBack} aria-label="Voltar" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <button onClick={onGetStarted} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors">
                        Mapear meu Funil
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <section className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-slate-900 dark:text-white">
                        O Poder do <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Funil Visual</span>
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        A clareza é o primeiro passo para a escala. Veja por que grandes players do mercado abandonaram os documentos de texto e migraram para o planejamento visual.
                    </p>
                </section>

                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Eye className="text-red-500" /> O Jeito Antigo (Cego)
                        </h3>
                        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                            <li className="flex gap-2">❌ Planilhas infinitas difíceis de ler</li>
                            <li className="flex gap-2">❌ Equipe perdida sobre o que fazer</li>
                            <li className="flex gap-2">❌ Bugs de fluxo descobertos só após o lançamento</li>
                            <li className="flex gap-2">❌ Dificuldade de explicar para o cliente</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border-2 border-indigo-100 dark:border-indigo-900 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">RECOMENDADO</div>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Map className="text-green-500" /> O Jeito FluxFunnel (Visual)
                        </h3>
                        <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                            <li className="flex gap-2"><CheckCircle className="text-green-500 w-5 h-5" /> Visão macro de toda a estratégia</li>
                            <li className="flex gap-2"><CheckCircle className="text-green-500 w-5 h-5" /> Identificação instantânea de gargalos</li>
                            <li className="flex gap-2"><CheckCircle className="text-green-500 w-5 h-5" /> Onboarding de equipe ultra-rápido</li>
                            <li className="flex gap-2"><CheckCircle className="text-green-500 w-5 h-5" /> O cliente entende e aprova na hora</li>
                        </ul>
                    </div>
                </div>

                <section className="prose dark:prose-invert lg:prose-lg mx-auto mb-16">
                    <h2>Entenda todo o fluxo antes de gastar 1 centavo</h2>
                    <p>
                        Quando você desenha seu funil visualmente, você consegue simular a jornada do usuário.
                        <em>"Se ele clicar aqui, ele vai para onde? E se ele abandonar o carrinho?"</em>
                    </p>
                    <p>
                        Essa antecipação permite criar <strong>recuperações de venda</strong>, <strong>upsells</strong> e <strong>cross-sells</strong> que estariam invisíveis em um planejamento textual.
                    </p>
                    <blockquote>
                        "O mapa não é o território, mas sem um mapa, você se perde no território."
                    </blockquote>
                </section>

                <div className="bg-slate-900 text-white rounded-2xl p-8 md:p-12 text-center">
                    <h2 className="text-3xl font-bold mb-6">Mapeie seu sucesso</h2>
                    <p className="text-slate-300 mb-8 text-lg">
                        Comece hoje a construir funis visuais profissionais. Sua estratégia merece essa clareza.
                    </p>
                    <button onClick={onGetStarted} className="bg-indigo-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/30 inline-flex items-center gap-2">
                        Criar Mapa Visual Grátis <ArrowRight />
                    </button>
                </div>
            </main>
        </div>
    );
};

export default VisualFunnelPage;
