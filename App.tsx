
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GitGraph, Plus, Folder, Presentation, PenTool, LogOut, Crown, User as UserIcon, Settings, Globe, LayoutDashboard, Workflow, Users, X, AlertTriangle, Save as SaveIcon, Sparkles, Eye, EyeOff, ChevronLeft, ChevronRight, Pencil, BookmarkPlus, Check, AlertCircle, Wrench, Lock, ShoppingBag, ShieldCheck, Save, Rocket, Share2 } from 'lucide-react';
import { LoadingScreen } from './components/LoadingScreen';

// Lazy loading for heavy dashboards
const FlowCanvasWrapped = React.lazy(() => import('./components/FlowCanvas'));
const ProjectsDashboard = React.lazy(() => import('./components/ProjectsDashboard'));
const SettingsDashboard = React.lazy(() => import('./components/SettingsDashboard'));
const MasterAdminDashboard = React.lazy(() => import('./components/MasterAdminDashboard'));
const TeamDashboard = React.lazy(() => import('./components/TeamDashboard'));
const MarketplaceDashboard = React.lazy(() => import('./components/MarketplaceDashboard'));
const RoadmapPage = React.lazy(() => import('./components/RoadmapPage'));
const ProfileCompletionBanner = React.lazy(() => import('./components/ProfileCompletionBanner'));

import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
const UpgradeModal = React.lazy(() => import('./components/UpgradeModal')); // Lazy loaded to save ~200KB (Stripe)
const PrivacyPolicy = React.lazy(() => import('./components/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./components/TermsOfService'));
const CookiesPolicy = React.lazy(() => import('./components/CookiesPolicy'));
const Blog = React.lazy(() => import('./components/Blog'));
const HelpCenter = React.lazy(() => import('./components/HelpCenter'));
const Community = React.lazy(() => import('./components/Community'));
const SystemStatus = React.lazy(() => import('./components/SystemStatus'));
const FeaturesPage = React.lazy(() => import('./components/FeaturesPage'));
const PricingPage = React.lazy(() => import('./components/PricingPage'));
const FunnelSalesPage = React.lazy(() => import('./components/pages/FunnelSalesPage'));
const FunnelBuilderPage = React.lazy(() => import('./components/pages/FunnelBuilderPage'));
const VisualFunnelPage = React.lazy(() => import('./components/pages/VisualFunnelPage'));
const AlternativeFunelyticsPage = React.lazy(() => import('./components/pages/AlternativeFunelyticsPage'));
const MapFunnelPage = React.lazy(() => import('./components/MapFunnelPage'));
const MicroSaasPage = React.lazy(() => import('./components/MicroSaasPage'));
const AffiliatesPage = React.lazy(() => import('./components/AffiliatesPage'));
const BlogPost = React.lazy(() => import('./components/blog/BlogPost'));
const PublicTemplatesPage = React.lazy(() => import('./components/PublicTemplatesPage'));

import AnnouncementBanner from './components/AnnouncementBanner';
import { Project, AppMode, User, Language, AppPage, AppView, FeedbackItem, PlanConfig, TeamMember, Template, SystemConfig } from './types';
import { INITIAL_NODES, INITIAL_EDGES, TRANSLATIONS, PROJECT_TEMPLATES, NODE_CONFIG, NODE_CATEGORY } from './constants';
import type { Node, Edge } from 'reactflow';
import { safeGet, safeSet, migrateFeedbacks } from './utils/storage';
import { api } from './services/api_fixed';
import { supabase, isOffline } from './services/supabaseClient';

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
  const [authInitialView, setAuthInitialView] = useState<'LOGIN' | 'FORGOT_PASSWORD' | 'RESET_SENT' | 'UPDATE_PASSWORD' | 'SIGNUP_SUCCESS' | 'SET_PASSWORD'>('LOGIN');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const initialHash = useRef(window.location.hash); // Capture hash immediately on mount
  const plansInitializedRef = useRef(false);
  const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' } | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [saveSignal, setSaveSignal] = useState(0);
  const [openSaveModalSignal, setOpenSaveModalSignal] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [showProfileBanner, setShowProfileBanner] = useState(() => !localStorage.getItem('hide_profile_banner'));
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeModalContext, setUpgradeModalContext] = useState<{ reason: 'LIMIT_REACHED' | 'FEATURE_LOCKED', featureName?: string, limitType?: 'NODES' | 'PROJECTS' }>({ reason: 'LIMIT_REACHED', limitType: 'NODES' });
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
  const [isInvitedMode, setIsInvitedMode] = useState(false);
  const [presentationShareProject, setPresentationShareProject] = useState<Project | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const t = useCallback((key: keyof typeof TRANSLATIONS['pt']) => TRANSLATIONS[lang][key] || key, [lang]);
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => { setToast({ show: true, message, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    if (!plansInitializedRef.current && plans.length === 0) {
      const generatedPlans: PlanConfig[] = [
        { id: 'FREE', label: 'Plano Gratuito', priceMonthly: 0, priceYearly: 0, projectLimit: 1, nodeLimit: 20, features: [t('pricingFreeFeat1'), t('pricingFreeFeat2'), t('pricingFreeFeat3'), t('pricingFreeFeat4'), t('pricingFreeFeat5'), t('pricingFreeFeat6')], isPopular: false, teamLimit: 0, order: 0 },
        { id: 'PRO', label: 'Plano Pro', priceMonthly: 69.90, priceYearly: 712.98, projectLimit: 5, nodeLimit: 100, features: [t('pricingProFeat1'), t('pricingProFeat2'), t('pricingProFeat3'), t('pricingProFeat4'), t('pricingProFeat5'), t('pricingProFeat6')], isPopular: false, teamLimit: 0, order: 1 },
        { id: 'PREMIUM', label: 'Plano Premium', priceMonthly: 97.90, priceYearly: 881.10, projectLimit: 9999, nodeLimit: 9999, features: [t('pricingPremiumFeat1'), t('pricingPremiumFeat2'), t('pricingPremiumFeat3'), t('pricingPremiumFeat4'), t('pricingPremiumFeat5'), t('pricingPremiumFeat6')], isPopular: true, teamLimit: 10, order: 2 },
        { id: 'CONVIDADO', label: 'Convidado', priceMonthly: 0, priceYearly: 0, projectLimit: 9999, nodeLimit: 9999, features: ['Acesso a Projetos da Equipe', 'Edição Colaborativa', 'Sem Gestão Financeira'], isPopular: false, teamLimit: 0, order: 99, isHidden: true },
      ];
      setPlans(generatedPlans);
      plansInitializedRef.current = true;
    }
  }, [lang, t, plans.length]);

  // FIX: Version Mismatch / Chunk Error Handler
  useEffect(() => {
    const handleChunkError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const errorMsg = (event instanceof ErrorEvent ? event.message : event.reason?.message) || '';

      if (
        errorMsg.includes('Unable to preload CSS') ||
        errorMsg.includes('Loading chunk') ||
        errorMsg.includes('dynamically imported module')
      ) {
        console.warn("Deploy Version Mismatch detected. Reloading...");
        // Prevent infinite loops using session storage
        const lastReload = sessionStorage.getItem('flux_chunk_reload');
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload) > 10000) {
          sessionStorage.setItem('flux_chunk_reload', now.toString());
          window.location.reload();
        }
      }

      // GLOBAL AUTH ERROR HANDLER
      // Catch "Invalid Refresh Token" which locks users out
      if (
        errorMsg.includes('Invalid Refresh Token') ||
        errorMsg.includes('refresh_token_not_found') ||
        errorMsg.includes('AuthApiError: Invalid Refresh Token')
      ) {
        console.warn("Critical Auth Error detected (Invalid Token). Forcing logout...");
        supabase.auth.signOut().then(() => {
          window.location.href = '/';
        });
      }
    };

    window.addEventListener('error', handleChunkError);
    window.addEventListener('unhandledrejection', handleChunkError);

    return () => {
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handleChunkError);
    };
  }, []);

  useEffect(() => {
    const initApp = async () => {
      const params = new URLSearchParams(window.location.search);
      const shareId = params.get('share');

      // Fast Route Check
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
      if (path === '/privacy') setCurrentView('PRIVACY');
      else if (path === '/terms') setCurrentView('TERMS');
      else if (path === '/cookies') setCurrentView('COOKIES');
      else if (path === '/blog') setCurrentView('BLOG');
      else if (path === '/help') setCurrentView('HELP');
      else if (path === '/community') setCurrentView('COMMUNITY');
      else if (path === '/status') setCurrentView('STATUS');
      else if (path === '/features') setCurrentView('FEATURES');
      else if (path === '/pricing') setCurrentView('PRICING');
      else if (path === '/roadmap') setCurrentView('ROADMAP');
      else if (path === '/mapa-de-funil') setCurrentView('MAP_FUNNEL');
      else if (path === '/micro-saas') setCurrentView('MICRO_SAAS');
      else if (path === '/afiliados') setCurrentView('AFFILIATES_LANDING');
      else if (path.startsWith('/blog/') && path.length > 6) setCurrentView('BLOG_POST');
      // else if (path === '/templates') setCurrentView('TEMPLATES_PUBLIC'); // DISABLED PER USER REQUEST

      let loggedUser = null;

      try {
        loggedUser = await api.auth.getProfile();
        if (loggedUser) {
          setUser(loggedUser);

          // FIX: Auto-link team member if invite exists by email but not linked
          const { data: authUser } = await supabase.auth.getUser();
          if (authUser.user?.email) {
            const { data: invite } = await supabase.from('team_members').select('*').eq('email', authUser.user.email).maybeSingle();
            if (invite && (invite.user_id !== loggedUser.id || invite.status !== 'ACTIVE')) {
              console.log("Linking user to team invite...");
              await supabase.from('team_members').update({ user_id: loggedUser.id, status: 'ACTIVE' }).eq('id', invite.id);
            }
          }
        }

        // Capture Affiliate ID from URL (Persistent 90 Days)
        const refId = params.get('ref');
        if (refId) {
          localStorage.setItem('flux_affiliate_id', refId);
          // Set cookie for 90 days (7776000 seconds)
          document.cookie = `flux_affiliate_id=${refId}; path=/; max-age=7776000; SameSite=Lax`;
        }

        setTeamMembers(await api.team.list());
        setCustomTemplates(await api.templates.list());
        if (loggedUser) {
          const membership = await api.team.checkMembership(loggedUser.id);
          if (membership) {
            // ENFORCE GUEST PLAN PERSISTENCE:
            // If user is a team member but still on FREE plan, officially update them to CONVIDADO plan in DB
            if (loggedUser.plan === 'FREE') {
              console.log("Team Member detected on FREE plan. Upgrading to CONVIDADO...");
              await api.auth.updateProfile(loggedUser.id, { plan: 'CONVIDADO' });
              loggedUser.plan = 'CONVIDADO';
              setUser(prev => prev ? ({ ...prev, plan: 'CONVIDADO' }) : prev);
            }

            // Set Invited Mode if they are explicitly CONVIDADO (or still FREE/Member just in case update failed)
            if (loggedUser.plan === 'CONVIDADO' || loggedUser.plan === 'FREE') {
              setIsInvitedMode(true);
            }
          }
        }

        setIsDark(safeGet<string>('theme', 'light') === 'dark');
        setLang(safeGet('lang', 'pt'));
        setSystemConfig(await api.system.get());

        // Check for Password Recovery
        if (window.location.hash.includes('type=recovery') || window.location.hash.includes('type=magiclink')) {
          setCurrentView('AUTH');
          setAuthReturnView(null);
        }

        // Check for Stripe Success Redirect
        const sessionId = params.get('session_id');
        if (sessionId && loggedUser) {
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);

          showNotification("Validando sua assinatura...", 'success');

          // FORCE SYNC (Critical for localhost/webhook delays)
          try {
            // NOTE: syncSubscription is not exposed on api.subscriptions directly in current version.
            // Relying on webhook or profile refresh.
            console.log("Forcing profile refresh for session:", sessionId);
            // await api.subscriptions.syncSubscription(sessionId); // REMOVED: Method does not exist on type
          } catch (err) {
            console.error("Sync failed, falling back to profile fetch", err);
          }

          // Show success message
          showNotification(t('upgradeSuccess'), 'success');
          // Force refresh profile to get new plan
          const updatedUser = await api.auth.getProfile();
          if (updatedUser) setUser(updatedUser);
          // Ensure we are in the app view
          setCurrentView('APP');
        } else if (sessionId && !loggedUser) {
          // Case where user upgraded but session was lost/not logged in
          showNotification("Por favor, faça login para concluir a atualização do seu plano.", 'success');
          setCurrentView('AUTH');
          setAuthReturnView('APP');
        }

        const dbPlans = await api.plans.list();
        if (dbPlans && dbPlans.length > 0) setPlans(dbPlans);

        setFeedbacks(await api.feedbacks.list());
        if (loggedUser?.isSystemAdmin) {
          try {
            setAllUsers(await api.admin.getUsers());
          } catch (err) {
            console.error("Fail to load users for admin:", err);
            // Fallback just in case
            setAllUsers(await api.users.list());
          }
        }
        setIsSidebarCollapsed(safeGet('sidebarCollapsed', false));
        setIsLoadingProjects(true);
        if (shareId) {
          try {
            // Try to fetch project directly (public/shared access)
            const sharedProj = await api.projects.get(shareId);
            if (sharedProj) {
              setSharedProject(sharedProj);
              setCurrentView('SHARED');
            }
          } catch (err) {
            console.error("Error loading shared project:", err);
            showNotification("Não foi possível carregar o projeto compartilhado.", "error");
          }
        }

        // Only load user projects if logged in and NOT in shared view (or load in bg)
        if (loggedUser) {
          const apiProjects = await api.projects.list();
          setProjects(apiProjects || []);
        }
      } catch (e) { console.error(e); }
      finally { setIsInitialized(true); setIsLoadingProjects(false); }
    };
    initApp();
  }, []); // Eslint deps fix or empty array as intentional once-run

  // Real-time Subscriptions
  useEffect(() => {
    if (isOffline) return;

    const channel = supabase.channel('realtime_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedbacks' }, async () => {
        setFeedbacks(await api.feedbacks.list());
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, async () => {
        // Use a functional update or rely on the captured 'user' ref if we were using refs,
        // but since we are in a dependency array [user], we can use it directly.
        if (user?.isSystemAdmin) {
          api.admin.getUsers().then(setAllUsers).catch(() => api.users.list().then(setAllUsers));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.isSystemAdmin, isOffline]); // Depend on admin status specifically for the profile listener logic

  const [upgradeModalInitialState, setUpgradeModalInitialState] = useState<{ planId: 'PRO' | 'PREMIUM', cycle: 'monthly' | 'yearly' } | null>(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      // Handle cleanup of hash params from URL
      if (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('type=magiclink'))) {
        // Clear the hash without reloading
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }

      if (event === 'PASSWORD_RECOVERY') {
        setCurrentView('AUTH');
        setAuthInitialView('UPDATE_PASSWORD'); // Force the specific view
        setAuthReturnView(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
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

            if (profile.isSystemAdmin) {
              try {
                setAllUsers(await api.admin.getUsers());
              } catch (err) {
                console.error("Failed to fetch all users on restore", err);
              }
            }

            // Only switch view if we are effectively seemingly not logged in
            // This is a bit tricky with stale access to state in useEffect.
            // But setting it to APP again is harmless unless it overrides a transition.

            // SECURITY/UX FIX: If this is an INVITE flow, do NOT auto-redirect to APP.
            // Let the SET_PASSWORD view handle it.
            // We check for 'type=invite' (hash) OR 'intent=invite' (query param set by api.team.invite)
            // Using initialHash to ensure we catch it even if Supabase clears the URL
            const currentHash = window.location.hash;
            const savedHash = initialHash.current;
            const isInviteFlow = (currentHash && currentHash.includes('type=invite')) ||
              (savedHash && savedHash.includes('type=invite')) ||
              (window.location.search && window.location.search.includes('intent=invite'));

            // FIX: Explicitly check for signup confirmation to ensure direct redirect to dashboard
            const isSignupConfirmation = window.location.hash && window.location.hash.includes('type=signup');
            const isRecoveryFlow = (currentHash && currentHash.includes('type=recovery')) ||
              (savedHash && savedHash.includes('type=recovery'));

            if (isSignupConfirmation) {
              console.log("Signup confirmation detected. Redirecting to Dashboard.");
              setCurrentView('APP');
              setAppPage('PROJECTS');
              // Clear hash to prevent re-triggering (optional, handled by generic clear above)
            } else if (!isInviteFlow && !isRecoveryFlow) {
              const publicRoutes = ['/privacy', '/terms', '/cookies', '/blog', '/help', '/community', '/status', '/features', '/pricing', '/roadmap', '/templates', '/mapa-de-funil', '/micro-saas', '/afiliados'];
              const isPublicRoute = publicRoutes.includes(window.location.pathname) || window.location.pathname.startsWith('/blog/');

              if (!isPublicRoute) {
                setCurrentView((prev) => (prev === 'AUTH' || prev === 'LANDING' ? 'APP' : prev));
                if (currentView === 'LANDING' || currentView === 'AUTH') {
                  setAppPage('PROJECTS');
                }
              }
            } else if (isRecoveryFlow) {
              console.log("Recovery flow detected. Staying in AUTH view.");
              setAuthInitialView('UPDATE_PASSWORD');
              setCurrentView('AUTH');
            } else {
              // Ensure we are on AUTH view so the specialized viewToUse logic works
              // Force the view to SET_PASSWORD for invites
              setAuthInitialView('SET_PASSWORD');
              setCurrentView('AUTH');
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

    if (!systemConfig.allowSignups && data.isSignup) {
      showNotification("Cadastros suspensos pelo administrador.", 'error');
      throw new Error("Cadastros estão temporariamente suspensos.");
    }

    try {

      const result = data.isSignup ?
        await api.auth.register(data.email, data.password, data.name) :
        await api.auth.login(data.email, data.password);


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


      setUser(newUser);

      // Load initial data


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



      setProjects(apiProjects || []);
      setTeamMembers(members || []);
      setCustomTemplates(templates || []);

      const membership = await api.team.checkMembership(newUser.id);
      if (membership && newUser.plan === 'FREE') {
        setIsInvitedMode(true);
      } else {
        setIsInvitedMode(false);
      }

      if (newUser.isSystemAdmin) {

        try {
          setAllUsers(await api.admin.getUsers());
        } catch (err) {
          console.error("Failed to fetch all users", err);
          setAllUsers(await api.users.list());
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

      // Check for pending template (from Public Gallery)
      const pendingTemplateId = localStorage.getItem('flux_pending_template_id');
      if (pendingTemplateId) {
        localStorage.removeItem('flux_pending_template_id');

        // Delay slightly to ensure state is ready
        setTimeout(() => {
          createProject(pendingTemplateId, undefined, true);
        }, 500);
      }


    } catch (e: any) {
      console.error("Auth process error:", e);
      throw e;
    }
  };

  const refreshTemplates = async () => {
    if (user) setCustomTemplates(await api.templates.list());
  };

  const createProject = async (templateId?: string, customName?: string, autoSwitchToBuilder: boolean = true) => {
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
      setOpenSaveModalSignal(0); // Reset save signal to prevent modal from opening on new project
      if (autoSwitchToBuilder) {
        setAppPage('BUILDER');
      } else {
        showNotification("Projeto salvo em 'Meus Projetos'!", "success");
      }
      if (autoSwitchToBuilder) showNotification("Projeto criado!");
    } catch (e) { showNotification("Erro ao criar projeto.", 'error'); }
  };

  const handleDeleteProject = async (id: string) => {
    // Confirmation handled by UI
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

  const handleInviteMember = async (email: string, role: 'ADMIN' | 'EDITOR' | 'VIEWER', name?: string, planId?: string) => {
    if (isOffline) {
      showNotification('Modo offline: convites indisponíveis.', 'error');
      return;
    }
    try {
      if (user?.plan === 'FREE' && teamMembers.length >= 1) { // Example limit
        throw new Error("Limite do plano Free atingido.");
      }
      await api.team.invite(email, role, name, planId);
      const members = await api.team.list();
      setTeamMembers(members);
      showNotification('Convite enviado com sucesso!', 'success');
    } catch (err: any) {
      console.error(err);
      showNotification(`Erro ao convidar: ${err.message}`, 'error');
      // Re-throw so modal stays open
      throw err;
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


  if (!isInitialized) {
    return <LoadingScreen />;
  }

  if (systemConfig.maintenanceMode && !user?.isSystemAdmin && currentView !== 'ADMIN' && currentView !== 'AUTH') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <Wrench size={48} className="text-amber-500 mb-6 animate-pulse" />
        <h1 className="text-4xl font-bold mb-4">Em Manutenção</h1>
        <button onClick={() => setCurrentView('AUTH')} className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold">Acesso Admin</button>
      </div>
    );
  }

  if ((currentView as any) === 'PRIVACY' || window.location.pathname.replace(/\/$/, '') === '/privacy') {
    return (
      <React.Suspense fallback={<LoadingScreen />}>
        <PrivacyPolicy onBack={() => { window.history.pushState({}, '', '/'); setCurrentView('LANDING'); }} lang={lang} />
      </React.Suspense>
    );
  }

  if ((currentView as any) === 'TERMS' || window.location.pathname.replace(/\/$/, '') === '/terms') {
    return (
      <React.Suspense fallback={<LoadingScreen />}>
        <TermsOfService onBack={() => { window.history.pushState({}, '', '/'); setCurrentView('LANDING'); }} lang={lang} />
      </React.Suspense>
    );
  }

  if ((currentView as any) === 'COOKIES' || window.location.pathname.replace(/\/$/, '') === '/cookies') {
    return (
      <React.Suspense fallback={<LoadingScreen />}>
        <CookiesPolicy onBack={() => { window.history.pushState({}, '', '/'); setCurrentView('LANDING'); }} />
      </React.Suspense>
    );
  }



  if ((currentView as any) === 'HELP' || window.location.pathname.replace(/\/$/, '') === '/help') {
    return (
      <React.Suspense fallback={<LoadingScreen />}>
        <HelpCenter onBack={() => { window.history.pushState({}, '', '/'); setCurrentView('LANDING'); }} />
      </React.Suspense>
    );
  }

  if ((currentView as any) === 'COMMUNITY' || window.location.pathname.replace(/\/$/, '') === '/community') {
    return (
      <React.Suspense fallback={<LoadingScreen />}>
        <Community onBack={() => { window.history.pushState({}, '', '/'); setCurrentView('LANDING'); }} />
      </React.Suspense>
    );
  }

  if ((currentView as any) === 'STATUS' || window.location.pathname.replace(/\/$/, '') === '/status') {
    return (
      <React.Suspense fallback={<LoadingScreen />}>
        <SystemStatus onBack={() => { window.history.pushState({}, '', '/'); setCurrentView('LANDING'); }} />
      </React.Suspense>
    );
  }

  if ((currentView as any) === 'FEATURES' || window.location.pathname.replace(/\/$/, '') === '/features') {
    return (
      <React.Suspense fallback={<LoadingScreen />}>
        <FeaturesPage onBack={() => { window.history.pushState({}, '', '/'); setCurrentView('LANDING'); }} />
      </React.Suspense>
    );
  }

  if ((currentView as any) === 'PRICING' || window.location.pathname.replace(/\/$/, '') === '/pricing') {
    return (
      <React.Suspense fallback={<LoadingScreen />}>
        <PricingPage onBack={() => { window.history.pushState({}, '', '/'); setCurrentView('LANDING'); }} plans={plans} />
      </React.Suspense>
    );
  }

  if ((currentView as any) === 'FUNNEL_SALES' || window.location.pathname.replace(/\/$/, '') === '/funil-de-vendas') {
    return (
      <React.Suspense fallback={<LoadingScreen />}>
        <FunnelSalesPage onBack={() => { window.history.pushState({}, '', '/'); setCurrentView('LANDING'); }} onGetStarted={() => { window.history.pushState({}, '', '/login'); setAuthReturnView('APP'); setCurrentView('AUTH'); }} />
      </React.Suspense>
    );
  }

  if ((currentView as any) === 'FUNNEL_BUILDER' || window.location.pathname.replace(/\/$/, '') === '/construtor-de-funil') {
    return (
      <React.Suspense fallback={<LoadingScreen />}>
        <FunnelBuilderPage onBack={() => { window.history.pushState({}, '', '/'); setCurrentView('LANDING'); }} onGetStarted={() => { window.history.pushState({}, '', '/login'); setAuthReturnView('APP'); setCurrentView('AUTH'); }} />
      </React.Suspense>
    );
  }

  if ((currentView as any) === 'VISUAL_FUNNEL' || window.location.pathname.replace(/\/$/, '') === '/funil-visual') {
    return (
      <React.Suspense fallback={<LoadingScreen />}>
        <VisualFunnelPage onBack={() => { window.history.pushState({}, '', '/'); setCurrentView('LANDING'); }} onGetStarted={() => { window.history.pushState({}, '', '/login'); setAuthReturnView('APP'); setCurrentView('AUTH'); }} />
      </React.Suspense>
    );
  }

  if ((currentView as any) === 'ALTERNATIVE_FUNELYTICS' || window.location.pathname.replace(/\/$/, '') === '/alternativa-funelytics' || window.location.pathname.replace(/\/$/, '') === '/funelytics-vs-fluxfunnel') {
    return (
      <React.Suspense fallback={<LoadingScreen />}>
        <AlternativeFunelyticsPage onBack={() => { window.history.pushState({}, '', '/'); setCurrentView('LANDING'); }} onGetStarted={() => { window.history.pushState({}, '', '/login'); setAuthReturnView('APP'); setCurrentView('AUTH'); }} />
      </React.Suspense>
    );
  }

  if ((currentView as any) === 'MAP_FUNNEL' || window.location.pathname.replace(/\/$/, '') === '/mapa-de-funil') {
    return (
      <React.Suspense fallback={<LoadingScreen />}>
        <MapFunnelPage onBack={() => { window.history.pushState({}, '', '/'); setCurrentView('LANDING'); }} onGetStarted={() => { window.history.pushState({}, '', '/login'); setAuthReturnView('APP'); setCurrentView('AUTH'); }} />
      </React.Suspense>
    );
  }

  if ((currentView as any) === 'MICRO_SAAS' || window.location.pathname.replace(/\/$/, '') === '/micro-saas') {
    return (
      <React.Suspense fallback={<LoadingScreen />}>
        <MicroSaasPage onBack={() => { window.history.pushState({}, '', '/'); setCurrentView('LANDING'); }} onGetStarted={() => { window.history.pushState({}, '', '/login'); setAuthReturnView('APP'); setCurrentView('AUTH'); }} />
      </React.Suspense>
    );
  }

  if ((currentView as any) === 'AFFILIATES_LANDING' || window.location.pathname.replace(/\/$/, '') === '/afiliados') {
    return (
      <React.Suspense fallback={<LoadingScreen />}>
        <AffiliatesPage onBack={() => { window.history.pushState({}, '', '/'); setCurrentView('LANDING'); }} />
      </React.Suspense>
    );
  }

  if ((currentView as any) === 'BLOG' || window.location.pathname.replace(/\/$/, '') === '/blog') {
    return (
      <React.Suspense fallback={<LoadingScreen />}>
        <Blog
          onBack={() => { window.history.pushState({}, '', '/'); setCurrentView('LANDING'); }}
          onNavigate={(slug) => { window.history.pushState({}, '', `/blog/${slug}`); setCurrentView('BLOG_POST'); }}
        />
      </React.Suspense>
    );
  }

  if ((currentView as any) === 'BLOG_POST' || window.location.pathname.startsWith('/blog/')) {
    const slug = window.location.pathname.split('/').pop() || '';
    return (
      <React.Suspense fallback={<LoadingScreen />}>
        <BlogPost
          postSlug={slug}
          onBack={() => { window.history.pushState({}, '', '/blog'); setCurrentView('BLOG'); }}
          onNavigate={(path: string) => { window.history.pushState({}, '', path); }}
          onGetStarted={() => { window.history.pushState({}, '', '/login'); setAuthReturnView('APP'); setCurrentView('AUTH'); }}
        />
      </React.Suspense>
    );
  }

  /* DISABLED
  if (currentView === 'TEMPLATES_PUBLIC' || window.location.pathname.replace(/\/$/, '') === '/templates') {
    return (
      <React.Suspense fallback={<LoadingScreen />}>
        <PublicTemplatesPage
          onBack={() => { window.history.pushState({}, '', '/'); setCurrentView('LANDING'); }}
          onUseTemplate={(templateId) => {
            if (user) {
              createProject(templateId);
            } else {
              localStorage.setItem('flux_pending_template_id', templateId);
              showNotification("Faça login para usar este modelo.", "success");
              setAuthReturnView('APP');
              setCurrentView('AUTH');
            }
          }}
        />
      </React.Suspense>
    );
  }
  */

  if (currentView === 'LANDING') return <LandingPage onLoginClick={() => { setAuthReturnView('APP'); setCurrentView('AUTH'); }} onGetStartedClick={() => { setAuthReturnView('APP'); setCurrentView('AUTH'); }} onRoadmapClick={() => setCurrentView('ROADMAP')} onNavigate={setCurrentView} lang={lang} setLang={setLang} t={t} plans={plans} systemConfig={systemConfig} setCurrentView={setCurrentView} setAuthReturnView={setAuthReturnView} />;
  if (currentView === 'AUTH') {
    // Priority: State from listener > Hash check
    const currentHash = window.location.hash;
    const savedHash = initialHash.current;

    // Improved Invite Logic: Check both current and initial hash
    const isInvite = currentHash.includes('type=invite') ||
      (savedHash && savedHash.includes('type=invite')) ||
      window.location.search.includes('intent=invite');

    const viewToUse = authInitialView !== 'LOGIN' ? authInitialView :
      (isInvite || currentHash.includes('type=magiclink')) ? 'SET_PASSWORD' :
        (currentHash.includes('type=recovery')) ? 'UPDATE_PASSWORD' : 'LOGIN';

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
          onGoogleLogin={api.auth.loginWithGoogle}
          onInviteComplete={async () => {
            // SECURITY: Clear recovery/invite indicators to prevent re-triggering this view
            if (window.location.hash) {
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
            }
            initialHash.current = '';
            setAuthInitialView('LOGIN');

            // Fetch latest profile state (plan updated by DB trigger)
            const profile = await api.auth.getProfile();
            if (profile) {
              setUser(profile);
              // Ensure Invited Mode is active if plan is CONVIDADO
              if (profile.plan === 'CONVIDADO') setIsInvitedMode(true);
            }
            setCurrentView('APP');
            setAppPage('PROJECTS');
            showNotification("Senha definida com sucesso! Bem-vindo(a).", 'success');
          }}
        />
      </>
    );
  }
  if (currentView === 'ROADMAP') return (
    <React.Suspense fallback={<LoadingScreen />}>
      <RoadmapPage onBack={() => setCurrentView(user ? 'APP' : 'LANDING')} feedbacks={feedbacks} onSubmitFeedback={async (item) => { await api.feedbacks.create({ ...item, authorId: user?.id }); setFeedbacks(await api.feedbacks.list()); }} onVote={async (id) => { await api.feedbacks.vote(id); setFeedbacks(await api.feedbacks.list()); }} onAddComment={async (id, text) => { await api.feedbacks.addComment(id, text); setFeedbacks(await api.feedbacks.list()); }} isAuthenticated={!!user} currentUser={user} onLoginRequest={() => { setAuthReturnView('ROADMAP'); setCurrentView('AUTH'); }} t={t} isDark={isDark} />
    </React.Suspense>
  );

  if (currentView === 'ADMIN' && user?.isSystemAdmin) {
    return (
      <React.Suspense fallback={<LoadingScreen />}>
        <MasterAdminDashboard
          onBack={() => { setCurrentView('APP'); setAppPage('PROJECTS'); }}
          feedbacks={feedbacks}

          onDeleteFeedback={api.feedbacks.delete}
          onUpdateFeedback={async (id, updates) => {
            try {
              await api.feedbacks.update(id, updates);
              if (updates.status) {
                const fb = feedbacks.find(f => f.id === id);
                if (fb && fb.authorId) {
                  await api.notifications.send(
                    fb.authorId,
                    'Atualização de Status',
                    `O status da sua sugestão "${fb.title}" foi alterado para ${updates.status}.`,
                    'STATUS_CHANGE',
                    id
                  );
                }
              }
              setFeedbacks(await api.feedbacks.list());
            } catch (e) { showNotification('Erro ao atualizar feedback.', 'error'); }
          }}
          onReplyFeedback={async (id, text) => {
            try {
              await api.feedbacks.addComment(id, text, true);
              const fb = feedbacks.find(f => f.id === id);
              if (fb && fb.authorId) {
                await api.notifications.send(
                  fb.authorId,
                  'Resposta ao seu Feedback',
                  `Um administrador respondeu à sua sugestão: "${fb.title}"`,
                  'FEEDBACK_REPLY',
                  id
                );
              }
              setFeedbacks(await api.feedbacks.list());
              showNotification('Resposta enviada com sucesso!');
            } catch (e) { showNotification('Erro ao enviar resposta.', 'error'); }
          }}
          onDeleteComment={async (fid, cid) => {
            try {
              // Check if API supports deleteComment, otherwise assume implemented or add TODO
              if (api.feedbacks.deleteComment) {
                await api.feedbacks.deleteComment(fid, cid);
              } else {
                // Fallback if not implemented in API service wrapper yet, though usually it is
                console.warn('api.feedbacks.deleteComment not implemented');
              }
              setFeedbacks(await api.feedbacks.list());
              showNotification('Comentário removido!');
            } catch (e) { showNotification('Erro ao remover comentário.', 'error'); }
          }}
          users={allUsers}
          onUpdateUser={async (u, p) => {
            if (u.plan) await api.admin.updateUserPlan(u.id, u.plan);
            if (u.status) await api.admin.updateUserStatus(u.id, u.status);
          }}
          onDeleteUser={api.admin.deleteUser}
          onBanUser={(id) => api.admin.updateUserStatus(id, 'BANNED')}
          onCreateUser={(u, p) => { }}
          onImpersonate={handleAdminImpersonate}
          plans={plans}
          onUpdatePlan={async (p) => {
            // Optimistic Update for regular edits
            setPlans(prev => prev.map(old => old.id === p.id ? { ...old, ...p } : old));
            try {
              await api.plans.update(p.id, p);
            } catch (e) {
              console.error(e);
              showNotification("Erro ao salvar alterações.", "error");
            }
          }}
          onReorderPlans={async (newPlans) => {
            // Instant UI update for reordering
            setPlans(newPlans);
            try {
              // Persist order changes for all affected plans (or simply all to be safe)
              await Promise.all(newPlans.map(p => api.plans.update(p.id, { order: p.order })));
            } catch (e) {
              console.error("Reorder failed", e);
              showNotification("Erro ao salvar nova ordem.", "error");
              // Ideally revert here, but for now we trust the user will retry or refresh
            }
          }}
          onDeletePlan={async (id) => { await api.plans.delete(id); setPlans(prev => prev.filter(p => p.id !== id)); showNotification("Plano removido."); }}
          onCreatePlan={async (p) => {
            const newPlan = await api.plans.create(p);
            setPlans(prev => [...prev, newPlan] as PlanConfig[]);
            showNotification("Novo plano criado!");
          }}
          systemConfig={systemConfig}
          onUpdateSystemConfig={(c) => api.system.update(c)}
          t={t}
        />
      </React.Suspense>
    );
  }

  if (currentView === 'SHARED' && sharedProject) {
    return (
      <div className={`flex flex-col h-screen ${isDark ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
        {toast?.show && <div className={`fixed top-14 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 rounded-xl shadow-2xl border ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{toast.message}</div>}

        <header className="h-16 flex items-center justify-between px-6 border-b bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 z-10 relative shadow-sm">
          <div className="flex items-center gap-2">
            <div onClick={() => window.location.href = '/'} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">
                <GitGraph size={18} className="text-white" />
              </div>
              <span className="font-bold text-lg text-slate-800 dark:text-white hidden sm:block">FluxFunnel</span>
            </div>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-2 hidden sm:block"></div>
            <h1 className="text-sm sm:text-lg font-bold text-slate-700 dark:text-slate-200 truncate max-w-[200px] sm:max-w-md">
              {sharedProject.name}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentView('LANDING')}
              className="hidden sm:flex px-4 py-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg font-bold transition-colors"
            >
              Criar meu Funil
            </button>
            <button
              onClick={() => setCurrentView('LANDING')}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            >
              Começar Grátis
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          <React.Suspense fallback={<LoadingScreen />}>
            <FlowCanvasWrapped
              project={sharedProject}
              onSaveProject={async () => { }} // No-op for read-only
              onUnsavedChanges={() => { }}
              triggerSaveSignal={0}
              openSaveModalSignal={0}
              isDark={isDark}
              toggleTheme={() => setIsDark(!isDark)}
              isPresentationMode={true}
              showNotesInPresentation={true}
              t={t}
              userPlan={'FREE'} // Default for viewing
              maxNodes={9999}
              plans={[]}
              showAIAssistant={false}
              onToggleAIAssistant={() => { }}
              onSaveTemplate={() => { }}
              onShareToMarketplace={() => { }}
              isSharedView={true}
            />
          </React.Suspense>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'dark' : ''}`}>
      {toast?.show && <div className={`fixed top-14 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 rounded-xl shadow-2xl border ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{toast.message}</div>}

      {showUpgradeModal && (
        <React.Suspense fallback={<LoadingScreen />}>
          <UpgradeModal
            userPlan={user?.plan || 'FREE'}
            onClose={() => setShowUpgradeModal(false)}
            initialPlan={upgradeModalInitialState?.planId}
            initialCycle={upgradeModalInitialState?.cycle}
            onUpgrade={() => {
              // Logic handled internally by UpgradeModal (Stripe Checkout)
              setShowUpgradeModal(false);
            }}
            isDark={isDark}
            plans={plans}
            limitType={upgradeModalContext.limitType}
            reason={upgradeModalContext.reason}
            featureName={upgradeModalContext.featureName}
            showNotification={showNotification}
          />
        </React.Suspense>
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
              <button
                key={item.id}
                onClick={() => {
                  // Guest (Invited) Restriction Logic
                  if (isInvitedMode && (item.id === 'MARKETPLACE' || item.id === 'TEAM')) {
                    setUpgradeModalContext({ reason: 'FEATURE_LOCKED', featureName: item.label });
                    setShowUpgradeModal(true);
                    return;
                  }

                  attemptNavigation(() => {
                    if (item.id === 'BUILDER' && !currentProjectId) setAppPage('PROJECTS');
                    else setAppPage(item.id as AppPage);
                  })
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isSidebarCollapsed ? 'justify-center' : 'lg:justify-start lg:px-4'} 
                  ${appPage === item.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                  ${(isInvitedMode && (item.id === 'MARKETPLACE' || item.id === 'TEAM')) ? 'opacity-60 cursor-not-allowed group' : ''}
                `}
                title={item.label}
              >
                {item.icon}
                <span className={`hidden font-medium flex-1 flex items-center justify-between ${isSidebarCollapsed ? '' : 'lg:flex'}`}>
                  {item.label}
                  {/* Visual lock for guests */}
                  {isInvitedMode && (item.id === 'MARKETPLACE' || item.id === 'TEAM') && (
                    <Lock size={14} className="text-amber-500" />
                  )}
                </span>
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
            <div className={`hidden text-left ${isSidebarCollapsed ? '' : 'lg:block'}`}><p className="text-sm font-bold truncate">{user?.name}</p><p className="text-xs text-slate-400">{isInvitedMode ? 'CONVIDADO' : user?.plan}</p></div>
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
                {/* {user?.plan === 'PREMIUM' && <button onClick={() => setShowAIAssistant(!showAIAssistant)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${showAIAssistant ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'}`}><Sparkles size={16} /> IA Audit</button>} */}
                <button onClick={() => setAppMode(prev => prev === AppMode.BUILDER ? AppMode.PRESENTATION : AppMode.BUILDER)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${appMode === AppMode.PRESENTATION ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`} title="Modo Apresentação"><Presentation size={18} /> Modo Apresentação</button>
                {user?.plan === 'PREMIUM' && (
                  <button
                    onClick={() => {
                      const proj = projects.find(p => p.id === currentProjectId);
                      if (proj) setPresentationShareProject(proj);
                      setIsCopied(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg font-bold transition-all ml-2"
                    title="Compartilhar Apresentação"
                  >
                    <Share2 size={18} />
                  </button>
                )}
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

        {/* Profile Completion Warning */}
        {appPage !== 'BUILDER' && user && showProfileBanner && (
          <ProfileCompletionBanner
            user={user}
            onDismiss={() => { setShowProfileBanner(false); localStorage.setItem('hide_profile_banner', 'true'); }}
            onAction={() => setAppPage('SETTINGS')}
          />
        )}

        <div className="flex-1 overflow-hidden relative flex">
          <React.Suspense fallback={<LoadingScreen />}>
            {appPage === 'PROJECTS' && <ProjectsDashboard projects={projects} projectsLimit={isInvitedMode ? 999 : (plans.find(p => p.id === (user?.plan || 'FREE'))?.projectLimit || 3)} onCreateProject={createProject} onOpenProject={(id) => { setCurrentProjectId(id); setOpenSaveModalSignal(0); setAppPage('BUILDER'); }} onDeleteProject={handleDeleteProject} onRenameProject={handleRenameProject} onRefreshTemplates={refreshTemplates} showNotification={showNotification} isDark={isDark} t={t} userPlan={user?.plan} customTemplates={customTemplates} onSaveAsTemplate={async (p) => { await api.templates.create({ customLabel: p.name, nodes: p.nodes, edges: p.edges, isCustom: true }); refreshTemplates(); }} onUpgrade={() => { setUpgradeModalContext({ reason: 'FEATURE_LOCKED', featureName: 'Compartilhamento de Link' }); setShowUpgradeModal(true); }} />}
            {appPage === 'MARKETPLACE' && <MarketplaceDashboard userPlan={user?.plan || 'FREE'} onDownload={async (t) => { await createProject(t.id, t.customLabel, false); }} isDark={isDark} t={t} userId={user?.id} onUpgrade={() => { setUpgradeModalContext({ reason: 'FEATURE_LOCKED', featureName: 'Acesso ao Marketplace' }); setShowUpgradeModal(true); }} />}
            {appPage === 'TEAM' && <TeamDashboard members={teamMembers} onInviteMember={handleInviteMember} onUpdateRole={handleUpdateMemberRole} onRemoveMember={handleRemoveMember} onResendInvite={handleResendInvite} onUpgrade={() => { setUpgradeModalContext({ reason: 'FEATURE_LOCKED', featureName: 'Gestão de Equipe' }); setShowUpgradeModal(true); }} plan={user?.plan || 'FREE'} maxMembers={plans.find(p => p.id === user?.plan)?.teamLimit ?? (user?.plan === 'PREMIUM' ? 10 : 0)} isDark={isDark} t={t} />}
            {appPage === 'MASTER_ADMIN' && <MasterAdminDashboard
              onBack={() => setAppPage('PROJECTS')}
              onReplyFeedback={async (id, text) => { await api.feedbacks.addComment(id, text); setFeedbacks(await api.feedbacks.list()); }}
              onDeleteComment={async (fid, cid) => { await api.feedbacks.deleteComment(fid, cid); setFeedbacks(await api.feedbacks.list()); }}
              feedbacks={feedbacks}

              onDeleteFeedback={async (id) => { await api.feedbacks.delete(id); setFeedbacks(await api.feedbacks.list()); }}
              onUpdateFeedback={async (id, f) => { await api.feedbacks.update(id, f); setFeedbacks(await api.feedbacks.list()); }}
              users={allUsers || []}
              onUpdateUser={async (u) => { await api.admin.updateUserStatus(u.id, u.status); await api.admin.updateUserPlan(u.id, u.plan); setAllUsers(await api.users.list()); }}
              onDeleteUser={async (id) => { await api.admin.deleteUser(id); setAllUsers(await api.users.list()); }}
              onBanUser={async (id) => { await api.admin.updateUserStatus(id, 'BANNED'); setAllUsers(await api.users.list()); }}
              onCreateUser={() => { }}
              onImpersonate={handleAdminImpersonate}
              plans={plans}
              onUpdatePlan={async (p) => { await api.plans.update(p.id, p); setPlans(await api.plans.list()); }}
              onReorderPlans={async (newPlans) => { setPlans(newPlans); await Promise.all(newPlans.map(p => api.plans.update(p.id, { order: p.order }))); }}
              onDeletePlan={async (id) => { await api.plans.delete(id); setPlans(await api.plans.list()); }}
              onCreatePlan={async (p) => { await api.plans.create(p); setPlans(await api.plans.list()); }}
              systemConfig={systemConfig}
              onUpdateSystemConfig={async (c) => { await api.system.update(c); setSystemConfig(await api.system.get()); }}
              t={t}
            />}
            {appPage === 'BUILDER' && (currentProjectId ? <FlowCanvasWrapped project={projects.find(p => p.id === currentProjectId)!} onSaveProject={triggerSaveProject} onUnsavedChanges={() => setHasUnsavedChanges(true)} triggerSaveSignal={saveSignal} openSaveModalSignal={openSaveModalSignal} isDark={isDark} toggleTheme={() => setIsDark(!isDark)} isPresentationMode={appMode === AppMode.PRESENTATION} showNotesInPresentation={showNotes} t={t}
              userPlan={isInvitedMode ? 'CONVIDADO' : (user?.plan || 'FREE')}
              maxNodes={isInvitedMode ? 999999 : (plans.find(p => p.id === (user?.plan || 'FREE'))?.nodeLimit || 20)}
              plans={plans} showAIAssistant={showAIAssistant} onToggleAIAssistant={() => setShowAIAssistant(!showAIAssistant)} showNotification={showNotification} onSaveTemplate={async (nodes, edges, name) => { if (!user) return; try { await api.templates.create({ customLabel: name, nodes, edges, isCustom: true, owner_id: user.id }); showNotification("Modelo salvo com sucesso!"); setCustomTemplates(await api.templates.list()); } catch (e) { showNotification("Erro ao salvar modelo", 'error'); } }} onShareToMarketplace={async (name, desc) => { if (!user) return; const p = projects.find(p => p.id === currentProjectId); if (p) { await api.templates.submitToMarketplace({ customLabel: name, customDescription: desc, nodes: p.nodes, edges: p.edges, authorName: user.name }); showNotification("Enviado para análise com sucesso!"); } }} /> : <div className="flex flex-col items-center justify-center h-full text-slate-400"><Folder size={64} className="mb-4 opacity-50" /><p>{t('noProjectSelected')}</p></div>)}
            {appPage === 'SETTINGS' && user && <SettingsDashboard isInvited={isInvitedMode} user={user} onUpdateUser={async (updated) => { await api.auth.updateProfile(user.id, updated); setUser({ ...user, ...updated }); showNotification("Perfil atualizado!"); }} isDark={isDark} toggleTheme={() => setIsDark(!isDark)} lang={lang} setLang={setLang} t={t} projectsCount={projects.filter(p => p.ownerId === user.id).length} onUpgrade={() => { setUpgradeModalContext({ reason: 'FEATURE_LOCKED', featureName: 'Assinatura Premium' }); setShowUpgradeModal(true); }} plans={plans} />}
          </React.Suspense>
        </div>
      </main>
      {presentationShareProject && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className={`w-full max-w-lg p-8 rounded-2xl shadow-2xl relative overflow-hidden ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 shadow-lg shadow-emerald-500/20">
                <Share2 size={36} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Compartilhar Apresentação</h3>
              <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Este link permite que qualquer pessoa visualize seu mapa em <strong>Modo Apresentação</strong>, sem a necessidade de login ou edição.
              </p>

              <div className={`w-full p-4 rounded-xl border-2 mb-6 text-left break-all font-mono text-sm flex items-center justify-between gap-4 ${isDark ? 'bg-slate-950 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                <span className="line-clamp-2">{`${window.location.origin}/?share=${presentationShareProject.id}`}</span>
              </div>

              <button
                onClick={() => {
                  const url = `${window.location.origin}/?share=${presentationShareProject.id}`;
                  navigator.clipboard.writeText(url);
                  setIsCopied(true);
                  showNotification("Link copiado para a área de transferência!", 'success');
                  setTimeout(() => setIsCopied(false), 3000);
                }}
                className={`w-full py-4 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 mb-4 ${isCopied ? 'bg-emerald-600 hover:bg-emerald-500 scale-95' : 'bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.02] shadow-indigo-500/25'}`}
              >
                {isCopied ? <><Check size={20} /> Link Copiado!</> : <><Share2 size={20} /> Copiar Link de Visualização</>}
              </button>

              <button
                onClick={() => setPresentationShareProject(null)}
                className={`text-sm font-bold hover:underline ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Fechar Janela
              </button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

export default App;

