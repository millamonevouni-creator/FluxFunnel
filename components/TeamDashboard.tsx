
import React, { useState } from 'react';
import { Users, UserPlus, Shield, Mail, CheckCircle, Clock, AlertCircle, Crown, MoreHorizontal, Lock, ArrowRight, X, ChevronDown } from 'lucide-react';
import { TeamMember, UserPlan } from '../types';

interface TeamDashboardProps {
  members: TeamMember[];
  onInviteMember: (email: string, role: 'ADMIN' | 'EDITOR' | 'VIEWER') => void;
  onUpdateRole: (id: string, newRole: 'ADMIN' | 'EDITOR' | 'VIEWER') => void;
  onRemoveMember: (id: string) => void;
  onUpgrade: () => void;
  plan: UserPlan;
  maxMembers: number;
  isDark: boolean;
  t: (key: any) => string;
}

const TeamDashboard = ({ members, onInviteMember, onUpdateRole, onRemoveMember, onUpgrade, plan, maxMembers, isDark, t }: TeamDashboardProps) => {
  const bgCard = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const textTitle = isDark ? 'text-white' : 'text-slate-900';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-500';

  // Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'EDITOR' | 'VIEWER'>('VIEWER');

  // --- PREMIUM LOCK CHECK ---
  if (plan !== 'PREMIUM') {
      return (
          <div className={`flex-1 h-full p-8 transition-colors duration-300 flex flex-col items-center justify-center ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
              <div className={`max-w-lg w-full text-center p-10 rounded-3xl border shadow-2xl relative overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  
                  {/* Background decoration */}
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>

                  <div className="relative z-10 flex flex-col items-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner rotate-3">
                          <Lock size={40} className="text-indigo-600" />
                      </div>
                      
                      <h2 className={`text-3xl font-extrabold mb-3 ${textTitle}`}>Colaboração em Equipe</h2>
                      
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold mb-6 border border-amber-200">
                          <Crown size={12} />
                          Recurso Premium
                      </div>

                      <p className={`text-lg mb-8 leading-relaxed ${textSub}`}>
                          A gestão de equipe e permissões avançadas está disponível exclusivamente para assinantes do plano <strong>Premium</strong>.
                      </p>

                      <div className={`w-full text-left p-4 rounded-xl mb-8 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                          <ul className="space-y-3">
                              <li className={`flex items-center gap-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                                  Convide membros ilimitados
                              </li>
                              <li className={`flex items-center gap-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                                  Defina permissões (Admin, Editor, Visualizador)
                              </li>
                              <li className={`flex items-center gap-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                  <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                                  Histórico de atividades da equipe
                              </li>
                          </ul>
                      </div>

                      <button 
                          onClick={onUpgrade}
                          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                      >
                          Fazer Upgrade para Premium <ArrowRight size={18} />
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  const usagePercentage = (members.length / maxMembers) * 100;
  const isLimitReached = members.length >= maxMembers && maxMembers !== 9999;

  const handleInviteSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onInviteMember(inviteEmail, inviteRole);
      setInviteEmail('');
      setShowInviteModal(false);
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
                    <h3 className="font-bold text-lg">Plano {plan}</h3>
                    <p className="text-indigo-100 text-sm">Limite da sua equipe</p>
                 </div>
              </div>
              <div className="text-right">
                 <span className="text-3xl font-bold">{members.length}</span>
                 <span className="text-indigo-200"> / {maxMembers === 9999 ? '∞' : maxMembers} usuários</span>
              </div>
           </div>
           
           {/* Progress Bar */}
           <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-white/90 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              ></div>
           </div>
           
           {usagePercentage >= 100 && maxMembers !== 9999 && (
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
                    Total: {members.length}
                </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {members.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                        <Users size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Sua equipe está vazia.</p>
                        <p className="text-sm">Convide alguém para começar a colaborar.</p>
                    </div>
                ) : (
                    members.map((member) => (
                        <div key={member.id} className={`p-4 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm
                                    ${member.role === 'ADMIN' ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-blue-400 to-indigo-500'}
                                `}>
                                    {member.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className={`font-bold text-sm ${textTitle}`}>{member.name}</h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Mail size={12} /> {member.email}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                {/* Role Dropdown */}
                                <div className="relative group/role">
                                    <select 
                                        value={member.role}
                                        onChange={(e) => onUpdateRole(member.id, e.target.value as any)}
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

                                {/* Status Badge */}
                                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded
                                     ${member.status === 'ACTIVE' ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' : 'text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400'}
                                `}>
                                    {member.status === 'ACTIVE' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                    {member.status === 'ACTIVE' ? 'Ativo' : 'Pendente'}
                                </div>

                                <button 
                                    onClick={() => onRemoveMember(member.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Remover"
                                >
                                    <MoreHorizontal size={18} />
                                </button>
                            </div>
                        </div>
                    ))
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
                      <button onClick={() => setShowInviteModal(false)} className={`p-1.5 rounded-full ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                          <X size={20} />
                      </button>
                  </div>

                  <form onSubmit={handleInviteSubmit} className="space-y-4">
                      <div>
                          <label className={`block text-sm font-bold mb-1 ${textSub}`}>E-mail do Colaborador</label>
                          <input 
                              type="email" 
                              required
                              autoFocus
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              placeholder="nome@empresa.com"
                              className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                          />
                      </div>

                      <div>
                          <label className={`block text-sm font-bold mb-1 ${textSub}`}>Permissão de Acesso</label>
                          <div className="grid grid-cols-3 gap-2">
                              {['VIEWER', 'EDITOR', 'ADMIN'].map((role) => (
                                  <button
                                      key={role}
                                      type="button"
                                      onClick={() => setInviteRole(role as any)}
                                      className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all ${
                                          inviteRole === role 
                                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                                              : `${isDark ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`
                                      }`}
                                  >
                                      {role}
                                  </button>
                              ))}
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                              {inviteRole === 'VIEWER' && 'Pode apenas visualizar os projetos. Não pode editar.'}
                              {inviteRole === 'EDITOR' && 'Pode editar fluxos e configurações do projeto.'}
                              {inviteRole === 'ADMIN' && 'Controle total sobre a equipe e cobranças.'}
                          </p>
                      </div>

                      <div className="pt-4 flex gap-3">
                          <button 
                              type="button" 
                              onClick={() => setShowInviteModal(false)}
                              className={`flex-1 py-3 rounded-xl font-bold transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                          >
                              Cancelar
                          </button>
                          <button 
                              type="submit"
                              className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                              <Mail size={18} /> Enviar Convite
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
