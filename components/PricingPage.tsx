import React from 'react';
import { ArrowLeft, Check } from 'lucide-react';

interface PricingPageProps {
    onBack: () => void;
    plans?: any[];
}

const PricingPage = ({ onBack, plans = [] }: PricingPageProps) => {
    // Fallback plans if not provided
    const displayPlans = plans.length > 0 ? plans : [
        { id: 'FREE', label: 'Plano Gratuito', priceMonthly: 0, features: ['1 Projeto', '20 Elementos', 'Exportação Básica'] },
        { id: 'PRO', label: 'Plano Pro', priceMonthly: 69.90, features: ['5 Projetos', '100 Elementos', 'Simulação de ROI', 'Prioridade no Suporte'] },
        { id: 'PREMIUM', label: 'Plano Premium', priceMonthly: 97.90, features: ['Projetos Ilimitados', 'Elementos Ilimitados', 'Acesso à API', 'Gestor de Contas'], isPopular: true }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
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
                            <span className="font-bold text-xl">Planos e Preços</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
                        Investimento simples, retorno exponencial
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Escolha o plano ideal para o seu momento de negócio. Sem contratos longos, cancele quando quiser.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {displayPlans.filter(p => !p.isHidden).map((plan) => (
                        <div key={plan.id} className={`relative bg-white dark:bg-slate-800 rounded-2xl p-8 border ${plan.isPopular ? 'border-indigo-500 shadow-xl scale-105' : 'border-slate-200 dark:border-slate-700 shadow-sm'} flex flex-col`}>
                            {plan.isPopular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                                    Mais Popular
                                </div>
                            )}
                            <div className="mb-6 text-center">
                                <h3 className="text-xl font-bold mb-2">{plan.label}</h3>
                                <div className="flex items-end justify-center gap-1">
                                    <span className="text-4xl font-extrabold">R$ {plan.priceMonthly.toFixed(2).replace('.', ',')}</span>
                                    <span className="text-slate-500 mb-1">/mês</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features && plan.features.map((feat: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                                        <Check className="text-green-500 shrink-0" size={20} />
                                        <span className="text-sm">{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            <button onClick={onBack} className={`w-full py-3 rounded-xl font-bold transition-colors ${plan.isPopular ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white'}`}>
                                {plan.priceMonthly === 0 ? 'Criar Conta Grátis' : 'Começar Agora'}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <p className="text-slate-500 mb-4">Tem uma equipe grande ou necessidades específicas?</p>
                    <a href="mailto:comercial@fluxfunnel.fun" className="text-indigo-600 font-bold hover:underline">Fale com nosso time de vendas</a>
                </div>
            </main>
        </div>
    );
};

export default PricingPage;
