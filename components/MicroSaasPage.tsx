import React from 'react';
import { ArrowLeft, Check, Rocket, BarChart } from 'lucide-react';
import { SEO } from './SEO';

interface MicroSaasPageProps {
    onBack: () => void;
    onGetStarted: () => void;
}

const MicroSaasPage = ({ onBack, onGetStarted }: MicroSaasPageProps) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
            <SEO
                title="Funil de Vendas para MicroSaaS: Planeje antes de Escalar | FluxFunnel"
                description="Founders de MicroSaaS perdem dinheiro com churn e CAC alto por falta de planejamento. O FluxFunnel te ajuda a visualizar e otimizar suas métricas."
                keywords="micro saas, funil saas, métricas saas, cac, ltv, churn, planejamento saas"
                url="https://fluxfunnel.fun/micro-saas"
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
                            <Rocket className="text-indigo-600 dark:text-indigo-400" />
                            <span className="font-bold text-xl">MicroSaaS</span>
                        </div>
                    </div>
                    <button onClick={onGetStarted} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                        Planejar Growth
                    </button>
                </div>
            </header>

            <main>
                <section className="py-20 px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <span className="text-indigo-600 font-bold tracking-wider text-sm uppercase mb-4 block">Para Founders e Indie Hackers</span>
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-slate-900 dark:text-white leading-tight">
                            Seu código está pronto.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Mas e o seu Funil de Aquisição?</span>
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
                            A maioria dos MicroSaaS morre não por falta de produto, mas por um CAC insustentável. Mapeie sua estratégia de growth visualmente.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button onClick={onGetStarted} className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-shadow shadow-lg shadow-indigo-500/30">
                                Mapear meu Funil SaaS
                            </button>
                        </div>
                    </div>
                </section>

                <section className="py-16 px-6 bg-white dark:bg-slate-800/50">
                    <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
                        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <BarChart />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Reduza o CAC</h3>
                            <p className="text-slate-600 dark:text-slate-400">Entenda onde você está perdendo leads antes mesmo de gastar com Ads.</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Rocket />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Otimize o Onboarding</h3>
                            <p className="text-slate-600 dark:text-slate-400">Desenhe a jornada do usuário dentro do app para aumentar a ativação.</p>
                        </div>
                        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Check />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Aumente o LTV</h3>
                            <p className="text-slate-600 dark:text-slate-400">Planeje touchpoints de retenção e upsell visualmente.</p>
                        </div>
                    </div>
                </section>

                <section className="py-20 px-6 text-center">
                    <h2 className="text-3xl font-bold mb-8">Construa um negócio previsível</h2>
                    <button onClick={onGetStarted} className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all">
                        Começar Agora Grátis
                    </button>
                </section>
            </main>
        </div>
    );
};

export default MicroSaasPage;
