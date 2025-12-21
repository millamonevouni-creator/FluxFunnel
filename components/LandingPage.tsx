
import React, { useState } from 'react';
import {
    Sparkles, ArrowRight, GitGraph, CheckCircle, Zap, Shield, Globe,
    PlayCircle, BarChart3, Puzzle, Users, Star, ChevronDown, ChevronUp,
    Facebook, Instagram, Youtube, Map, XCircle, MousePointer,
    Layout, Share, Monitor, PenTool, LayoutDashboard, LayoutTemplate,
    Briefcase, UserCog, GraduationCap, MousePointer2, Presentation, X,
    BookOpen, Heart, Target, Crown, MessageCircle, Rocket, Layers, Quote
} from 'lucide-react';
import { Language, PlanConfig, AppView, SystemConfig } from '../types';

interface LandingPageProps {
    onLoginClick: () => void;
    onGetStartedClick: () => void;
    onRoadmapClick: () => void;
    onNavigate: (view: AppView) => void;
    lang: Language;
    setLang: (l: Language) => void;
    t: (key: any) => string;
    plans: PlanConfig[];
    systemConfig: SystemConfig;
}

const LandingPage = ({ onLoginClick, onGetStartedClick, onRoadmapClick, onNavigate, lang, setLang, t, plans, systemConfig }: LandingPageProps) => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const toggleFaq = (idx: number) => {
        setOpenFaq(openFaq === idx ? null : idx);
    };

    const handleActionClick = async (planId?: string) => {
        if (!systemConfig.allowSignups) {
            alert('Novos cadastros estão temporariamente pausados pelo administrador.');
            return;
        }

        // If explicitly a specific plan action (from pricing card)
        if (planId && (planId === 'PRO' || planId === 'PREMIUM')) {
            try {
                // Determine price ID based on billing cycle
                const targetPlan = plans.find(p => p.id === planId);
                let priceId = billingCycle === 'monthly' ? targetPlan?.stripe_price_id_monthly : targetPlan?.stripe_price_id_yearly;

                // Fallback to env vars
                if (!priceId) {
                    const envKey = `VITE_STRIPE_PRICE_${planId}_${billingCycle.toUpperCase()}`;
                    priceId = import.meta.env[envKey];
                }

                if (!priceId || priceId.includes('ID_AQUI')) {
                    alert("Configuração de pagamento incompleta. Atualize o plano no Painel Master.");
                    return;
                }

                // IMPLEMENTATION: Store choice for post-login
                const checkoutData = {
                    planId,
                    cycle: billingCycle,
                    timestamp: Date.now()
                };
                localStorage.setItem('flux_pending_checkout', JSON.stringify(checkoutData));
                console.log("DEBUG: Stored pending checkout:", checkoutData);

                // Open Auth Modal
                onGetStartedClick();
                return;

            } catch (error) {
                console.error(error);
                return;
            }
        }


        onGetStartedClick();
    };

    const faqs = [
        { q: "Posso cancelar a qualquer momento?", a: "Sim, absolutamente. Não há fidelidade ou contratos de longo prazo no plano mensal. Você pode cancelar sua assinatura facilmente nas configurações da conta." },
        { q: "Preciso instalar algo no meu computador?", a: "Não! O FluxFunnel é 100% baseado na nuvem. Você pode acessar seus funis de qualquer dispositivo, em qualquer lugar." },
        { q: "O plano gratuito é realmente gratuito?", a: "Sim, o plano gratuito é vitalício e permite criar 1 projeto completo. É perfeito para você testar e validar o poder da nossa plataforma." },
        { q: "Vocês oferecem suporte?", a: "Sim! Todos os planos incluem acesso à nossa base de conhecimento. Planos Pro e Premium têm suporte prioritário via chat e email." }
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500/30 selection:text-indigo-900 scroll-smooth overflow-x-hidden">

            {/* Navbar com Glassmorphism */}
            <nav className="fixed w-full z-50 transition-all duration-300 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-110 group-hover:rotate-3">
                            <GitGraph className="text-white" size={22} />
                        </div>
                        <span className="font-bold text-2xl tracking-tighter text-slate-900">FluxFunnel</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                        <a href="#features" className="hover:text-indigo-600 transition-colors">Funcionalidades</a>
                        <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">Como Funciona</a>
                        <a href="#projects" className="hover:text-indigo-600 transition-colors">Modelos</a>
                        <a href="#pricing" className="hover:text-indigo-600 transition-colors">Planos</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={onLoginClick} className="text-sm font-bold text-slate-600 hover:text-indigo-600 px-4 py-2 hover:bg-slate-100 rounded-lg transition-all">{t('signIn')}</button>
                        <button
                            onClick={() => handleActionClick()}
                            className={`text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-xl shadow-indigo-500/20 active:scale-95 ${!systemConfig.allowSignups ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800 hover:-translate-y-1'}`}
                            disabled={!systemConfig.allowSignups}
                        >
                            {t('getStarted')}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section Premium */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-slate-50 opacity-70 -z-10"></div>
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-violet-200/30 to-fuchsia-200/30 blur-3xl -z-10 rounded-full mix-blend-multiply filter opacity-70 animate-blob"></div>
                <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-cyan-200/30 to-blue-200/30 blur-3xl -z-10 rounded-full mix-blend-multiply filter opacity-70 animate-blob animation-delay-2000"></div>

                <div className="container mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-100 shadow-sm mb-8 animate-fade-in-up hover:shadow-md transition-shadow cursor-default">
                        <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        <span className="text-sm font-bold text-slate-600">A Revolução na Criação de Funis</span>
                        <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-black bg-indigo-100 text-indigo-700 uppercase tracking-wide">Novo</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1] text-slate-900 animate-fade-in-up">
                        Planeje. Construa. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600">Escalone Vendas.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed font-medium animate-fade-in-up delay-100">
                        A plataforma visual definitiva para estrategistas digitais. Mapeie funis complexos, desenhe jornadas de clientes e otimize conversões em minutos, não horas.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-200 mb-16">
                        <button onClick={() => handleActionClick()} className="group relative w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-slate-900/30 hover:shadow-slate-900/50 hover:-translate-y-1 transition-all overflow-hidden">
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                            <span className="flex items-center justify-center gap-3">Começar Gratuitamente <ArrowRight size={20} /></span>
                        </button>
                        <button onClick={() => window.location.href = "#how-it-works"} className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 rounded-2xl font-bold text-lg border border-slate-200 shadow-lg shadow-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
                            <PlayCircle size={20} className="text-indigo-600" /> Ver Demonstração
                        </button>
                    </div>

                    <div className="flex flex-col items-center gap-4 animate-fade-in-up delay-300">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <img key={i} className="w-12 h-12 rounded-full border-4 border-white shadow-sm" src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                            ))}
                            <div className="w-12 h-12 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">+2k</div>
                        </div>
                        <p className="text-sm font-semibold text-slate-500">Junte-se a mais de <span className="text-indigo-600 font-bold">2.000+ estrategistas</span> que usam FluxFunnel</p>
                        <div className="flex gap-1 text-amber-400">
                            <Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof Logo Strip */}
            <div className="py-10 border-y border-slate-100 bg-white/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 overflow-hidden">
                    <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Empresas que escalam com FluxFunnel</p>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {['Stripe', 'Spotify', 'Slack', 'Intercom', 'Notion'].map(brand => (
                            <span key={brand} className="text-2xl md:text-3xl font-black text-slate-300 hover:text-indigo-600 transition-colors cursor-default">{brand}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20 max-w-3xl mx-auto">
                        <h2 className="text-indigo-600 font-bold tracking-wide uppercase text-sm mb-3">Poder Ilimitado</h2>
                        <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Tudo o que você precisa para desenhar o sucesso.</h3>
                        <p className="text-lg text-slate-600">Ferramentas profissionais projetadas para eliminar a confusão e trazer clareza absoluta para suas estratégias de marketing.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: <GitGraph size={32} />, title: 'Mapeamento Visual', desc: 'Arraste e solte elementos para criar fluxos complexos em segundos. Interface intuitiva que flui com seu pensamento.' },
                            { icon: <Sparkles size={32} />, title: 'Assistente IA', desc: 'Nossa inteligência artificial analisa seus funis e sugere otimizações para aumentar suas taxas de conversão.' },
                            { icon: <BarChart3 size={32} />, title: 'Previsão de ROI', desc: 'Simule tráfego e conversão em cada etapa para prever o faturamento antes mesmo de lançar a campanha.' },
                            { icon: <Share size={32} />, title: 'Colaboração em Tempo Real', desc: 'Convide seu time, deixe comentários e construa estratégias juntos, sem versões de arquivos perdidas.' },
                            { icon: <LayoutDashboard size={32} />, title: 'Modelos Prontos', desc: 'Acesse nossa biblioteca com dezenas de funis validados de alta conversão para diversos nichos.' },
                            { icon: <Zap size={32} />, title: 'Exportação Rápida', desc: 'Exporte seus diagramas em PDF, PNG ou gere um relatório completo para apresentar aos clientes.' }
                        ].map((feat, i) => (
                            <div key={i} className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">
                                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                    {feat.icon}
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3">{feat.title}</h4>
                                <p className="text-slate-500 leading-relaxed group-hover:text-slate-600">{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-20">
                        <h3 className="text-3xl md:text-5xl font-black mb-6">Do Caos à Clareza em 3 Passos</h3>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">Simplificamos o complexo. Veja como é fácil transformar ideias abstratas em planos de ação concretos.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-slate-700 via-indigo-500 to-slate-700"></div>

                        {[
                            { step: 1, title: 'Planeje', desc: 'Escolha um modelo validado ou comece do zero com nossa tela infinita.', icon: <Map /> },
                            { step: 2, title: 'Personalize', desc: 'Adicione etapas, defina métricas e conecte as ferramentas do seu stack.', icon: <PenTool /> },
                            { step: 3, title: 'Execute', desc: 'Exporte o plano tático e compartilhe com seu time para implementação.', icon: <Rocket /> }
                        ].map((item, i) => (
                            <div key={i} className="relative flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-900 shadow-xl flex items-center justify-center text-indigo-400 mb-8 relative z-10 group hover:scale-110 transition-transform duration-300">
                                    <span className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center font-black text-white text-sm border-2 border-slate-900">{item.step}</span>
                                    {React.cloneElement(item.icon as React.ReactElement, { size: 40 })}
                                </div>
                                <h4 className="text-2xl font-bold mb-3">{item.title}</h4>
                                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-black text-center text-slate-900 mb-16">O que os Experts dizem</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: "Ricardo Silva", role: "Growth Hacker", text: "Antes do FluxFunnel, eu usava 3 ferramentas diferentes para planejar. Agora faço tudo em um lugar só. A economia de tempo é surreal." },
                            { name: "Amanda Costa", role: "Consultora de Marketing", text: "Meus clientes ficam impressionados quando apresento os fluxos visuais. A ferramenta se pagou no primeiro projeto que fechei." },
                            { name: "Pedro Alencar", role: "Dono de Agência", text: "A funcionalidade de simulação de ROI mudou o jogo para nós. Conseguimos vender projetos com muito mais segurança." }
                        ].map((t, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative">
                                <Quote className="text-indigo-100 absolute top-6 right-6" size={48} />
                                <div className="flex gap-1 text-amber-500 mb-4">
                                    <Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" />
                                </div>
                                <p className="text-slate-600 mb-6 italic relative z-10">"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                                        <p className="text-xs text-slate-500">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section Refined */}
            <div id="pricing" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-indigo-600 font-bold tracking-wide uppercase text-sm mb-3">Investimento</h2>
                        <h2 className="text-4xl font-black mb-6 text-slate-900 tracking-tighter">Escolha seu Nível de Poder</h2>
                        <div
                            className="inline-flex items-center bg-slate-100 p-1 rounded-full cursor-pointer select-none border border-slate-200"
                            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                        >
                            <span className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Mensal</span>
                            <span className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                                Anual <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] uppercase font-black">-20%</span>
                            </span>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-start">
                        {[...plans].sort((a, b) => (a.order || 0) - (b.order || 0)).map((plan) => {
                            const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
                            const period = billingCycle === 'monthly' ? '/mês' : '/ano';

                            return (
                                <div key={plan.id} className={`p-8 lg:p-10 rounded-[2.5rem] border transition-all duration-500 relative flex flex-col ${plan.isPopular ? 'border-indigo-600 shadow-2xl scale-105 z-10 bg-white ring-4 ring-indigo-50' : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-xl'}`}>
                                    {plan.isPopular && (
                                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                                            <Crown size={12} fill="currentColor" /> Recomendado
                                        </div>
                                    )}

                                    <div className="mb-8 text-center md:text-left">
                                        <h3 className="text-lg font-black uppercase tracking-widest text-slate-400 mb-4">{plan.label}</h3>
                                        <div className="flex items-baseline justify-center md:justify-start gap-1">
                                            <span className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter whitespace-nowrap">
                                                R$ {Number(price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                            {price > 0 && <span className="text-slate-400 font-bold text-sm">{period}</span>}
                                        </div>
                                        <p className="text-slate-400 text-sm mt-4 font-medium min-h-[40px]">
                                            {plan.id === 'FREE' && 'Para iniciantes e estudantes.'}
                                            {plan.id === 'PRO' && 'Para freelancers e consultores.'}
                                            {plan.id === 'PREMIUM' && 'Para agências e times de alta performance.'}
                                        </p>
                                    </div>

                                    <div className="flex-1 mb-10">
                                        <button
                                            onClick={() => handleActionClick(plan.id)}
                                            disabled={!systemConfig.allowSignups}
                                            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95 ${plan.isPopular ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-200' : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-200'} ${!systemConfig.allowSignups ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {price === 0 ? 'Criar Conta Grátis' : 'Assinar Agora'}
                                        </button>

                                        <div className="mt-8 space-y-4">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">O que está incluso:</p>
                                            <ul className="space-y-3">
                                                <li className="flex items-center gap-3 text-slate-700 text-sm font-bold">
                                                    <div className="p-1 rounded-full bg-indigo-100 text-indigo-600"><CheckCircle size={12} strokeWidth={4} /></div>
                                                    {plan.projectLimit >= 9999 ? 'Projetos Ilimitados' : `${plan.projectLimit} Projetos Ativos`}
                                                </li>
                                                <li className="flex items-center gap-3 text-slate-700 text-sm font-bold">
                                                    <div className="p-1 rounded-full bg-indigo-100 text-indigo-600"><CheckCircle size={12} strokeWidth={4} /></div>
                                                    {plan.nodeLimit >= 9999 ? 'Elementos Ilimitados' : `${plan.nodeLimit} Elementos/Fluxo`}
                                                </li>
                                                {plan.features.map((feature, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-slate-600 text-sm font-medium leading-tight">
                                                        <div className="p-1 mt-0.5 rounded-full bg-slate-100 text-slate-400"><CheckCircle size={12} strokeWidth={4} /></div>
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-3xl font-black text-center text-slate-900 mb-12">Perguntas Frequentes</h2>
                    <div className="space-y-4">
                        {faqs.map((item, idx) => (
                            <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300">
                                <button
                                    onClick={() => toggleFaq(idx)}
                                    className="w-full flex items-center justify-between p-6 text-left font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                                >
                                    {item.q}
                                    {openFaq === idx ? <ChevronUp className="text-indigo-600" /> : <ChevronDown className="text-slate-400" />}
                                </button>
                                <div className={`px-6 text-slate-600 leading-relaxed overflow-hidden transition-all duration-300 ${openFaq === idx ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    {item.a}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-20 bg-indigo-600 text-white overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>

                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Pronto para transformar seus resultados?</h2>
                    <p className="text-indigo-100 text-xl mb-10 font-medium">Junte-se a milhares de profissionais que já modernizaram a forma de planejar vendas online.</p>
                    <button
                        onClick={() => handleActionClick()}
                        disabled={!systemConfig.allowSignups}
                        className="px-12 py-5 bg-white text-indigo-600 rounded-full font-black text-lg shadow-2xl hover:bg-indigo-50 hover:scale-105 transition-all w-full sm:w-auto"
                    >
                        Criar Conta Gratuitamente
                    </button>
                    <p className="mt-6 text-sm text-indigo-200 font-medium">Não requer cartão de crédito • Cancelamento a qualquer momento</p>
                </div>
            </section>

            {/* Footer Enhanced */}
            <footer className="bg-slate-950 text-slate-400 py-20 border-t border-slate-900 text-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 mb-6 text-white">
                                <GitGraph className="text-indigo-500" size={24} />
                                <span className="font-bold text-xl">FluxFunnel</span>
                            </div>
                            <p className="mb-6 leading-relaxed">A plataforma visual #1 para planejamento de estratégias digitais. Construída para performance, desenhada para clareza.</p>
                            <div className="flex gap-4">
                                {[
                                    { Icon: Facebook, name: 'Facebook' },
                                    { Icon: Instagram, name: 'Instagram' },
                                    { Icon: Youtube, name: 'Youtube' }
                                ].map(({ Icon, name }, i) => (
                                    <a key={i} href="#" aria-label={name} title={name} className="p-2 bg-slate-900 rounded-full hover:bg-indigo-600 hover:text-white transition-all"><Icon size={18} /></a>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Produto</h4>
                            <ul className="space-y-4">
                                <li><a href="#features" className="hover:text-indigo-400 transition-colors">Funcionalidades</a></li>
                                <li><a href="#pricing" className="hover:text-indigo-400 transition-colors">Planos e Preços</a></li>
                                <li><button onClick={onRoadmapClick} className="hover:text-indigo-400 transition-colors">Roadmap Público</button></li>
                                <li><button onClick={() => onNavigate('GALLERY')} className="hover:text-indigo-400 transition-colors">Biblioteca de Modelos</button></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Recursos</h4>
                            <ul className="space-y-4">
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Central de Ajuda</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Comunidade</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Status do Sistema</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-xs">Legal</h4>
                            <ul className="space-y-4">
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Termos de Uso</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Política de Privacidade</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Cookies</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p>© 2025 FluxFunnel Inc. Todos os direitos reservados.</p>
                        <div className="flex items-center gap-2 text-xs font-medium bg-slate-900 px-3 py-1 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Sistemas Operacionais
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
