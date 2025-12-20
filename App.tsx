
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GitGraph, Plus, Folder, Presentation, PenTool, LogOut, Crown, User as UserIcon, Settings, Globe, LayoutDashboard, Workflow, Users, X, AlertTriangle, Save as SaveIcon, Sparkles, Eye, EyeOff, ChevronLeft, ChevronRight, Pencil, BookmarkPlus, Check, AlertCircle, Wrench, Lock, ShoppingBag, ShieldCheck } from 'lucide-react';
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
import { Project, AppMode, User, Language, AppPage, AppView, FeedbackItem, FeedbackStatus, UserStatus, UserPlan, PlanConfig, TeamMember, Template, SystemConfig, NodeType, Announcement } from './types';
import { INITIAL_NODES, INITIAL_EDGES, TRANSLATIONS, PROJECT_TEMPLATES, NODE_CONFIG, NODE_CATEGORY } from './constants';
import { Node, Edge } from 'reactflow';
import { safeGet, safeSet, migrateFeedbacks } from './utils/storage';
import { api } from './services/api';

const DEFAULT_PROJECT: Project = { id: 'proj_default', name: 'Funil Exemplo 1', nodes: INITIAL_NODES as any, edges: INITIAL_EDGES, updatedAt: new Date() };

const MOCK_PROJECTS: Project[] = [
  { id: 'p_admin_1', name: 'Ecossistema Enterprise Q4', nodes: [], edges: [], updatedAt: new Date(), ownerId: 'u1' },
  { id: 'p_admin_2', name: 'Funil High Ticket', nodes: PROJECT_TEMPLATES[1].nodes as any, edges: PROJECT_TEMPLATES[1].edges, updatedAt: new Date(), ownerId: 'u1' }
];

const App = () => {
  const [currentView, setCurrentView] = useState<AppView>('LANDING');
  const [appPage, setAppPage] = useState<AppPage>('PROJECTS');
  const [user, setUser] = useState<User | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [appMode, setAppMode] = useState<AppMode>(AppMode.BUILDER);
  const [showNotes, setShowNotes] = useState(true);
  const [lang, setLang] = useState<Language>('pt');
  const [authReturnView, setAuthReturnView] = useState<AppView | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const plansInitializedRef = useRef(false);
  const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' } | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [saveSignal, setSaveSignal] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
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
        { id: 'FREE', label: 'Plano Gratuito', priceMonthly: 0, priceYearly: 0, projectLimit: 1, nodeLimit: 20, features: [t('pricingFreeFeat1'), t('pricingFreeFeat2'), t('pricingFreeFeat3'), t('pricingFreeFeat4'), t('pricingFreeFeat5'), t('pricingFreeFeat6')], isPopular: false },
        { id: 'PRO', label: 'Plano Pro', priceMonthly: 69.90, priceYearly: 712.98, projectLimit: 5, nodeLimit: 100, features: [t('pricingProFeat1'), t('pricingProFeat2'), t('pricingProFeat3'), t('pricingProFeat4'), t('pricingProFeat5'), t('pricingProFeat6')], isPopular: false },
        { id: 'PREMIUM', label: 'Plano Premium', priceMonthly: 97.90, priceYearly: 881.10, projectLimit: 9999, nodeLimit: 9999, features: [t('pricingPremiumFeat1'), t('pricingPremiumFeat2'), t('pricingPremiumFeat3'), t('pricingPremiumFeat4'), t('pricingPremiumFeat5'), t('pricingPremiumFeat6')], isPopular: true },
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

        const dbPlans = await api.plans.list();
        if (dbPlans && dbPlans.length > 0) setPlans(dbPlans);

        setFeedbacks(await api.feedbacks.list());
        if (loggedUser?.isSystemAdmin) setAllUsers(await api.users.list());
        setIsSidebarCollapsed(safeGet('sidebarCollapsed', false));
        setIsLoadingProjects(true);
        const apiProjects = await api.projects.list();
        const combined = [...MOCK_PROJECTS, ...apiProjects];
        const unique = Array.from(new Map(combined.map(p => [p.id, p])).values());
        setProjects(unique.length ? unique : [DEFAULT_PROJECT]);
        if (shareId) {
          const found = unique.find(p => p.id === shareId);
          if (found) { setSharedProject(found); setCurrentView('SHARED'); }
        }
      } catch (e) { console.error(e); }
      finally { setIsInitialized(true); setIsLoadingProjects(false); }
    };
    initApp();
  }, []);

  useEffect(() => { if (isInitialized) { safeSet('theme', isDark ? 'dark' : 'light'); if (isDark) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); } }, [isDark, isInitialized]);
  useEffect(() => { if (isInitialized) safeSet('lang', lang); }, [lang, isInitialized]);

  const handleLogin = async (data: any) => {
    if (!systemConfig.allowSignups && data.isSignup) { showNotification("Cadastros suspensos.", 'error'); return; }
    try {
      const { user: newUser } = data.isSignup ? await api.auth.register(data.email, data.password, data.name) : await api.auth.login(data.email, data.password);
      if (newUser.status === 'BANNED') { await api.auth.logout(); showNotification("Conta banida.", 'error'); return; }
      setUser(newUser);
      const apiProjects = await api.projects.list();
      const combined = [...MOCK_PROJECTS, ...apiProjects];
      const unique = Array.from(new Map(combined.map(p => [p.id, p])).values());
      setProjects(unique);
      if (newUser.isSystemAdmin) setAllUsers(await api.users.list());
      if (authReturnView) setCurrentView(authReturnView); else { setCurrentView('APP'); setAppPage('PROJECTS'); }
    } catch (e) { showNotification("Falha na autenticação.", 'error'); }
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

  const handleLogout = async () => { await api.auth.logout(); setUser(null); setProjects([]); setCurrentView('LANDING'); setAppPage('PROJECTS'); setCurrentProjectId(null); setIsProfileMenuOpen(false); };

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
  if (currentView === 'AUTH') return <AuthPage onAuthSuccess={handleLogin} onBack={() => setCurrentView('LANDING')} t={t} lang={lang} />;
  if (currentView === 'ROADMAP') return <RoadmapPage onBack={() => setCurrentView(user ? 'APP' : 'LANDING')} feedbacks={feedbacks} onSubmitFeedback={(item) => api.feedbacks.create(item)} onVote={(id) => api.feedbacks.update(id, {})} onAddComment={(id, text) => api.feedbacks.update(id, {})} isAuthenticated={!!user} currentUser={user} onLoginRequest={() => { setAuthReturnView('ROADMAP'); setCurrentView('AUTH'); }} t={t} isDark={isDark} />;

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
        onUpdateUser={(u, p) => api.users.update(u.id, u)}
        onDeleteUser={api.users.delete}
        onCreateUser={(u, p) => api.users.update(u.id, u)}
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
                <button onClick={() => setAppMode(prev => prev === AppMode.BUILDER ? AppMode.PRESENTATION : AppMode.BUILDER)} className={`p-2 rounded-lg ${appMode === AppMode.PRESENTATION ? 'bg-green-100 text-green-700' : 'text-slate-500'}`}><Presentation size={20} /></button>
              </>
            )}
            <button onClick={() => setCurrentView('ROADMAP')} className="text-sm font-bold text-indigo-600 ml-4">Roadmap</button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative flex">
          {appPage === 'PROJECTS' && <ProjectsDashboard projects={projects.filter(p => p.ownerId === user?.id)} onCreateProject={createProject} onOpenProject={(id) => { setCurrentProjectId(id); setAppPage('BUILDER'); }} onDeleteProject={api.projects.delete} isDark={isDark} t={t} userPlan={user?.plan} customTemplates={customTemplates} onSaveAsTemplate={(p) => api.templates.create({ customLabel: p.name, nodes: p.nodes, edges: p.edges, isCustom: true })} />}
          {appPage === 'MARKETPLACE' && <MarketplaceDashboard userPlan={user?.plan || 'FREE'} onDownload={(t) => createProject(t.id, t.customLabel)} isDark={isDark} t={t} />}
          {appPage === 'TEAM' && <TeamDashboard members={teamMembers} onInviteMember={api.team.invite} onUpdateRole={api.team.updateRole} onRemoveMember={api.team.remove} onUpgrade={() => { }} plan={user?.plan || 'FREE'} maxMembers={user?.plan === 'PREMIUM' ? 9999 : 0} isDark={isDark} t={t} />}
          {appPage === 'BUILDER' && (currentProjectId ? <FlowCanvasWrapped project={projects.find(p => p.id === currentProjectId)!} onSaveProject={triggerSaveProject} onUnsavedChanges={() => setHasUnsavedChanges(true)} triggerSaveSignal={saveSignal} isDark={isDark} toggleTheme={() => setIsDark(!isDark)} isPresentationMode={appMode === AppMode.PRESENTATION} showNotesInPresentation={showNotes} t={t} userPlan={user?.plan || 'FREE'} showAIAssistant={showAIAssistant} onToggleAIAssistant={() => setShowAIAssistant(!showAIAssistant)} /> : <div className="flex flex-col items-center justify-center h-full text-slate-400"><Folder size={64} className="mb-4 opacity-50" /><p>{t('noProjectSelected')}</p></div>)}
          {appPage === 'SETTINGS' && user && <SettingsDashboard user={user} onUpdateUser={(updated) => api.auth.updateProfile(user.id, updated)} isDark={isDark} toggleTheme={() => setIsDark(!isDark)} lang={lang} setLang={setLang} t={t} projectsCount={projects.filter(p => p.ownerId === user.id).length} />}
        </div>
      </main>
    </div>
  );
};

export default App;
