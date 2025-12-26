
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Plus, Trash2, Copy, Check, Users, Percent, Search, ExternalLink } from 'lucide-react';

interface Affiliate {
    id: string;
    name: string;
    email: string;
    cpf: string;
    code: string;
    commission_rate: number;
    pix_key: string;
    status: 'ACTIVE' | 'INACTIVE';
    created_at: string;
}

export default function AffiliatesDashboard() {
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newAffiliate, setNewAffiliate] = useState<Partial<Affiliate>>({ commission_rate: 30, status: 'ACTIVE' });
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        fetchAffiliates();
    }, []);

    const fetchAffiliates = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('affiliates').select('*').order('created_at', { ascending: false });
        if (error) console.error('Error fetching affiliates:', error);
        else setAffiliates(data || []);
        setIsLoading(false);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAffiliate.code || !newAffiliate.name) return alert('Nome e Código são obrigatórios');

        try {
            const { data, error } = await supabase.from('affiliates').insert([newAffiliate]).select();
            if (error) throw error;
            setAffiliates([data[0], ...affiliates]);
            setShowModal(false);
            setNewAffiliate({ commission_rate: 30, status: 'ACTIVE' });
        } catch (err: any) {
            alert('Erro ao criar afiliado: ' + err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja remover este afiliado?')) return;
        const { error } = await supabase.from('affiliates').delete().eq('id', id);
        if (!error) setAffiliates(affiliates.filter(a => a.id !== id));
    };

    const copyLink = (code: string, id: string) => {
        const link = `${window.location.origin}/?ref=${code}`;
        navigator.clipboard.writeText(link);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredAffiliates = affiliates.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in-up space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-pink-600/10 border border-pink-500/20 rounded-xl text-pink-500 shadow-lg shadow-pink-500/5">
                            <Users size={20} />
                        </div>
                        <h3 className="text-xl font-black tracking-tighter uppercase">Gestão de Afiliados</h3>
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] ml-1">PARCEIROS E COMISSÕES</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.1em] flex items-center gap-2 shadow-lg shadow-pink-500/20 active:scale-95 transition-all"
                >
                    <Plus size={16} /> Novo Afiliado
                </button>
            </div>

            {/* Search */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search size={16} className="text-slate-500 group-focus-within:text-pink-500 transition-colors" />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-[#0f172a]/60 border border-slate-800 rounded-2xl text-slate-200 placeholder:text-slate-600 outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/20 transition-all font-medium"
                    placeholder="Buscar afiliado por nome ou código..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAffiliates.map(affiliate => (
                    <div key={affiliate.id} className="bg-[#0f172a]/60 border border-slate-800 p-6 rounded-3xl shadow-lg hover:border-pink-500/30 transition-all group relative overflow-hidden">

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-bold text-lg text-white">{affiliate.name}</h4>
                                <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                                    <div className="px-2 py-0.5 rounded-md bg-slate-800 font-mono text-pink-400 border border-slate-700">
                                        ?ref={affiliate.code}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-2xl font-black text-pink-500">{affiliate.commission_rate}%</span>
                                <span className="text-[9px] uppercase font-bold text-slate-600 tracking-wider">Comissão</span>
                            </div>
                        </div>

                        <div className="space-y-2 mb-6">
                            <p className="text-xs text-slate-400 flex justify-between">
                                <span>CPF/CNPJ:</span> <span className="text-slate-200 font-mono">{affiliate.cpf || '-'}</span>
                            </p>
                            <p className="text-xs text-slate-400 flex justify-between">
                                <span>PIX:</span> <span className="text-slate-200 font-mono">{affiliate.pix_key || '-'}</span>
                            </p>
                            <p className="text-xs text-slate-400 flex justify-between">
                                <span>Criado em:</span> <span className="text-slate-500">{new Date(affiliate.created_at).toLocaleDateString()}</span>
                            </p>
                        </div>

                        <div className="flex gap-3 mt-auto">
                            <button
                                onClick={() => copyLink(affiliate.code, affiliate.id)}
                                className="flex-1 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 group/btn"
                            >
                                {copiedId === affiliate.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="group-hover/btn:text-pink-400" />}
                                {copiedId === affiliate.id ? 'Copiado!' : 'Copiar Link'}
                            </button>
                            <button
                                onClick={() => handleDelete(affiliate.id)}
                                className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-all"
                                title="Remover Afiliado" // Added title
                                aria-label="Remover Afiliado" // Added aria-label
                            >
                                <Trash2 size={16} aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                ))}

                {filteredAffiliates.length === 0 && !isLoading && (
                    <div className="col-span-full py-12 text-center text-slate-500">
                        Nehum afiliado encontrado.
                    </div>
                )}
            </div>

            {/* Modal Criar */}
            {showModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 w-full max-w-lg shadow-2xl relative">
                        <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Novo Afiliado</h3>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-1">Nome Completo</label>
                                <input autoFocus type="text" className="w-full mt-1 p-3 bg-[#020617] border border-slate-700 rounded-xl text-white outline-none focus:border-pink-500"
                                    value={newAffiliate.name || ''} onChange={e => setNewAffiliate({ ...newAffiliate, name: e.target.value })}
                                    placeholder="Ex: João Silva" required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-1">Código (Ref)</label>
                                    <input type="text" className="w-full mt-1 p-3 bg-[#020617] border border-slate-700 rounded-xl text-white outline-none focus:border-pink-500 font-mono text-pink-400"
                                        value={newAffiliate.code || ''} onChange={e => setNewAffiliate({ ...newAffiliate, code: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '') })}
                                        placeholder="joao123" required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-1">Comissão (%)</label>
                                    <input type="number" className="w-full mt-1 p-3 bg-[#020617] border border-slate-700 rounded-xl text-white outline-none focus:border-pink-500"
                                        value={newAffiliate.commission_rate} onChange={e => setNewAffiliate({ ...newAffiliate, commission_rate: parseFloat(e.target.value) })}
                                        placeholder="30" title="Taxa de Comissão" required />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-1">CPF / CNPJ</label>
                                <input type="text" className="w-full mt-1 p-3 bg-[#020617] border border-slate-700 rounded-xl text-white outline-none focus:border-pink-500"
                                    value={newAffiliate.cpf || ''} onChange={e => setNewAffiliate({ ...newAffiliate, cpf: e.target.value })}
                                    placeholder="000.000.000-00" />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-1">Chave PIX</label>
                                <input type="text" className="w-full mt-1 p-3 bg-[#020617] border border-slate-700 rounded-xl text-white outline-none focus:border-pink-500"
                                    value={newAffiliate.pix_key || ''} onChange={e => setNewAffiliate({ ...newAffiliate, pix_key: e.target.value })}
                                    placeholder="Email, Telefone ou Aleatória" />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition-all">Cancelar</button>
                                <button type="submit" className="flex-1 py-3 rounded-xl font-bold bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-500/20 transition-all">Criar Parceria</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
