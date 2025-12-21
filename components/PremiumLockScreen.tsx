import React from 'react';
import { Lock, Crown, CheckCircle, ArrowRight } from 'lucide-react';

interface PremiumLockScreenProps {
    title: string;
    description: string;
    features: string[];
    onUpgrade: () => void;
    isDark: boolean;
}

const PremiumLockScreen: React.FC<PremiumLockScreenProps> = ({ title, description, features, onUpgrade, isDark }) => {
    const textTitle = isDark ? 'text-white' : 'text-slate-900';
    const textSub = isDark ? 'text-slate-400' : 'text-slate-500';

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

                    <h2 className={`text-3xl font-extrabold mb-3 ${textTitle}`}>{title}</h2>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold mb-6 border border-amber-200">
                        <Crown size={12} />
                        Recurso Premium
                    </div>

                    <p className={`text-lg mb-8 leading-relaxed ${textSub}`}>
                        {description}
                    </p>

                    <div className={`w-full text-left p-4 rounded-xl mb-8 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                        <ul className="space-y-3">
                            {features.map((feature, index) => (
                                <li key={index} className={`flex items-center gap-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                    <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button
                        onClick={onUpgrade}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                        title="Fazer Upgrade para Premium"
                        aria-label="Fazer Upgrade para Premium"
                    >
                        Fazer Upgrade para Premium <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PremiumLockScreen;
