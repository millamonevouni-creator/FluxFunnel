
import React, { useState, useEffect } from 'react';
import { Plus, Folder, Clock, Trash2, Edit, Layout, ArrowRight, X, Type, ChevronLeft, Sparkles, Lock, BookmarkPlus, ShoppingBag, Send, AlertCircle } from 'lucide-react';
import { Project, Template, UserPlan } from '../types';
import { PROJECT_TEMPLATES } from '../constants';
import { api } from '../services/api';

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
}

const ProjectsDashboard = ({ 
    projects, onCreateProject, onOpenProject, onDeleteProject, isDark, t, 
    userPlan = 'FREE', customTemplates = [], onSaveAsTemplate 
}: ProjectsDashboardProps) => {
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [creationStep, setCreationStep] = useState<'SELECT' | 'NAME'>('SELECT');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [templateTab, setTemplateTab] = useState<'SYSTEM' | 'CUSTOM'>('SYSTEM');
  
  const bgCard = isDark ? 'bg-slate-800 border-slate-700 hover:border-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-400';
  const textTitle = isDark ? 'text-white' : 'text-slate-900';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-500';

  const handleShareToMarketplace = async (project: Project) => {
      if (userPlan !== 'PREMIUM') {
          alert(t('premiumOnly'));
          return;
      }
      
      const confirmMsg = "Sua estratégia passará por uma auditoria antes de ficar disponível publicamente no Marketplace. Durante esse tempo, apenas você verá o status PENDENTE. Continuar?";
      if (window.confirm(confirmMsg)) {
          try {
              await api.templates.submitToMarketplace({
                  customLabel: project.name,
                  customDescription: `Arquitetura estratégica compartilhada por um membro Premium da comunidade FluxFunnel.`,
                  nodes: project.nodes,
                  edges: project.edges,
                  authorName: 'Usuário Premium'
              });
              alert(t('publishSuccess'));
          } catch (e) {
              alert("Erro ao enviar para o Marketplace.");
          }
      }
  };

  const handleCreateClick = () => {
      setNewProjectName('');
      setCreationStep('SELECT');
      setSelectedTemplateId(null);
      setIsTemplateModalOpen(true);
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

  // Filter templates that the current user owns and are public (marketplace submissions)
  const mySubmissions = customTemplates.filter(t => t.isPublic);

  return (
    <div className={`flex-1 overflow-y-auto h-full p-8 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className={`text-3xl font-bold ${textTitle} mb-2`}>{t('projects')}</h2>
            <p className={textSub}>{t('projectsDesc')}</p>
          </div>
          <button 
            onClick={handleCreateClick}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg hover:shadow-indigo-500/20 transition-all transform hover:-translate-y-1"
          >
            <Plus size={20} />
            {t('newProject')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

          {projects.map((project) => {
            // Find if this project has a linked template in marketplace
            const submission = mySubmissions.find(s => s.customLabel === project.name);
            
            return (
                <div 
                  key={project.id}
                  className={`relative flex flex-col p-6 rounded-2xl border transition-all duration-300 group h-[220px] ${bgCard} shadow-sm hover:shadow-xl`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-700 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                      <Layout size={24} />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                          onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title={t('deleteBtn')}
                        >
                          <Trash2 size={18} />
                        </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                      <h3 className={`text-xl font-bold ${textTitle} truncate`}>{project.name}</h3>
                      {submission && (
                          <div className={`shrink-0 flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                              submission.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                              submission.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                              'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`} title={`Status no Marketplace: ${submission.status || 'PENDENTE'}`}>
                              {submission.status === 'PENDING' || !submission.status ? <Clock size={10}/> : null}
                              {submission.status || 'PENDENTE'}
                          </div>
                      )}
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
            );
          })}
        </div>

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
      </div>

      {isTemplateModalOpen && (
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
                      <button onClick={() => setIsTemplateModalOpen(false)} className={`p-2 rounded-full ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                          <X size={24} />
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
                                              <button key={template.id} onClick={() => !isLocked && handleTemplateSelect(template.id)} className={`group relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all h-[200px] text-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} ${!isLocked ? `hover:border-indigo-500 ${isDark ? 'hover:bg-slate-750' : 'hover:bg-white hover:shadow-lg'}` : 'opacity-70 cursor-not-allowed'}`}>
                                                  {isLocked && <div className="absolute top-3 right-3 bg-black/50 p-1.5 rounded-full backdrop-blur-sm border border-white/10"><Lock size={14} className="text-white" /></div>}
                                                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform ${!isLocked && 'group-hover:scale-110'} ${isDark ? 'bg-slate-900 shadow-inner' : 'bg-white shadow-sm border border-slate-100'}`}>{template.icon}</div>
                                                  <h3 className={`text-lg font-bold mb-2 ${textTitle}`}>{getTemplateName(template)}</h3>
                                                  <p className={`text-xs line-clamp-2 px-2 ${textSub}`}>{getTemplateDesc(template)}</p>
                                              </button>
                                          );
                                      })
                                  ) : (
                                      customTemplates.map(template => (
                                          <button key={template.id} onClick={() => handleTemplateSelect(template.id)} className={`group relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all h-[200px] text-center ${isDark ? 'bg-slate-800 border-slate-700 hover:border-indigo-500 hover:bg-slate-750' : 'bg-slate-50 border-slate-200 hover:border-indigo-500 hover:bg-white hover:shadow-lg'}`}>
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
      )}
    </div>
  );
};

export default ProjectsDashboard;
