import React from 'react';
import { User } from '../types';
import { User as UserIcon, Building2, X, ArrowRight } from 'lucide-react';

interface ProfileCompletionBannerProps {
    user: User;
    onDismiss: () => void;
    onAction: () => void;
}

const ProfileCompletionBanner: React.FC<ProfileCompletionBannerProps> = ({ user, onDismiss, onAction }) => {
    if (user.company_name && user.job_title) return null;

    return (
        <div className="bg-indigo-600 dark:bg-indigo-900 border-b border-indigo-500 text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <svg width="100%" height="100%">
                    <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="currentColor" strokeWidth="2" fill="none" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                </svg>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm hidden sm:block">
                        <UserIcon size={20} className="text-white" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <p className="font-medium text-sm sm:text-base">
                            👋 Olá, {user.name.split(' ')[0]}! Complete seu perfil para uma experiência personalizada.
                        </p>
                        <div className="flex gap-2 text-xs text-indigo-200">
                            {!user.company_name && <span className="bg-black/20 px-2 py-0.5 rounded flex items-center gap-1"><Building2 size={10} /> Empresa pendente</span>}
                            {!user.job_title && <span className="bg-black/20 px-2 py-0.5 rounded flex items-center gap-1"><UserIcon size={10} /> Cargo pendente</span>}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onAction}
                        className="whitespace-nowrap bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm"
                    >
                        Completar Agora <ArrowRight size={14} />
                    </button>
                    <button
                        onClick={onDismiss}
                        className="p-1 hover:bg-white/20 rounded-lg transition-colors text-indigo-100 hover:text-white"
                        aria-label="Ignorar"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileCompletionBanner;
