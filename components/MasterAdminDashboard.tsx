
import React, { useState, useMemo, useEffect } from 'react';
import {
    Users, TrendingUp, DollarSign, Activity, Shield, Crown, ArrowLeft, Search,
    Check, X, Plus, Trash2, Edit, LogIn, Server, RefreshCw, ShoppingBag, Eye, Star, User as UserIcon, Sparkles, Layout, ShieldAlert, Zap, Heart,
    Settings, CreditCard, ChevronRight, ChevronUp, BarChart, Filter, MoreHorizontal, Mail, Calendar, ExternalLink, MessageSquare, AlertCircle,
    Clock, Globe, CheckCircle, Download, Bug, Lightbulb, ThumbsUp, Send, CornerDownRight, Pencil, Folder, LayoutDashboard, PieChart as PieChartIcon, AppWindow
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart as ReBarChart, Bar
} from 'recharts';
import {
    User, PlanConfig, FeedbackItem, SystemConfig,
    FeedbackStatus, UserStatus, Template, TemplateStatus, FeedbackType
} from '../types';
import { api } from '../services/api';

interface MasterAdminDashboardProps {
    onBack: () => void;
    feedbacks: FeedbackItem[];
    onUpdateStatus: (id: string, status: FeedbackStatus) => void;
    onDeleteFeedback: (id: string) => void;
    onUpdateFeedback: (id: string, data: Partial<FeedbackItem>) => void;
    onReplyFeedback: (id: string, text: string) => void;
    onDeleteComment: (feedbackId: string, commentId: string) => void;
    users: User[];
    onUpdateUser: (user: User, password?: string) => void;
    onDeleteUser: (id: string) => void;
    onCreateUser: (user: User, password?: string) => void;
    onImpersonate: (id: string) => void;
    plans: PlanConfig[];
    onUpdatePlan: (plan: PlanConfig) => void;
    onDeletePlan: (id: string) => void;
    onCreatePlan: (plan: PlanConfig) => void;
    systemConfig: SystemConfig;
    onUpdateSystemConfig: (config: SystemConfig) => void;
    t: (key: any) => string;
}

const MasterAdminDashboard = ({
    onBack, feedbacks, onUpdateStatus, onDeleteFeedback, onUpdateFeedback,
    onReplyFeedback, onDeleteComment, users, onUpdateUser, onDeleteUser,
    onCreateUser, onImpersonate, plans, onUpdatePlan, onDeletePlan,
    onCreatePlan, systemConfig, onUpdateSystemConfig, t
}: MasterAdminDashboardProps) => {

    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'PLANS' | 'FEEDBACK' | 'SYSTEM' | 'TEMPLATES'>('PLANS');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
    const [editingPlan, setEditingPlan] = useState<PlanConfig | null>(null);

    // User Module State
    const [userSearch, setUserSearch] = useState('');
    const [userFilter, setUserFilter] = useState<'ALL' | 'ACTIVE' | 'BANNED' | 'PREMIUM'>('ALL');

    // Marketplace Moderation State
    const [tplSearch, setTplSearch] = useState('');
    const [tplFilter, setTplFilter] = useState<TemplateStatus | 'ALL'>('PENDING');

    // Roadmap/Feedback State
    const [fbSearch, setFbSearch] = useState('');
    const [fbStatusFilter, setFbStatusFilter] = useState<FeedbackStatus | 'ALL'>('ALL');
    const [fbTypeFilter, setFbTypeFilter] = useState<FeedbackType | 'ALL'>('ALL');
    const [selectedFb, setSelectedFb] = useState<FeedbackItem | null>(null);
    const [replyText, setReplyText] = useState('');

    const revenueData = [
        { name: 'Jan', mrr: 450, users: 12 },
        { name: 'Fev', mrr: 1200, users: 28 },
        { name: 'Mar', mrr: 2800, users: 54 },
        { name: 'Abr', mrr: 3900, users: 82 },
        { name: 'Mai', mrr: 5200, users: 110 },
        { name: 'Jun', mrr: 8400, users: 165 },
    ];

    const fetchTemplates = async () => {
        setIsLoadingTemplates(true);
        try {
            const list = await api.templates.list();
            setTemplates(list);
        } catch (e) { console.error(e); }
        finally { setIsLoadingTemplates(false); }
    };

    useEffect(() => {
        if (activeTab === 'TEMPLATES') fetchTemplates();
    }, [activeTab]);

    const handleModerateTemplate = async (id: string, status: TemplateStatus) => {
        try {
            await api.templates.moderate(id, status);
            setTemplates(prev => prev.map(t => t.id === id ? { ...t, status } : t));
        } catch (e) { alert("Erro na moderação."); }
    };

    const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
        try {
            setTemplates(prev => prev.map(t => t.id === id ? { ...t, isFeatured } : t));
        } catch (e) { console.error(e); }
    };

    const handleRemoveTemplate = async (id: string) => {
        if (window.confirm("Remover permanentemente este template?")) {
            try {
                await api.templates.delete(id);
                setTemplates(prev => prev.filter(t => t.id !== id));
            } catch (e) { alert("Erro ao remover."); }
        }
    };

    const stats = useMemo(() => {
        const mrr = users.reduce((acc, user) => {
            const plan = plans.find(p => p.id === user.plan);
            return acc + (plan ? plan.priceMonthly : 0);
        }, 0);
        return { totalUsers: users.length, activeUsers: users.filter(u => u.status === 'ACTIVE').length, mrr };
    }, [users, plans]);

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                u.email.toLowerCase().includes(userSearch.toLowerCase());
            const matchesFilter = userFilter === 'ALL' ||
                (userFilter === 'ACTIVE' && u.status === 'ACTIVE') ||
                (userFilter === 'BANNED' && u.status === 'BANNED') ||
                (userFilter === 'PREMIUM' && u.plan === 'PREMIUM');
            return matchesSearch && matchesFilter;
        });
    }, [users, userSearch, userFilter]);

    const filteredTemplates = useMemo(() => {
        return templates.filter(t => {
            const matchesSearch = (t.customLabel || '').toLowerCase().includes(tplSearch.toLowerCase()) ||
                (t.authorName || '').toLowerCase().includes(tplSearch.toLowerCase());
            const matchesFilter = tplFilter === 'ALL' || t.status === tplFilter;
            return matchesSearch && matchesFilter;
        });
    }, [templates, tplSearch, tplFilter]);

    const filteredFeedbacks = useMemo(() => {
        return feedbacks.filter(f => {
            const matchesSearch = f.title.toLowerCase().includes(fbSearch.toLowerCase()) ||
                f.description.toLowerCase().includes(fbSearch.toLowerCase());
            const matchesStatus = fbStatusFilter === 'ALL' || f.status === fbStatusFilter;
            const matchesType = fbTypeFilter === 'ALL' || f.type === fbTypeFilter;
            return matchesSearch && matchesStatus && matchesType;
        }).sort((a, b) => b.votes - a.votes);
    }, [feedbacks, fbSearch, fbStatusFilter, fbTypeFilter]);

    const handleSavePlan = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPlan) {
            onUpdatePlan(editingPlan);
            setEditingPlan(null);
        }
    };

    const getStatusConfig = (status: FeedbackStatus) => {
        switch (status) {
            case 'PLANNED': return { label: 'Planejado', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' };
            case 'IN_PROGRESS': return { label: 'Executando', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' };
            case 'COMPLETED': return { label: 'Finalizado', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' };
            case 'REJECTED': return { label: 'Arquivado', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' };
            default: return { label: 'Análise', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' };
        }
    };

    const getTypeConfig = (type: FeedbackType) => {
        switch (type) {
            case 'BUG': return { icon: <Bug size={14} />, color: 'text-red-400' };
            case 'FEATURE': return { icon: <Zap size={14} />, color: 'text-yellow-400' };
            case 'IMPROVEMENT': return { icon: <Lightbulb size={14} />, color: 'text-indigo-400' };
            default: return { icon: <MessageSquare size={14} />, color: 'text-slate-400' };
        }
    };

    const handleSendReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFb || !replyText.trim()) return;
        onReplyFeedback(selectedFb.id, replyText);
        setReplyText('');
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans p-4 overflow-y-auto selection:bg-indigo-500/30 scrollbar-thin scrollbar-thumb-slate-800">
            {/* Header Unificado Estilo Enterprise - Compacto */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 p-4 bg-[#0f172a]/40 border border-slate-800/60 rounded-2xl backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2.5 bg-slate-900/80 hover:bg-indigo-600 rounded-xl text-slate-400 hover:text-white transition-all shadow-md border border-slate-800">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <Shield className="text-indigo-500" size={18} />
                            <h1 className="text-lg font-black tracking-tight uppercase">Painel Master</h1>
                        </div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">FluxVision Enterprise</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-1 p-1 bg-[#020617] rounded-xl border border-slate-800 shadow-inner">
                    {[
                        { id: 'OVERVIEW', label: 'Saúde' },
                        { id: 'USERS', label: 'Usuários' },
                        { id: 'TEMPLATES', label: 'Marketplace' },
                        { id: 'PLANS', label: 'Planos' },
                        { id: 'FEEDBACK', label: 'Roadmap' },
                        { id: 'SYSTEM', label: 'Sistema' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* MODULO: PLANOS (ENGENHARIA DE OFERTAS) */}
            {activeTab === 'PLANS' && (
                <div className="animate-fade-in-up space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="p-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-indigo-500 shadow-lg shadow-indigo-500/5">
                                    <CreditCard size={20} />
                                </div>
                                <h3 className="text-xl font-black tracking-tighter uppercase">Engenharia de Ofertas</h3>
                            </div>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] ml-1">CONFIGURAÇÃO DE MONETIZAÇÃO E LIMITES</p>
                        </div>
                        <button
                            onClick={() => setEditingPlan({ id: `NEW_${Date.now()}`, label: 'Novo Plano', priceMonthly: 0, priceYearly: 0, projectLimit: 1, nodeLimit: 20, features: [], isPopular: false })}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.1em] flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all transform hover:-translate-y-0.5"
                        >
                            <Plus size={16} /> Adicionar Modelo
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-1">
                        {plans.map(plan => (
                            <div
                                key={plan.id}
                                className={`
                                    bg-[#0f172a]/60 rounded-3xl border p-6 flex flex-col shadow-xl relative transition-all duration-500 h-full group
                                    ${plan.isPopular ? 'border-indigo-600/50 ring-4 ring-indigo-500/5 scale-[1.02] z-10' : 'border-slate-800/60 hover:border-indigo-500/30'}
                                `}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-4 rounded-2xl shadow-lg ${plan.id === 'PREMIUM' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : (plan.id === 'PRO' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-800/40 text-slate-400 border border-slate-700/50')}`}>
                                        {plan.id === 'PREMIUM' ? <Crown size={24} /> : (plan.id === 'PRO' ? <Zap size={24} /> : <Layout size={24} />)}
                                    </div>
                                    <button
                                        onClick={() => setEditingPlan(plan)}
                                        className="p-3 bg-slate-900/80 border border-slate-800 hover:bg-indigo-600 text-slate-500 hover:text-white rounded-xl transition-all shadow-md hover:scale-105 active:scale-95"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                </div>

                                <div className="mb-8">
                                    <h4 className="text-2xl font-black mb-1 tracking-tight group-hover:text-indigo-400 transition-colors uppercase">{plan.label}</h4>
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">PREÇO MENSAL: R$ {plan.priceMonthly}</p>
                                </div>

                                <div className="space-y-3 mb-8 flex-1">
                                    {plan.features.map((f, i) => (
                                        <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors">
                                            <div className="shrink-0 w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                                <Check size={12} className="text-emerald-500" />
                                            </div>
                                            <span>{f}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setEditingPlan(plan)}
                                    className={`
                                        w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2
                                        ${plan.isPopular
                                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                            : 'bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-500 hover:text-slate-200 shadow-md'}
                                    `}
                                >
                                    CONFIGURAR PLANO
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MODAL DE EDIÇÃO DE PLANO (ENGENHARIA DE OFERTA) */}
            {editingPlan && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/95 backdrop-blur-md animate-fade-in-up">
                    <div className="w-full max-w-2xl bg-[#0f172a] rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl flex flex-col transform scale-100 transition-transform">
                        <div className="p-10 border-b border-slate-800/60 flex justify-between items-center bg-[#0f172a]/50">
                            <div>
                                <h3 className="text-3xl font-black uppercase tracking-tight">Editor de Produto</h3>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">REDEFININDO OFERTA GLOBAL: {editingPlan.label}</p>
                            </div>
                            <button onClick={() => setEditingPlan(null)} className="p-4 bg-slate-900 hover:bg-slate-800 rounded-3xl text-slate-500 transition-all border border-slate-800 shadow-2xl hover:scale-110 active:scale-95">
                                <X size={28} />
                            </button>
                        </div>
                        <form onSubmit={handleSavePlan} className="p-12 space-y-10 overflow-y-auto max-h-[75vh] scrollbar-thin">

                            <div className="flex items-center justify-between p-8 bg-[#020617]/50 border border-slate-800/60 rounded-[2.5rem] group hover:border-indigo-500/30 transition-all">
                                <div className="flex items-center gap-5">
                                    <div className={`p-5 rounded-2xl transition-all ${editingPlan.isPopular ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-900 text-slate-600'}`}>
                                        <Sparkles size={24} />
                                    </div>
                                    <div>
                                        <p className="font-black text-xs uppercase tracking-[0.2em] text-slate-200">Destacar como Popular</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">ATIVAR CARD LUMINOSO NA LANDING PAGE</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditingPlan({ ...editingPlan, isPopular: !editingPlan.isPopular })}
                                    className={`w-16 h-9 rounded-full relative transition-all duration-500 ${editingPlan.isPopular ? 'bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.3)]' : 'bg-slate-800'}`}
                                >
                                    <div className={`absolute top-1.5 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 ${editingPlan.isPopular ? 'right-1.5' : 'left-1.5'}`}></div>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Nome Comercial do Plano</label>
                                <input type="text" value={editingPlan.label} onChange={e => setEditingPlan({ ...editingPlan, label: e.target.value })} className="w-full p-6 bg-[#020617] border border-slate-800 rounded-2xl outline-none focus:border-indigo-500 transition-all text-sm font-black placeholder:text-slate-700" placeholder="Ex: Plano Elite / Business" />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Preço Mensal (R$)</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-500 font-black text-xs">R$</div>
                                        <input type="number" step="0.01" value={editingPlan.priceMonthly} onChange={e => setEditingPlan({ ...editingPlan, priceMonthly: parseFloat(e.target.value) })} className="w-full p-6 pl-14 bg-[#020617] border border-slate-800 rounded-2xl outline-none focus:border-indigo-500 transition-all text-sm font-black" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Preço Anual (R$)</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-purple-500 font-black text-xs">R$</div>
                                        <input type="number" step="0.01" value={editingPlan.priceYearly} onChange={e => setEditingPlan({ ...editingPlan, priceYearly: parseFloat(e.target.value) })} className="w-full p-6 pl-14 bg-[#020617] border border-slate-800 rounded-2xl outline-none focus:border-indigo-500 transition-all text-sm font-black" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Capacidade de Projetos</label>
                                    <div className="relative">
                                        <Folder className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                        <input type="number" value={editingPlan.projectLimit} onChange={e => setEditingPlan({ ...editingPlan, projectLimit: parseInt(e.target.value) })} className="w-full p-6 pl-14 bg-[#020617] border border-slate-800 rounded-2xl outline-none focus:border-indigo-500 transition-all text-sm font-black" />
                                    </div>
                                    <p className="text-[9px] text-slate-600 font-bold uppercase px-2 italic">*Use 9999 para ilimitado</p>
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Elementos no Fluxo</label>
                                    <div className="relative">
                                        <Activity className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                        <input type="number" value={editingPlan.nodeLimit} onChange={e => setEditingPlan({ ...editingPlan, nodeLimit: parseInt(e.target.value) })} className="w-full p-6 pl-14 bg-[#020617] border border-slate-800 rounded-2xl outline-none focus:border-indigo-500 transition-all text-sm font-black" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Entregáveis de Valor (Uma por linha)</label>
                                <textarea
                                    rows={6}
                                    value={editingPlan.features.join('\n')}
                                    onChange={e => setEditingPlan({ ...editingPlan, features: e.target.value.split('\n').filter(f => f.trim() !== '') })}
                                    className="w-full p-8 bg-[#020617] border border-slate-800 rounded-[2.5rem] outline-none focus:border-indigo-500 transition-all resize-none text-xs font-bold leading-loose text-slate-400"
                                    placeholder="Ex: Projetos Ilimitados&#10;Audit IA Ativo&#10;Suporte Prioritário"
                                />
                            </div>

                            <div className="pt-6 flex gap-6">
                                <button type="button" onClick={() => { if (window.confirm("Ação irreversível. Excluir este modelo de plano?")) { onDeletePlan(editingPlan.id); setEditingPlan(null); } }} className="p-8 bg-red-600/10 text-red-500 border border-red-600/20 rounded-3xl font-black shadow-xl hover:bg-red-600 hover:text-white transition-all active:scale-90">
                                    <Trash2 size={28} />
                                </button>
                                <button type="submit" className="flex-1 py-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl shadow-indigo-500/30 transition-all active:scale-95">
                                    Publicar Alterações Globais
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ABAS RESTANTES (Sincronização / Skeleton) */}
            {/* TAB: OVERVIEW (DASHBOARD) */}
            {activeTab === 'OVERVIEW' && (
                <div className="animate-fade-in-up space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-[#0f172a]/60 border border-slate-800 p-4 rounded-3xl shadow-lg relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -translate-y-10 translate-x-10 group-hover:bg-indigo-500/20 transition-all"></div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400"><DollarSign size={18} /></div>
                                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">MRR Mensal</span>
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tight">R$ {stats.mrr.toFixed(2)}</h3>
                            <div className="flex items-center gap-1.5 mt-2 text-emerald-400 text-[10px] font-bold">
                                <TrendingUp size={12} /> +12% vs mês anterior
                            </div>
                        </div>

                        <div className="bg-[#0f172a]/60 border border-slate-800 p-4 rounded-3xl shadow-lg relative overflow-hidden group hover:border-purple-500/30 transition-all">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -translate-y-10 translate-x-10 group-hover:bg-purple-500/20 transition-all"></div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400"><Users size={18} /></div>
                                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Total Usuários</span>
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tight">{stats.totalUsers}</h3>
                            <div className="flex items-center gap-1.5 mt-2 text-purple-400 text-[10px] font-bold">
                                <UserIcon size={12} /> {stats.activeUsers} Ativos agora
                            </div>
                        </div>

                        <div className="bg-[#0f172a]/60 border border-slate-800 p-4 rounded-3xl shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -translate-y-10 translate-x-10 group-hover:bg-emerald-500/20 transition-all"></div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400"><Activity size={18} /></div>
                                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Saúde Sistema</span>
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tight">99.9%</h3>
                            <div className="flex items-center gap-1.5 mt-2 text-emerald-400 text-[10px] font-bold">
                                <Server size={12} /> Todos serviços online
                            </div>
                        </div>

                        <div className="bg-[#0f172a]/60 border border-slate-800 p-4 rounded-3xl shadow-lg relative overflow-hidden group hover:border-amber-500/30 transition-all">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -translate-y-10 translate-x-10 group-hover:bg-amber-500/20 transition-all"></div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400"><ShoppingBag size={18} /></div>
                                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Marketplace</span>
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tight">{templates.length}</h3>
                            <div className="flex items-center gap-1.5 mt-2 text-amber-400 text-[10px] font-bold">
                                <Star size={12} /> {templates.filter(t => t.status === 'PENDING').length} Para aprovação
                            </div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-80">
                        <div className="lg:col-span-2 bg-[#0f172a]/60 border border-slate-800 p-6 rounded-3xl shadow-lg">
                            <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2"><BarChart size={16} /> Crescimento MRR</h4>
                            <div className="h-60 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData}>
                                        <defs>
                                            <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(val) => `R$${val}`} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                                            itemStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}
                                            labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '11px' }}
                                        />
                                        <Area type="monotone" dataKey="mrr" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorMrr)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-[#0f172a]/60 border border-slate-800 p-6 rounded-3xl shadow-lg">
                            <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2"><PieChartIcon size={16} /> Distribuição Planos</h4>
                            <div className="h-60 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Free', value: users.filter(u => u.plan === 'FREE').length },
                                                { name: 'Pro', value: users.filter(u => u.plan === 'PRO').length },
                                                { name: 'Premium', value: users.filter(u => u.plan === 'PREMIUM').length },
                                            ]}
                                            cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5}
                                            dataKey="value"
                                        >
                                            <Cell key="cell-0" fill="#94a3b8" />
                                            <Cell key="cell-1" fill="#6366f1" />
                                            <Cell key="cell-2" fill="#a855f7" />
                                        </Pie>
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', fontSize: '12px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB: USERS */}
            {activeTab === 'USERS' && (
                <div className="animate-fade-in-up space-y-4">
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar usuários por nome ou email..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-[#0f172a]/60 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-200 transition-all font-medium text-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            {['ALL', 'ACTIVE', 'PREMIUM', 'BANNED'].map(f => (
                                <button key={f} onClick={() => setUserFilter(f as any)} className={`px-4 py-3 rounded-xl font-bold uppercase tracking-wider text-[10px] border transition-all ${userFilter === f ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-[#0f172a]/60 border-slate-800 text-slate-500 hover:text-slate-300'}`}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#0f172a]/60 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800/60 bg-slate-900/50 text-[10px] uppercase tracking-widest text-slate-500">
                                    <th className="p-4 font-black">Usuário</th>
                                    <th className="p-4 font-black text-center">Plano</th>
                                    <th className="p-4 font-black text-center">Status</th>
                                    <th className="p-4 font-black text-center">Último Login</th>
                                    <th className="p-4 font-black text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 font-medium text-xs text-slate-400">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white uppercase text-[10px]">
                                                    {user.name.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <div className="text-white font-bold">{user.name}</div>
                                                    <div className="text-[10px] text-slate-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${user.plan === 'PREMIUM' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : (user.plan === 'PRO' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-slate-800 text-slate-400 border-slate-700')}`}>
                                                {user.plan}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold ${user.status === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`}></span>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-[10px] font-mono text-center">{new Date(user.lastLogin).toLocaleDateString()}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => onImpersonate(user.id)} title="Acessar conta" className="p-1.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-lg transition-colors">
                                                    <LogIn size={14} />
                                                </button>
                                                <button onClick={() => onUpdateUser({ ...user, status: user.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE' })} title={user.status === 'ACTIVE' ? 'Banir' : 'Reativar'} className="p-1.5 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg transition-colors">
                                                    <ShieldAlert size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && <div className="p-8 text-center text-slate-500 text-xs">Nenhum usuário encontrado.</div>}
                    </div>
                </div>
            )}

            {/* TAB: TEMPLATES (MARKETPLACE) */}
            {activeTab === 'TEMPLATES' && (
                <div className="animate-fade-in-up space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input type="text" value={tplSearch} onChange={(e) => setTplSearch(e.target.value)} placeholder="Filtrar templates..." className="w-full pl-10 pr-4 py-3 bg-[#0f172a]/60 border border-slate-800 rounded-xl outline-none focus:border-indigo-500 text-slate-200 transition-all font-medium text-sm" />
                        </div>
                        <select value={tplFilter} onChange={(e) => setTplFilter(e.target.value as any)} className="px-4 py-3 bg-[#0f172a]/60 border border-slate-800 rounded-xl text-slate-400 font-bold outline-none focus:border-indigo-500 uppercase text-[10px] tracking-wider cursor-pointer">
                            <option value="ALL">Todos Status</option>
                            <option value="PENDING">Pendentes</option>
                            <option value="APPROVED">Aprovados</option>
                            <option value="REJECTED">Rejeitados</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {filteredTemplates.map(tpl => (
                            <div key={tpl.id} className="bg-[#0f172a]/60 border border-slate-800 p-4 rounded-3xl shadow-lg flex flex-col hover:border-indigo-500/30 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-slate-900 rounded-xl text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <LayoutDashboard size={18} />
                                    </div>
                                    <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${tpl.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : (tpl.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20')}`}>
                                        {tpl.status}
                                    </div>
                                </div>
                                <h4 className="text-sm font-bold text-white mb-1 line-clamp-1">{tpl.customLabel || tpl.labelKey}</h4>
                                <p className="text-slate-500 text-[10px] font-medium mb-4 line-clamp-2 min-h-[2.5em]">{tpl.customDescription || 'Sem descrição.'}</p>

                                <div className="flex items-center gap-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-4">
                                    <span className="flex items-center gap-1"><Download size={10} /> {tpl.downloads || 0}</span>
                                    <span className="flex items-center gap-1"><Star size={10} /> {tpl.rating?.toFixed(1) || '0.0'}</span>
                                    <span className="flex items-center gap-1"><UserIcon size={10} /> {tpl.authorName || 'Anon'}</span>
                                </div>

                                <div className="mt-auto flex gap-2">
                                    {tpl.status === 'PENDING' && (
                                        <>
                                            <button onClick={() => handleModerateTemplate(tpl.id, 'APPROVED')} className="flex-1 py-2 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-600/20 rounded-lg font-bold text-[10px] uppercase transition-all">Aprovar</button>
                                            <button onClick={() => handleModerateTemplate(tpl.id, 'REJECTED')} className="flex-1 py-2 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/20 rounded-lg font-bold text-[10px] uppercase transition-all">Rejeitar</button>
                                        </>
                                    )}
                                    {tpl.status === 'APPROVED' && (
                                        <button onClick={() => handleToggleFeatured(tpl.id, !tpl.isFeatured)} className={`flex-1 py-2 rounded-lg font-bold text-[10px] uppercase transition-all border ${tpl.isFeatured ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-amber-400'}`}>
                                            {tpl.isFeatured ? 'Destaque Ativo' : 'Destacar'}
                                        </button>
                                    )}
                                    <button onClick={() => handleRemoveTemplate(tpl.id)} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-500 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB: FEEDBACK (ROADMAP) */}
            {activeTab === 'FEEDBACK' && (
                <div className="animate-fade-in-up grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                    <div className="lg:col-span-1 bg-[#0f172a]/60 border border-slate-800 rounded-3xl overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-800/60 sticky top-0 bg-[#0f172a] z-10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Inbox de Feedback</h3>
                            <div className="flex flex-col gap-2">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                    <input type="text" value={fbSearch} onChange={e => setFbSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-800/60 rounded-lg text-xs font-bold text-slate-300 outline-none focus:border-indigo-500" placeholder="Buscar..." />
                                </div>
                                <div className="flex gap-2">
                                    <select value={fbStatusFilter} onChange={e => setFbStatusFilter(e.target.value as any)} className="w-1/2 p-2 bg-slate-900/50 border border-slate-800/60 rounded-lg text-[9px] font-bold text-slate-400 uppercase outline-none"><option value="ALL">Status</option><option value="PENDING">Pendente</option><option value="PLANNED">Planejado</option><option value="IN_PROGRESS">Em Exec.</option><option value="COMPLETED">Feito</option></select>
                                    <select value={fbTypeFilter} onChange={e => setFbTypeFilter(e.target.value as any)} className="w-1/2 p-2 bg-slate-900/50 border border-slate-800/60 rounded-lg text-[9px] font-bold text-slate-400 uppercase outline-none"><option value="ALL">Tipo</option><option value="BUG">Bug</option><option value="FEATURE">Feature</option><option value="IMPROVEMENT">Melhoria</option></select>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
                            {filteredFeedbacks.map(fb => (
                                <div key={fb.id} onClick={() => setSelectedFb(fb)} className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedFb?.id === fb.id ? 'bg-indigo-600/10 border-indigo-500/50' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <div className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider ${getTypeConfig(fb.type).color} bg-white/5`}>
                                            {getTypeConfig(fb.type).icon} {fb.type}
                                        </div>
                                        <span className={`text-[8px] font-bold uppercase tracking-wider ${getStatusConfig(fb.status).color}`}>{getStatusConfig(fb.status).label}</span>
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-200 mb-0.5 line-clamp-1">{fb.title}</h4>
                                    <p className="text-[10px] text-slate-500 line-clamp-2 mb-2">{fb.description}</p>
                                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-600 uppercase">
                                        <span>{fb.authorName}</span>
                                        <span className="flex items-center gap-1"><ThumbsUp size={8} /> {fb.votes}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-[#0f172a]/80 border border-slate-800 rounded-3xl p-6 relative overflow-hidden flex flex-col">
                        {selectedFb ? (
                            <>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${getTypeConfig(selectedFb.type).color} bg-slate-900`}>{selectedFb.type}</span>
                                            <span className="text-slate-600 text-[10px] font-mono">{new Date(selectedFb.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <h2 className="text-2xl font-black text-white mb-2 leading-tight">{selectedFb.title}</h2>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 px-2 py-1 bg-indigo-600/20 text-indigo-400 rounded-lg text-[10px] font-bold border border-indigo-500/30">
                                                <ThumbsUp size={12} /> {selectedFb.votes} Votos
                                            </div>
                                            <div className="flex items-center gap-2 px-2 py-1 bg-slate-800 text-slate-400 rounded-lg text-[10px] font-bold border border-slate-700">
                                                <UserIcon size={12} /> {selectedFb.authorName}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            value={selectedFb.status}
                                            onChange={(e) => { onUpdateStatus(selectedFb.id, e.target.value as any); setSelectedFb({ ...selectedFb, status: e.target.value as any }); }}
                                            className="bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-bold uppercase rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                                        >
                                            <option value="PENDING">Pendente</option>
                                            <option value="PLANNED">Planejado</option>
                                            <option value="IN_PROGRESS">Em Andamento</option>
                                            <option value="COMPLETED">Concluído</option>
                                            <option value="REJECTED">Arquivar</option>
                                        </select>
                                        <button onClick={() => { if (window.confirm('Apagar feedback?')) { onDeleteFeedback(selectedFb.id); setSelectedFb(null); } }} className="p-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-lg transition-colors border border-red-600/20"><Trash2 size={14} /></button>
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 mb-6 max-h-32 overflow-y-auto">
                                    <p className="text-slate-300 text-xs leading-relaxed">{selectedFb.description}</p>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 sticky top-0 bg-[#0f172a] py-2 z-10">Histórico de Respostas</h4>
                                    {(selectedFb.comments || []).map(comment => (
                                        <div key={comment.id} className={`flex gap-3 ${comment.isAdmin ? 'flex-row-reverse' : ''}`}>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${comment.isAdmin ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                                                {comment.authorName.substring(0, 1)}
                                            </div>
                                            <div className={`p-3 rounded-xl max-w-[85%] ${comment.isAdmin ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-100 rounded-tr-none' : 'bg-slate-800 border border-slate-700 text-slate-300 rounded-tl-none'}`}>
                                                <div className="flex justify-between items-center mb-1 gap-3">
                                                    <span className="text-[9px] font-black uppercase tracking-wider opacity-70">{comment.authorName} {comment.isAdmin && '(Staff)'}</span>
                                                    {comment.isAdmin && <button onClick={() => onDeleteComment(selectedFb.id, comment.id)} className="text-slate-500 hover:text-red-400"><X size={10} /></button>}
                                                </div>
                                                <p className="text-[11px] leading-relaxed">{comment.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedFb.comments || selectedFb.comments.length === 0) && <div className="text-center py-8 text-slate-600 text-[10px] italic">Nenhuma resposta ainda.</div>}
                                </div>

                                <form onSubmit={handleSendReply} className="mt-auto relative">
                                    <input
                                        type="text"
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        placeholder="Escreva uma resposta oficial..."
                                        className="w-full pl-5 pr-12 py-3 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:border-indigo-500 text-slate-200 transition-all font-medium text-xs"
                                    />
                                    <button type="submit" disabled={!replyText.trim()} className="absolute right-2 top-2 p-1.5 bg-indigo-600 disabled:opacity-50 text-white rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all"><Send size={14} /></button>
                                </form>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-600">
                                <MessageSquare size={48} className="mb-4 opacity-20" />
                                <p className="text-sm font-bold">Selecione um item para moderar</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB: SYSTEM (CONFIG) */}
            {activeTab === 'SYSTEM' && (
                <div className="animate-fade-in-up max-w-4xl mx-auto space-y-6">
                    <div className="bg-[#0f172a]/60 border border-slate-800 p-6 rounded-3xl shadow-xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20"><ShieldAlert size={24} /></div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Zona de Perigo (Controle de Acesso)</h3>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">GERENCIAMENTO GLOBAL DE DISPONIBILIDADE</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-6 bg-[#020617]/50 border border-slate-800 rounded-2xl">
                                <div className="max-w-md">
                                    <h4 className="text-sm font-bold text-white mb-1">Modo de Manutenção</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">Quando ativo, bloqueia o acesso de todos os usuários (exceto Admins). Use apenas em atualizações críticas.</p>
                                </div>
                                <button
                                    onClick={() => onUpdateSystemConfig({ ...systemConfig, maintenanceMode: !systemConfig.maintenanceMode })}
                                    className={`relative w-14 h-7 rounded-full transition-all duration-300 ${systemConfig.maintenanceMode ? 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'bg-slate-700'}`}
                                >
                                    <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${systemConfig.maintenanceMode ? 'left-7.5' : 'left-0.5'}`}></span>
                                </button>
                            </div>

                            <div className="flex items-center justify-between p-6 bg-[#020617]/50 border border-slate-800 rounded-2xl">
                                <div className="max-w-md">
                                    <h4 className="text-sm font-bold text-white mb-1">Permitir Novos Cadastros</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">Controla se novos usuários podem criar contas. Desative para tornar o sistema fechado/privado.</p>
                                </div>
                                <button
                                    onClick={() => onUpdateSystemConfig({ ...systemConfig, allowSignups: !systemConfig.allowSignups })}
                                    className={`relative w-14 h-7 rounded-full transition-all duration-300 ${systemConfig.allowSignups ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-slate-700'}`}
                                >
                                    <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${systemConfig.allowSignups ? 'left-7.5' : 'left-0.5'}`}></span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0f172a]/60 border border-slate-800 p-6 rounded-3xl shadow-xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500 border border-indigo-500/20"><Send size={24} /></div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Comunicados Globais</h3>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">MENSAGENS DE SISTEMA PARA USUÁRIOS</p>
                            </div>
                        </div>
                        <div className="bg-[#020617]/50 border border-slate-800 rounded-2xl p-6">
                            <div className="flex gap-4 mb-6">
                                <div className="flex-1 space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Título do Comunicado"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-xs font-bold text-slate-200 outline-none focus:border-indigo-500"
                                        id="announcementTitle"
                                    />
                                    <textarea
                                        placeholder="Mensagem detalhada..."
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-xs font-medium text-slate-300 outline-none focus:border-indigo-500 min-h-[80px]"
                                        id="announcementMessage"
                                    ></textarea>
                                    <div className="flex gap-3">
                                        <select id="announcementType" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-[10px] font-bold text-slate-400 uppercase outline-none focus:border-indigo-500">
                                            <option value="INFO">Informativo</option>
                                            <option value="WARNING">Aviso</option>
                                            <option value="ALERT">Alerta Crítico</option>
                                        </select>
                                        <button
                                            onClick={() => {
                                                const title = (document.getElementById('announcementTitle') as HTMLInputElement).value;
                                                const message = (document.getElementById('announcementMessage') as HTMLTextAreaElement).value;
                                                const type = (document.getElementById('announcementType') as HTMLSelectElement).value as any;

                                                if (!title || !message) return alert('Preencha título e mensagem');

                                                const newAnnouncement: any = {
                                                    id: Date.now().toString(),
                                                    title,
                                                    message,
                                                    type,
                                                    isActive: true,
                                                    createdAt: new Date()
                                                };

                                                onUpdateSystemConfig({
                                                    ...systemConfig,
                                                    announcements: [newAnnouncement, ...(systemConfig.announcements || [])]
                                                });

                                                (document.getElementById('announcementTitle') as HTMLInputElement).value = '';
                                                (document.getElementById('announcementMessage') as HTMLTextAreaElement).value = '';
                                            }}
                                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                                        >
                                            Publicar
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Comunicados Ativos</h4>
                                {(systemConfig.announcements || []).map((ann: any) => (
                                    <div key={ann.id} className="flex items-start gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl group hover:border-slate-700 transition-all">
                                        <div className={`p-2 rounded-lg shrink-0 ${ann.type === 'ALERT' ? 'bg-red-500/10 text-red-500' : ann.type === 'WARNING' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                            {ann.type === 'ALERT' ? <ShieldAlert size={16} /> : ann.type === 'WARNING' ? <ShieldAlert size={16} /> : <AppWindow size={16} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h5 className="text-xs font-bold text-slate-200">{ann.title}</h5>
                                                <button
                                                    onClick={() => {
                                                        onUpdateSystemConfig({
                                                            ...systemConfig,
                                                            announcements: systemConfig.announcements.filter((a: any) => a.id !== ann.id)
                                                        });
                                                    }}
                                                    className="text-slate-600 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-slate-400 leading-relaxed">{ann.message}</p>
                                            <span className="text-[9px] text-slate-600 font-mono mt-2 block">{new Date(ann.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                                {(!systemConfig.announcements || systemConfig.announcements.length === 0) && (
                                    <div className="text-center py-8 text-slate-600 text-[10px] italic border border-dashed border-slate-800 rounded-xl">
                                        Nenhum comunicado ativo.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MasterAdminDashboard;
