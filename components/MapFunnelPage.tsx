import React from 'react';
import { ArrowLeft, Check, Share2, Map } from 'lucide-react';
import { SEO } from './SEO';

interface MapFunnelPageProps {
    onBack: () => void;
    onGetStarted: () => void;
}

const MapFunnelPage = ({ onBack, onGetStarted }: MapFunnelPageProps) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
            <SEO
                title="Mapa de Funil de Vendas: Organize sua Estratégia Visualmente | FluxFunnel"
                description="O mapa de funil de vendas é a ferramenta essencial para quem quer vender na internet. Entenda o que é, como desenhar e por que o visual converte mais."
                keywords="mapa de funil, mapeamento de vendas, funil visual, estratégia de vendas, fluxfunnel"
                url="https://fluxfunnel.fun/mapa-de-funil"
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
                            <Map className="text-indigo-600 dark:text-indigo-400" />
                            <span className="font-bold text-xl">Mapa de Funil</span>
                        </div>
                    </div>
                    <button onClick={onGetStarted} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                        Mapear Agora
                    </button>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="py-20 px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-slate-900 dark:text-white leading-tight">
                            Por que você precisa de um <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Mapa de Funil</span>?
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
                            Tentar vender sem um mapa é como navegar sem bússola. Você se perde, gasta dinheiro à toa e não sabe para onde ir.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button onClick={onGetStarted} className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-shadow shadow-lg shadow-indigo-500/30">
                                Criar Meu Primeiro Mapa Grátis
                            </button>
                        </div>
                    </div>
                </section>

                {/* Content Section */}
                <section className="py-16 px-6 bg-white dark:bg-slate-800/50">
                    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">O que é um Mapa de Funil?</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                                Um Mapa de Funil (ou Funnel Map) é a representação visual de toda a jornada do seu cliente. Ele mostra exatamente quais páginas, anúncios e e-mails uma pessoa percorre desde o momento que te conhece até a compra.
                            </p>
                            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                                Com o <strong>FluxFunnel</strong>, você não apenas desenha esse mapa, mas simula os resultados antes mesmo de colocar a campanha no ar.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Identifique gargalos na conversão",
                                    "Ganhe clareza sobre o processo",
                                    "Comunique melhor com sua equipe",
                                    "Evite erros caros de tráfego"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 font-medium">
                                        <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full text-green-600">
                                            <Check size={16} />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <div className="relative bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl">
                                {/* Abstract Visual Representation of a Map */}
                                <div className="space-y-4 opacity-80">
                                    <div className="flex justify-center"><div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center text-white"><Share2 /></div></div>
                                    <div className="h-8 w-0.5 bg-slate-300 mx-auto"></div>
                                    <div className="flex justify-center gap-8">
                                        <div className="w-12 h-12 bg-purple-500 rounded-lg"></div>
                                        <div className="w-12 h-12 bg-purple-500 rounded-lg"></div>
                                    </div>
                                    <div className="h-8 w-0.5 bg-slate-300 mx-auto"></div>
                                    <div className="flex justify-center"><div className="w-20 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">$$$</div></div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg">Visão Clara</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-20 px-6 text-center">
                    <h2 className="text-3xl font-bold mb-8">Pare de tentar adivinhar sua estratégia</h2>
                    <button onClick={onGetStarted} className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all">
                        Mapear Minha Estratégia Agora
                    </button>
                </section>
            </main>
        </div>
    );
};

export default MapFunnelPage;
