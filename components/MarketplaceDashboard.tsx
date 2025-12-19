
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Star, Download, Crown, Lock, Layout, User, Trash2, AlertCircle, TrendingUp, Sparkles, CheckCircle, Eye, ShieldAlert, X } from 'lucide-react';
import { Template, UserPlan } from '../types';
import { api } from '../services/api';

interface MarketplaceDashboardProps {
  userPlan: UserPlan;
  onDownload: (template: Template) => void;
  isDark: boolean;
  t: (key: any) => string;
}

const MarketplaceDashboard = ({ userPlan, onDownload, isDark, t }: MarketplaceDashboardProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'RATED' | 'DOWNLOADS' | 'FEATURED'>('ALL');
  const [ratingTarget, setRatingTarget] = useState<string | null>(null);
  const [quickLookTemplate, setQuickLookTemplate] = useState<Template | null>(null);

  const fetchMarketplace = async () => {
    setIsLoading(true);
    try {
      const publicTemplates = await api.templates.listPublic();
      setTemplates(publicTemplates);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplace();
  }, []);

  const handleRate = async (id: string, stars: number) => {
      try {
          await api.templates.rate(id, stars);
          setRatingTarget(null);
          fetchMarketplace(); // Refresh stats
          alert("Obrigado pela sua avaliação!");
      } catch (e) {
          alert("Erro ao enviar avaliação.");
      }
  };

  const handleReport = async (id: string) => {
      if (window.confirm(t('reportTemplate') + "?")) {
          alert("Denúncia enviada para a moderação. Obrigado por ajudar a manter o marketplace seguro.");
      }
  };

  const filtered = templates
    .filter(t => t.customLabel?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (activeFilter === 'RATED') return (b.rating || 0) - (a.rating || 0);
      if (activeFilter === 'DOWNLOADS') return (b.downloads || 0) - (a.downloads || 0);
      if (activeFilter === 'FEATURED') return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      return 0;
    });

  const isPremium = userPlan === 'PREMIUM';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textTitle = isDark ? 'text-white' : 'text-slate-900';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-500';

  if (!isPremium) {
    return (
      <div className={`flex-1 h-full flex flex-col items-center justify-center p-8 text-center ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="max-w-md animate-fade-in-up">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/20 rotate-3">
            <Lock size={48} className="text-white" />
          </div>
          <h2 className={`text-4xl font-black mb-4 tracking-tight ${textTitle}`}>{t('premiumOnly')}</h2>
          <p className={`text-lg mb-10 leading-relaxed ${textSub}`}>
            O Marketplace é o centro estratégico da nossa elite. Assine o <strong>Premium</strong> para baixar e compartilhar funis que já geraram milhões.
          </p>
          <button className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black shadow-xl shadow-indigo-500/30 transition-all flex items-center gap-3 mx-auto transform hover:scale-105 active:scale-95">
            <Crown size={24} /> Quero Acesso Premium
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-y-auto h-full p-8 transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header Superior */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                    <ShoppingBag size={28} className="text-white" />
                </div>
                <div>
                    <h2 className={`text-4xl font-black tracking-tight ${textTitle}`}>{t('marketplace')}</h2>
                    <p className={`text-sm font-medium mt-1 ${textSub}`}>{t('marketplaceDesc')}</p>
                </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 p-1 bg-slate-200 dark:bg-slate-800 rounded-xl">
             {[
                 { id: 'ALL', label: 'Recentes' },
                 { id: 'FEATURED', label: 'Destaques', icon: <Sparkles size={12}/> },
                 { id: 'RATED', label: t('topRated'), icon: <Star size={12}/> },
                 { id: 'DOWNLOADS', label: t('mostDownloaded'), icon: <TrendingUp size={12}/> }
             ].map(filter => (
                 <button 
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id as any)}
                    className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-2 ${activeFilter === filter.id ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                 >
                     {filter.icon}
                     {filter.label}
                 </button>
             ))}
          </div>
        </div>

        {/* Barra de Pesquisa Pro */}
        <div className={`mb-12 group p-1 rounded-2xl border shadow-xl flex items-center transition-all ${isDark ? 'bg-slate-900 border-slate-700 focus-within:border-indigo-500' : 'bg-white border-slate-200 focus-within:border-indigo-400'}`}>
            <div className="p-3">
                <Search className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={24} />
            </div>
            <input 
                type="text" 
                placeholder={t('searchTemplates')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none p-4 text-xl font-medium text-slate-800 dark:text-white placeholder-slate-400"
            />
        </div>

        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1,2,3,4,5,6].map(i => (
                    <div key={i} className={`h-[450px] rounded-[2.5rem] animate-pulse ${isDark ? 'bg-slate-900' : 'bg-slate-200'}`}></div>
                ))}
            </div>
        ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <AlertCircle size={64} className="mb-4" />
                <h3 className="text-xl font-bold">Nenhuma estratégia encontrada</h3>
                <p>Tente termos diferentes ou limpe os filtros.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((tpl) => (
                    <div key={tpl.id} className={`group relative flex flex-col rounded-[2.5rem] border shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden ${cardBg} hover:-translate-y-2`}>
                        
                        {/* Featured Badge */}
                        {tpl.isFeatured && (
                            <div className="absolute top-6 left-6 z-10 bg-amber-400 text-amber-950 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                                <Sparkles size={12} /> Destaque
                            </div>
                        )}

                        {/* Preview Area */}
                        <div className="h-56 bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/10 transition-colors duration-700">
                            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
                            <Layout size={80} className="text-slate-300 dark:text-slate-600 group-hover:scale-125 group-hover:text-indigo-400/50 transition-all duration-1000 ease-out" />
                            
                            <div className="absolute bottom-4 right-4 flex gap-2">
                                <button onClick={() => setQuickLookTemplate(tpl)} className="p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 text-indigo-600 transition-all hover:scale-110">
                                    <Eye size={16} />
                                </button>
                                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-[10px] font-black shadow-sm flex items-center gap-2 border dark:border-slate-700">
                                    <Download size={12} className="text-indigo-600" />
                                    {tpl.downloads || 0}
                                </div>
                                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-[10px] font-black shadow-sm flex items-center gap-2 border dark:border-slate-700">
                                    <Star size={12} className="text-amber-500 fill-amber-500" />
                                    {tpl.rating?.toFixed(1) || '0.0'}
                                </div>
                            </div>
                        </div>

                        {/* Conteúdo Info */}
                        <div className="p-8 flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-[10px] font-black uppercase shadow-sm">
                                        {tpl.authorName?.substring(0, 2) || 'FF'}
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">{tpl.authorName || 'Autor Oficial'}</span>
                                </div>
                                <button onClick={() => handleReport(tpl.id)} className="text-slate-400 hover:text-red-500 transition-colors" title={t('reportTemplate')}>
                                    <ShieldAlert size={14} />
                                </button>
                            </div>

                            <h3 className={`text-2xl font-black mb-3 line-clamp-1 leading-tight ${textTitle}`}>{tpl.customLabel}</h3>
                            <p className={`text-sm mb-8 flex-1 line-clamp-3 leading-relaxed font-medium ${textSub}`}>{tpl.customDescription}</p>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => {
                                        onDownload(tpl);
                                        setRatingTarget(tpl.id);
                                    }}
                                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 group-hover:px-6"
                                >
                                    <Download size={20} />
                                    {t('downloadTemplate')}
                                </button>
                            </div>

                            {/* Avaliação Rápida Pós-Download */}
                            {ratingTarget === tpl.id && (
                                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl animate-fade-in-up">
                                    <p className="text-[10px] font-black uppercase text-amber-600 mb-2 text-center">Avalie esta estratégia</p>
                                    <div className="flex justify-center gap-2">
                                        {[1,2,3,4,5].map(star => (
                                            <button 
                                                key={star} 
                                                onClick={() => handleRate(tpl.id, star)}
                                                className="text-amber-400 hover:scale-125 transition-transform"
                                            >
                                                <Star size={24} className="hover:fill-amber-400" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}

        <div className="mt-20 py-12 border-t dark:border-slate-800 flex flex-col items-center text-center">
            <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                <CheckCircle size={32} className="text-green-600" />
            </div>
            <h4 className={`text-2xl font-black mb-2 ${textTitle}`}>Sua estratégia no radar?</h4>
            <p className={`${textSub} max-w-lg mb-8`}>Publique seu melhor funil e torne-se uma referência na comunidade. Projetos aprovados recebem badge de Autor Verificado.</p>
            <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="font-black text-indigo-600 hover:text-indigo-500 underline underline-offset-8"
            >
                Voltar para Meus Projetos e Compartilhar
            </button>
        </div>
      </div>

      {/* QUICK LOOK MODAL */}
      {quickLookTemplate && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/90 backdrop-blur-xl animate-fade-in-up">
              <div className={`w-full max-w-5xl rounded-[3rem] border overflow-hidden flex flex-col h-full ${cardBg}`}>
                  <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                      <div>
                          <h3 className={`text-3xl font-black ${textTitle}`}>{t('quickLook')}: {quickLookTemplate.customLabel}</h3>
                          <p className={textSub}>Estrutura técnica com {quickLookTemplate.nodes.length} elementos.</p>
                      </div>
                      <button onClick={() => setQuickLookTemplate(null)} className="p-4 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-3xl transition-all">
                          <X size={28} />
                      </button>
                  </div>
                  <div className="flex-1 p-10 bg-slate-100/50 dark:bg-slate-950/50 overflow-auto scrollbar-thin">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {quickLookTemplate.nodes.map((node: any) => (
                            <div key={node.id} className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 mb-3">
                                    <Layout size={20} />
                                </div>
                                <span className="text-[9px] font-black uppercase text-indigo-500 mb-1">{node.data.type}</span>
                                <p className="text-[11px] font-bold leading-tight">{node.data.label}</p>
                            </div>
                        ))}
                      </div>
                  </div>
                  <div className="p-8 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-4 bg-white dark:bg-slate-900">
                      <button onClick={() => { onDownload(quickLookTemplate); setQuickLookTemplate(null); }} className="px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                          <Download size={24} /> {t('downloadTemplate')}
                      </button>
                      <button onClick={() => setQuickLookTemplate(null)} className="px-10 py-5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-[2rem] font-black transition-all">
                          Fechar Prévia
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default MarketplaceDashboard;
