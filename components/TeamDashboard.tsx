
import React, { useState, useRef, useEffect } from 'react';
import { Users, UserPlus, Mail, CheckCircle, Clock, AlertCircle, Crown, MoreHorizontal, Lock, ArrowRight, X, ChevronDown } from 'lucide-react';
import { TeamMember, UserPlan } from '../types';

import PremiumLockScreen from './PremiumLockScreen';

interface TeamDashboardProps {
    members: TeamMember[];
    onInviteMember: (email: string, role: 'ADMIN' | 'EDITOR' | 'VIEWER', name?: string, planId?: string) => Promise<void>;
    onUpdateRole: (id: string, newRole: 'ADMIN' | 'EDITOR' | 'VIEWER') => void;
    onRemoveMember: (id: string) => void;
    onResendInvite: (email: string) => Promise<void>;
    onUpgrade: () => void;
    plan: UserPlan;
    maxMembers: number;
    isDark: boolean;
    t: (key: any) => string;
}

const TeamDashboard = ({ members = [], onInviteMember, onUpdateRole, onRemoveMember, onResendInvite, onUpgrade, plan, maxMembers, isDark, t }: TeamDashboardProps) => {
    const bgCard = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
    const textTitle = isDark ? 'text-white' : 'text-slate-900';
    const textSub = isDark ? 'text-slate-400' : 'text-slate-500';

    // Safe access
    const safeMembers = Array.isArray(members) ? members : [];
    const safeMaxMembers = typeof maxMembers === 'number' ? maxMembers : 0;
    const safePlan = plan || 'FREE';

    // Modal State
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteName, setInviteName] = useState('');
    const [invitePlan, setInvitePlan] = useState('CONVIDADO');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'ADMIN' | 'EDITOR' | 'VIEWER'>('EDITOR');
    const [isInviteLoading, setIsInviteLoading] = useState(false);
    const progressRef = useRef<HTMLDivElement>(null);

    // --- PREMIUM LOCK CHECK ---
    if (safePlan !== 'PREMIUM') {
        return (
            <PremiumLockScreen
                title="Colaboração em Equipe"
                description="A gestão de equipe e permissões avançadas está disponível exclusivamente para assinantes do plano Premium."
                features={["Convide membros ilimitados", "Defina permissões (Admin, Editor, Visualizador)", "Histórico de atividades da equipe"]}
                onUpgrade={onUpgrade}
                isDark={isDark}
            />
        );
    }

    const usagePercentage = safeMaxMembers > 0 ? (safeMembers.length / safeMaxMembers) * 100 : 0;
    const isLimitReached = safeMembers.length >= safeMaxMembers && safeMaxMembers !== 9999;

    useEffect(() => {
        if (progressRef.current) {
            const val = Math.min(Math.max(usagePercentage, 0), 100);
            const parent = progressRef.current.parentElement;
            if (parent) {
                progressRef.current.style.width = `${val}%`;
                parent.setAttribute('role', 'progressbar');
                parent.setAttribute('aria-valuenow', Math.round(val).toString());
                parent.setAttribute('aria-valuemin', '0');
                parent.setAttribute('aria-valuemax', '100');
            }
        }
    }, [usagePercentage]);

    const handleInviteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsInviteLoading(true);
        try {
            await onInviteMember(inviteEmail, inviteRole, inviteName, invitePlan);
            setInviteEmail('');
            setInviteName('');
            setInvitePlan('CONVIDADO');
            setShowInviteModal(false);
        } catch (error) {
            // Error is handled by parent notification, but we keep modal open
            console.error(error);
        } finally {
            setIsInviteLoading(false);
        }
    };


    return (
        <div className={`flex-1 overflow-y-auto h-full p-8 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className={`text-3xl font-bold ${textTitle} mb-2`}>Gestão de Equipe</h2>
                        <p className={textSub}>Adicione colaboradores para visualizar e editar seus funis.</p>
                    </div>
                    <button
                        onClick={() => setShowInviteModal(true)}
                        disabled={isLimitReached}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition-all transform 
                ${isLimitReached
                                ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/20 hover:-translate-y-1'
                            }`
                        }
                        title={isLimitReached ? "Limite de membros atingido" : "Convidar novo membro"}
                        aria-label={isLimitReached ? "Limite de membros atingido" : "Convidar novo membro"}
                    >
                        <UserPlus size={20} />
                        {isLimitReached ? 'Limite Atingido' : 'Convidar Membro'}
                    </button>
                </div>

                {/* Plan Usage Card */}
                <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Crown size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Plano {safePlan}</h3>
                                <p className="text-indigo-100 text-sm">Limite da sua equipe</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-3xl font-bold">{safeMembers.length}</span>
                            <span className="text-indigo-200"> / {safeMaxMembers === 9999 ? '∞' : safeMaxMembers} usuários</span>
                        </div>
                    </div>

                    <div
                        className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden"
                        aria-label={`Uso da equipe: ${Math.round(usagePercentage)}%`}
                        title={`Uso da equipe: ${Math.round(usagePercentage)}%`}
                    >
                        <div ref={progressRef} className={`h-full rounded-full transition-all duration-1000 ${usagePercentage > 90 ? 'bg-red-500' : 'bg-indigo-600'}`}></div>
                    </div>

                    {usagePercentage >= 100 && safeMaxMembers !== 9999 && (
                        <div className="mt-4 flex items-center gap-2 text-sm bg-white/10 p-2 rounded-lg text-indigo-100">
                            <AlertCircle size={16} />
                            <span>Você atingiu o limite do seu plano. Fale com o suporte para expandir.</span>
                        </div>
                    )}
                </div>

                {/* Members List */}
                <div className={`rounded-2xl border overflow-visible ${bgCard}`}>
                    <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <h3 className={`font-bold ${textTitle}`}>Membros Ativos</h3>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-500 border border-slate-200'}`}>
                            Total: {safeMembers.length}
                        </span>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {safeMembers.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <Users size={48} className="mx-auto mb-4 opacity-50" />
                                <p>Sua equipe está vazia.</p>
                                <p className="text-sm">Convide alguém para começar a colaborar.</p>
                            </div>
                        ) : (
                            safeMembers.map((member) => {
                                // Safety check for members
                                if (!member) return null;
                                const displayName = member.name || member.email?.split('@')[0] || 'Membro';
                                const initials = displayName.substring(0, 2).toUpperCase();

                                return (
                                    <div key={member.id || Math.random().toString()} className={`p-4 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm
                                    ${member.role === 'ADMIN' ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-blue-400 to-indigo-500'}
                                `}>
                                                {initials}
                                            </div>
                                            <div>
                                                <h4 className={`font-bold text-sm ${textTitle}`}>{displayName}</h4>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <Mail size={12} /> {member.email || 'Sem e-mail'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            {/* Role Dropdown */}
                                            <div className="relative group/role">
                                                <select
                                                    value={member.role || 'VIEWER'}
                                                    onChange={(e) => onUpdateRole(member.id, e.target.value as any)}
                                                    title="Alterar função do membro"
                                                    aria-label="Selecionar função do membro"
                                                    className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg border text-xs font-bold uppercase cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500 transition-all
                                            ${member.role === 'ADMIN'
                                                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                                                            : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800'}
                                        `}
                                                >
                                                    <option value="VIEWER">Viewer</option>
                                                    <option value="EDITOR">Editor</option>
                                                    <option value="ADMIN">Admin</option>
                                                </select>
                                                <ChevronDown size={12} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${member.role === 'ADMIN' ? 'text-amber-600' : 'text-indigo-600'}`} />
                                            </div>

                                            {/* Status and Actions */}
                                            <div className="flex items-center gap-3">
                                                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded
                                                    ${member.status === 'ACTIVE' ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' : 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400'}
                                                `}>
                                                    {member.status === 'ACTIVE' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                                    {member.status === 'ACTIVE' ? 'Ativo' : 'Pendente'}
                                                </div>

                                                {member.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => onResendInvite(member.email)}
                                                        className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-wait"
                                                        title="Reenviar convite de acesso"
                                                        aria-label="Reenviar convite de acesso"
                                                    >
                                                        Reenviar
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => onRemoveMember(member.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    title={`Remover ${displayName}`}
                                                    aria-label={`Remover ${displayName}`}
                                                >
                                                    <MoreHorizontal size={18} aria-hidden="true" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* INVITE MODAL */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up">
                    <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className={`text-xl font-bold ${textTitle}`}>Convidar Membro</h3>
                            {/* Invite Form */}
                            <button onClick={() => setShowInviteModal(false)} className={`p-1.5 rounded-full ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`} title="Fechar modal" aria-label="Fechar modal">
                                <X size={20} aria-hidden="true" />
                            </button>
                        </div>

                        <form onSubmit={handleInviteSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="invite-name" className={`block text-sm font-bold mb-1 ${textSub}`}>Nome do Colaborador</label>
                                <input
                                    id="invite-name"
                                    type="text"
                                    required
                                    autoFocus
                                    value={inviteName}
                                    onChange={(e) => setInviteName(e.target.value)}
                                    placeholder="Ex: Ana Silva"
                                    className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                />
                            </div>

                            <div>
                                <label htmlFor="invite-plan" className={`block text-sm font-bold mb-1 ${textSub}`}>Tipo de Convite</label>
                                <select
                                    id="invite-plan"
                                    value="CONVIDADO"
                                    disabled
                                    className={`w-full p-3 rounded-xl border outline-none bg-slate-100 text-slate-500 cursor-not-allowed ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}
                                >
                                    <option value="CONVIDADO">Convidado (Plano Convidado)</option>
                                </select>
                                <p className="text-xs text-slate-500 mt-1">O usuário será adicionado automaticamente ao Plano Convidado.</p>
                            </div>

                            <div>
                                <label htmlFor="invite-email" className={`block text-sm font-bold mb-1 ${textSub}`}>E-mail do Colaborador</label>
                                <input
                                    id="invite-email"
                                    type="email"
                                    required
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="nome@empresa.com"
                                    className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-bold mb-1 ${textSub}`}>Permissão de Acesso</label>
                                <div className="grid grid-cols-1 gap-2">
                                    <button
                                        type="button"
                                        className="py-2 px-1 rounded-lg text-xs font-bold border transition-all bg-indigo-600 text-white border-indigo-600 shadow-md cursor-default"
                                        title="Função Editor"
                                    >
                                        EDITOR
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    Pode editar fluxos e configurações do projeto.
                                </p>
                                <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 font-medium flex items-center gap-1">
                                    <AlertCircle size={10} /> O convite é enviado via e-mail. Peça para o membro verificar a pasta de spam.
                                </p>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowInviteModal(false)}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                                    title="Cancelar convite"
                                    aria-label="Cancelar convite"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isInviteLoading}
                                    className={`flex-[2] py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2`}
                                    title="Enviar Convite"
                                    aria-label="Enviar Convite"
                                >
                                    {isInviteLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Mail size={18} /> Enviar Convite
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamDashboard;
