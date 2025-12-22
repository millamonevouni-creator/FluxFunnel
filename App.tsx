
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GitGraph, Plus, Folder, Presentation, PenTool, LogOut, Crown, User as UserIcon, Settings, Globe, LayoutDashboard, Workflow, Users, X, AlertTriangle, Save as SaveIcon, Sparkles, Eye, EyeOff, ChevronLeft, ChevronRight, Pencil, BookmarkPlus, Check, AlertCircle, Wrench, Lock, ShoppingBag, ShieldCheck, Save, Rocket } from 'lucide-react';
import FlowCanvasWrapped from './components/FlowCanvas';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import ProjectsDashboard from './components/ProjectsDashboard';
import SettingsDashboard from './components/SettingsDashboard';
import RoadmapPage from './components/RoadmapPage';
import MasterAdminDashboard from './components/MasterAdminDashboard';
import UpgradeModal from './components/UpgradeModal';
import PublicGallery from './components/PublicGallery';
import PublicIcons from './components/PublicIcons';
import TeamDashboard from './components/TeamDashboard';
import AIAssistant from './components/AIAssistant';
import MarketplaceDashboard from './components/MarketplaceDashboard';
import AnnouncementBanner from './components/AnnouncementBanner';
import { Project, AppMode, User, Language, AppPage, AppView, FeedbackItem, FeedbackStatus, UserStatus, UserPlan, PlanConfig, TeamMember, Template, SystemConfig, NodeType, Announcement } from './types';
import { INITIAL_NODES, INITIAL_EDGES, TRANSLATIONS, PROJECT_TEMPLATES, NODE_CONFIG, NODE_CATEGORY } from './constants';
import { Node, Edge } from 'reactflow';
import { safeGet, safeSet, migrateFeedbacks } from './utils/storage';
import { api } from './services/api_fixed';
import { supabase } from './services/supabaseClient';

const DEFAULT_PROJECT = (t: any): Project => ({ id: 'proj_default', name: t('newProject'), nodes: INITIAL_NODES as any, edges: INITIAL_EDGES, updatedAt: new Date() });

const App = () => {
  const [currentView, setCurrentView] = useState<AppView>('LANDING');
  const [appPage, setAppPage] = useState<AppPage>('PROJECTS');
  const [user, setUser] = useState<User | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [appMode, setAppMode] = useState<AppMode>(AppMode.BUILDER);
  const [showNotes, setShowNotes] = useState(true);
  const [lang, setLang] = useState<Language>('pt');
  const [authReturnView, setAuthReturnView] = useState<AppView | null>(null);
  const [authInitialView, setAuthInitialView] = useState<'LOGIN' | 'FORGOT_PASSWORD' | 'RESET_SENT' | 'UPDATE_PASSWORD' | 'SIGNUP_SUCCESS'>('LOGIN');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const plansInitializedRef = useRef(false);
  const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' } | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [saveSignal, setSaveSignal] = useState(0);
  const [openSaveModalSignal, setOpenSaveModalSignal] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showProjectLimitModal, setShowProjectLimitModal] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [sharedProject, setSharedProject] = useState<Project | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({ maintenanceMode: false, allowSignups: true, announcements: [], debugMode: false });

  const t = useCallback((key: keyof typeof TRANSLATIONS['pt']) => TRANSLATIONS[lang][key] || key, [lang]);
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => { setToast({ show: true, message, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    if (!plansInitializedRef.current && plans.length === 0) {
      const generatedPlans: PlanConfig[] = [
        { id: 'FREE', label: 'Plano Gratuito', priceMonthly: 0, priceYearly: 0, projectLimit: 1, nodeLimit: 20, features: [t('pricingFreeFeat1'), t('pricingFreeFeat2'), t('pricingFreeFeat3'), t('pricingFreeFeat4'), t('pricingFreeFeat5'), t('pricingFreeFeat6')], isPopular: false, teamLimit: 0, order: 0 },
        { id: 'PRO', label: 'Plano Pro', priceMonthly: 69.90, priceYearly: 712.98, projectLimit: 5, nodeLimit: 100, features: [t('pricingProFeat1'), t('pricingProFeat2'), t('pricingProFeat3'), t('pricingProFeat4'), t('pricingProFeat5'), t('pricingProFeat6')], isPopular: false, teamLimit: 0, order: 1 },
        { id: 'PREMIUM', label: 'Plano Premium', priceMonthly: 97.90, priceYearly: 881.10, projectLimit: 9999, nodeLimit: 9999, features: [t('pricingPremiumFeat1'), t('pricingPremiumFeat2'), t('pricingPremiumFeat3'), t('pricingPremiumFeat4'), t('pricingPremiumFeat5'), t('pricingPremiumFeat6')], isPopular: true, teamLimit: 10, order: 2 },
      ];
      setPlans(generatedPlans);
      plansInitializedRef.current = true;
    }
  }, [lang, t, plans.length]);

  useEffect(() => {
    const initApp = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const shareId = params.get('share');
        const loggedUser = await api.auth.getProfile();
        if (loggedUser) {
          setUser(loggedUser);
          setTeamMembers(await api.team.list());
          setCustomTemplates(await api.templates.list());
        }
        setIsDark(safeGet<string>('theme', 'light') === 'dark');
        setLang(safeGet('lang', 'pt'));
        setSystemConfig(await api.system.get());

        // Check for password recovery hash on initial load
        if (window.location.hash.includes('type=recovery') || window.location.hash.includes('type=magiclink')) {
          setCurrentView('AUTH');
          setAuthReturnView(null);
        }

        const dbPlans = await api.plans.list();
        if (dbPlans && dbPlans.length > 0) setPlans(dbPlans);

        setFeedbacks(await api.feedbacks.list());
        if (loggedUser?.isSystemAdmin) setAllUsers(await api.users.list());
        setIsSidebarCollapsed(safeGet('sidebarCollapsed', false));
        setIsLoadingProjects(true);
        const apiProjects = await api.projects.list();
        setProjects(apiProjects.length ? apiProjects : [DEFAULT_PROJECT(t)]);
        if (shareId) {
          const found = apiProjects.find(p => p.id === shareId);
          if (found) { setSharedProject(found); setCurrentView('SHARED'); }
        }
      } catch (e) { console.error(e); }
      finally { setIsInitialized(true); setIsLoadingProjects(false); }
    };
    initApp();
  }, []); // Eslint deps fix or empty array as intentional once-run

  const [upgradeModalInitialState, setUpgradeModalInitialState] = useState<{ planId: 'PRO' | 'PREMIUM', cycle: 'monthly' | 'yearly' } | null>(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Handle cleanup of hash params from URL
      if (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('type=magiclink'))) {
        // Clear the hash without reloading
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }

      if (event === 'PASSWORD_RECOVERY') {
        setCurrentView('AUTH');
        setAuthInitialView('UPDATE_PASSWORD'); // Force the specific view
        setAuthReturnView(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // If magic link or normal login happened
        // Only auto-redirect if we are not already in the app/loading process (checks for AUTH or LANDING view)
        // This avoids conflict with handleLogin which handles UI feedback
        // We use a function update for currentView or check it via ref/state if available, 
        // but here since we are in a closure, we might have stale state. 
        // Ideally we should trust the event, but let's be safe.
        // Actually, for simplicity and robustness, existing session check is enough, 
        // but we verify if we have a user.
        if (session?.user) {
          // We fetch profile to ensure we have the latest role/plan
          const profile = await api.auth.getProfile();
          if (profile) {
            setUser(profile);
            setTeamMembers(await api.team.list());

            const apiProjects = await api.projects.list();
            setProjects(apiProjects);

            // Only switch view if we are effectively seemingly not logged in
            // This is a bit tricky with stale access to state in useEffect.
            // But setting it to APP again is harmless unless it overrides a transition.
            setCurrentView((prev) => (prev === 'AUTH' || prev === 'LANDING' ? 'APP' : prev));
            if (currentView === 'LANDING' || currentView === 'AUTH') {
              setAppPage('PROJECTS');
            }
          }
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => { if (isInitialized) { safeSet('theme', isDark ? 'dark' : 'light'); if (isDark) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); } }, [isDark, isInitialized]);
  useEffect(() => { if (isInitialized) safeSet('lang', lang); }, [lang, isInitialized]);

  const handleLogin = async (data: any) => {
    console.log("DEBUG: handleLogin started", data);
    if (!systemConfig.allowSignups && data.isSignup) {
      showNotification("Cadastros suspensos pelo administrador.", 'error');
      throw new Error("Cadastros estão temporariamente suspensos.");
    }

    try {
      console.log("DEBUG: Calling api.auth.login/register");
      const result = data.isSignup ?
        await api.auth.register(data.email, data.password, data.name) :
        await api.auth.login(data.email, data.password);

      console.log("DEBUG: Auth API returned", result);
      const newUser = result.user;

      if (data.isSignup && !result.token) {
        setAuthInitialView('SIGNUP_SUCCESS');
        return;
      }

      if (newUser.status === 'BANNED') {
        await api.auth.logout();
        showNotification("Sua conta está suspensa.", 'error');
        throw new Error("Conta banida ou suspensa.");
      }

      console.log("DEBUG: Setting user state", newUser);
      setUser(newUser);

      // Load initial data
      console.log("DEBUG: Fetching initial data...");

      const fetchPromise = Promise.all([
        api.projects.list(),
        api.team.list(),
        api.templates.list()
      ]);

      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          console.warn("DEBUG: Initial data fetch timed out! Proceeding mostly empty.");
          resolve([[], [], []]);
        }, 5000);
      });

      const [apiProjects, members, templates] = await Promise.race([fetchPromise, timeoutPromise]) as [any[], any[], any[]];

      console.log("DEBUG: Initial data fetched (or timed out)", { projects: apiProjects?.length, members: members?.length, templates: templates?.length });

      setProjects(apiProjects || []);
      setTeamMembers(members || []);
      setCustomTemplates(templates || []);

      if (newUser.isSystemAdmin) {
        console.log("DEBUG: Fetching all users for System Admin");
        // Also wrap this in timeout or just let it fly async without await? 
        // Better to await but fast fail. 
        try {
          setAllUsers(await api.users.list());
        } catch (err) {
          console.error("Failed to fetch all users", err);
        }
      }

      showNotification(data.isSignup ? "Conta criada com sucesso!" : "Login realizado com sucesso!");

      if (authReturnView) {
        setCurrentView(authReturnView);
      } else {
        setCurrentView('APP');
        setAppPage('PROJECTS');
      }

      // Check for pending checkout
      const pendingCheckout = localStorage.getItem('flux_pending_checkout');
      if (pendingCheckout) {
        try {
          const { planId, cycle, timestamp } = JSON.parse(pendingCheckout);
          // Only honor if less than 1 hour old
          if (Date.now() - timestamp < 3600000) {
            setUpgradeModalInitialState({ planId, cycle });
            setShowUpgradeModal(true);
          }
          localStorage.removeItem('flux_pending_checkout');
        } catch (e) {
          console.error("Invalid pending checkout data", e);
        }
      }


    } catch (e: any) {
      console.error("Auth process error:", e);
      throw e;
    }
  };

  const refreshTemplates = async () => {
    if (user) setCustomTemplates(await api.templates.list());
  };

  const createProject = async (templateId?: string, customName?: string) => {
    if (!user) return;
    const myProjects = projects.filter(p => p.ownerId === user.id);
    const userPlanConfig = plans.find(p => p.id === user.plan) || { projectLimit: user.plan === 'PREMIUM' ? 9999 : (user.plan === 'PRO' ? 5 : 1) };
    if (myProjects.length >= userPlanConfig.projectLimit) { setShowProjectLimitModal(true); return; }
    let initialNodes: Node[] = [];
    let initialEdges: Edge[] = [];
    let template = PROJECT_TEMPLATES.find(t => t.id === templateId);
    if (!template) { template = customTemplates.find(t => t.id === templateId); }
    if (template) { initialNodes = template.nodes; initialEdges = template.edges; } else if (templateId === 'blank') { initialNodes = []; initialEdges = []; }
    const finalName = customName?.trim() || `${t('newProject')} ${projects.length + 1}`;
    const newProj = { name: finalName, nodes: initialNodes as any, edges: initialEdges as any, updatedAt: new Date(), ownerId: user.id };
    try {
      const created = await api.projects.create(newProj);
      setProjects(prev => [...prev, created]);
      setCurrentProjectId(created.id);
      setAppPage('BUILDER');
      showNotification("Projeto criado!");
    } catch (e) { showNotification("Erro ao criar projeto.", 'error'); }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este projeto?")) return;
    try {
      await api.projects.delete(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      showNotification("Projeto excluído com sucesso!");
    } catch (e) {
      showNotification("Erro ao excluir projeto.", 'error');
    }
  };

  const handleRenameProject = async (id: string, newName: string) => {
    try {
      const updatedProject = { ...projects.find(p => p.id === id)!, name: newName, updatedAt: new Date() };
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p)); // Optimistic update
      await api.projects.update(id, { name: newName });
      showNotification("Projeto renomeado!");
    } catch (e) {
      showNotification("Erro ao renomear projeto.", 'error');
    }
  };

  const handleLogout = async () => { await api.auth.logout(); setUser(null); setProjects([]); setCurrentView('LANDING'); setAppPage('PROJECTS'); setCurrentProjectId(null); setIsProfileMenuOpen(false); };

  const handleInviteMember = async (email: string, role: string) => {
    try {
      await api.team.invite(email, role);
      setTeamMembers(await api.team.list());
      showNotification("Convite enviado com sucesso!");
    } catch (e: any) {
      console.error(e);
      showNotification(e.message || "Erro ao convidar membro.", 'error');
      throw e;
    }
  };

  const handleRemoveMember = async (id: string) => {
    await api.team.remove(id);
    setTeamMembers(await api.team.list());
    showNotification("Membro removido.");
  };

  const handleResendInvite = async (email: string) => {
    try {
      await api.team.resendInvite(email);
      showNotification("Convite reenviado com sucesso!");
    } catch (e: any) {
      console.error(e);
      showNotification(e.message || "Erro ao reenviar convite. Verifique o limite de e-mails.", 'error');
    }
  };

  const handleUpdateMemberRole = async (id: string, role: string) => {
    await api.team.updateRole(id, role);
    setTeamMembers(await api.team.list());
    showNotification("Permissão atualizada.");
  };

  const handleAdminImpersonate = (userId: string) => {
    const targetUser = allUsers.find(u => u.id === userId);
    if (targetUser) {
      if (targetUser.status === 'BANNED') { if (!window.confirm("Atenção: Este usuário está BANIDO. Deseja acessar mesmo assim?")) return; }
      setUser(targetUser);
      setCurrentView('APP');
      setAppPage('PROJECTS');
      setCurrentProjectId(null);
      showNotification(`Acessando painel como ${targetUser.name}`, 'success');
    } else { showNotification("Erro: Usuário não encontrado.", 'error'); }
  };

  const triggerSaveProject = async (nodes: Node[], edges: Edge[]) => {
    if (currentProjectId) {
      setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, nodes, edges, updatedAt: new Date() } : p));
      setHasUnsavedChanges(false);
      await api.projects.update(currentProjectId, { nodes, edges });
    }
  };

  const attemptNavigation = (action: () => void) => {
    if (hasUnsavedChanges && currentView === 'APP' && appPage === 'BUILDER') { setPendingNavigation(() => action); setShowUnsavedModal(true); }
    else action();
  };

  const confirmNavigation = (shouldSave: boolean) => {
    if (shouldSave) { setSaveSignal(s => s + 1); setTimeout(() => { if (pendingNavigation) pendingNavigation(); setPendingNavigation(null); setShowUnsavedModal(false); }, 100); }
    else { setHasUnsavedChanges(false); if (pendingNavigation) pendingNavigation(); setPendingNavigation(null); setShowUnsavedModal(false); }
  };

  if (systemConfig.maintenanceMode && !user?.isSystemAdmin && currentView !== 'ADMIN' && currentView !== 'AUTH') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <Wrench size={48} className="text-amber-500 mb-6 animate-pulse" />
        <h1 className="text-4xl font-bold mb-4">Em Manutenção</h1>
        <button onClick={() => setCurrentView('AUTH')} className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold">Acesso Admin</button>
      </div>
    );
  }

  if (currentView === 'LANDING') return <LandingPage onLoginClick={() => { setAuthReturnView('APP'); setCurrentView('AUTH'); }} onGetStartedClick={() => { setAuthReturnView('APP'); setCurrentView('AUTH'); }} onRoadmapClick={() => setCurrentView('ROADMAP')} onNavigate={setCurrentView} lang={lang} setLang={setLang} t={t} plans={plans} systemConfig={systemConfig} />;
  if (currentView === 'AUTH') {
    // Priority: State from listener > Hash check
    const viewToUse = authInitialView !== 'LOGIN' ? authInitialView :
      (window.location.hash.includes('type=recovery') || window.location.hash.includes('type=magiclink')) ? 'UPDATE_PASSWORD' : 'LOGIN';

    return (
      <>
        {toast?.show && <div className={`fixed top-14 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 rounded-xl shadow-2xl border ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{toast.message}</div>}
        <AuthPage
          onAuthSuccess={handleLogin}
          onBack={() => setCurrentView('LANDING')}
          t={t}
          lang={lang}
          initialView={viewToUse}
          onUpdatePassword={api.auth.updatePassword}
          onResetPassword={api.auth.resetPassword}
        />
      </>
    );
  }
  if (currentView === 'ROADMAP') return <RoadmapPage onBack={() => setCurrentView(user ? 'APP' : 'LANDING')} feedbacks={feedbacks} onSubmitFeedback={async (item) => { await api.feedbacks.create(item); setFeedbacks(await api.feedbacks.list()); }} onVote={async (id) => { await api.feedbacks.vote(id); setFeedbacks(await api.feedbacks.list()); }} onAddComment={async (id, text) => { await api.feedbacks.addComment(id, text); setFeedbacks(await api.feedbacks.list()); }} isAuthenticated={!!user} currentUser={user} onLoginRequest={() => { setAuthReturnView('ROADMAP'); setCurrentView('AUTH'); }} t={t} isDark={isDark} />;

  if (currentView === 'ADMIN' && user?.isSystemAdmin) {
    return (
      <MasterAdminDashboard
        onBack={() => { setCurrentView('APP'); setAppPage('PROJECTS'); }}
        feedbacks={feedbacks}
        onUpdateStatus={(id, status) => api.feedbacks.update(id, { status })}
        onDeleteFeedback={api.feedbacks.delete}
        onUpdateFeedback={api.feedbacks.update}
        onReplyFeedback={(id, text) => { }}
        onDeleteComment={(fid, cid) => { }}
        users={allUsers}
        onUpdateUser={async (u, p) => {
          if (u.plan) await api.admin.updateUserPlan(u.id, u.plan);
          if (u.status) await api.admin.updateUserStatus(u.id, u.status);
        }}
        onDeleteUser={api.admin.deleteUser}
        onCreateUser={(u, p) => { }}
        onImpersonate={handleAdminImpersonate}
        plans={plans}
        onUpdatePlan={async (p) => { await api.plans.update(p.id, p); setPlans(prev => prev.map(old => old.id === p.id ? p : old)); showNotification("Plano atualizado!"); }}
        onDeletePlan={async (id) => { await api.plans.delete(id); setPlans(prev => prev.filter(p => p.id !== id)); showNotification("Plano removido."); }}
        onCreatePlan={async (p) => { await api.plans.create(p); setPlans(prev => [...prev, p]); showNotification("Novo plano criado!"); }}
        systemConfig={systemConfig}
        onUpdateSystemConfig={(c) => api.system.update(c)}
        t={t}
      />
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'dark' : ''}`}>
      {toast?.show && <div className={`fixed top-14 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 rounded-xl shadow-2xl border ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{toast.message}</div>}

      {showUpgradeModal && (
        <UpgradeModal
          userPlan={user?.plan || 'FREE'}
          onClose={() => setShowUpgradeModal(false)}
          initialPlan={upgradeModalInitialState?.planId}
          initialCycle={upgradeModalInitialState?.cycle}
          onUpgrade={async () => {
            // Mock upgrade for testing - effectively update user plan immediately for verifying UI
            if (user) {
              await api.admin.updateUserPlan(user.id, 'PREMIUM');
              const up = await api.auth.getProfile();
              if (up) setUser(up);
              setShowUpgradeModal(false);
              showNotification('Upgrade para PREMIUM realizado com sucesso!', 'success');
            }
          }}
          isDark={isDark}
          plans={plans}

        />
      )}

      {showUnsavedModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">{t('unsavedModalTitle')}</h3>
            <div className="flex flex-col gap-3">
              <button onClick={() => confirmNavigation(true)} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Salvar e Sair</button>
              <button onClick={() => confirmNavigation(false)} className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold">Descartar</button>
              <button onClick={() => setShowUnsavedModal(false)} className="w-full py-3 text-slate-500">Continuar editando</button>
            </div>
          </div>
        </div>
      )}

      {showProjectLimitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Rocket size={32} />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-center text-slate-800 dark:text-white">Limite de Projetos Atingido!</h3>
            <p className="text-center text-slate-600 dark:text-slate-300 mb-6">
              Você atingiu o limite de projetos do seu plano atual. Faça um upgrade para criar fluxos ilimitados.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setShowProjectLimitModal(false); setShowUpgradeModal(true); }}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all transform hover:scale-[1.02]"
              >
                Fazer Upgrade Agora 🚀
              </button>
              <button
                onClick={() => setShowProjectLimitModal(false)}
                className="w-full py-3 text-slate-500 font-medium hover:text-slate-700 dark:hover:text-slate-300"
              >
                Agora não
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className={`relative z-50 bg-slate-900 text-white flex flex-col justify-between transition-all duration-300 w-20 ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}>
        <div>
          <div className="h-16 flex items-center justify-center lg:justify-between px-4 lg:px-6 border-b border-slate-800">
            <div className="flex items-center"><GitGraph className="text-indigo-500" size={18} /><span className={`ml-3 font-bold ${isSidebarCollapsed ? 'hidden' : 'hidden lg:block'}`}>FluxFunnel</span></div>
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hidden lg:block text-slate-500 hover:text-white transition-colors">{isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}</button>
          </div>
          <div className="p-2 lg:p-4 space-y-2">
            {[
              { id: 'PROJECTS', icon: <LayoutDashboard size={20} />, label: t('projects') },
              { id: 'BUILDER', icon: <Workflow size={20} />, label: t('footerLinkBuilder') },
              { id: 'MARKETPLACE', icon: <ShoppingBag size={20} />, label: t('marketplace') },
              { id: 'TEAM', icon: <Users size={20} />, label: t('team') },
              { id: 'SETTINGS', icon: <Settings size={20} />, label: t('settings') }
            ].map(item => (
              <button key={item.id} onClick={() => attemptNavigation(() => { if (item.id === 'BUILDER' && !currentProjectId) setAppPage('PROJECTS'); else setAppPage(item.id as AppPage); })} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isSidebarCollapsed ? 'justify-center' : 'lg:justify-start lg:px-4'} ${appPage === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`} title={item.label}>
                {item.icon}<span className={`hidden font-medium ${isSidebarCollapsed ? '' : 'lg:block'}`}>{item.label}</span>
              </button>
            ))}

            {/* DEDICATED ADMIN BUTTON FOR SYSTEM ADMINS */}
            {user?.isSystemAdmin && (
              <button onClick={() => attemptNavigation(() => setCurrentView('ADMIN'))} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all bg-amber-600/10 text-amber-500 border border-amber-600/20 hover:bg-amber-600 hover:text-white ${isSidebarCollapsed ? 'justify-center' : 'lg:justify-start lg:px-4'}`} title="Painel Master">
                <ShieldCheck size={20} /><span className={`hidden font-black uppercase text-[10px] tracking-widest ${isSidebarCollapsed ? '' : 'lg:block'}`}>Admin Master</span>
              </button>
            )}
          </div>
        </div>
        <div className="p-4 border-t border-slate-800 relative">
          <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-colors">
            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">{user?.name.substring(0, 2).toUpperCase()}</div>
            <div className={`hidden text-left ${isSidebarCollapsed ? '' : 'lg:block'}`}><p className="text-sm font-bold truncate">{user?.name}</p><p className="text-xs text-slate-400">{user?.plan}</p></div>
          </button>
          {isProfileMenuOpen && (
            <div className="absolute bottom-full left-0 w-56 mb-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
              <button onClick={() => { attemptNavigation(() => setAppPage('SETTINGS')); setIsProfileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700">Configurações</button>
              {user?.isSystemAdmin && <button onClick={() => { attemptNavigation(() => setCurrentView('ADMIN')); setIsProfileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-amber-400 hover:bg-slate-700">Admin Panel</button>}
              <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-700 border-t border-slate-700">Sair</button>
            </div>
          )}
        </div>
      </aside>

      <main className={`flex-1 flex flex-col h-full relative overflow-hidden transition-colors ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <header className={`h-16 flex items-center justify-between px-6 border-b ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h1 className="text-xl font-bold">
            {appPage === 'PROJECTS' && t('projects')}
            {appPage === 'MARKETPLACE' && t('marketplace')}
            {appPage === 'SETTINGS' && t('settings')}
            {appPage === 'TEAM' && t('team')}
            {appPage === 'BUILDER' && (currentProjectId ? projects.find(p => p.id === currentProjectId)?.name : t('noProjectSelected'))}
          </h1>
          <div className="flex items-center gap-2">
            {appPage === 'BUILDER' && currentProjectId && (
              <>
                {user?.plan === 'PREMIUM' && <button onClick={() => setShowAIAssistant(!showAIAssistant)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${showAIAssistant ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'}`}><Sparkles size={16} /> IA Audit</button>}
                <button onClick={() => setAppMode(prev => prev === AppMode.BUILDER ? AppMode.PRESENTATION : AppMode.BUILDER)} className={`p-2 rounded-lg ${appMode === AppMode.PRESENTATION ? 'bg-green-100 text-green-700' : 'text-slate-500'}`} title="Modo Apresentação"><Presentation size={20} /></button>
                <button onClick={() => setOpenSaveModalSignal(prev => prev + 1)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 ml-2">
                  <Save size={18} /> Salvar
                </button>
              </>
            )}
            <button onClick={() => setCurrentView('ROADMAP')} className="text-sm font-bold text-indigo-600 ml-4">Roadmap</button>
          </div>
        </header>

        {/* Global Announcements */}
        {appPage !== 'BUILDER' && <AnnouncementBanner announcements={systemConfig.announcements} />}

        <div className="flex-1 overflow-hidden relative flex">
          {appPage === 'PROJECTS' && <ProjectsDashboard projects={projects.filter(p => p.ownerId === user?.id)} onCreateProject={createProject} onOpenProject={(id) => { setCurrentProjectId(id); setAppPage('BUILDER'); }} onDeleteProject={handleDeleteProject} onRenameProject={handleRenameProject} onRefreshTemplates={refreshTemplates} showNotification={showNotification} isDark={isDark} t={t} userPlan={user?.plan} customTemplates={customTemplates} onSaveAsTemplate={async (p) => { await api.templates.create({ customLabel: p.name, nodes: p.nodes, edges: p.edges, isCustom: true }); refreshTemplates(); }} />}
          {appPage === 'MARKETPLACE' && <MarketplaceDashboard userPlan={user?.plan || 'FREE'} onDownload={async (t) => { await createProject(t.id, t.customLabel); showNotification("Template baixado!"); }} isDark={isDark} t={t} userId={user?.id} onUpgrade={() => setShowUpgradeModal(true)} />}
          {appPage === 'TEAM' && <TeamDashboard members={teamMembers} onInviteMember={handleInviteMember} onUpdateRole={handleUpdateMemberRole} onRemoveMember={handleRemoveMember} onResendInvite={handleResendInvite} onUpgrade={() => setShowUpgradeModal(true)} plan={user?.plan || 'FREE'} maxMembers={plans.find(p => p.id === user?.plan)?.teamLimit ?? (user?.plan === 'PREMIUM' ? 10 : 0)} isDark={isDark} t={t} />}
          {appPage === 'MASTER_ADMIN' && <MasterAdminDashboard
            onBack={() => setAppPage('PROJECTS')}
            onReplyFeedback={async (id, text) => { await api.feedbacks.addComment(id, text); setFeedbacks(await api.feedbacks.list()); }}
            onDeleteComment={async (fid, cid) => { await api.feedbacks.deleteComment(fid, cid); setFeedbacks(await api.feedbacks.list()); }}
            feedbacks={feedbacks}
            onUpdateStatus={async (id, status) => { await api.feedbacks.update(id, { status }); setFeedbacks(await api.feedbacks.list()); }}
            onDeleteFeedback={async (id) => { await api.feedbacks.delete(id); setFeedbacks(await api.feedbacks.list()); }}
            onUpdateFeedback={async (id, f) => { await api.feedbacks.update(id, f); setFeedbacks(await api.feedbacks.list()); }}
            users={allUsers || []}
            onUpdateUser={async (u) => { await api.admin.updateUserStatus(u.id, u.status); await api.admin.updateUserPlan(u.id, u.plan); setAllUsers(await api.users.list()); }}
            onDeleteUser={async (id) => { await api.admin.updateUserStatus(id, 'BANNED'); setAllUsers(await api.users.list()); }}
            onCreateUser={() => { }}
            onImpersonate={handleAdminImpersonate}
            plans={plans}
            onUpdatePlan={async (p) => { await api.plans.update(p.id, p); setPlans(await api.plans.list()); }}
            onDeletePlan={async (id) => { await api.plans.delete(id); setPlans(await api.plans.list()); }}
            onCreatePlan={async (p) => { await api.plans.create(p); setPlans(await api.plans.list()); }}
            systemConfig={systemConfig}
            onUpdateSystemConfig={async (c) => { await api.system.update(c); setSystemConfig(await api.system.get()); }}
            t={t}
          />}
          {appPage === 'BUILDER' && (currentProjectId ? <FlowCanvasWrapped project={projects.find(p => p.id === currentProjectId)!} onSaveProject={triggerSaveProject} onUnsavedChanges={() => setHasUnsavedChanges(true)} triggerSaveSignal={saveSignal} openSaveModalSignal={openSaveModalSignal} isDark={isDark} toggleTheme={() => setIsDark(!isDark)} isPresentationMode={appMode === AppMode.PRESENTATION} showNotesInPresentation={showNotes} t={t} userPlan={user?.plan || 'FREE'} showAIAssistant={showAIAssistant} onToggleAIAssistant={() => setShowAIAssistant(!showAIAssistant)} onSaveTemplate={async (nodes, edges, name) => { if (!user) return; try { await api.templates.create({ customLabel: name, nodes, edges, isCustom: true, owner_id: user.id }); showNotification("Modelo salvo com sucesso!"); setCustomTemplates(await api.templates.list()); } catch (e) { showNotification("Erro ao salvar modelo", 'error'); } }} onShareToMarketplace={async (name, desc) => { if (!user) return; const p = projects.find(p => p.id === currentProjectId); if (p) { await api.templates.submitToMarketplace({ customLabel: name, customDescription: desc, nodes: p.nodes, edges: p.edges, authorName: user.name }); showNotification("Enviado para análise com sucesso!"); } }} /> : <div className="flex flex-col items-center justify-center h-full text-slate-400"><Folder size={64} className="mb-4 opacity-50" /><p>{t('noProjectSelected')}</p></div>)}
          {appPage === 'SETTINGS' && user && <SettingsDashboard user={user} onUpdateUser={async (updated) => { await api.auth.updateProfile(user.id, updated); setUser({ ...user, ...updated }); showNotification("Perfil atualizado!"); }} isDark={isDark} toggleTheme={() => setIsDark(!isDark)} lang={lang} setLang={setLang} t={t} projectsCount={projects.filter(p => p.ownerId === user.id).length} />}
        </div>
      </main>
    </div>
  );
};

export default App;
