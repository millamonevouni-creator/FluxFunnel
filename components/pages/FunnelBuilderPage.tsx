import React from 'react';
import { ArrowLeft, ArrowRight, MousePointer, Layout, Share2, Layers } from 'lucide-react';
import { SEO } from '../SEO';

interface Props {
    onBack: () => void;
    onGetStarted: () => void;
}

const FunnelBuilderPage: React.FC<Props> = ({ onBack, onGetStarted }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
            <SEO
                title="Construtor de Funil de Vendas Visual e Intuitivo | FluxFunnel"
                description="O melhor construtor de funil de vendas para planejar suas estratégias. Interface visual drag & drop, simulação de conversão e relatórios completos."
                keywords="construtor de funil, criador de funil, ferramenta de funil, software de funil de vendas, desenhar funil online, funil marketing digital, flux funnel"
                url="https://fluxfunnel.fun/construtor-de-funil"
            />

            <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={onBack} aria-label="Voltar" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <button onClick={onGetStarted} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors">
                        Começar Agora
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="text-center mb-16">
                    <div className="inline-block px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-bold mb-4 uppercase tracking-wide">
                        Ferramenta Profissional
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-slate-900 dark:text-white">
                        Construtor de Funil de Vendas <br />
                        <span className="text-indigo-600">Visual e Intuitivo</span>
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Abandone os rabiscos em papel e as planilhas confusas. Profissionalize sua operação com um construtor feito para estrategistas.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
                    <div className="space-y-8">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                <MousePointer className="text-indigo-600" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Simples como Arrastar e Soltar</h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Nossa interface Drag & Drop permite que qualquer pessoa, mesmo sem conhecimento técnico, desenhe funis complexos em minutos.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                <Layout className="text-indigo-600" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Biblioteca de Modelos Prontos</h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Não sabe por onde começar? Use nossos templates validados para Lançamentos, Perpétuo, PLR e E-commerce.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm shrink-0">
                                <Share2 className="text-indigo-600" size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Compartilhe com Clientes</h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Envie links de visualização para aprovar estratégias com clientes ou compartilhar com sua equipe sem complicação.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-2xl p-4 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                        {/* Abstract representation of the UI */}
                        <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-4 mb-4">
                                        <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center text-white"><span className="text-xs">Ads</span></div>
                                        <ArrowRight className="text-slate-500" />
                                        <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center text-white"><span className="text-xs">Página</span></div>
                                        <ArrowRight className="text-slate-500" />
                                        <div className="w-16 h-16 bg-purple-500 rounded-lg flex items-center justify-center text-white"><span className="text-xs">Checkout</span></div>
                                    </div>
                                    <p className="text-slate-500 text-sm">Visualização em Tempo Real</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-900 text-white rounded-3xl p-12 text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Por que visual é melhor?</h2>
                        <p className="text-indigo-100 text-lg max-w-2xl mx-auto mb-8">
                            O cérebro processa imagens 60.000 vezes mais rápido que texto.
                            Usar um construtor visual elimina ruídos de comunicação e alinha todo o time na mesma página.
                        </p>
                        <button onClick={onGetStarted} className="bg-white text-indigo-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-100 transition-all flex items-center justify-center gap-2 mx-auto">
                            Experimentar Construtor Grátis <Layers size={20} />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FunnelBuilderPage;
