
import React, { useState } from 'react';
import { GitGraph, Mail, Lock, User, ArrowRight, Loader2, CheckCircle, AlertCircle, Key, ArrowLeft, Sparkles } from 'lucide-react';
import { Language } from '../types';

interface AuthPageProps {
    onAuthSuccess: (data: { email: string; name?: string; password?: string; isSignup?: boolean }) => void;
    onBack: () => void;
    t: (key: any) => string;
    lang: Language;
    customSubtitle?: string; // New prop for contextual messages
    initialView?: AuthView;
    onUpdatePassword?: (password: string) => Promise<void>;
    onResetPassword?: (email: string) => Promise<void>;
    onGoogleLogin?: () => Promise<void>;
    onInviteComplete?: () => void; // Callback to switch view without reload
}

// Google G Logo SVG Component for button
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.47 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

type AuthView = 'LOGIN' | 'FORGOT_PASSWORD' | 'RESET_SENT' | 'UPDATE_PASSWORD' | 'SIGNUP_SUCCESS' | 'SET_PASSWORD';

const AuthPage = ({ onAuthSuccess, onBack, t, lang, customSubtitle, initialView = 'LOGIN', onUpdatePassword, onResetPassword, onGoogleLogin, onInviteComplete }: AuthPageProps) => {
    const [currentView, setCurrentView] = useState<AuthView>(initialView);

    // Allow parent to drive view changes (e.g. async auth listener)
    React.useEffect(() => {
        if (initialView) setCurrentView(initialView);
    }, [initialView]);

    const [isLogin, setIsLogin] = useState(true); // Toggles between Login and Signup when in LOGIN view
    const [isLoading, setIsLoading] = useState(false);

    // State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Basic Validation
        if (!email.includes('@')) {
            setError('Por favor, insira um e-mail válido.');
            return;
        }
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (!isLogin && password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setIsLoading(true);

        try {
            // Pass the input data back to App.tsx including intent (login vs signup)
            await onAuthSuccess({
                email: email.toLowerCase(),
                name: isLogin ? undefined : name,
                password: password,
                isSignup: !isLogin
            });
        } catch (err: any) {
            setError(err.message || 'Erro inesperado na autenticação.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.includes('@')) {
            setError('Por favor, insira um e-mail válido para recuperação.');
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            if (onResetPassword) {
                await onResetPassword(email);
            } else {
                // Fallback/Simulate if no handler provided (for testing/storybook)
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
            setCurrentView('RESET_SENT');
        } catch (e: any) {
            setError(e.message || 'Erro ao enviar email de recuperação.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            if (onUpdatePassword) {
                await onUpdatePassword(password);

                // If we are in SET_PASSWORD mode (onboarding), we want to go straight to APP
                if (currentView === 'SET_PASSWORD') {
                    // Call the success handler directly to transition without reload
                    // We construct a synthetic success data object since we are already authenticated
                    // We might not have email here, but handleLogin in App.tsx might need it? 
                    // Actually handleLogin does api.auth.login which we DON'T want if already logged in.
                    // But wait, if we are here, we just updated password.
                    // The user is authenticated.
                    // We should probably have a separate prop for "just finish" or use a flag.
                    // Let's assume onAuthSuccess handles "just switch view" if we pass a special flag? 
                    // No, handleLogin calls login.

                    // FIX: check if onInviteComplete is provided (we will add this prop)
                    if (onInviteComplete) {
                        onInviteComplete();
                        return;
                    }

                    // Fallback to reload if handler not provided yet
                    window.location.href = '/';
                    return;
                }

                setCurrentView('LOGIN');
                // Show success message or auto-login? For now just go to login.
                alert('Senha atualizada com sucesso! Por favor, faça login.');
            }
        } catch (e: any) {
            setError(e.message || 'Erro ao atualizar senha.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (onGoogleLogin) {
            setIsLoading(true);
            try {
                await onGoogleLogin();
            } catch (error: any) {
                setError(error.message || "Erro ao iniciar login com Google.");
                setIsLoading(false);
            }
        } else {
            console.warn("Google Login handler not provided");
            setError("Login com Google não configurado.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">

            {/* Brand */}
            <div className="mb-8 flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform" onClick={onBack}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <GitGraph className="text-white" size={24} />
                </div>
                <span className="font-bold text-2xl text-slate-800 tracking-tight">FluxFunnel</span>
            </div>

            <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative overflow-hidden transition-all duration-500 hover:shadow-[0_20px_60px_rgba(79,70,229,0.15)]">

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center flex-col">
                        <Loader2 className="animate-spin text-indigo-600 mb-2" size={40} />
                        <p className="text-sm font-bold text-slate-600 animate-pulse">
                            {currentView === 'FORGOT_PASSWORD' ? 'Enviando link...' :
                                currentView === 'UPDATE_PASSWORD' ? 'Atualizando senha...' :
                                    (isLogin ? 'Autenticando...' : 'Criando sua conta...')}
                        </p>
                    </div>
                )}

                {/* --- VIEW: SIGNUP SUCCESS / EMAIL VERIFICATION --- */}
                {currentView === 'SIGNUP_SUCCESS' && (
                    <div className="text-center py-4 animate-fade-in-up">
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Mail className="text-indigo-600" size={36} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Quase lá!</h2>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            Enviamos um e-mail de confirmação para <strong>{email}</strong>. <br />
                            Por favor, verifique sua caixa de entrada para ativar sua conta.
                        </p>
                        <button
                            onClick={() => { setCurrentView('LOGIN'); setIsLogin(true); setError(null); }}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
                        >
                            Ir para Login
                        </button>
                    </div>
                )}

                {/* --- VIEW: PASSWORD RESET SUCCESS --- */}
                {currentView === 'RESET_SENT' && (
                    <div className="text-center py-4 animate-fade-in-up">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="text-green-600" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Verifique seu e-mail</h2>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            Enviamos um link de recuperação para <strong>{email}</strong>. Clique no link para criar uma nova senha.
                        </p>
                        <button
                            onClick={() => { setCurrentView('LOGIN'); setError(null); }}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all shadow-md"
                        >
                            Voltar para Login
                        </button>
                        <button
                            onClick={() => setCurrentView('FORGOT_PASSWORD')}
                            className="mt-4 text-indigo-600 text-sm font-bold hover:underline"
                        >
                            Tentar outro e-mail
                        </button>
                    </div>
                )}

                {/* --- VIEW: SET PASSWORD (FIRST ACCESS) --- */}
                {currentView === 'SET_PASSWORD' && (
                    <div className="animate-fade-in-up">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                                <Sparkles className="text-indigo-600" size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Bem-vindo(a)!</h2>
                            <p className="text-slate-500 text-sm mt-2">Você foi convidado(a) para colaborar. Defina sua senha para acessar.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleUpdatePasswordSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 ml-1">Crie sua Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="No mínimo 6 caracteres"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 ml-1">Confirme a Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repita a senha"
                                        className={`w-full bg-slate-50 border rounded-xl py-2.5 pl-10 pr-4 text-slate-900 focus:ring-2 outline-none transition-all placeholder:text-slate-400
                                    ${confirmPassword && confirmPassword !== password ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500 focus:bg-white'}
                                `}
                                    />
                                    {confirmPassword && confirmPassword === password && (
                                        <CheckCircle className="absolute right-3 top-3 text-green-500" size={18} />
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 shadow-md shadow-indigo-500/20 active:scale-95"
                            >
                                Acessar Plataforma <ArrowRight size={18} />
                            </button>
                        </form>
                    </div>
                )}

                {/* --- VIEW: UPDATE PASSWORD FORM --- */}
                {currentView === 'UPDATE_PASSWORD' && (
                    <div className="animate-fade-in-up">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                <Lock size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Nova Senha</h2>
                        </div>
                        <p className="text-slate-500 text-sm mb-6">Defina sua nova senha de acesso.</p>

                        {error && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleUpdatePasswordSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 ml-1">Nova Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 ml-1">Confirmar Nova Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className={`w-full bg-slate-50 border rounded-xl py-2.5 pl-10 pr-4 text-slate-900 focus:ring-2 outline-none transition-all placeholder:text-slate-400
                                    ${confirmPassword && confirmPassword !== password ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500 focus:bg-white'}
                                `}
                                    />
                                    {confirmPassword && confirmPassword === password && (
                                        <CheckCircle className="absolute right-3 top-3 text-green-500" size={18} />
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 shadow-md shadow-indigo-500/20 active:scale-95"
                            >
                                Atualizar Senha <ArrowRight size={18} />
                            </button>
                        </form>
                    </div>
                )}

                {/* --- VIEW: FORGOT PASSWORD FORM --- */}
                {currentView === 'FORGOT_PASSWORD' && (
                    <div className="animate-fade-in-up">
                        <button
                            onClick={() => { setCurrentView('LOGIN'); setError(null); }}
                            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-sm font-medium mb-6 transition-colors"
                        >
                            <ArrowLeft size={16} /> Voltar
                        </button>

                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                <Key size={20} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Redefinir Senha</h2>
                        </div>
                        <p className="text-slate-500 text-sm mb-6">Insira seu e-mail e enviaremos instruções para você recuperar o acesso.</p>

                        {error && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleResetSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 ml-1">E-mail Cadastrado</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="email@exemplo.com"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 shadow-md shadow-indigo-500/20 active:scale-95"
                            >
                                Enviar Link de Recuperação <ArrowRight size={18} />
                            </button>
                        </form>
                    </div>
                )}

                {/* --- VIEW: LOGIN / SIGNUP --- */}
                {currentView === 'LOGIN' && (
                    <div className="animate-fade-in-up">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">
                            {isLogin ? t('welcomeBack') : t('createAccount')}
                        </h2>

                        {/* Dynamic Subtitle */}
                        <p className={`text-center mb-8 text-sm ${customSubtitle ? 'text-indigo-600 font-medium bg-indigo-50 py-2 rounded-lg' : 'text-slate-500'}`}>
                            {customSubtitle ? customSubtitle : (isLogin ? t('enterDetails') : t('startBuilding'))}
                        </p>

                        {error && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 ml-1">{t('fullName')}</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="John Doe"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 ml-1">{t('emailAddr')}</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="email@example.com"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-semibold text-slate-600">{t('password')}</label>
                                    {isLogin && (
                                        <button type="button" onClick={() => { setCurrentView('FORGOT_PASSWORD'); setError(null); }} className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline">
                                            Esqueceu a senha?
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                                    />
                                </div>
                            </div>

                            {!isLogin && (
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 ml-1">{t('confirmPwd')}</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                                        <input
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className={`w-full bg-slate-50 border rounded-xl py-2.5 pl-10 pr-4 text-slate-900 focus:ring-2 outline-none transition-all placeholder:text-slate-400
                                        ${confirmPassword && confirmPassword !== password ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500 focus:bg-white'}
                                    `}
                                        />
                                        {confirmPassword && confirmPassword === password && (
                                            <CheckCircle className="absolute right-3 top-3 text-green-500" size={18} />
                                        )}
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 shadow-md shadow-indigo-500/20 active:scale-95"
                            >
                                {isLogin ? t('signIn') : t('getStarted')} <ArrowRight size={18} />
                            </button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-2 bg-white text-slate-400 font-medium">OU</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-3"
                        >
                            <GoogleIcon />
                            {t('continueWithGoogle')}
                        </button>

                        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                            <p className="text-slate-500 text-sm">
                                {isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')}
                                <button
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setError(null);
                                        setPassword('');
                                        setConfirmPassword('');
                                    }}
                                    className="ml-2 text-indigo-600 hover:text-indigo-500 font-bold"
                                >
                                    {isLogin ? t('getStarted') : t('signIn')}
                                </button>
                            </p>
                        </div>
                    </div>
                )}
            </div>

        </div >
    );
};

export default AuthPage;
