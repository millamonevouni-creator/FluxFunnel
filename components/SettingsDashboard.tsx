import React, { useState } from 'react';
import { User as UserIcon, Lock, CreditCard, Bell, Moon, Sun, Globe, Save, CheckCircle, Shield, Camera, Briefcase, Building, Laptop, ToggleLeft, ToggleRight, AlertTriangle, ChevronDown, Mail, Rocket } from 'lucide-react';
import { User, Language, UserPlan } from '../types';
import { api } from '../services/api';

interface SettingsDashboardProps {
    user: User;
    onUpdateUser: (updatedUser: Partial<User>) => void;
    isDark: boolean;
    toggleTheme: () => void;
    lang: Language;
    setLang: (l: Language) => void;
    t: (key: any) => string;
    projectsCount?: number;
}

const SettingsDashboard = ({ user, onUpdateUser, isDark, toggleTheme, lang, setLang, t, projectsCount = 0 }: SettingsDashboardProps) => {
    const [activeTab, setActiveTab] = useState<'PROFILE' | 'PLAN' | 'PREFERENCES' | 'SECURITY' | 'NOTIFICATIONS'>('PROFILE');
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [company, setCompany] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Notification States
    const [notifMarketing, setNotifMarketing] = useState(true);
    const [notifSecurity, setNotifSecurity] = useState(true);

    // Security States
    const [twoFactor, setTwoFactor] = useState(false);

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            onUpdateUser({ name, email });
            setIsSaving(false);
            // Using a simple alert for now, in real app use toast
            // alert('Perfil atualizado com sucesso!');
        }, 800);
    };

    const tabs = [
        { id: 'PROFILE', label: t('tabProfile'), icon: <UserIcon size={18} /> },
        { id: 'PREFERENCES', label: t('tabPreferences'), icon: <Globe size={18} /> },
        { id: 'PLAN', label: t('tabPlan'), icon: <CreditCard size={18} /> },
        { id: 'NOTIFICATIONS', label: t('tabNotifications'), icon: <Bell size={18} /> },
        { id: 'SECURITY', label: t('tabSecurity'), icon: <Lock size={18} /> },
    ];

    // Helper styles
    const cardClass = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
    const labelClass = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;
    const inputClass = `w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
        }`;

    // Plan Limits
    const getPlanLimits = (plan: UserPlan) => {
        switch (plan) {
            case 'FREE': return { projects: 1, nodes: 20 };
            case 'PRO': return { projects: 5, nodes: 100 };
            case 'PREMIUM': return { projects: 9999, nodes: 9999 };
            default: return { projects: 1, nodes: 20 };
        }
    };

    const limits = getPlanLimits(user.plan);
    const projectPercentage = limits.projects === 9999 ? 0 : Math.min((projectsCount / limits.projects) * 100, 100);

    return (
        <div className={`flex-1 overflow-y-auto h-full p-8 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
            <div className="max-w-5xl mx-auto">
                <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('settings')}</h2>
                <p className={`mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('manageAccount')}</p>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className={`rounded-2xl border overflow-hidden shadow-sm ${cardClass}`}>
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-bold transition-colors border-l-4
                                ${activeTab === tab.id
                                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                            : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}
                            `}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 space-y-6">

                        {/* PROFILE TAB */}
                        {activeTab === 'PROFILE' && (
                            <div className={`p-8 rounded-2xl border shadow-sm ${cardClass}`}>
                                <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('personalInfo')}</h3>

                                <div className="flex items-center gap-6 mb-8">
                                    <div className="relative group cursor-pointer">
                                        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-xl ring-4 ring-white dark:ring-slate-800
                                    ${isDark ? 'bg-slate-700' : 'bg-slate-200'}
                                    bg-gradient-to-br from-indigo-500 to-purple-600
                                `}>
                                            {name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Camera size={24} className="text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('yourPhoto')}</p>
                                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('photoDesc')}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSaveProfile} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={labelClass}>{t('fullName')}</label>
                                            <div className="relative">
                                                <UserIcon className={`absolute left-3 top-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} size={18} />
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={e => setName(e.target.value)}
                                                    className={`${inputClass} pl-10`}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClass}>{t('emailAddr')}</label>
                                            <input
                                                type="email"
                                                value={email}
                                                disabled
                                                className={`${inputClass} opacity-70 cursor-not-allowed`}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className={labelClass}>{t('companyName')}</label>
                                            <div className="relative">
                                                <Building className={`absolute left-3 top-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} size={18} />
                                                <input
                                                    type="text"
                                                    value={company}
                                                    onChange={e => setCompany(e.target.value)}
                                                    placeholder="Acme Inc."
                                                    className={`${inputClass} pl-10`}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClass}>{t('jobTitle')}</label>
                                            <div className="relative">
                                                <Briefcase className={`absolute left-3 top-3.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} size={18} />
                                                <input
                                                    type="text"
                                                    value={jobTitle}
                                                    onChange={e => setJobTitle(e.target.value)}
                                                    placeholder="Marketing Manager"
                                                    className={`${inputClass} pl-10`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-70 shadow-lg shadow-indigo-500/20 active:scale-95"
                                        >
                                            {isSaving ? t('saving') : <><Save size={18} /> {t('saveChanges')}</>}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* PREFERENCES TAB */}
                        {activeTab === 'PREFERENCES' && (
                            <div className={`p-8 rounded-2xl border shadow-sm ${cardClass}`}>
                                <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('appearanceLang')}</h3>

                                <div className="grid gap-6">
                                    <div className={`flex items-center justify-between p-5 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-full ${isDark ? 'bg-slate-800 text-yellow-400' : 'bg-white text-slate-600 shadow-sm'}`}>
                                                {isDark ? <Moon size={24} /> : <Sun size={24} />}
                                            </div>
                                            <div>
                                                <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('darkMode')}</p>
                                                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('darkModeDesc')}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={toggleTheme}
                                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isDark ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                        >
                                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${isDark ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>

                                    <div>
                                        <label className={labelClass}>{t('systemLang')}</label>
                                        <div className="relative max-w-sm mt-2">
                                            <Globe className={`absolute left-3 top-3.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} size={18} />
                                            <select
                                                value={lang}
                                                onChange={(e) => setLang(e.target.value as Language)}
                                                className={`${inputClass} pl-10 cursor-pointer appearance-none`}
                                            >
                                                <option value="pt">Português (Brasil)</option>
                                                <option value="en">English (US)</option>
                                                <option value="es">Español</option>
                                            </select>
                                            <ChevronDown className={`absolute right-3 top-3.5 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* NOTIFICATIONS TAB */}
                        {activeTab === 'NOTIFICATIONS' && (
                            <div className={`p-8 rounded-2xl border shadow-sm ${cardClass}`}>
                                <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('tabNotifications')}</h3>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-4">
                                            <div className={`p-2 rounded-lg h-fit ${isDark ? 'bg-slate-700 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                                <Mail size={20} />
                                            </div>
                                            <div>
                                                <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('marketingEmails')}</h4>
                                                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('marketingEmailsDesc')}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setNotifMarketing(!notifMarketing)} className={`text-2xl ${notifMarketing ? 'text-indigo-600' : 'text-slate-300'}`}>
                                            {notifMarketing ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                                        </button>
                                    </div>

                                    <div className="h-px bg-slate-100 dark:bg-slate-700"></div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-4">
                                            <div className={`p-2 rounded-lg h-fit ${isDark ? 'bg-slate-700 text-red-400' : 'bg-red-50 text-red-600'}`}>
                                                <Shield size={20} />
                                            </div>
                                            <div>
                                                <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('securityEmails')}</h4>
                                                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('securityEmailsDesc')}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setNotifSecurity(!notifSecurity)} className={`text-2xl ${notifSecurity ? 'text-indigo-600' : 'text-slate-300'}`}>
                                            {notifSecurity ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PLAN TAB */}
                        {activeTab === 'PLAN' && (
                            <div className="space-y-6">
                                {/* Current Plan Card */}
                                <div className={`p-8 rounded-2xl border relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl`}>
                                    <div className="absolute top-0 right-0 p-32 bg-white opacity-5 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>

                                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Shield className="text-indigo-200" size={20} />
                                                <span className="font-bold text-indigo-100 uppercase tracking-wider text-xs">{t('currentPlan')}</span>
                                            </div>
                                            <h3 className="text-4xl font-extrabold mb-2">{user.plan}</h3>
                                            <p className="text-indigo-100 text-sm opacity-90 flex items-center gap-2">
                                                <CheckCircle size={14} /> {t('autoRenewal')}
                                            </p>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <span className="text-3xl font-bold block">
                                                {user.plan === 'FREE' ? t('starter') : (user.plan === 'PRO' ? 'R$ 49,90' : 'R$ 79,90')}
                                            </span>
                                            <span className="text-sm opacity-80">{user.plan !== 'FREE' ? t('month') : t('forever')}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Usage Stats */}
                                <div className={`p-8 rounded-2xl border shadow-sm ${cardClass}`}>
                                    <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('usageLimit')}</h3>

                                    {/* Projects Usage */}
                                    <div className="mb-6">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{t('projectsUsed')}</span>
                                            <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                {projectsCount} / {limits.projects === 9999 ? '∞' : limits.projects}
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                                            <div className={`h-full rounded-full transition-all duration-1000 ${projectPercentage > 90 ? 'bg-red-500' : 'bg-indigo-600'}`} style={{ width: `${projectPercentage}%` }}></div>
                                        </div>
                                    </div>

                                    {user.plan === 'FREE' && (
                                        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl flex items-center gap-3 border border-indigo-100 dark:border-indigo-800">
                                            <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-full text-indigo-600 dark:text-indigo-300">
                                                <Rocket size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100">{t('upgradeToIncrease')}</p>
                                            </div>
                                            <button className="text-xs font-bold bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                                                Upgrade
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Payment Method */}
                                {user.plan !== 'FREE' && (
                                    <div className={`p-8 rounded-2xl border shadow-sm ${cardClass}`}>
                                        <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('paymentMethod')}</h3>
                                        <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50 dark:bg-slate-900 dark:border-slate-700">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-8 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center text-xs font-bold text-slate-500">
                                                    VISA
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>•••• •••• •••• 4242</p>
                                                    <p className="text-xs text-slate-500">{t('expires')} 12/28</p>
                                                </div>
                                            </div>
                                            <button className="text-sm font-bold text-indigo-600 hover:underline">{t('updateMethod')}</button>
                                        </div>
                                    </div>
                                )}

                                {/* Invoice History */}
                                <div className={`p-8 rounded-2xl border shadow-sm ${cardClass}`}>
                                    <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('billingHistory')}</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className={`text-xs uppercase ${isDark ? 'text-slate-400 bg-slate-900' : 'text-slate-500 bg-slate-50'}`}>
                                                <tr>
                                                    <th className="px-4 py-3 rounded-l-lg">{t('tableDate')}</th>
                                                    <th className="px-4 py-3">{t('tableDesc')}</th>
                                                    <th className="px-4 py-3">{t('tableAmount')}</th>
                                                    <th className="px-4 py-3 rounded-r-lg">{t('tableStatus')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                                {user.plan === 'FREE' ? (
                                                    <tr className="border-b border-slate-100 dark:border-slate-800">
                                                        <td colSpan={4} className="px-4 py-6 text-center text-slate-400 italic">{t('noBilling')}</td>
                                                    </tr>
                                                ) : (
                                                    <tr className="border-b border-slate-100 dark:border-slate-800">
                                                        <td className="px-4 py-3">15 Nov, 2024</td>
                                                        <td className="px-4 py-3">UniFunnel {user.plan}</td>
                                                        <td className="px-4 py-3 font-medium">{user.plan === 'PRO' ? 'R$ 49,90' : 'R$ 79,90'}</td>
                                                        <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1 w-fit"><CheckCircle size={10} /> {t('paid')}</span></td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECURITY TAB */}
                        {activeTab === 'SECURITY' && (
                            <div className="space-y-6">
                                <div className={`p-8 rounded-2xl border shadow-sm ${cardClass}`}>
                                    <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('accountSecurity')}</h3>

                                    <form className="space-y-4 max-w-md" onSubmit={async (e) => {
                                        e.preventDefault();
                                        const form = e.target as HTMLFormElement;
                                        const newPass = (form.elements.namedItem('newPass') as HTMLInputElement).value;
                                        const confirmPass = (form.elements.namedItem('confirmPass') as HTMLInputElement).value;

                                        if (newPass !== confirmPass) {
                                            alert(t('passwordsDontMatch') || 'As senhas não coincidem');
                                            return;
                                        }
                                        if (newPass.length < 6) {
                                            alert(t('passwordTooShort') || 'A senha deve ter pelo menos 6 caracteres');
                                            return;
                                        }

                                        try {
                                            setIsSaving(true);
                                            await api.auth.updatePassword(newPass);
                                            alert(t('passwordUpdated') || 'Senha atualizada com sucesso!');
                                            form.reset();
                                        } catch (error) {
                                            console.error(error);
                                            alert(t('passwordUpdateError') || 'Erro ao atualizar senha');
                                        } finally {
                                            setIsSaving(false);
                                        }
                                    }}>
                                        <div>
                                            <label className={labelClass}>{t('newPwd')}</label>
                                            <input name="newPass" type="password" placeholder="••••••••" className={inputClass} required />
                                        </div>
                                        <div>
                                            <label className={labelClass}>{t('confirmPwd')}</label>
                                            <input name="confirmPass" type="password" placeholder="••••••••" className={inputClass} required />
                                        </div>
                                        <div className="pt-2">
                                            <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl font-bold transition-all shadow-md disabled:opacity-50">
                                                {isSaving ? (t('saving') || 'Salvando...') : t('updatePwd')}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* 2FA Section */}
                                <div className={`p-8 rounded-2xl border shadow-sm ${cardClass}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('twoFactor')}</h3>
                                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('twoFactorDesc')}</p>
                                        </div>
                                        <button onClick={() => setTwoFactor(!twoFactor)} className={`text-3xl ${twoFactor ? 'text-green-500' : 'text-slate-300'}`}>
                                            {twoFactor ? <ToggleRight size={48} /> : <ToggleLeft size={48} />}
                                        </button>
                                    </div>
                                    {twoFactor && (
                                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl flex items-center gap-3">
                                            <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                                            <p className="text-sm text-green-800 dark:text-green-200 font-medium">Autenticação de dois fatores está ativa.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Active Sessions */}
                                <div className={`p-8 rounded-2xl border shadow-sm ${cardClass}`}>
                                    <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('activeSessions')}</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded text-slate-500">
                                                    <Laptop size={20} />
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Chrome on Windows</p>
                                                    <p className="text-xs text-slate-500">São Paulo, Brazil • <span className="text-green-500 font-bold">{t('currentSession')}</span></p>
                                                </div>
                                            </div>
                                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-red-100 dark:border-red-900/30">
                                    <h4 className="text-red-600 font-bold mb-2 flex items-center gap-2"><AlertTriangle size={18} /> {t('dangerZone')}</h4>
                                    <p className="text-sm text-slate-500 mb-4">{t('deleteWarning')}</p>
                                    <button className="px-5 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-bold transition-colors">
                                        {t('deleteAccount')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsDashboard;