
import React, { useState } from 'react';
import { GitGraph, ArrowLeft, ChevronUp, MessageSquare, Plus, CheckCircle, Clock, Search, Filter, Bug, Lightbulb, Zap, X, Lock, LogIn, Send, CornerDownRight, ThumbsUp, User as UserIcon } from 'lucide-react';
import { FeedbackItem, FeedbackType, FeedbackStatus, User } from '../types';

interface RoadmapPageProps {
  onBack: () => void;
  feedbacks: FeedbackItem[];
  onSubmitFeedback: (item: Omit<FeedbackItem, 'id' | 'votes' | 'status' | 'createdAt' | 'comments' | 'votedUserIds'>) => void;
  onVote: (id: string) => void;
  onAddComment: (feedbackId: string, text: string) => void;
  isAuthenticated: boolean;
  currentUser?: User | null;
  onLoginRequest: () => void;
  t: (key: any) => string;
  isDark?: boolean;
}

const RoadmapPage = ({ onBack, feedbacks, onSubmitFeedback, onVote, onAddComment, isAuthenticated, currentUser, onLoginRequest, t, isDark = false }: RoadmapPageProps) => {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // Details / Comment Modal State
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [commentInput, setCommentInput] = useState('');
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | 'ALL'>('ALL');
  const [filterType, setFilterType] = useState<FeedbackType | 'ALL'>('ALL');

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<FeedbackType>('FEATURE');
  const [authorName, setAuthorName] = useState('');

  const checkAuth = (action: () => void) => {
      if (!isAuthenticated) {
          setIsLoginModalOpen(true);
          return;
      }
      action();
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTitle.trim() || !newDesc.trim()) return;
      
      onSubmitFeedback({
          title: newTitle,
          description: newDesc,
          type: newType,
          authorName: authorName || 'Anônimo'
      });
      
      // Reset
      setNewTitle('');
      setNewDesc('');
      setNewType('FEATURE');
      setAuthorName('');
      setIsSubmitModalOpen(false);
  };

  const handlePostComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!commentInput.trim() || !selectedFeedback) return;

      checkAuth(() => {
          onAddComment(selectedFeedback.id, commentInput);
          setCommentInput('');
      });
  };

  // Keep selectedFeedback in sync with the real data from props
  const activeFeedback = selectedFeedback ? feedbacks.find(f => f.id === selectedFeedback.id) || selectedFeedback : null;

  const getStatusStyle = (status: FeedbackStatus) => {
      switch (status) {
          case 'PLANNED': return { label: 'Planejado', bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' };
          case 'IN_PROGRESS': return { label: 'Em Progresso', bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' };
          case 'COMPLETED': return { label: 'Concluído', bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' };
          case 'REJECTED': return { label: 'Arquivado', bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' };
          default: return { label: 'Em Análise', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700' };
      }
  };

  const getTypeIcon = (type: FeedbackType) => {
      switch (type) {
          case 'BUG': return <Bug size={14} className="text-red-500" />;
          case 'FEATURE': return <Zap size={14} className="text-yellow-500 fill-yellow-500" />;
          case 'IMPROVEMENT': return <Lightbulb size={14} className="text-indigo-500" />;
          default: return <MessageSquare size={14} className="text-slate-400" />;
      }
  };

  const getTypeLabel = (type: FeedbackType) => {
      switch (type) {
          case 'BUG': return 'Bug';
          case 'FEATURE': return 'Feature';
          case 'IMPROVEMENT': return 'Melhoria';
          default: return 'Outro';
      }
  };

  // Advanced Filtering
  const filteredFeedbacks = feedbacks
    .filter(item => {
        const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
        const matchesType = filterType === 'ALL' || item.type === filterType;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesType && matchesSearch;
    })
    .sort((a, b) => b.votes - a.votes); // Sort by popularity

  const bgPage = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const bgCard = isDark ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/50' : 'bg-white border-slate-200 hover:border-indigo-300';
  const bgInput = isDark ? 'bg-slate-800 border-slate-700 text-white focus:ring-indigo-500' : 'bg-white border-slate-200 text-slate-900 focus:ring-indigo-500';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`min-h-screen font-sans ${bgPage} transition-colors duration-300 relative overflow-x-hidden`}>
      {/* Background Decor */}
      <div className={`absolute top-0 left-0 w-full h-[500px] pointer-events-none ${isDark ? 'opacity-10' : 'opacity-40'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-200/40 via-slate-50/0 to-transparent"></div>
      </div>

      {/* Navbar */}
      <nav className={`border-b sticky top-0 z-30 backdrop-blur-xl ${isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/80'}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={onBack} className={`flex items-center gap-2 text-sm font-bold transition-colors py-2 pr-4 rounded-lg ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'}`}>
            <ArrowLeft size={18} />
            Voltar
          </button>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                 <GitGraph className="text-white" size={18} />
             </div>
             <span className={`font-bold text-lg tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Roadmap</span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wide mb-4 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800">
                    <SparklesIcon /> Comunidade
                 </div>
                 <h1 className={`text-3xl md:text-4xl font-extrabold mb-3 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                     Sugestões & Melhorias
                 </h1>
                 <p className={`text-lg leading-relaxed ${textSub}`}>
                     Sua opinião molda nosso produto. Vote nas ideias que você mais quer ver ou envie a sua.
                 </p>
            </div>
            <button 
                onClick={() => checkAuth(() => setIsSubmitModalOpen(true))}
                className="shrink-0 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center gap-2"
            >
                <Plus size={18} />
                <span>Nova Sugestão</span>
            </button>
        </div>

        {/* Controls Bar (Sticky & Glass) */}
        <div className={`p-2 rounded-xl shadow-lg border mb-8 flex flex-col md:flex-row gap-3 items-center justify-between sticky top-20 z-20 backdrop-blur-md transition-all ${isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-slate-200 ring-1 ring-slate-100'}`}>
            {/* Search */}
            <div className="relative w-full md:w-96 group">
                <Search className={`absolute left-3.5 top-2.5 transition-colors ${isDark ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-indigo-500'}`} size={16} />
                <input 
                    type="text" 
                    placeholder="Buscar funcionalidades..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg outline-none text-sm font-medium transition-all border bg-transparent ${isDark ? 'border-slate-700 text-white focus:border-indigo-500 focus:bg-slate-900' : 'border-slate-200 text-slate-900 focus:border-indigo-500 focus:bg-slate-50'}`}
                />
            </div>

            {/* Filters */}
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                <div className="relative">
                    <select 
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className={`pl-8 pr-8 py-2 border rounded-lg text-xs font-bold outline-none cursor-pointer transition-all appearance-none ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-700'}`}
                    >
                        <option value="ALL">Tipos</option>
                        <option value="FEATURE">Funcionalidades</option>
                        <option value="BUG">Bugs</option>
                        <option value="IMPROVEMENT">Melhorias</option>
                    </select>
                    <Filter size={12} className={`absolute left-3 top-2.5 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>

                <div className="relative">
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                        className={`pl-8 pr-8 py-2 border rounded-lg text-xs font-bold outline-none cursor-pointer transition-all appearance-none ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-700'}`}
                    >
                        <option value="ALL">Status</option>
                        <option value="PENDING">Em Análise</option>
                        <option value="PLANNED">Planejado</option>
                        <option value="IN_PROGRESS">Em Progresso</option>
                        <option value="COMPLETED">Concluído</option>
                    </select>
                    <Clock size={12} className={`absolute left-3 top-2.5 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
            </div>
        </div>

        {/* FEEDBACK GRID LAYOUT */}
        {filteredFeedbacks.length === 0 ? (
            <div className={`text-center py-24 rounded-3xl border border-dashed flex flex-col items-center justify-center ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-300'}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800' : 'bg-white shadow-sm'}`}>
                    <Search size={24} className={`opacity-50 ${textSub}`} />
                </div>
                <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Nenhum feedback encontrado</h3>
                <p className={`text-sm mb-4 ${textSub}`}>Tente ajustar seus filtros ou seja o primeiro a sugerir algo!</p>
                <button onClick={() => {setSearchQuery(''); setFilterStatus('ALL'); setFilterType('ALL');}} className="text-indigo-600 text-sm font-bold hover:underline">Limpar Filtros</button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFeedbacks.map((item) => {
                    const hasVoted = currentUser && item.votedUserIds && item.votedUserIds.includes(currentUser.id);
                    const statusStyle = getStatusStyle(item.status);

                    return (
                        <div 
                            key={item.id} 
                            onClick={() => setSelectedFeedback(item)}
                            className={`
                                group relative flex flex-col p-5 rounded-2xl border transition-all duration-300 cursor-pointer h-full hover:-translate-y-1 hover:shadow-xl
                                ${bgCard}
                                ${hasVoted ? 'ring-1 ring-indigo-500 shadow-indigo-500/10' : 'shadow-sm'}
                            `}
                        >
                            {/* Card Header: Status & Type */}
                            <div className="flex justify-between items-start mb-3">
                                <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border tracking-wide whitespace-nowrap ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                                    {statusStyle.label}
                                </span>
                                <div className={`p-1.5 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`} title={getTypeLabel(item.type)}>
                                    {getTypeIcon(item.type)}
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="flex-1 mb-4">
                                <h3 className={`text-lg font-bold leading-snug mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {item.title}
                                </h3>
                                <p className={`text-sm leading-relaxed line-clamp-3 ${textSub}`}>
                                    {item.description}
                                </p>
                            </div>

                            {/* Card Footer: Vote & Meta */}
                            <div className={`pt-4 mt-auto border-t flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); checkAuth(() => onVote(item.id)); }}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border
                                        ${hasVoted 
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-inner' 
                                            : `bg-transparent text-slate-500 hover:border-indigo-400 hover:text-indigo-600 dark:text-slate-400 dark:border-slate-700`}
                                    `}
                                >
                                    <ChevronUp size={14} className={hasVoted ? 'stroke-[3px]' : ''} />
                                    <span>{item.votes}</span>
                                </button>

                                <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                                    <div className="flex items-center gap-1" title={`${item.comments?.length || 0} comentários`}>
                                        <MessageSquare size={14} className={item.comments?.length ? 'text-indigo-500' : ''} />
                                        <span>{item.comments?.length || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1" title={new Date(item.createdAt).toLocaleDateString()}>
                                        <Clock size={14} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>

      {/* MODAL: DETAILS & COMMENTS (Pop-up) */}
      {activeFeedback && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in-up">
              <div 
                className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative ${bgCard} ${isDark ? 'bg-slate-900 shadow-slate-900/50' : 'bg-white'}`}
                onClick={(e) => e.stopPropagation()}
              >
                  {/* Modal Header */}
                  <div className={`p-6 border-b flex justify-between items-start flex-shrink-0 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
                      <div className="pr-10">
                          <div className="flex items-center gap-3 mb-3">
                              <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border tracking-wide ${getStatusStyle(activeFeedback.status).bg} ${getStatusStyle(activeFeedback.status).text} ${getStatusStyle(activeFeedback.status).border}`}>
                                  {getStatusStyle(activeFeedback.status).label}
                              </span>
                              <div className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                                  {getTypeIcon(activeFeedback.type)}
                                  <span>{getTypeLabel(activeFeedback.type)}</span>
                              </div>
                          </div>
                          <h3 className={`font-bold text-2xl leading-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeFeedback.title}</h3>
                          <div className={`text-xs flex items-center gap-1 ${textSub}`}>
                              Enviado por <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{activeFeedback.authorName}</span> em {new Date(activeFeedback.createdAt).toLocaleDateString()}
                          </div>
                      </div>
                      <button onClick={() => setSelectedFeedback(null)} className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
                          <X size={24} />
                      </button>
                  </div>

                  {/* Modal Body */}
                  <div className={`flex-1 overflow-y-auto p-8 scrollbar-thin ${isDark ? 'scrollbar-thumb-slate-700' : 'scrollbar-thumb-slate-300'}`}>
                      {/* Description Box */}
                      <div className={`p-6 rounded-xl border mb-8 leading-relaxed text-sm ${isDark ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                          <p className="whitespace-pre-wrap">{activeFeedback.description}</p>
                      </div>

                      {/* Vote Action Area */}
                      <div className="flex items-center justify-between gap-4 mb-10 pb-10 border-b border-dashed border-slate-200 dark:border-slate-800">
                          <div className="flex flex-col">
                              <span className={`text-sm font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Gostou dessa ideia?</span>
                              <span className={`text-xs ${textSub}`}>Dê seu voto para priorizarmos o desenvolvimento.</span>
                          </div>
                          {(() => {
                              const hasVoted = currentUser && activeFeedback.votedUserIds && activeFeedback.votedUserIds.includes(currentUser.id);
                              return (
                                <button 
                                    onClick={() => checkAuth(() => onVote(activeFeedback.id))}
                                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95
                                        ${hasVoted 
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/30' 
                                            : `${isDark ? 'bg-slate-800 border border-slate-700 text-white hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600'}`}
                                    `}
                                >
                                    {hasVoted ? <CheckCircle size={20} /> : <ThumbsUp size={20} />}
                                    <span>{hasVoted ? 'Votado' : 'Apoiar'}</span>
                                    <span className={`ml-2 px-2 py-0.5 rounded text-xs ${hasVoted ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-900'}`}>{activeFeedback.votes}</span>
                                </button>
                              );
                          })()}
                      </div>

                      {/* Comments Section */}
                      <div>
                          <h4 className={`font-bold mb-6 flex items-center gap-2 text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              Discussão <span className={`text-xs px-2.5 py-0.5 rounded-full ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{activeFeedback.comments?.length || 0}</span>
                          </h4>
                          
                          <div className="space-y-6 mb-6">
                              {activeFeedback.comments && activeFeedback.comments.length > 0 ? (
                                  activeFeedback.comments.map((comment) => (
                                      <div key={comment.id} className="flex gap-4 group">
                                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-sm
                                              ${comment.isAdmin ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-slate-400'}
                                          `}>
                                              {comment.authorName.substring(0, 1).toUpperCase()}
                                          </div>
                                          <div className="flex-1">
                                              <div className={`rounded-2xl rounded-tl-none p-4 border transition-colors ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                                  <div className="flex justify-between items-center mb-2">
                                                      <div className="flex items-center gap-2">
                                                          <span className={`font-bold text-sm ${comment.isAdmin ? 'text-indigo-600 dark:text-indigo-400' : (isDark ? 'text-slate-200' : 'text-slate-900')}`}>
                                                              {comment.authorName} 
                                                          </span>
                                                          {comment.isAdmin && <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">ADMIN</span>}
                                                      </div>
                                                      <span className={`text-[10px] font-medium ${textSub}`}>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                  </div>
                                                  <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{comment.text}</p>
                                              </div>
                                          </div>
                                      </div>
                                  ))
                              ) : (
                                  <div className={`text-center py-10 rounded-2xl border border-dashed ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                                      <p className={`text-sm font-medium ${textSub}`}>Sem comentários ainda. Seja o primeiro a compartilhar sua opinião!</p>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>

                  {/* Comment Input Footer */}
                  <div className={`p-5 border-t flex-shrink-0 ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
                      <form onSubmit={handlePostComment} className="flex gap-3 items-end">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mb-1 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                              {isAuthenticated && currentUser ? (
                                  <span className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{currentUser.name.substring(0, 1).toUpperCase()}</span>
                              ) : (
                                  <LogIn size={16} />
                              )}
                          </div>
                          <div className="flex-1 relative">
                              <textarea 
                                  value={commentInput}
                                  onChange={(e) => setCommentInput(e.target.value)}
                                  placeholder={isAuthenticated ? "Escreva um comentário construtivo..." : "Faça login para comentar..."}
                                  className={`w-full border rounded-2xl py-3 pl-4 pr-12 focus:ring-2 outline-none transition-all text-sm resize-none min-h-[50px] max-h-[120px] ${bgInput}`}
                                  rows={1}
                              />
                              <button 
                                  type="submit"
                                  disabled={!commentInput.trim()}
                                  className="absolute right-2 bottom-2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                              >
                                  <Send size={16} />
                              </button>
                          </div>
                      </form>
                  </div>
              </div>
          </div>
      )}

      {/* LOGIN REQUIRED MODAL */}
      {isLoginModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
              <div className={`w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <div className="p-8 text-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isDark ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                          <Lock size={32} />
                      </div>
                      <h3 className={`font-extrabold text-2xl mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Login Necessário</h3>
                      <p className={`text-sm mb-8 leading-relaxed ${textSub}`}>
                          Para garantir a qualidade da nossa comunidade, você precisa estar conectado para votar ou enviar sugestões.
                      </p>
                      
                      <div className="flex flex-col gap-3">
                          <button 
                              onClick={() => onLoginRequest()}
                              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/30 hover:-translate-y-0.5"
                          >
                              <LogIn size={20} /> Fazer Login / Cadastrar
                          </button>
                          <button 
                              onClick={() => setIsLoginModalOpen(false)}
                              className={`w-full py-3.5 bg-transparent font-bold rounded-xl transition-all ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                          >
                              Cancelar
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* SUBMIT MODAL */}
      {isSubmitModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
                  <div className={`px-8 py-6 border-b flex justify-between items-center ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-slate-50'}`}>
                      <h3 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>Nova Sugestão</h3>
                      <button onClick={() => setIsSubmitModalOpen(false)} className={`p-2 rounded-full transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}>
                          <X size={20} />
                      </button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-8 space-y-6">
                      {/* Type Selection */}
                      <div>
                          <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Tipo de Feedback</label>
                          <div className="grid grid-cols-3 gap-3">
                             {(['FEATURE', 'BUG', 'IMPROVEMENT'] as FeedbackType[]).map(ft => (
                                 <button
                                    key={ft}
                                    type="button"
                                    onClick={() => setNewType(ft)}
                                    className={`flex flex-col items-center justify-center py-4 px-2 rounded-xl border-2 transition-all relative overflow-hidden
                                        ${newType === ft 
                                            ? 'bg-indigo-50 border-indigo-600 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-500 dark:text-indigo-300' 
                                            : `border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600' : 'bg-white'}`}
                                    `}
                                 >
                                     <div className={`mb-2 transition-transform duration-300 ${newType === ft ? 'scale-110' : 'grayscale opacity-70'}`}>
                                         {React.cloneElement(getTypeIcon(ft) as React.ReactElement<any>, { size: 24 })}
                                     </div>
                                     <span className="text-xs font-bold text-center">{getTypeLabel(ft)}</span>
                                     {newType === ft && <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>}
                                 </button>
                             ))}
                          </div>
                      </div>

                      <div>
                          <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Título</label>
                          <input 
                            type="text" 
                            required
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className={`w-full p-3.5 border rounded-xl focus:ring-2 outline-none transition-all font-medium ${bgInput}`}
                            placeholder="Seja breve e direto (Ex: Adicionar Modo Escuro)"
                          />
                      </div>

                      <div>
                          <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Descrição Detalhada</label>
                          <textarea 
                            required
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            className={`w-full p-3.5 border rounded-xl focus:ring-2 outline-none min-h-[120px] transition-all resize-none text-sm leading-relaxed ${bgInput}`}
                            placeholder="Explique o problema que você quer resolver ou como essa funcionalidade ajudaria seu fluxo de trabalho..."
                          />
                      </div>

                      {!currentUser && (
                          <div>
                              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Seu Nome (Opcional)</label>
                              <div className="relative">
                                  <input 
                                    type="text" 
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    className={`w-full p-3.5 pl-10 border rounded-xl focus:ring-2 outline-none transition-all font-medium ${bgInput}`}
                                    placeholder="Como devemos te chamar?"
                                  />
                                  <div className="absolute left-3.5 top-3.5 opacity-50">
                                      <CornerDownRight size={16} />
                                  </div>
                              </div>
                          </div>
                      )}

                      <div className="pt-4 flex justify-end gap-3">
                          <button 
                            type="button" 
                            onClick={() => setIsSubmitModalOpen(false)}
                            className={`px-6 py-3 font-bold rounded-xl transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                          >
                              Cancelar
                          </button>
                          <button 
                            type="submit"
                            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 transition-all active:scale-95 flex items-center gap-2"
                          >
                              Enviar Sugestão <Send size={16} />
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

// Helper Sparkles Icon
const SparklesIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
);

export default RoadmapPage;
