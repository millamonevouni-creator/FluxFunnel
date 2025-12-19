
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
}

const UpgradeModal = ({ onClose, onUpgrade, isDark, limitType = 'NODES', plans, userPlan }: UpgradeModalProps) => {
  const isProjectLimit = limitType === 'PROJECTS';

  // Fallback default values if plans aren't loaded yet
  const freePlan = plans?.find(p => p.id === 'FREE') || { projectLimit: 1, nodeLimit: 20 };
  const proPlan = plans?.find(p => p.id === 'PRO') || { projectLimit: 5, nodeLimit: 100 };
  const premiumPlan = plans?.find(p => p.id === 'PREMIUM') || { projectLimit: 9999, nodeLimit: 9999 };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        
        {/* Header Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-600 to-purple-700 z-0"></div>
        
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
        >
            <X size={20} />
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
                onClick={onUpgrade}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-1 mb-3"
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
