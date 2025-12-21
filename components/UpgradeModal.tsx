
import React from 'react';
import { X, Crown, CheckCircle, Zap, Layout } from 'lucide-react';
import { PlanConfig, UserPlan } from '../types';

interface UpgradeModalProps {
    onClose: () => void;
    onUpgrade: () => void;
    isDark: boolean;
    limitType?: 'NODES' | 'PROJECTS';
    plans?: PlanConfig[]; // New: Pass plans to read updated limits
    userPlan?: UserPlan;
    initialPlan?: 'PRO' | 'PREMIUM';
    initialCycle?: 'monthly' | 'yearly';
}

const UpgradeModal = ({ onClose, onUpgrade, isDark, limitType = 'NODES', plans, userPlan, initialPlan, initialCycle }: UpgradeModalProps) => {
    const isProjectLimit = limitType === 'PROJECTS';
    const [selectedPlan, setSelectedPlan] = React.useState<'PRO' | 'PREMIUM'>(initialPlan || 'PRO');
    const [cycle, setCycle] = React.useState<'monthly' | 'yearly'>(initialCycle || 'monthly');

    // Update state if props change when opening
    React.useEffect(() => {
        if (initialPlan) setSelectedPlan(initialPlan);
        if (initialCycle) setCycle(initialCycle);
    }, [initialPlan, initialCycle]);


    // Fallback default values if plans aren't loaded yet
    const freePlan = plans?.find(p => p.id === 'FREE') || { projectLimit: 1, nodeLimit: 20 };
    const proPlan = plans?.find(p => p.id === 'PRO') || { projectLimit: 5, nodeLimit: 100 };
    const premiumPlan = plans?.find(p => p.id === 'PREMIUM') || { projectLimit: 9999, nodeLimit: 9999 };

    const handleCheckout = async (planId: 'PRO' | 'PREMIUM', cycle: 'monthly' | 'yearly' = 'monthly') => {
        try {
            // Updated to use specific Monthly/Yearly Price IDs
            // Find target plan from props
            const targetPlan = plans?.find(p => p.id === planId);

            // Get dynamic price ID from DB, fallback to env vars
            let priceId = cycle === 'monthly'
                ? targetPlan?.stripe_price_id_monthly
                : targetPlan?.stripe_price_id_yearly;

            if (!priceId) {
                // Fallback for backward compatibility
                const envMap: any = {
                    'PRO': { monthly: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY, yearly: import.meta.env.VITE_STRIPE_PRICE_PRO_YEARLY },
                    'PREMIUM': { monthly: import.meta.env.VITE_STRIPE_PRICE_PREMIUM_MONTHLY, yearly: import.meta.env.VITE_STRIPE_PRICE_PREMIUM_YEARLY }
                };
                priceId = envMap[planId]?.[cycle];
            }

            if (!priceId || priceId.includes('price_fake') || priceId.includes('ID_AQUI')) {
                alert("Preço não configurado. Por favor, atualize este plano no Painel Master para gerar os IDs do Stripe.");
                return;
            }

            // Call the API function we created
            // Call the API function we created
            const { api } = await import('../services/api_fixed');
            const { sessionId, url } = await api.subscriptions.createCheckoutSession(priceId);

            if (url) {
                // Modern implementation: Redirect to the URL provided by Stripe/Backend
                window.location.href = url;
                return;
            }

            if (!sessionId) {
                throw new Error("Sessão de checkout não retornou ID nem URL.");
            }

            const { loadStripe } = await import('@stripe/stripe-js');
            const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

            if (!stripeKey) {
                console.error("Stripe Publishable Key is missing in environment variables.");
                alert("Erro interna: Chave pública do Stripe não configurada (VITE_STRIPE_PUBLISHABLE_KEY). Contate o administrador.");
                return;
            }

            const stripe = await loadStripe(stripeKey);

            if (!stripe) throw new Error("Stripe failed to load");

            const { error } = await (stripe as any).redirectToCheckout({ sessionId });
            if (error) throw error;

        } catch (error) {
            console.error("CHECKOUT ERROR:", error);
            alert("Erro ao iniciar checkout: " + (error instanceof Error ? error.message : "Erro desconhecido"));
        }
    };

    const handleUpgradeClick = () => {
        handleCheckout(selectedPlan, cycle);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
            <div className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>

                {/* Header Background */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-600 to-purple-700 z-0"></div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
                    title="Fechar"
                    aria-label="Fechar modal"
                >
                    <X size={20} aria-hidden="true" />
                </button>

                <div className="relative z-10 px-8 pt-8 pb-8 flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center mb-6 rotate-3 transform hover:rotate-0 transition-transform duration-500">
                        {isProjectLimit ? (
                            <Layout size={40} className="text-indigo-600 fill-indigo-100" />
                        ) : (
                            <Crown size={40} className="text-indigo-600 fill-indigo-100" />
                        )}
                    </div>

                    <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {isProjectLimit ? 'Limite de Projetos Atingido' : 'Limite de Elementos Atingido'}
                    </h2>

                    <p className={`text-sm mb-6 max-w-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {isProjectLimit
                            ? `No seu plano atual, você pode ter apenas ${userPlan === 'FREE' ? freePlan.projectLimit : proPlan.projectLimit} projeto(s) ativo(s).`
                            : `Você atingiu o limite de ${userPlan === 'FREE' ? freePlan.nodeLimit : proPlan.nodeLimit} elementos no fluxo.`
                        }
                    </p>

                    {/* Plan Selection Toggles */}
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-lg mb-4 w-full dark:bg-slate-800">
                        <button onClick={() => setSelectedPlan('PRO')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${selectedPlan === 'PRO' ? 'bg-white shadow text-indigo-600 dark:bg-slate-700 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}>PRO</button>
                        <button onClick={() => setSelectedPlan('PREMIUM')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${selectedPlan === 'PREMIUM' ? 'bg-white shadow text-purple-600 dark:bg-slate-700 dark:text-purple-400' : 'text-slate-500 hover:text-slate-700'}`}>PREMIUM</button>
                    </div>
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-lg mb-6 w-full dark:bg-slate-800">
                        <button onClick={() => setCycle('monthly')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${cycle === 'monthly' ? 'bg-white shadow text-indigo-600 dark:bg-slate-700 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}>Mensal</button>
                        <button onClick={() => setCycle('yearly')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${cycle === 'yearly' ? 'bg-white shadow text-green-600 dark:bg-slate-700 dark:text-green-400' : 'text-slate-500 hover:text-slate-700'}`}>Anual (-15%)</button>
                    </div>

                    {/* Comparison Table */}
                    <div className={`w-full rounded-xl p-4 mb-6 text-left space-y-3 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-100'}`}>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Plano Grátis</span>
                            <span className="font-bold text-slate-500">
                                {isProjectLimit ? `${freePlan.projectLimit} Projeto(s)` : `${freePlan.nodeLimit} Elementos`}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-bold text-indigo-500 flex items-center gap-2"><Zap size={14} /> Plano Pro</span>
                            <span className="font-bold text-indigo-600">
                                {isProjectLimit ? `${proPlan.projectLimit} Projetos` : `${proPlan.nodeLimit} Elementos`}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-bold text-purple-500 flex items-center gap-2"><Crown size={14} /> Plano Premium</span>
                            <span className="font-bold text-purple-600">
                                {premiumPlan.projectLimit >= 9999 ? 'Ilimitado' : premiumPlan.projectLimit}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleUpgradeClick}
                        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-1 mb-3"
                        title="Fazer Upgrade de Plano"
                        aria-label="Fazer Upgrade de Plano"
                    >
                        Fazer Upgrade Agora
                    </button>

                    <button
                        onClick={onClose}
                        className={`text-xs font-medium hover:underline ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                    >
                        {isProjectLimit ? 'Voltar para meus projetos' : 'Não, obrigado. Vou remover elementos.'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
