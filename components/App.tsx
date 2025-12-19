
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GitGraph, Plus, Folder, Presentation, PenTool, LogOut, Crown, User as UserIcon, Settings, Globe, LayoutDashboard, Workflow, Users, X, AlertTriangle, Save as SaveIcon, Sparkles, Eye, EyeOff, ChevronLeft, ChevronRight, Pencil, BookmarkPlus, Check, AlertCircle, Wrench, Lock } from 'lucide-react';
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
import { Project, AppMode, User, Language, AppPage, AppView, FeedbackItem, FeedbackStatus, UserStatus, UserPlan, PlanConfig, TeamMember, Template, SystemConfig, NodeType, Announcement } from './types';
import { INITIAL_NODES, INITIAL_EDGES, TRANSLATIONS, PROJECT_TEMPLATES, NODE_CONFIG, NODE_CATEGORY } from './constants';
import { Node, Edge } from 'reactflow';
import { safeGet, safeSet, migrateFeedbacks } from './utils/storage';
import { api } from './services/api';

// --- INITIAL DATA & MOCKS ---

const DEFAULT_PROJECT: Project = {
    id: 'proj_default',
    name: 'Funil Exemplo 1',
    nodes: INITIAL_NODES as any,
    edges: INITIAL_EDGES,
    updatedAt: new Date(),
    // No ownerId means it's a system/template project
};

// MOCK PROJECTS LINKED TO SPECIFIC USERS FOR IMPERSONATION TESTING
const MOCK_PROJECTS: Project[] = [
    // Alex's Projects (Free Plan)
    {
        id: 'p_alex_1',
        name: 'Funil de Captação Simples',
        nodes: INITIAL_NODES as any,
        edges: INITIAL_EDGES,
        updatedAt: new Date(),
        ownerId: 'u2' // Alex
    },
    // Sara's Projects (Pro Plan)
    {
        id: 'p_sara_1',
        name: 'Lançamento Semente V1',
        nodes: PROJECT_TEMPLATES[1].nodes,
        edges: PROJECT_TEMPLATES[1].edges,
        updatedAt: new Date(),
        ownerId: 'u3' // Sarah
    },
    {
        id: 'p_sara_2',
        name: 'Webinar Perpétuo',
        nodes: PROJECT_TEMPLATES[2].nodes,
        edges: PROJECT_TEMPLATES[2].edges,
        updatedAt: new Date(),
        ownerId: 'u3' // Sarah
    },
    // Michele/Admin Projects
    {
        id: 'p_admin_1',
        name: 'Ecossistema Enterprise Q4',
        nodes: [],
        edges: [],
        updatedAt: new Date(),
        ownerId: 'u1' // Master Admin
    },
    {
        id: 'p_admin_2',
        name: 'Funil High Ticket',
        nodes: PROJECT_TEMPLATES[0].nodes,
        edges: PROJECT_TEMPLATES[0].edges,
        updatedAt: new Date(),
        ownerId: 'u1' // Master Admin
    }
];

const MOCK_ALL_USERS: User[] = [
    { id: 'u1', name: 'Master Admin', email: 'admin@fluxfunnel.io', plan: 'PREMIUM', status: 'ACTIVE', lastLogin: new Date(), isSystemAdmin: true },
    { id: 'u2', name: 'Alex Builder', email: 'alex@demo.com', plan: 'PRO', status: 'ACTIVE', lastLogin: new Date(Date.now() - 86400000) },
    { id: 'u3', name: 'Sarah Agency', email: 'sarah@agency.com', plan: 'PREMIUM', status: 'ACTIVE', lastLogin: new Date(Date.now() - 3600000) },
    { id: 'u4', name: 'John Free', email: 'john@free.com', plan: 'FREE', status: 'INACTIVE', lastLogin: new Date(Date.now() - 2592000000) },
];

const INITIAL_FEEDBACKS: FeedbackItem[] = [
    {
        id: 'f1', title: 'Dark Mode Support', description: 'Please add a dark theme for late night work.',
        type: 'FEATURE', status: 'COMPLETED', votes: 45, votedUserIds: [],
        authorName: 'John Doe', createdAt: new Date(), comments: []
    },
    {
        id: 'f2', title: 'TikTok Ads Icon', description: 'Missing TikTok ads icon in the traffic section.',
        type: 'FEATURE', status: 'IN_PROGRESS', votes: 32, votedUserIds: [],
        authorName: 'Sara Pro', createdAt: new Date(), comments: []
    }
];

const App = () => {
    // Global View State
    const [currentView, setCurrentView] = useState<AppView>('LANDING');
    const [appPage, setAppPage] = useState<AppPage>('PROJECTS');
    const [user, setUser] = useState<User | null>(null);
    const [isDark, setIsDark] = useState(false);
    const [appMode, setAppMode] = useState<AppMode>(AppMode.BUILDER);
    const [showNotes, setShowNotes] = useState(true);
    const [lang, setLang] = useState<Language>('pt');

    // Navigation Memory
    const [authReturnView, setAuthReturnView] = useState<AppView | null>(null);

    // UI State
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const plansInitializedRef = useRef(false);

    // Toast Notification State
    const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' } | null>(null);

    // Team Data
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

    // --- SAVE & NAVIGATION STATE ---
    const [saveSignal, setSaveSignal] = useState(0);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);

    // --- LIMIT MODAL STATE ---
    const [showProjectLimitModal, setShowProjectLimitModal] = useState(false);

    // --- DATA STATE ---
    const [projects, setProjects] = useState<Project[]>([]);
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);

    // Shared Link State
    const [sharedProject, setSharedProject] = useState<Project | null>(null);

    // Roadmap Data
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(INITIAL_FEEDBACKS);

    // Custom Templates State
    const [customTemplates, setCustomTemplates] = useState<Template[]>([]);

    // Admin Data & System Config (CENTRALIZED)
    const [allUsers, setAllUsers] = useState<User[]>(MOCK_ALL_USERS);
    const [plans, setPlans] = useState<PlanConfig[]>([]);
    const [systemConfig, setSystemConfig] = useState<SystemConfig>({
        maintenanceMode: false,
        allowSignups: true,
        announcements: [],
        debugMode: false
    });

    // Helper Translation Function
    const t = useCallback((key: keyof typeof TRANSLATIONS['pt']) => {
        return TRANSLATIONS[lang][key] || key;
    }, [lang]);

    // Helper Toast Function
    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Generate Plans based on Language (Fallback if DB empty)
    useEffect(() => {
        const isSeeded = safeGet<boolean>('admin_plans_seeded', false);
        if (!plansInitializedRef.current && plans.length === 0 && !isSeeded) {
            const generatedPlans: PlanConfig[] = [
                {
                    id: 'FREE',
                    label: t('starter'),
                    priceMonthly: 0,
                    priceYearly: 0,
                    projectLimit: 1,
                    nodeLimit: 20,
                    features: [
                        t('pricingFreeFeat1'), t('pricingFreeFeat2'), t('pricingFreeFeat3'),
                        t('pricingFreeFeat4'), t('pricingFreeFeat5'), t('pricingFreeFeat6')
                    ]
                },
                {
                    id: 'PRO',
                    label: t('pro'),
                    priceMonthly: 69.90,
                    priceYearly: 712.98,
                    projectLimit: 5,
                    nodeLimit: 100,
                    features: [
                        t('pricingProFeat1'), t('pricingProFeat2'), t('pricingProFeat3'),
                        t('pricingProFeat4'), t('pricingProFeat5'), t('pricingProFeat6')
                    ]
                },
                {
                    id: 'PREMIUM',
                    label: t('agency'),
                    priceMonthly: 97.90,
                    priceYearly: 881.10,
                    projectLimit: 9999,
                    nodeLimit: 9999,
                    features: [
                        t('pricingPremiumFeat1'), t('pricingPremiumFeat2'), t('pricingPremiumFeat3'),
                        t('pricingPremiumFeat4'), t('pricingPremiumFeat5'), t('pricingPremiumFeat6')
                    ]
                },
            ];
            setPlans(generatedPlans);
            plansInitializedRef.current = true;
        }
    }, [lang, t, plans.length]);

    // --- INITIALIZATION ---
    useEffect(() => {
        const initApp = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const shareId = params.get('share');

                // 1. Load User Profile
                let loggedUser: User | null = null;
                try {
                    loggedUser = await api.auth.getProfile();
                    if (loggedUser) {
                        setUser(loggedUser);
                        // Load Team
                        const team = await api.team.list();
                        setTeamMembers(team);
                        // Load Templates
                        const tpls = await api.templates.list();
                        setCustomTemplates(tpls);
                    }
                } catch (e) {
                    console.warn("User not authenticated");
                }

                // 2. Load Settings
                const storedTheme = safeGet<string>('theme', 'light');
                setIsDark(storedTheme === 'dark');
                const storedLang = safeGet<Language>('lang', 'pt');
                setLang(storedLang);

                // 3. Load System Config
                try {
                    const config = await api.system.get();
                    setSystemConfig(config);
                } catch (e) {
                    console.error("Failed to load system config", e);
                }

                // 4. Load Plans
                try {
                    const dbPlans = await api.plans.list();
                    if (dbPlans.length > 0) setPlans(dbPlans);
                } catch (e) {
                    console.error("Failed to load plans", e);
                }

                // 5. Load Feedbacks
                try {
                    const dbFeedbacks = await api.feedbacks.list();
                    if (dbFeedbacks.length > 0) {
                        setFeedbacks(dbFeedbacks);
                    } else {
                        setFeedbacks(INITIAL_FEEDBACKS); // Fallback for demo
                    }
                } catch (e) {
                    setFeedbacks(INITIAL_FEEDBACKS);
                }

                // 6. Load Users (Admin Only)
                if (loggedUser?.isSystemAdmin) {
                    try {
                        const usersList = await api.users.list();
                        // Merge/Use Mocks if DB is empty (Offline Mode)
                        setAllUsers(usersList.length > 0 ? usersList : MOCK_ALL_USERS);
                    } catch (e) {
                        setAllUsers(MOCK_ALL_USERS);
                    }
                }

                const storedSidebarState = safeGet<boolean>('sidebarCollapsed', false);
                setIsSidebarCollapsed(storedSidebarState);

                // 7. Load Projects
                setIsLoadingProjects(true);
                try {
                    const apiProjects = await api.projects.list();
                    // Merge mocked projects so user isn't empty in demo
                    const combinedProjects = [...MOCK_PROJECTS, ...apiProjects];
                    // Deduplicate by ID
                    const uniqueProjects = Array.from(new Map(combinedProjects.map(p => [p.id, p])).values());

                    // Add Default Project if list is empty
                    if (uniqueProjects.length === 0) uniqueProjects.push(DEFAULT_PROJECT);

                    setProjects(uniqueProjects);

                    // Handle Shared Project
                    if (shareId) {
                        const found = uniqueProjects.find(p => p.id === shareId);
                        if (found) {
                            setSharedProject(found);
                            setCurrentView('SHARED');
                            showNotification("Visualizando projeto compartilhado.", 'success');
                        } else {
                            showNotification("Projeto compartilhado não encontrado.", 'error');
                        }
                    }
                } catch (e) {
                    console.error("Error loading projects", e);
                    setProjects([...MOCK_PROJECTS, DEFAULT_PROJECT]);
                } finally {
                    setIsLoadingProjects(false);
                }

            } catch (globalError) {
                console.error("CRITICAL INIT ERROR:", globalError);
            } finally {
                setIsInitialized(true);
            }
        };
        initApp();
    }, []);

    // --- PERSISTENCE (UI ONLY) ---
    useEffect(() => {
        if (isInitialized) {
            safeSet('theme', isDark ? 'dark' : 'light');
            if (isDark) document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
        }
    }, [isDark, isInitialized]);

    useEffect(() => { if (isInitialized) safeSet('lang', lang); }, [lang, isInitialized]);

    const toggleSidebar = () => {
        const newState = !isSidebarCollapsed;
        setIsSidebarCollapsed(newState);
        safeSet('sidebarCollapsed', newState);
    };

    // --- HANDLERS ---

    const handleLogin = async (data: { email: string, name?: string, password?: string, isSignup?: boolean }) => {
        // SYSTEM CONFIG CHECK
        if (!systemConfig.allowSignups && data.isSignup) {
            showNotification("Novos cadastros estão temporariamente suspensos.", 'error');
            return;
        }

        try {
            let authResult;

            if (data.isSignup) {
                authResult = await api.auth.register(data.email, data.password, data.name);
            } else {
                authResult = await api.auth.login(data.email, data.password);
            }

            const { user: newUser } = authResult;

            if (newUser.status === 'BANNED') {
                showNotification("Acesso negado: Esta conta está suspensa.", 'error');
                await api.auth.logout();
                return;
            }

            setUser(newUser);

            // Refresh Data
            setIsLoadingProjects(true);
            const apiProjects = await api.projects.list();
            // In offline mode, apiProjects is empty. Merge with MOCK_PROJECTS to ensure data.
            const combined = [...MOCK_PROJECTS, ...apiProjects];
            const unique = Array.from(new Map(combined.map(p => [p.id, p])).values());
            setProjects(unique.length ? unique : [DEFAULT_PROJECT]);
            setIsLoadingProjects(false);

            const team = await api.team.list();
            setTeamMembers(team);

            const tpls = await api.templates.list();
            setCustomTemplates(tpls);

            if (newUser.isSystemAdmin) {
                const usersList = await api.users.list();
                setAllUsers(usersList.length > 0 ? usersList : MOCK_ALL_USERS);
            }

            if (authReturnView) {
                setCurrentView(authReturnView);
                setAuthReturnView(null);
            } else {
                setCurrentView('APP');
                setAppPage('PROJECTS');
            }

        } catch (error: any) {
            if (!data.isSignup) {
                // Specific error for login failure to guide user
                if (error.message?.includes('Invalid login credentials') || error.message?.includes('User not found')) {
                    showNotification("Conta não encontrada. Por favor, cadastre-se se ainda não tem conta.", 'error');
                } else {
                    showNotification("Erro ao fazer login. Verifique suas credenciais.", 'error');
                }
            } else {
                showNotification(error.message || "Erro ao criar conta.", 'error');
            }
        }
    };

    const handleLogout = async () => {
        await api.auth.logout();
        setUser(null);
        setProjects([]);
        setTeamMembers([]);
        setAllUsers([]);
        setCustomTemplates([]);
        setCurrentView('LANDING');
        setAppPage('PROJECTS');
        setCurrentProjectId(null);
        setIsProfileMenuOpen(false);
    };

    const handleAdminImpersonate = (userId: string) => {
        const targetUser = allUsers.find(u => u.id === userId);
        if (targetUser) {
            if (targetUser.status === 'BANNED') {
                if (!window.confirm("Atenção: Este usuário está BANIDO. Deseja acessar mesmo assim?")) return;
            }
            setUser(targetUser);
            setCurrentView('APP');
            setAppPage('PROJECTS');
            setCurrentProjectId(null);
            showNotification(`Acessando painel como ${targetUser.name}`, 'success');
        } else {
            showNotification("Erro: Usuário não encontrado.", 'error');
        }
    };

    const triggerSaveProject = async (nodes: Node[], edges: Edge[]) => {
        if (currentProjectId) {
            // Optimistic UI Update
            setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, nodes, edges, updatedAt: new Date() } : p));
            setHasUnsavedChanges(false);
            try {
                await api.projects.update(currentProjectId, { nodes, edges });
            } catch (e) {
                console.error("Failed to save remotely", e);
                setHasUnsavedChanges(true);
                showNotification("Erro ao salvar no servidor.", 'error');
            }
        }
    };

    const handleSaveAsTemplate = async (nodes: Node[], edges: Edge[], name: string) => {
        if (!user) {
            showNotification("Você precisa estar logado.", 'error');
            return;
        }
        try {
            const newTemplate = await api.templates.create({
                customLabel: name,
                customDescription: `Criado em ${new Date().toLocaleDateString()}`,
                nodes,
                edges
            });
            setCustomTemplates(prev => [...prev, newTemplate]);
            showNotification(`Modelo "${name}" salvo com sucesso!`, 'success');
        } catch (e) {
            showNotification("Erro ao salvar template.", 'error');
        }
    };

    // --- SETTINGS HANDLERS ---
    const handleUpdateUser = async (updated: Partial<User>) => {
        if (!user) return;
        try {
            await api.auth.updateProfile(user.id, updated);
            setUser(prev => prev ? { ...prev, ...updated } : null);
            showNotification("Perfil atualizado com sucesso!");
        } catch (e) {
            showNotification("Erro ao atualizar perfil.", 'error');
        }
    };

    // --- FEEDBACK HANDLERS ---
    const handleSubmitFeedback = async (item: any) => {
        try {
            await api.feedbacks.create(item);
            const list = await api.feedbacks.list();
            setFeedbacks(list.length ? list : [...feedbacks, { ...item, id: Date.now().toString(), status: 'PENDING', createdAt: new Date(), votes: 0, comments: [], votedUserIds: [] }]);
            showNotification("Feedback enviado com sucesso!", 'success');
        } catch (e) {
            showNotification("Erro ao enviar feedback", 'error');
        }
    };

    const handleVoteFeedback = async (id: string) => {
        if (!user) return;
        const fb = feedbacks.find(f => f.id === id);
        if (!fb || fb.votedUserIds.includes(user.id)) return;

        const newVotes = fb.votes + 1;
        const newVoters = [...fb.votedUserIds, user.id];
        setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, votes: newVotes, votedUserIds: newVoters } : f));

        try {
            await api.feedbacks.update(id, { votes: newVotes, votedUserIds: newVoters });
        } catch (e) { console.error(e); }
    };

    const handleAddComment = async (id: string, text: string) => {
        if (!user) return;
        const fb = feedbacks.find(f => f.id === id);
        if (!fb) return;

        const newComment = { id: Date.now().toString(), text, authorName: user.name, createdAt: new Date(), isAdmin: user.isSystemAdmin };
        const newComments = [...fb.comments, newComment];
        setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, comments: newComments } : f));

        try {
            await api.feedbacks.update(id, { comments: newComments });
        } catch (e) { console.error(e); }
    };

    // --- TEAM HANDLERS ---
    const handleInviteMember = async (email: string, role: 'ADMIN' | 'EDITOR' | 'VIEWER') => {
        try {
            await api.team.invite(email, role);
            const list = await api.team.list();
            setTeamMembers(list);
            showNotification(`Convite enviado para ${email}`, 'success');
        } catch (e) {
            showNotification("Erro ao convidar membro", 'error');
        }
    };

    const handleUpdateMemberRole = async (id: string, newRole: 'ADMIN' | 'EDITOR' | 'VIEWER') => {
        try {
            await api.team.updateRole(id, newRole);
            setTeamMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
            showNotification("Permissão atualizada", 'success');
        } catch (e) {
            showNotification("Erro ao atualizar permissão", 'error');
        }
    };

    const handleRemoveMember = async (id: string) => {
        if (window.confirm("Remover membro?")) {
            try {
                await api.team.remove(id);
                setTeamMembers(prev => prev.filter(m => m.id !== id));
                showNotification("Membro removido", 'success');
            } catch (e) {
                showNotification("Erro ao remover membro", 'error');
            }
        }
    };

    // --- ADMIN HANDLERS ---
    const handleAdminUpdateUser = async (updated: User, password?: string) => {
        try {
            await api.users.update(updated.id, updated);
            setAllUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
            showNotification("Usuário atualizado com sucesso.", 'success');
        } catch (e) {
            showNotification("Erro ao atualizar usuário.", 'error');
        }
    };

    const handleAdminDeleteUser = async (id: string) => {
        try {
            await api.users.delete(id);
            setAllUsers(prev => prev.filter(u => u.id !== id));
            showNotification("Usuário removido.", 'success');
        } catch (e) {
            showNotification("Erro ao remover usuário.", 'error');
        }
    };

    const handleAdminCreateUser = async (newUser: User, password?: string) => {
        // For Demo/Mock mode, update state directly. In production, this requires backend.
        setAllUsers(prev => [...prev, newUser]);
        showNotification("Usuário criado com sucesso (Demo).", 'success');
    };

    const handleAdminUpdatePlan = async (updated: PlanConfig) => {
        try {
            await api.plans.update(updated.id, updated);
            setPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
            showNotification("Plano atualizado!", 'success');
        } catch (e) {
            showNotification("Erro ao atualizar plano.", 'error');
        }
    };

    const handleAdminCreatePlan = async (newPlan: PlanConfig) => {
        try {
            await api.plans.create(newPlan);
            setPlans(prev => [...prev, newPlan]);
            showNotification("Plano criado!", 'success');
        } catch (e) {
            showNotification("Erro ao criar plano.", 'error');
        }
    }

    const handleAdminDeletePlan = async (id: string) => {
        try {
            await api.plans.delete(id);
            setPlans(prev => prev.filter(p => p.id !== id));
            showNotification("Plano excluído!", 'success');
        } catch (e) {
            showNotification("Erro ao excluir plano.", 'error');
        }
    };

    const handleAdminUpdateFeedbackStatus = async (id: string, status: FeedbackStatus) => {
        try {
            await api.feedbacks.update(id, { status });
            setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status } : f));
            showNotification("Status atualizado", 'success');
        } catch (e) {
            showNotification("Erro ao atualizar status", 'error');
        }
    };
    const handleAdminDeleteFeedback = async (id: string) => {
        try {
            await api.feedbacks.delete(id);
            setFeedbacks(prev => prev.filter(f => f.id !== id));
            showNotification("Feedback excluído", 'success');
        } catch (e) {
            showNotification("Erro ao excluir feedback", 'error');
        }
    };
    const handleAdminUpdateFeedback = async (id: string, data: Partial<FeedbackItem>) => {
        try {
            await api.feedbacks.update(id, data);
            setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, ...data } : f));
            showNotification("Feedback atualizado", 'success');
        } catch (e) {
            showNotification("Erro ao atualizar feedback", 'error');
        }
    };
    const handleAdminDeleteComment = async (feedbackId: string, commentId: string) => {
        const fb = feedbacks.find(f => f.id === feedbackId);
        if (!fb) return;
        const newComments = fb.comments.filter(c => c.id !== commentId);
        try {
            await api.feedbacks.update(feedbackId, { comments: newComments });
            setFeedbacks(prev => prev.map(f => f.id === feedbackId ? { ...f, comments: newComments } : f));
            showNotification("Comentário excluído", 'success');
        } catch (e) {
            showNotification("Erro ao excluir comentário", 'error');
        }
    };
    const handleUpdateSystemConfig = async (newConfig: SystemConfig) => {
        try {
            await api.system.update(newConfig);
            setSystemConfig(newConfig);
            showNotification("Configurações atualizadas", 'success');
        } catch (e) {
            showNotification("Erro ao salvar configurações", 'error');
        }
    };

    // --- VIEW HELPERS ---

    const getMaxTeamMembers = (plan: UserPlan) => {
        if (plan === 'PREMIUM') return 10;
        return 0;
    };

    const userVisibleProjects = useMemo(() => {
        if (!user) return [];
        return projects.filter(p => p.ownerId === user.id);
    }, [projects, user]);

    const activeProject = useMemo(() => {
        if (!currentProjectId) return null;
        return projects.find(p => p.id === currentProjectId) || null;
    }, [projects, currentProjectId]);

    // --- NAVIGATION GUARDS ---
    const attemptNavigation = (action: () => void) => {
        if (hasUnsavedChanges && currentView === 'APP' && appPage === 'BUILDER') {
            setPendingNavigation(() => action);
            setShowUnsavedModal(true);
        } else {
            action();
        }
    };

    const confirmNavigation = (shouldSave: boolean) => {
        if (shouldSave) {
            setSaveSignal(s => s + 1);
            setTimeout(() => {
                if (pendingNavigation) pendingNavigation();
                setPendingNavigation(null);
                setShowUnsavedModal(false);
            }, 100);
        } else {
            setHasUnsavedChanges(false);
            if (pendingNavigation) pendingNavigation();
            setPendingNavigation(null);
            setShowUnsavedModal(false);
        }
    };

    const cancelNavigation = () => {
        setPendingNavigation(null);
        setShowUnsavedModal(false);
    };

    const openProject = (id: string) => {
        setCurrentProjectId(id);
        setAppPage('BUILDER');
    };

    const createProject = async (templateId?: string, customName?: string) => {
        const myProjects = projects.filter(p => p.ownerId === user?.id);
        const userPlanConfig = plans.find(p => p.id === user?.plan) || plans[0];

        if (myProjects.length >= userPlanConfig.projectLimit) {
            setShowProjectLimitModal(true);
            return;
        }

        let initialNodes = [];
        let initialEdges = [];
        let template = PROJECT_TEMPLATES.find(t => t.id === templateId);
        if (!template) {
            template = customTemplates.find(t => t.id === templateId);
        }

        if (template) {
            initialNodes = template.nodes;
            initialEdges = template.edges;
        }

        const finalName = customName && customName.trim() !== ''
            ? customName
            : `${t('newProject')} ${projects.length + 1}`;

        const newProj: Project = {
            id: '',
            name: finalName,
            nodes: initialNodes as any,
            edges: initialEdges as any,
            updatedAt: new Date(),
            ownerId: user?.id
        };

        try {
            const created = await api.projects.create(newProj);
            setProjects([...projects, created]);
            openProject(created.id);
        } catch (e) {
            showNotification("Erro ao criar projeto.", 'error');
        }
    };

    const handleRenameActiveProject = async () => {
        if (!currentProjectId) return;
        const project = projects.find(p => p.id === currentProjectId);
        if (!project) return;

        const newName = window.prompt(t('projectName'), project.name);
        if (newName && newName.trim() !== '') {
            setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, name: newName, updatedAt: new Date() } : p));
            try {
                await api.projects.update(currentProjectId, { name: newName });
            } catch (e) {
                console.error("Failed to rename remotely", e);
            }
        }
    };

    const handleDeleteProject = async (id: string) => {
        if (window.confirm("Tem certeza que deseja excluir este projeto?")) {
            try {
                await api.projects.delete(id);
                setProjects(projects.filter(p => p.id !== id));
                if (currentProjectId === id) {
                    setCurrentProjectId(null);
                    setAppPage('PROJECTS');
                }
            } catch (e) {
                showNotification("Erro ao excluir projeto.", 'error');
            }
        }
    };

    const getActiveBanner = () => {
        if (!systemConfig.announcements || systemConfig.announcements.length === 0) return null;

        const now = new Date();
        const viableAnnouncements = systemConfig.announcements.filter(ann => {
            if (!ann.active) return false;
            const start = ann.start ? new Date(ann.start) : null;
            const end = ann.end ? new Date(ann.end) : null;
            const isStarted = !start || now >= start;
            const isNotEnded = !end || now <= end;
            return isStarted && isNotEnded;
        });

        return viableAnnouncements.length > 0 ? viableAnnouncements[0] : null;
    };

    const activeBanner = getActiveBanner();

    // --- MAINTENANCE MODE SCREEN ---
    // Updated condition to explicitly exclude 'AUTH' view so the button works
    if (systemConfig.maintenanceMode && !user?.isSystemAdmin && currentView !== 'ADMIN' && currentView !== 'AUTH') {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Wrench size={48} className="text-amber-500" />
                </div>
                <h1 className="text-4xl font-bold mb-4">Sistema em Manutenção</h1>
                <p className="text-slate-400 max-w-md text-lg">
                    Estamos realizando melhorias essenciais. O sistema voltará em breve. Agradecemos a paciência.
                </p>

                <button
                    onClick={() => setCurrentView('AUTH')}
                    className="mt-8 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-white rounded-lg font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                    <Lock size={16} />
                    Acesso Administrativo
                </button>
            </div>
        );
    }

    // --- RENDER ---
    if (currentView === 'SHARED' && sharedProject) {
        return (
            <div className={`flex flex-col h-screen overflow-hidden ${isDark ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
                <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <GitGraph className="text-white" size={18} />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">{sharedProject.name}</h1>
                            <p className="text-xs text-slate-500">Visualização Pública • Modo Apresentação</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => { window.history.replaceState(null, '', '/'); setCurrentView('LANDING'); }}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm shadow-md transition-all"
                        >
                            Criar meu Mapa
                        </button>
                    </div>
                </header>
                <div className="flex-1 overflow-hidden relative">
                    <FlowCanvasWrapped
                        project={sharedProject}
                        onSaveProject={() => { }}
                        onUnsavedChanges={() => { }}
                        isDark={isDark}
                        toggleTheme={() => setIsDark(!isDark)}
                        isPresentationMode={true}
                        showNotesInPresentation={true}
                        t={t}
                        userPlan={'FREE'}
                        isSharedView={true}
                    />
                </div>
            </div>
        );
    }

    if (currentView === 'LANDING') {
        return (
            <LandingPage
                onLoginClick={() => { setAuthReturnView('APP'); setCurrentView('AUTH'); }}
                onGetStartedClick={() => { setAuthReturnView('APP'); setCurrentView('AUTH'); }}
                onRoadmapClick={() => { setCurrentView('ROADMAP'); }}
                onNavigate={(view) => setCurrentView(view)}
                lang={lang}
                setLang={setLang}
                t={t}
                plans={plans}
                systemConfig={systemConfig}
            />
        );
    }

    if (currentView === 'GALLERY') {
        return (
            <PublicGallery
                onBack={() => setCurrentView('LANDING')}
                onUseTemplate={() => { setAuthReturnView('APP'); setCurrentView('AUTH'); }}
                t={t}
            />
        );
    }

    if (currentView === 'ICONS') {
        return (
            <PublicIcons
                onBack={() => setCurrentView('LANDING')}
                t={t}
            />
        );
    }

    if (currentView === 'AUTH') {
        return (
            <AuthPage
                onAuthSuccess={handleLogin}
                onBack={() => setCurrentView('LANDING')}
                t={t}
                lang={lang}
                customSubtitle={authReturnView === 'ROADMAP' ? t('loginRequiredMsg') : undefined}
            />
        );
    }

    if (currentView === 'ROADMAP') {
        return (
            <RoadmapPage
                onBack={() => setCurrentView(user ? 'APP' : 'LANDING')}
                feedbacks={feedbacks}
                onSubmitFeedback={handleSubmitFeedback}
                onVote={handleVoteFeedback}
                onAddComment={handleAddComment}
                isAuthenticated={!!user}
                currentUser={user}
                onLoginRequest={() => { setAuthReturnView('ROADMAP'); setCurrentView('AUTH'); }}
                t={t}
                isDark={isDark}
            />
        )
    }

    if (currentView === 'ADMIN' && user?.isSystemAdmin) {
        return (
            <MasterAdminDashboard
                onBack={() => { setCurrentView('APP'); }}
                feedbacks={feedbacks}
                onUpdateStatus={handleAdminUpdateFeedbackStatus}
                onDeleteFeedback={handleAdminDeleteFeedback}
                onUpdateFeedback={handleAdminUpdateFeedback}
                onReplyFeedback={handleAddComment}
                onDeleteComment={handleAdminDeleteComment}
                users={allUsers}
                onUpdateUser={handleAdminUpdateUser}
                onDeleteUser={handleAdminDeleteUser}
                onCreateUser={handleAdminCreateUser}
                onImpersonate={handleAdminImpersonate}
                plans={plans}
                onUpdatePlan={handleAdminUpdatePlan}
                onDeletePlan={handleAdminDeletePlan}
                onCreatePlan={handleAdminCreatePlan}
                systemConfig={systemConfig}
                onUpdateSystemConfig={handleUpdateSystemConfig}
                t={t}
            />
        )
    }

    // --- APP LAYOUT ---
    return (
        <div className={`flex h-screen overflow-hidden ${isDark ? 'dark' : ''}`}>

            {/* GLOBAL ANNOUNCEMENT BANNER */}
            {activeBanner && (
                <div className="fixed top-0 left-0 right-0 z-[9999] bg-indigo-600 text-white text-sm font-bold text-center py-2 px-4 shadow-md flex items-center justify-center gap-2">
                    <AlertCircle size={16} />
                    {activeBanner.message}
                </div>
            )}

            {/* TOAST NOTIFICATION */}
            {toast && toast.show && (
                <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[300] animate-fade-in-up">
                    <div className={`flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border ${toast.type === 'success'
                            ? 'bg-green-600 text-white border-green-500'
                            : 'bg-red-600 text-white border-red-500'
                        }`}>
                        {toast.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
                        <span className="font-bold">{toast.message}</span>
                        <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* UNSAVED CHANGES MODAL */}
            {showUnsavedModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 animate-fade-in-up">
                        <div className="flex items-center gap-3 text-amber-500 mb-4">
                            <AlertTriangle size={24} />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('unsavedModalTitle')}</h3>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-8">{t('unsavedModalDesc')}</p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => confirmNavigation(true)}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                            >
                                <SaveIcon size={18} /> {t('saveAndExit')}
                            </button>
                            <button
                                onClick={() => confirmNavigation(false)}
                                className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl font-bold"
                            >
                                {t('discardChanges')}
                            </button>
                            <button
                                onClick={cancelNavigation}
                                className="w-full py-3 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
                            >
                                {t('keepEditing')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PROJECT LIMIT MODAL */}
            {showProjectLimitModal && (
                <UpgradeModal
                    onClose={() => setShowProjectLimitModal(false)}
                    onUpgrade={() => {
                        showNotification("Redirecionando para página de checkout...");
                        setShowProjectLimitModal(false);
                    }}
                    isDark={isDark}
                    limitType="PROJECTS"
                    plans={plans} // Pass dynamic plans
                    userPlan={user?.plan}
                />
            )}

            {/* Main Sidebar */}
            <aside
                className={`bg-slate-900 text-white flex flex-col justify-between transition-all duration-300 shrink-0 z-50 overflow-visible
            w-20 ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
            ${activeBanner ? 'mt-9' : ''} /* Adjust for banner */
        `}
            >
                <div>
                    {/* Sidebar Header with Toggle */}
                    <div className={`h-16 flex items-center border-b border-slate-800 transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-4 lg:px-6'}`}>
                        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-full' : ''}`}>
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                                <GitGraph className="text-white" size={18} />
                            </div>
                            <span className={`ml-3 font-bold text-lg tracking-tight ${isSidebarCollapsed ? 'hidden' : 'hidden lg:block'}`}>FluxFunnel</span>
                        </div>

                        {/* Collapse Button - Visible only on Desktop */}
                        <button
                            onClick={toggleSidebar}
                            className={`hidden lg:flex p-1 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ${isSidebarCollapsed ? 'hidden' : 'block'}`}
                            title="Collapse Sidebar"
                        >
                            <ChevronLeft size={16} />
                        </button>
                    </div>

                    {/* Mobile/Collapsed specific toggle placement (if needed) or simple toggle when collapsed */}
                    {isSidebarCollapsed && (
                        <div className="hidden lg:flex justify-center py-2 border-b border-slate-800">
                            <button
                                onClick={toggleSidebar}
                                className="p-1 rounded-full text-slate-400 hover:bg-slate-800 hover:text-white"
                                title="Expand Sidebar"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}

                    <div className="p-2 lg:p-4 space-y-2">
                        {[
                            { id: 'PROJECTS', icon: <LayoutDashboard size={20} />, label: t('projects') },
                            { id: 'BUILDER', icon: <Workflow size={20} />, label: t('footerLinkBuilder') },
                            { id: 'TEAM', icon: <Users size={20} />, label: t('team') },
                            { id: 'SETTINGS', icon: <Settings size={20} />, label: t('settings') }
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => attemptNavigation(() => {
                                    // Special case: clicking Builder when no project selected goes to projects
                                    if (item.id === 'BUILDER' && !currentProjectId) {
                                        setAppPage('PROJECTS');
                                    } else {
                                        setAppPage(item.id as AppPage);
                                    }
                                })}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                   ${isSidebarCollapsed ? 'justify-center' : 'justify-center lg:justify-start lg:px-4'}
                   ${appPage === item.id
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
                                title={item.label}
                            >
                                {item.icon}
                                <span className={`hidden font-medium ${isSidebarCollapsed ? '' : 'lg:block'}`}>{item.label}</span>

                                {/* Selection indicator bubble for Builder when collapsed/mobile */}
                                {item.id === 'BUILDER' && !currentProjectId && !isSidebarCollapsed && (
                                    <span className="hidden lg:block ml-auto text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">Select Project</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-800 relative">
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-colors ${isSidebarCollapsed ? 'justify-center' : ''}`}
                        >
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-sm font-bold shadow-inner border border-white/10 shrink-0">
                                {user?.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className={`hidden text-left overflow-hidden ${isSidebarCollapsed ? '' : 'lg:block'}`}>
                                <p className="text-sm font-bold truncate">{user?.name}</p>
                                <p className="text-xs text-slate-400 truncate">{user?.plan} Plan</p>
                            </div>
                        </button>

                        {/* Profile Menu Popover */}
                        {isProfileMenuOpen && (
                            <div className="absolute bottom-full left-0 w-64 mb-4 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-fade-in-up z-[100]">
                                <div className="p-4 border-b border-slate-700">
                                    <p className="text-white font-bold truncate">{user?.name}</p>
                                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                                </div>
                                <button
                                    onClick={() => { attemptNavigation(() => setAppPage('SETTINGS')); setIsProfileMenuOpen(false); }}
                                    className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-3 transition-colors"
                                >
                                    <Settings size={16} /> {t('settings')}
                                </button>
                                {user?.isSystemAdmin && (
                                    <button
                                        onClick={() => { attemptNavigation(() => setCurrentView('ADMIN')); setIsProfileMenuOpen(false); }}
                                        className="w-full text-left px-4 py-3 text-sm text-amber-400 hover:bg-slate-700/50 flex items-center gap-3 transition-colors"
                                    >
                                        <Crown size={16} /> Admin Dashboard
                                    </button>
                                )}
                                <div className="border-t border-slate-700/50">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                                    >
                                        <LogOut size={16} /> {t('signOut')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={`flex-1 flex flex-col h-full relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-50'} ${activeBanner ? 'mt-9' : ''}`}>

                {/* Top Header (Mobile/Context) */}
                <header className={`h-16 flex items-center justify-between px-6 border-b shrink-0 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center gap-3">
                        <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            {appPage === 'PROJECTS' && t('projects')}
                            {appPage === 'SETTINGS' && t('settings')}
                            {appPage === 'TEAM' && t('team')}
                            {appPage === 'BUILDER' && (
                                <span className="flex items-center gap-2">
                                    {activeProject ? (
                                        <>
                                            <span className="text-slate-500 cursor-pointer hover:text-indigo-500" onClick={() => attemptNavigation(() => setAppPage('PROJECTS'))}>{t('projects')} /</span>
                                            <span className="cursor-pointer hover:underline" onClick={handleRenameActiveProject}>{activeProject.name}</span>
                                            <button onClick={handleRenameActiveProject} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400">
                                                <Pencil size={14} />
                                            </button>
                                            {hasUnsavedChanges && <span className="text-xs text-amber-500 animate-pulse font-medium">{t('unsavedChanges')}</span>}
                                        </>
                                    ) : t('noProjectSelected')}
                                </span>
                            )}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        {appPage === 'BUILDER' && activeProject && (
                            <>
                                {/* AI AUDIT BUTTON - Styled as a Tool not Chat */}
                                {/* Only visible for PREMIUM plan */}
                                {user?.plan === 'PREMIUM' && (
                                    <button
                                        onClick={() => setShowAIAssistant(!showAIAssistant)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all
                                  ${showAIAssistant
                                                ? 'bg-purple-600 text-white shadow-lg'
                                                : 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200'}
                              `}
                                        title="Audit Strategy"
                                    >
                                        <Sparkles size={16} />
                                        <span className="hidden sm:inline">IA Audit</span>
                                    </button>
                                )}

                                <button
                                    onClick={() => setAppMode(prev => prev === AppMode.BUILDER ? AppMode.PRESENTATION : AppMode.BUILDER)}
                                    className={`p-2 rounded-lg transition-colors ${appMode === AppMode.PRESENTATION ? 'bg-green-100 text-green-700' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
                                    title={t('present')}
                                >
                                    <Presentation size={20} />
                                </button>
                                {appMode === AppMode.PRESENTATION && (
                                    <button
                                        onClick={() => setShowNotes(!showNotes)}
                                        className={`p-2 rounded-lg transition-colors ${!showNotes ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'}`}
                                        title={showNotes ? "Ocultar Notas" : "Mostrar Notas"}
                                    >
                                        {showNotes ? <Eye size={20} /> : <EyeOff size={20} />}
                                    </button>
                                )}
                            </>
                        )}
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                        <button onClick={() => setCurrentView('ROADMAP')} className="text-sm font-bold text-indigo-600 hover:text-indigo-500">
                            Roadmap
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-hidden relative flex">
                    <div className="flex-1 h-full relative">
                        {appPage === 'PROJECTS' && (
                            <ProjectsDashboard
                                projects={userVisibleProjects}
                                onCreateProject={createProject}
                                onOpenProject={openProject}
                                onDeleteProject={handleDeleteProject}
                                isDark={isDark}
                                t={t}
                                userPlan={user?.plan || 'FREE'}
                                customTemplates={customTemplates}
                                onSaveAsTemplate={(project) => handleSaveAsTemplate(project.nodes, project.edges, project.name)}
                            />
                        )}

                        {appPage === 'TEAM' && user && (
                            <TeamDashboard
                                members={teamMembers}
                                onInviteMember={handleInviteMember}
                                onUpdateRole={handleUpdateMemberRole}
                                onRemoveMember={handleRemoveMember}
                                onUpgrade={() => setShowProjectLimitModal(true)} // REUSE UPGRADE MODAL TRIGGER
                                plan={user.plan}
                                maxMembers={getMaxTeamMembers(user.plan)} // Use proper maxMembers
                                isDark={isDark}
                                t={t}
                            />
                        )}

                        {appPage === 'BUILDER' && (
                            activeProject ? (
                                <div className="w-full h-full relative">
                                    <FlowCanvasWrapped
                                        project={activeProject}
                                        onSaveProject={triggerSaveProject}
                                        onSaveTemplate={(nodes, edges, name) => handleSaveAsTemplate(nodes, edges, name)}
                                        onUnsavedChanges={() => setHasUnsavedChanges(true)}
                                        triggerSaveSignal={saveSignal}
                                        isDark={isDark}
                                        toggleTheme={() => setIsDark(!isDark)}
                                        isPresentationMode={appMode === AppMode.PRESENTATION}
                                        showNotesInPresentation={showNotes}
                                        t={t}
                                        userPlan={user?.plan || 'FREE'}
                                        showAIAssistant={showAIAssistant}
                                        onToggleAIAssistant={() => setShowAIAssistant(!showAIAssistant)}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <Folder size={64} className="mb-4 opacity-50" />
                                    <p>{t('noProjectSelected')}</p>
                                    <button onClick={() => setAppPage('PROJECTS')} className="mt-4 text-indigo-500 font-bold hover:underline">
                                        {t('backToProjects')}
                                    </button>
                                </div>
                            )
                        )}

                        {appPage === 'SETTINGS' && user && (
                            <SettingsDashboard
                                user={user}
                                onUpdateUser={handleUpdateUser}
                                isDark={isDark}
                                toggleTheme={() => setIsDark(!isDark)}
                                lang={lang}
                                setLang={setLang}
                                t={t}
                                projectsCount={userVisibleProjects.length} // Pass project count for usage metrics
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
