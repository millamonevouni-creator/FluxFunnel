
import React, { useState, useMemo } from 'react';
import {
    Search, Plus, MessageSquare, ThumbsUp, MessageCircle, Clock, User as UserIcon,
    Trash2, X, Send, MoreHorizontal, Filter, ArrowRight, Calendar, CheckCircle
} from 'lucide-react';
import { FeedbackItem, FeedbackStatus, FeedbackType } from '../types';

interface RoadmapBoardProps {
    feedbacks: FeedbackItem[];
    onUpdateFeedback: (id: string, updates: Partial<FeedbackItem>) => void;
    onDeleteFeedback: (id: string) => void;
    onSubmitFeedback: (data: { title: string, description: string, type: FeedbackType, authorName: string }) => Promise<void>;
    onReplyFeedback: (id: string, text: string) => void;
    onDeleteComment: (feedbackId: string, commentId: string) => void;
}

const RoadmapBoard: React.FC<RoadmapBoardProps> = ({
    feedbacks,
    onUpdateFeedback,
    onDeleteFeedback,
    onSubmitFeedback,
    onReplyFeedback,
    onDeleteComment
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<FeedbackType | 'ALL'>('ALL');
    const [selectedFb, setSelectedFb] = useState<FeedbackItem | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [feedbackToDelete, setFeedbackToDelete] = useState<string | null>(null);

    // New Feedback Form State
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newType, setNewType] = useState<FeedbackType>('FEATURE');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [replyText, setReplyText] = useState('');

    // Local state for Date Editing (Manual Save)
    const [tempStartDate, setTempStartDate] = useState('');
    const [tempEndDate, setTempEndDate] = useState('');

    // Sync temp dates when modal opens
    React.useEffect(() => {
        if (selectedFb) {
            setTempStartDate(selectedFb.startDate ? new Date(selectedFb.startDate).toISOString().split('T')[0] : '');
            setTempEndDate(selectedFb.estimatedCompletionDate ? new Date(selectedFb.estimatedCompletionDate).toISOString().split('T')[0] : '');
        }
    }, [selectedFb]);

    // Update selected item when global list changes (e.g. new comment added)
    React.useEffect(() => {
        if (selectedFb) {
            const updated = feedbacks.find(f => f.id === selectedFb.id);
            if (updated) setSelectedFb(updated);
        }
    }, [feedbacks]);

    const handleSaveDates = () => {
        if (!selectedFb) return;
        onUpdateFeedback(selectedFb.id, {
            startDate: tempStartDate ? new Date(tempStartDate).toISOString() : undefined,
            estimatedCompletionDate: tempEndDate ? new Date(tempEndDate).toISOString() : undefined
        });

        // Update local selectedFb to reflect changes immediately in UI if needed (though onUpdateFeedback usually triggers prop update)
        // But for visual feedback let's ensure:
        setSelectedFb(prev => prev ? {
            ...prev,
            startDate: tempStartDate ? new Date(tempStartDate).toISOString() : undefined,
            estimatedCompletionDate: tempEndDate ? new Date(tempEndDate).toISOString() : undefined
        } : null);

        alert('Datas atualizadas com sucesso!');
    };


    const COLUMNS = [
        { id: 'PENDING', label: 'Pendente', color: 'border-l-4 border-l-yellow-500 bg-yellow-500/5' },
        { id: 'PLANNED', label: 'Planejado', color: 'border-l-4 border-l-blue-500 bg-blue-500/5' },
        { id: 'IN_PROGRESS', label: 'Em Andamento', color: 'border-l-4 border-l-purple-500 bg-purple-500/5' },
        { id: 'COMPLETED', label: 'Concluído', color: 'border-l-4 border-l-emerald-500 bg-emerald-500/5' },
        { id: 'REJECTED', label: 'Arquivado', color: 'border-l-4 border-l-red-500 bg-red-500/5' }
    ] as const;

    const filteredFeedbacks = useMemo(() => {
        return feedbacks.filter(f => {
            const matchesSearch = f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                f.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'ALL' || f.type === typeFilter;
            return matchesSearch && matchesType;
        }).sort((a, b) => b.votes - a.votes);
    }, [feedbacks, searchTerm, typeFilter]);

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('cardId', id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e: React.DragEvent, status: FeedbackStatus) => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData('cardId');
        if (cardId) {
            onUpdateFeedback(cardId, { status });
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const submitNewFeedback = async () => {
        if (!newTitle.trim() || !newDesc.trim()) return;
        setIsSubmitting(true);
        try {
            await onSubmitFeedback({
                title: newTitle,
                description: newDesc,
                type: newType,
                authorName: 'Admin'
            });
            setIsCreateModalOpen(false);
            setNewTitle('');
            setNewDesc('');
            setNewType('FEATURE');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTypeConfig = (type: FeedbackType) => {
        switch (type) {
            case 'BUG': return { label: 'Bug', color: 'text-red-400 bg-red-400/10 border-red-400/20' };
            case 'FEATURE': return { label: 'Feature', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' };
            case 'IMPROVEMENT': return { label: 'Melhoria', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' };
            default: return { label: type, color: 'text-slate-400 bg-slate-400/10 border-slate-400/20' };
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#020617] text-white">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 px-1">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Buscar no roadmap..."
                            className="pl-11 pr-4 py-2.5 bg-[#0f172a] border border-slate-800 rounded-xl text-sm font-medium text-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all w-64 shadow-sm"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <select
                            value={typeFilter}
                            onChange={e => setTypeFilter(e.target.value as any)}
                            className="pl-11 pr-8 py-2.5 bg-[#0f172a] border border-slate-800 rounded-xl text-sm font-bold text-slate-400 outline-none focus:border-indigo-500 appearance-none cursor-pointer hover:bg-slate-900 transition-all shadow-sm"
                            aria-label="Filtrar por tipo"
                        >
                            <option value="ALL">Todos os Tipos</option>
                            <option value="FEATURE">Features</option>
                            <option value="BUG">Bugs</option>
                            <option value="IMPROVEMENT">Melhorias</option>
                        </select>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5"
                >
                    <Plus size={18} />
                    <span>Novo Feedback</span>
                </button>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                <div className="flex h-full gap-6 min-w-max px-1">
                    {COLUMNS.map(column => {
                        const items = filteredFeedbacks.filter(f => f.status === column.id);
                        return (
                            <div
                                key={column.id}
                                className="flex flex-col w-[320px] h-full"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, column.id as FeedbackStatus)}
                            >
                                <div className={`flex items-center justify-between p-4 mb-3 bg-[#0f172a]/80 border-y border-r border-slate-800 rounded-r-xl rounded-l-sm backdrop-blur-sm ${column.color}`}>
                                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-200">{column.label}</h3>
                                    <span className="px-2.5 py-0.5 rounded-md bg-slate-900/50 border border-white/5 text-xs font-bold text-slate-400">
                                        {items.length}
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                                    {items.map(item => (
                                        <div
                                            key={item.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, item.id)}
                                            onClick={() => setSelectedFb(item)}
                                            className="group relative p-4 bg-[#0f172a] hover:bg-[#1e293b] border border-slate-800 hover:border-indigo-500/30 rounded-2xl cursor-pointer transition-all duration-200 shadow-sm hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]"
                                        >
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFeedbackToDelete(item.id);
                                                }}
                                                className="absolute top-2 right-2 p-2 text-slate-500 hover:text-red-500 hover:bg-slate-800 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
                                                title="Excluir Feedback"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <div className="flex items-start justify-between mb-3">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getTypeConfig(item.type).color}`}>
                                                    {getTypeConfig(item.type).label}
                                                </span>
                                                {item.authorName === 'Admin' && (
                                                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded border border-indigo-400/20">Official</span>
                                                )}
                                            </div>

                                            <h4 className="font-bold text-slate-200 text-sm mb-2 leading-snug group-hover:text-white transition-colors line-clamp-2">
                                                {item.title}
                                            </h4>

                                            <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-4 group-hover:text-slate-400 transition-colors">
                                                {item.description}
                                            </p>

                                            <div className="flex items-center justify-between pt-3 border-t border-slate-800/50 group-hover:border-slate-700/50 transition-colors">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <div className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-800">
                                                        <ThumbsUp size={12} className={item.votes > 0 ? "text-indigo-400" : ""} />
                                                        <span className="text-[10px] font-bold">{item.votes}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-800">
                                                        <MessageCircle size={12} />
                                                        <span className="text-[10px] font-bold">{item.comments?.length || 0}</span>
                                                    </div>
                                                </div>
                                                <div className="text-[10px] font-mono text-slate-600">
                                                    {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </div>
                                            </div>
                                            {(item.startDate || item.estimatedCompletionDate) && (
                                                <div className="mt-3 pt-2 border-t border-slate-800/50 flex items-center gap-2 text-[10px] font-bold text-indigo-300">
                                                    <Calendar size={12} />
                                                    {item.estimatedCompletionDate ? (
                                                        <span>Prev: {new Date(item.estimatedCompletionDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                                                    ) : (
                                                        <span>Iniciado: {new Date(item.startDate!).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {items.length === 0 && (
                                        <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-slate-600 gap-2 opacity-50">
                                            <div className="p-2 rounded-full bg-slate-800/50">
                                                <Search size={16} />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-widest">Vazio</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-[#0f172a]">
                            <h3 className="text-lg font-black text-white">Novo Item no Roadmap</h3>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                aria-label="Fechar"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Título</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    placeholder="Ex: Integração com Slack"
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tipo</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['FEATURE', 'BUG', 'IMPROVEMENT'] as const).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setNewType(type)}
                                            className={`py-2 px-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${newType === type
                                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                                                : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-700'
                                                }`}
                                        >
                                            {getTypeConfig(type).label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Descrição</label>
                                <textarea
                                    value={newDesc}
                                    onChange={e => setNewDesc(e.target.value)}
                                    placeholder="Descreva detalhadamente a solicitação..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium resize-none"
                                />
                            </div>
                        </div>
                        <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={submitNewFeedback}
                                disabled={isSubmitting || !newTitle.trim() || !newDesc.trim()}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all"
                            >
                                {isSubmitting ? 'Criando...' : 'Criar Feedback'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedFb && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setSelectedFb(null)}>
                    <div className="w-full max-w-2xl max-h-[90vh] bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="p-5 border-b border-slate-800 flex justify-between items-start bg-[#0f172a]">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${getTypeConfig(selectedFb.type).color}`}>
                                        {getTypeConfig(selectedFb.type).label}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                        ID: {selectedFb.id.slice(0, 8)}
                                    </span>
                                </div>
                                <h2 className="text-xl font-black text-white leading-tight">{selectedFb.title}</h2>
                            </div>
                            <button onClick={() => setSelectedFb(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors" aria-label="Fechar">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800">
                            <div className="flex flex-wrap items-center gap-6 mb-8 text-xs font-medium text-slate-400">
                                <div className="flex items-center gap-2">
                                    <UserIcon size={14} className="text-slate-500" />
                                    <span>{selectedFb.authorName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-slate-500" />
                                    <span>{new Date(selectedFb.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ThumbsUp size={14} className="text-indigo-500" />
                                    <span className="text-indigo-300 font-bold">{selectedFb.votes} votos</span>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 mb-8">
                                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedFb.description}</p>
                            </div>

                            {/* Date Estimations - Admin Control */}
                            <div className="flex gap-4 mb-4 bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
                                <div className="space-y-1 flex-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Início do Projeto</label>
                                    <input
                                        type="date"
                                        value={tempStartDate}
                                        onChange={(e) => setTempStartDate(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-slate-300 outline-none focus:border-indigo-500"
                                        title="Data de Início"
                                    />
                                </div>
                                <div className="space-y-1 flex-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Previsão de Conclusão</label>
                                    <input
                                        type="date"
                                        value={tempEndDate}
                                        onChange={(e) => setTempEndDate(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-slate-300 outline-none focus:border-indigo-500"
                                        title="Previsão de Conclusão"
                                    />
                                </div>
                            </div>

                            {/* Save Dates Button (Replaces Conclude) */}
                            <button
                                onClick={handleSaveDates}
                                className="w-full mb-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={18} />
                                Salvar Alterações de Data
                            </button>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Discussão ({selectedFb.comments?.length || 0})</h4>
                                </div>

                                <div className="space-y-4">
                                    {(selectedFb.comments || []).map(comment => (
                                        <div key={comment.id} className={`flex gap-4 ${comment.isAdmin ? 'flex-row-reverse' : ''}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${comment.isAdmin
                                                ? 'bg-indigo-600 text-white border-indigo-500'
                                                : 'bg-slate-800 text-slate-400 border-slate-700'
                                                }`}>
                                                {comment.authorName.charAt(0)}
                                            </div>
                                            <div className={`flex flex-col max-w-[80%] ${comment.isAdmin ? 'items-end' : 'items-start'}`}>
                                                <div className={`px-4 py-3 text-sm rounded-2xl shadow-sm ${comment.isAdmin
                                                    ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-100 rounded-tr-none'
                                                    : 'bg-slate-800 border border-slate-700 text-slate-300 rounded-tl-none'
                                                    }`}>
                                                    <p>{comment.text}</p>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1 px-1">
                                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">
                                                        {comment.authorName} {comment.isAdmin && '(Staff)'}
                                                    </span>
                                                    {comment.isAdmin && (
                                                        <button
                                                            onClick={() => onDeleteComment(selectedFb.id, comment.id)}
                                                            className="text-[9px] text-red-500 hover:underline cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            Excluir
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedFb.comments || selectedFb.comments.length === 0) && (
                                        <div className="text-center py-6 text-slate-600 text-xs italic">
                                            Nenhum comentário.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-slate-800 bg-[#0f172a] space-y-4">
                            {/* Actions Row */}
                            <div className="flex gap-4 items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black uppercase text-slate-500">Mover para:</span>
                                    <select
                                        value={selectedFb.status}
                                        onChange={(e) => onUpdateFeedback(selectedFb.id, { status: e.target.value as FeedbackStatus })}
                                        className="bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500 cursor-pointer hover:bg-slate-700 transition-colors"
                                        aria-label="Alterar status"
                                    >
                                        <option value="PENDING">Pendente</option>
                                        <option value="PLANNED">Planejado</option>
                                        <option value="IN_PROGRESS">Em Andamento</option>
                                        <option value="COMPLETED">Concluído</option>
                                        <option value="REJECTED">Arquivado</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => setFeedbackToDelete(selectedFb.id)}
                                    className="text-slate-500 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                                    title="Excluir Feedback"
                                    aria-label="Excluir Feedback"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* Reply Input */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    placeholder="Escreva uma resposta oficial..."
                                    className="w-full pl-4 pr-12 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm font-medium text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && replyText.trim()) {
                                            onReplyFeedback(selectedFb.id, replyText);
                                            setReplyText('');
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        if (replyText.trim()) {
                                            onReplyFeedback(selectedFb.id, replyText);
                                            setReplyText('');
                                        }
                                    }}
                                    disabled={!replyText.trim()}
                                    className="absolute right-2 top-2 p-2 bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-md active:scale-95"
                                    aria-label="Enviar resposta"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {feedbackToDelete && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-sm bg-[#0f172a] border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-6 text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-2 text-red-500">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-lg font-black text-white">Excluir Feedback?</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Esta ação não pode ser desfeita. O feedback será permanentemente removido do sistema.
                            </p>
                        </div>
                        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex gap-3">
                            <button
                                onClick={() => setFeedbackToDelete(null)}
                                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    if (feedbackToDelete) {
                                        onDeleteFeedback(feedbackToDelete);
                                        setFeedbackToDelete(null);
                                        if (selectedFb?.id === feedbackToDelete) setSelectedFb(null);
                                    }
                                }}
                                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 transition-all"
                            >
                                Sim, Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoadmapBoard;
