import React, { useState, useEffect } from 'react';
import { Plus, Folder, Clock, Trash2, Edit, Layout, ArrowRight, X, Type, ChevronLeft, Sparkles, Lock, BookmarkPlus, Share2, ShoppingBag, Send, AlertCircle, Check } from 'lucide-react';
import { Project, Template, UserPlan } from '../types';
import { PROJECT_TEMPLATES } from '../constants';
import { api } from '../services/api_fixed';

interface ProjectsDashboardProps {
    projects: Project[];
    onCreateProject: (templateId?: string, name?: string) => void;
    onOpenProject: (id: string) => void;
    onDeleteProject: (id: string) => void;
    isDark: boolean;
    t: (key: any) => string;
    userPlan?: UserPlan;
    customTemplates?: Template[];
    onSaveAsTemplate?: (project: Project) => void;
    onRenameProject?: (id: string, newName: string) => Promise<void>;
    onRefreshTemplates?: () => Promise<void>;
    showNotification?: (msg: string, type?: 'success' | 'error') => void;
    projectsLimit?: number;
    onUpgrade?: () => void;
}

const ProjectsDashboard = ({
    projects, onCreateProject, onOpenProject, onDeleteProject, isDark, t,
    userPlan = 'FREE', customTemplates = [], onSaveAsTemplate, onRenameProject, onRefreshTemplates,
    showNotification, projectsLimit = 3, onUpgrade
}: ProjectsDashboardProps) => {
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [creationStep, setCreationStep] = useState<'SELECT' | 'NAME'>('SELECT');
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

    const [newProjectName, setNewProjectName] = useState('');
    const [renamingProject, setRenamingProject] = useState<{ id: string, name: string } | null>(null);
    const [templateTab, setTemplateTab] = useState<'SYSTEM' | 'CUSTOM'>('SYSTEM');
    const [editingSubmission, setEditingSubmission] = useState<{ id: string, name: string, desc: string } | null>(null);
    const [deletingItem, setDeletingItem] = useState<{ type: 'PROJECT' | 'TEMPLATE' | 'PUBLICATION', id: string, name: string } | null>(null);
    const [sharingItem, setSharingItem] = useState<Project | null>(null);
    const [presentationShareProject, setPresentationShareProject] = useState<Project | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    // New Dashboard Tabs
    const [dashboardTab, setDashboardTab] = useState<'PROJECTS' | 'TEMPLATES' | 'MARKETPLACE'>('PROJECTS');

    const bgCard = isDark ? 'bg-slate-800 border-slate-700 hover:border-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-400';
    const textTitle = isDark ? 'text-white' : 'text-slate-900';
    const textSub = isDark ? 'text-slate-400' : 'text-slate-500';

    const handleCreateClick = () => {
        if (projects.length >= projectsLimit) {
            if (onUpgrade) {
                onUpgrade();
            } else {
                showNotification?.(t('maxProjectsReached') || 'Limite de projetos atingido', 'error');
            }
            return;
        }
        setNewProjectName('');
        setCreationStep('SELECT');
        setSelectedTemplateId(null);
        setIsTemplateModalOpen(true);
    };

    const handleShareToMarketplace = (project: Project) => {
        if (userPlan !== 'PREMIUM') {
            showNotification?.(t('premiumOnly'), 'error');
            return;
        }
        setSharingItem(project);
    };

    const handleTemplateSelect = (templateId: string) => {
        const customTemplate = customTemplates?.find(t => t.id === templateId);
        if (customTemplate) {
            onCreateProject(templateId, customTemplate.customLabel || "Novo Projeto");
            setIsTemplateModalOpen(false);
        } else {
            setSelectedTemplateId(templateId);
            setCreationStep('NAME');
            if (!newProjectName) {
                setNewProjectName(`${t('newProject')} ${projects.length + 1}`);
            }
        }
    };

    const handleFinalCreate = () => {
        onCreateProject(selectedTemplateId || 'blank', newProjectName);
        setIsTemplateModalOpen(false);
    };

    const handleBackToSelect = () => {
        setCreationStep('SELECT');
    };

    const getTemplateName = (tpl: Template) => tpl.customLabel || t(tpl.labelKey);
    const getTemplateDesc = (tpl: Template) => tpl.customDescription || t(tpl.descriptionKey);

    // Split templates into Private (My Models) and Public (Marketplace Submissions)
    const myTemplates = customTemplates.filter(t => !t.isPublic);
    const mySubmissions = customTemplates.filter(t => t.isPublic);

    return (
        <div className={`flex-1 overflow-y-auto h-full p-8 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h2 className={`text-3xl font-bold ${textTitle} mb-2`}>{t('projects')}</h2>
                        <p className={textSub}>{t('projectsDesc')}</p>
                    </div>

                    {/* Main Action based on Tab */}
                    {dashboardTab === 'PROJECTS' && (
                        <button
                            onClick={handleCreateClick}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg hover:shadow-indigo-500/20 transition-all transform hover:-translate-y-1"
                        >
                            <Plus size={20} />
                            {t('newProject')}
                        </button>
                    )}
                </div>

                {/* Dashboard Tabs */}
                <div className="flex gap-1 mb-8 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setDashboardTab('PROJECTS')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                ${dashboardTab === 'PROJECTS' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <Layout size={16} /> Meus Projetos
                    </button>
                    <button
                        onClick={() => setDashboardTab('TEMPLATES')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                ${dashboardTab === 'TEMPLATES' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <Folder size={16} /> Meus Modelos
                    </button>
                    <button
                        onClick={() => setDashboardTab('MARKETPLACE')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                ${dashboardTab === 'MARKETPLACE' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <ShoppingBag size={16} /> Minhas Publicações
                    </button>
                </div>


                {/* PROJECTS TAB */}
                {dashboardTab === 'PROJECTS' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                        <button
                            onClick={handleCreateClick}
                            className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all group h-[220px]
                ${isDark ? 'border-slate-700 hover:border-indigo-500 hover:bg-slate-800/50' : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50'}
                `}
                        >
                            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Plus size={32} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className={`font-bold ${textTitle} group-hover:text-indigo-600`}>{t('createVisualShortcut')}</span>
                        </button>

                        {projects.map((project) => (
                            <div
                                key={project.id}
                                className={`relative flex flex-col p-6 rounded-2xl border transition-all duration-300 group h-[220px] ${bgCard} shadow-sm hover:shadow-xl`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-700 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                        <Layout size={24} />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setRenamingProject({ id: project.id, name: project.name }); }}
                                            className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                            title="Renomear"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (userPlan !== 'PREMIUM') {
                                                    onUpgrade?.();
                                                    return;
                                                }
                                                setPresentationShareProject(project);
                                                setIsCopied(false);
                                            }}
                                            className={`p-2 hover:bg-slate-100 dark:hover:bg-indigo-900/20 rounded-lg transition-colors ${userPlan === 'PREMIUM' ? 'text-slate-400 hover:text-indigo-500' : 'text-slate-300 hover:text-amber-500'}`}
                                            title={userPlan === 'PREMIUM' ? "Copiar Link de Apresentação" : "Recurso Premium (Bloqueado)"}
                                        >
                                            {userPlan === 'PREMIUM' ? <Share2 size={18} /> : <Lock size={18} />}
                                        </button>
                                        {userPlan === 'PREMIUM' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleShareToMarketplace(project); }}
                                                className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                                title={t('shareTemplate')}
                                            >
                                                <Send size={18} />
                                            </button>
                                        )}
                                        {onSaveAsTemplate && userPlan !== 'FREE' && (
                                            <button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSaveAsTemplate(project); }}
                                                className="p-2 text-slate-400 hover:text-purple-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                                title={t('saveAsTemplate')}
                                            >
                                                <BookmarkPlus size={18} />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setDeletingItem({ type: 'PROJECT', id: project.id, name: project.name }); }}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title={t('deleteBtn')}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className={`text-xl font-bold ${textTitle} truncate`}>{project.name}</h3>
                                </div>

                                <div className={`flex items-center gap-2 text-xs ${textSub} mb-auto`}>
                                    <Clock size={12} />
                                    {t('editedAt')}: {new Date(project.updatedAt).toLocaleDateString()}
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                    <span className="text-xs font-medium px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
                                        {project.nodes.length} {t('elementsCount')}
                                    </span>
                                    <button
                                        onClick={() => onOpenProject(project.id)}
                                        className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                                    >
                                        {t('openBtn')} <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* TEMPLATES TAB */}
                {dashboardTab === 'TEMPLATES' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                        <button
                            onClick={() => { setCreationStep('SELECT'); setIsTemplateModalOpen(true); }} // Shortcut to open modal directly? Or maybe specific action
                            className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all group h-[220px]
                    ${isDark ? 'border-slate-700 hover:border-indigo-500 hover:bg-slate-800/50' : 'border-slate-300 hover:border-indigo-500 hover:bg-indigo-50'}
                    `}
                        >
                            <p className={textSub}>Salve projetos como Modelo para aparecerem aqui.</p>
                        </button>

                        {myTemplates.map(tpl => (
                            <div key={tpl.id} className={`relative flex flex-col p-6 rounded-2xl border transition-all duration-300 group h-[220px] ${bgCard} shadow-sm hover:shadow-xl`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-700 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                                        <Folder size={24} />
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeletingItem({ type: 'TEMPLATE', id: tpl.id, name: tpl.customLabel || 'Modelo' });
                                            }}
                                            className="p-2 text-slate-400 hover:text-red-500 rounded-lg"
                                            title="Excluir"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className={`text-xl font-bold ${textTitle} truncate mb-1`}>{tpl.customLabel}</h3>
                                <p className={`text-xs ${textSub} line-clamp-3 mb-auto`}>{tpl.customDescription || "Sem descrição."}</p>

                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                    <span className="text-xs font-medium px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">Modelo Pessoal</span>
                                    <button onClick={() => handleTemplateSelect(tpl.id)} className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                                        Usar <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* RENAME MODAL */}
                {renamingProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up">
                        <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                            <h3 className={`text-xl font-bold mb-4 ${textTitle}`}>Renomear Projeto</h3>
                            <input
                                type="text"
                                value={renamingProject.name}
                                onChange={e => setRenamingProject(prev => prev ? { ...prev, name: e.target.value } : null)}
                                className={`w-full p-3 rounded-xl border mb-6 text-lg font-medium outline-none focus:border-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                                placeholder="Nome do projeto"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        onRenameProject?.(renamingProject.id, renamingProject.name);
                                        setRenamingProject(null);
                                    }
                                }}
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setRenamingProject(null)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-bold">Cancelar</button>
                                <button onClick={() => { onRenameProject?.(renamingProject.id, renamingProject.name); setRenamingProject(null); }} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/20">Salvar</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MARKETPLACE SUBMISSIONS TAB */}
                {dashboardTab === 'MARKETPLACE' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                        {mySubmissions.length === 0 && (
                            <div className="col-span-full text-center py-20 text-slate-400">
                                <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
                                <p>Você ainda não enviou nenhuma estratégia para o Marketplace.</p>
                            </div>
                        )}
                        {mySubmissions.map(sub => (
                            <div key={sub.id} className={`relative flex flex-col p-6 rounded-2xl border transition-all duration-300 group h-[300px] ${bgCard} shadow-sm hover:shadow-xl`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-700 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                                        <ShoppingBag size={24} />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className={`shrink-0 flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-full border ${sub.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                            sub.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                            }`}>
                                            {sub.status === 'PENDING' ? 'PENDENTE' : (sub.status || 'PENDENTE')}
                                        </div>

                                        {(!sub.status || sub.status === 'PENDING') && (
                                            <div className="flex gap-1">
                                                <button onClick={(e) => { e.stopPropagation(); setEditingSubmission({ id: sub.id, name: sub.customLabel || '', desc: sub.customDescription || '' }); }} className="p-1.5 text-slate-400 hover:text-indigo-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Editar"><Edit size={16} /></button>
                                                <button onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeletingItem({ type: 'PUBLICATION', id: sub.id, name: sub.customLabel || 'Publicação' });
                                                }} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Excluir"><Trash2 size={16} /></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <h3 className={`text-xl font-bold ${textTitle} truncate mb-4`}>{sub.customLabel}</h3>
                                <p className={`text-sm ${textSub} line-clamp-3 mb-auto mt-2`}>{sub.customDescription}</p>

                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs text-slate-500">
                                    <span>{sub.downloads || 0} Downloads</span>
                                    <span>{sub.nodes.length} Elementos</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {projects.length === 0 && (
                    <div className="mt-16 flex flex-col items-center justify-center text-center">
                        <div className={`w-20 h-20 rounded-full mb-4 flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-400'}`}>
                            <Folder size={40} />
                        </div>
                        <h3 className={`text-lg font-bold ${textTitle} mb-1`}>{t('noMapsCreated')}</h3>
                        <p className={`text-sm ${textSub} mb-6`}>{t('startOrganizingNow')}</p>
                        <button onClick={handleCreateClick} className="text-indigo-600 font-bold hover:underline">
                            {t('createFirstProject')}
                        </button>
                    </div>
                )}

                {editingSubmission && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up">
                        <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                            <h3 className={`text-xl font-bold mb-4 ${textTitle}`}>Editar Publicação</h3>
                            <input type="text" value={editingSubmission.name} onChange={e => setEditingSubmission(prev => prev ? { ...prev, name: e.target.value } : null)} className={`w-full p-3 rounded-xl border mb-4 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`} placeholder="Nome..." />
                            <textarea value={editingSubmission.desc} onChange={e => setEditingSubmission(prev => prev ? { ...prev, desc: e.target.value } : null)} className={`w-full p-3 rounded-xl border mb-4 h-32 resize-none ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`} placeholder="Descrição..." />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setEditingSubmission(null)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-bold">Cancelar</button>
                                <button onClick={async () => {
                                    try {
                                        await api.templates.update(editingSubmission.id, { custom_label: editingSubmission.name, custom_description: editingSubmission.desc });
                                        setEditingSubmission(null);
                                        showNotification?.("Publicação atualizada!");
                                        onRefreshTemplates?.();
                                    } catch (e) {
                                        showNotification?.("Erro ao atualizar", 'error');
                                    }
                                }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">Salvar</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {
                isTemplateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up">
                        <div className={`w-full max-w-4xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[85vh] ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <div className={`px-8 py-6 border-b flex justify-between items-center shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                <div>
                                    <h2 className={`text-2xl font-bold ${textTitle}`}>
                                        {creationStep === 'SELECT' ? t('createMapTitle') : t('projectName')}
                                    </h2>
                                    <p className={textSub}>
                                        {creationStep === 'SELECT' ? t('startOrganizingNow') : "Dê um nome para identificar seu mapa facilmente."}
                                    </p>
                                </div>
                                <button onClick={() => setIsTemplateModalOpen(false)} className={`p-2 rounded-full ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`} title="Fechar" aria-label="Fechar">
                                    <X size={24} aria-hidden="true" />
                                </button>
                            </div>

                            {creationStep === 'SELECT' && (
                                <div className="flex-1 overflow-hidden flex flex-col">
                                    <div className={`flex px-8 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                        <button onClick={() => setTemplateTab('SYSTEM')} className={`py-4 mr-6 text-sm font-bold border-b-2 transition-colors ${templateTab === 'SYSTEM' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{t('systemTemplates')}</button>
                                        <button onClick={() => setTemplateTab('CUSTOM')} className={`py-4 mr-6 text-sm font-bold border-b-2 transition-colors ${templateTab === 'CUSTOM' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{t('myTemplates')}</button>
                                    </div>
                                    <div className="p-8 overflow-y-auto">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {templateTab === 'SYSTEM' ? (
                                                PROJECT_TEMPLATES.map(template => {
                                                    const isLocked = userPlan === 'FREE' && template.isPro;
                                                    return (
                                                        <button
                                                            key={template.id}
                                                            onClick={() => !isLocked && handleTemplateSelect(template.id)}
                                                            className={`group relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all h-[200px] text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} ${!isLocked ? `hover:border-indigo-500 ${isDark ? 'hover:bg-slate-750' : 'hover:bg-white hover:shadow-lg'}` : 'opacity-70 cursor-not-allowed'}`}
                                                            title={getTemplateName(template)}
                                                        >
                                                            {isLocked && <div className="absolute top-3 right-3 bg-black/50 p-1.5 rounded-full backdrop-blur-sm border border-white/10"><Lock size={14} className="text-white" /></div>}
                                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform ${!isLocked && 'group-hover:scale-110'} ${isDark ? 'bg-slate-900 shadow-inner' : 'bg-white shadow-sm border border-slate-100'}`}>{template.icon}</div>
                                                            <h3 className={`text-lg font-bold mb-2 ${textTitle}`}>{getTemplateName(template)}</h3>
                                                            <p className={`text-xs line-clamp-2 px-2 ${textSub}`}>{getTemplateDesc(template)}</p>
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                customTemplates.map(template => (
                                                    <button
                                                        key={template.id}
                                                        onClick={() => handleTemplateSelect(template.id)}
                                                        className={`group relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all h-[200px] text-center ${isDark ? 'bg-slate-800 border-slate-700 hover:border-indigo-500 hover:bg-slate-750' : 'bg-slate-50 border-slate-200 hover:border-indigo-500 hover:bg-white hover:shadow-lg'}`}
                                                        title={getTemplateName(template)}
                                                    >
                                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${isDark ? 'bg-slate-900 shadow-inner' : 'bg-white shadow-sm border border-slate-100'}`}><Folder size={32} className="text-indigo-500" /></div>
                                                        <h3 className={`text-lg font-bold mb-2 ${textTitle}`}>{getTemplateName(template)}</h3>
                                                        <p className={`text-xs line-clamp-2 px-2 ${textSub}`}>{getTemplateDesc(template)}</p>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {creationStep === 'NAME' && (
                                <div className="p-10 flex flex-col items-center justify-center flex-1">
                                    <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}><Layout size={48} /></div>
                                    <div className="w-full max-w-md">
                                        <label className={`block text-sm font-bold mb-2 ml-1 ${textTitle}`}>Nome do Projeto</label>
                                        <div className="relative mb-8">
                                            <Type className={`absolute left-4 top-3.5 ${textSub}`} size={20} />
                                            <input type="text" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="Ex: Funil de Vendas VSL..." className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 outline-none focus:ring-0 transition-all text-lg font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'}`} autoFocus />
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={handleBackToSelect} className={`flex-1 py-3.5 rounded-xl font-bold border-2 transition-all ${isDark ? 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>Voltar</button>
                                            <button onClick={handleFinalCreate} disabled={!newProjectName.trim()} className="flex-[2] py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><Sparkles size={20} /> Criar Projeto</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
            {deletingItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up">
                    <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl relative overflow-hidden ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Excluir {deletingItem.type === 'PROJECT' ? 'Projeto' : deletingItem.type === 'TEMPLATE' ? 'Modelo' : 'Publicação'}?</h3>
                            <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Você está prestes a excluir <strong>"{deletingItem.name}"</strong>. Esta ação não pode ser desfeita.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setDeletingItem(null)}
                                    className={`flex-1 py-3 font-bold rounded-xl border-2 transition-all ${isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            if (deletingItem.type === 'PROJECT') {
                                                await onDeleteProject(deletingItem.id);
                                            } else if (deletingItem.type === 'TEMPLATE') {
                                                await api.templates.delete(deletingItem.id);
                                                showNotification?.("Modelo excluído!", 'success');
                                                onRefreshTemplates?.();
                                            } else if (deletingItem.type === 'PUBLICATION') {
                                                await api.templates.delete(deletingItem.id);
                                                showNotification?.("Publicação excluída!", 'success');
                                                onRefreshTemplates?.();
                                            }
                                            setDeletingItem(null);
                                        } catch (error) {
                                            console.error(error);
                                            showNotification?.("Erro ao excluir item. Verifique permissões.", 'error');
                                        }
                                    }}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-500/25 transition-all"
                                >
                                    Excluir Agora
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {sharingItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up">
                    <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl relative overflow-hidden ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                                <Send size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Publicar no Marketplace?</h3>
                            <p className={`mb-6 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Sua estratégia <strong>"{sharingItem.name}"</strong> passará por uma auditoria antes de ficar pública.
                                <br /><br />
                                Enquanto isso, ela ficará com status <span className="font-bold text-amber-500">PENDENTE</span>.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setSharingItem(null)}
                                    className={`flex-1 py-3 font-bold rounded-xl border-2 transition-all ${isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            await api.templates.submitToMarketplace({
                                                customLabel: sharingItem.name,
                                                customDescription: `Arquitetura estratégica compartilhada por um membro Premium da comunidade FluxFunnel.`,
                                                nodes: sharingItem.nodes,
                                                edges: sharingItem.edges,
                                                authorName: 'Usuário Premium'
                                            });
                                            showNotification?.(t('publishSuccess'), 'success');
                                            onRefreshTemplates?.();
                                            setSharingItem(null);
                                        } catch (e) {
                                            console.error(e);
                                            showNotification?.("Erro ao enviar para o Marketplace.", 'error');
                                        }
                                    }}
                                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all"
                                >
                                    Enviar Agora
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {presentationShareProject && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up">
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
                                    showNotification?.("Link copiado para a área de transferência!", 'success');
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

export default ProjectsDashboard;
