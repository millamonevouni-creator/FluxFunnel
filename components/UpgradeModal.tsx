
import React from 'react';
import { X, Crown, CheckCircle, Zap, Layout } from 'lucide-react';
import { PlanConfig, UserPlan } from '../types';

interface UpgradeModalProps {
    onClose: () => void;
    onUpgrade: () => void;
    isDark: boolean;
    limitType?: 'NODES' | 'PROJECTS';
    plans?: PlanConfig[];
    userPlan?: UserPlan;
    initialPlan?: 'PRO' | 'PREMIUM';
    initialCycle?: 'monthly' | 'yearly';
    // New props for context-aware messages
    reason?: 'LIMIT_REACHED' | 'FEATURE_LOCKED';
    featureName?: string;
    showNotification?: (msg: string, type: 'success' | 'error') => void;
}

const UpgradeModal = ({ onClose, onUpgrade, isDark, limitType = 'NODES', plans, userPlan, initialPlan, initialCycle, reason = 'LIMIT_REACHED', featureName, showNotification }: UpgradeModalProps) => {
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
    const currentPlanConfig = plans?.find(p => p.id === selectedPlan);

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
                showNotification ? showNotification("Preço não configurado. Contate o suporte.", "error") : alert("Preço não configurado.");
                return;
            }

            // Call the API function we created
            // Store choice for post-checkout processing
            localStorage.setItem('flux_pending_checkout', JSON.stringify({
                planId,
                cycle,
                timestamp: Date.now()
            }));

            // Call the API function we created
            const { api } = await import('../services/api_fixed');
            const affiliateId = localStorage.getItem('flux_affiliate_id');
            const { sessionId, url } = await api.subscriptions.createCheckoutSession(priceId, {
                affiliate: affiliateId // Pass affiliate ID
            });

            if (url) {
                window.location.href = url;
                return;
            }

            if (!sessionId) {
                throw new Error("Sessão de checkout não retornou ID nem URL.");
            }

            const { loadStripe } = await import('@stripe/stripe-js');
            const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

            if (!stripeKey) {
                console.error("Stripe Publishable Key is missing.");
                showNotification ? showNotification("Erro interno: Chave Stripe não configurada.", "error") : alert("Erro Stripe Key Missing");
                return;
            }

            const stripe = await loadStripe(stripeKey);

            if (!stripe) throw new Error("Stripe failed to load");

            const { error } = await (stripe as any).redirectToCheckout({ sessionId });
            if (error) throw error;

        } catch (error) {
            console.error("CHECKOUT ERROR:", error);
            const msg = error instanceof Error ? error.message : "Erro desconhecido";
            showNotification ? showNotification(`Erro ao iniciar checkout: ${msg}`, "error") : alert(msg);
        }
    };

    const handleUpgradeClick = () => {
        handleCheckout(selectedPlan, cycle);
    };

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
            <div className={`relative w-full max-w-lg md:max-w-4xl overflow-hidden rounded-3xl shadow-2xl border flex flex-col md:flex-row ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/10 hover:bg-black/20 text-slate-500 dark:text-slate-400 dark:hover:bg-white/10 transition-colors"
                    title="Fechar"
                >
                    <X size={20} />
                </button>

                {/* Left Side: The "Pain" / Context */}
                <div className={`md:w-2/5 p-8 flex flex-col justify-center relative overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 z-0"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-700 shadow-lg flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400">
                            {isProjectLimit ? <Layout size={28} /> : <Crown size={28} />}
                        </div>
                        <h2 className={`text-2xl font-black mb-4 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Assinatura {currentPlanConfig?.label || (selectedPlan === 'PRO' ? 'Pro' : 'Premium')}
                        </h2>
                        <p className={`text-sm mb-8 font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            {reason === 'FEATURE_LOCKED' ? (
                                <span>
                                    Este recurso é exclusivo para assinantes <b>{currentPlanConfig?.label || (selectedPlan === 'PRO' ? 'Pro' : 'Premium')}</b>.
                                    {userPlan === 'CONVIDADO' && <span className="block mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-xl border border-amber-100 dark:border-amber-800/50 text-xs">
                                        <b className="block mb-1">Nota para Convidados:</b>
                                        Você tem acesso aos projetos da equipe, mas recursos avançados exigem uma conta própria.
                                    </span>}
                                </span>
                            ) : (
                                isProjectLimit
                                    ? `Você atingiu o limite de ${userPlan === 'FREE' ? freePlan.projectLimit : proPlan.projectLimit} projetos ativos.`
                                    : `Você usou todos os ${userPlan === 'FREE' ? freePlan.nodeLimit : proPlan.nodeLimit} elementos disponíveis.`
                            )}
                        </p>
                        <div className="space-y-3">
                            {(currentPlanConfig?.features || (selectedPlan === 'PREMIUM' ? ['Projetos Ilimitados', 'Acesso total a Ícones', 'Suporte Prioritário'] : ['Até 5 Projetos', 'Acesso basico a Ícones', 'Suporte Standard'])).map((feature, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                                    <CheckCircle size={16} className="text-green-500" /> {feature}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: The Offer */}
                <div className="md:w-3/5 p-8 flex flex-col relative bg-white dark:bg-slate-900">
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="mb-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl inline-flex self-center">
                            <button onClick={() => setSelectedPlan('PRO')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${selectedPlan === 'PRO' ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600 dark:text-indigo-300' : 'text-slate-500'}`}>Pro</button>
                            <button onClick={() => setSelectedPlan('PREMIUM')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${selectedPlan === 'PREMIUM' ? 'bg-white dark:bg-slate-700 shadow-md text-purple-600 dark:text-purple-300' : 'text-slate-500'}`}>Premium</button>
                        </div>

                        {(() => {
                            // const currentPlanConfig = plans?.find(p => p.id === selectedPlan);
                            const currentPrice = cycle === 'monthly' ? currentPlanConfig?.priceMonthly : currentPlanConfig?.priceYearly;
                            const priceDisplay = currentPrice ? `R$ ${currentPrice.toFixed(2).replace('.', ',')}` : 'Sob consulta';

                            return (
                                <div className="text-center mb-8">
                                    <h3 className="text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">{priceDisplay}<span className="text-lg text-slate-400 font-medium ml-1 outline-none align-super">/ {cycle === 'monthly' ? 'mês' : 'ano'}</span></h3>
                                    <div className="flex justify-center gap-4 text-sm font-bold text-slate-500">
                                        <button onClick={() => setCycle('monthly')} className={`hover:text-indigo-500 transition-colors ${cycle === 'monthly' ? 'text-indigo-600 underline underline-offset-4' : ''}`}>Mensal</button>
                                        <button onClick={() => setCycle('yearly')} className={`hover:text-green-500 transition-colors ${cycle === 'yearly' ? 'text-green-600 underline underline-offset-4' : ''}`}>Anual (-15%)</button>
                                    </div>
                                </div>
                            );
                        })()}

                        <button
                            onClick={handleUpgradeClick}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/20 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 group"
                        >
                            Fazer Upgrade Agora <Zap size={20} className="group-hover:text-yellow-300 transition-colors" />
                        </button>
                        <p className="text-center mt-4 text-xs text-slate-400">Pagamento seguro via Stripe. Cancele quando quiser.
                        </p>

                        <button
                            onClick={onClose}
                            className={`mt-4 text-xs font-medium hover:underline text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                        >
                            Não, obrigado. Quero continuar limitado.
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
