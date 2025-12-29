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
                url="https://www.fluxfunnel.fun/alternativa-funelytics"
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "mainEntity": [
                        {
                            "@type": "Question",
                            "name": "O FluxFunnel é melhor que o Funelytics?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Para o mercado brasileiro, sim. O FluxFunnel oferece uma experiência 100% em português, pagamento em Reais (R$) sem IOF, e suporte nativo. Além disso, possui templates focados em estratégias locais como Lançamentos e PLR."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "O Funelytics tem versão gratuita?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "O Funelytics possui uma versão gratuita limitada. O FluxFunnel também oferece um plano gratuito vitalício que permite criar projetos completos com acesso a todos os elementos visuais."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Quanto custa o FluxFunnel comparado ao Funelytics?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "O FluxFunnel tem planos a partir de R$ 69,90/mês, enquanto as versões pagas do Funelytics são cobradas em Dólar e podem custar centenas de Reais dependendo da cotação. O FluxFunnel é significativamente mais acessível para empresas brasileiras."
                            }
                        }
                    ]
                }}
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

                {/* SEO Content Block - Injected for Ranking */}
                <section className="mb-24 prose prose-lg dark:prose-invert max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">Por que migrar do Funelytics para o FluxFunnel?</h2>

                    <div className="grid md:grid-cols-2 gap-10 mb-12">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-3">1. Custo-Benefício no Brasil</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Ferramentas internacionais cobram em Dólar. Com o IOF e a variação cambial, seu custo pode variar todo mês.
                                O <strong>FluxFunnel</strong> tem preço fixo em Reais, planejado para a realidade do empreendedor brasileiro, sendo muito mais barato que a versão Pro do Funelytics.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-3">2. Foco em Lançamentos e PLR</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Nossos templates não são genéricos. Eles foram criados baseados nas estratégias que mais funcionam no Brasil:
                                Lançamento Semente, Meteórico, Perpétuo e Funis de PLR validados.
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-3">3. Suporte nativo em Português</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Nada pior do que depender de tradutor para resolver um problema técnico urgente. Nosso suporte é 100% brasileiro,
                                rápido e conhece as ferramentas que você usa (Hotmart, Eduzz, Kiwify, ActiveCampaign).
                            </p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-3">4. Simplicidade Visual</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Removemos a complexidade desnecessária. O FluxFunnel é "arrastar e soltar" de verdade.
                                Você não precisa ser um designer ou programador para criar mapas mentais de funis profissionais e bonitos.
                            </p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800/50 p-8 rounded-2xl border border-indigo-100 dark:border-slate-700 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Conclusão: Qual o melhor construtor de funis?</h3>
                            <p className="text-slate-700 dark:text-slate-300 text-lg">
                                Se você é uma empresa global com orçamento em dólar, o Funelytics é uma excelente ferramenta de análise de dados.
                                Mas se você busca <strong>planejamento visual, estratégia e agilidade</strong> focada no mercado digital brasileiro,
                                o <strong>FluxFunnel</strong> é a escolha racional e inteligente.
                            </p>
                        </div>
                    </div>
                </section>

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
