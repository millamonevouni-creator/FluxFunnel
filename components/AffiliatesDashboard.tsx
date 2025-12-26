
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Plus, Trash2, Copy, Check, Users, Percent, Search, ExternalLink, FileText, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

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

interface Commission {
    id: string;
    affiliate_id: string;
    amount: number;
    sale_amount: number;
    status: 'PAID' | 'PENDING';
    created_at: string;
}

interface Payout {
    id: string;
    affiliate_id: string;
    amount: number;
    date: string;
    notes?: string;
}

interface Transaction {
    id: string;
    date: string;
    type: 'COMMISSION' | 'PAYOUT';
    amount: number;
    description: string;
}

export default function AffiliatesDashboard() {
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newAffiliate, setNewAffiliate] = useState<Partial<Affiliate>>({ commission_rate: 30, status: 'ACTIVE' });
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [showPayoutModal, setShowPayoutModal] = useState<string | null>(null); // Affiliate ID
    const [showStatementModal, setShowStatementModal] = useState<string | null>(null); // Affiliate ID
    const [newPayout, setNewPayout] = useState<{ amount: number; date: string }>({ amount: 0, date: new Date().toISOString().split('T')[0] });

    useEffect(() => {
        fetchAffiliates();
    }, []);

    const fetchAffiliates = async () => {
        setIsLoading(true);
        const { data: affiliatesData, error: affError } = await supabase.from('affiliates').select('*').order('created_at', { ascending: false });
        const { data: commissionsData, error: commError } = await supabase.from('commissions').select('*');
        const { data: payoutsData, error: payError } = await supabase.from('payouts').select('*');

        if (affError) console.error('Error fetching affiliates:', affError);
        if (commError) console.error('Error fetching commissions:', commError);
        if (payError) console.error('Error fetching payouts:', payError);

        setAffiliates(affiliatesData || []);
        setCommissions(commissionsData || []);
        setPayouts(payoutsData || []);
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

    const [affiliateToDelete, setAffiliateToDelete] = useState<Affiliate | null>(null);

    const handleDeleteClick = (affiliate: Affiliate) => {
        setAffiliateToDelete(affiliate);
    };

    const confirmDelete = async () => {
        if (!affiliateToDelete) return;
        const { error } = await supabase.from('affiliates').delete().eq('id', affiliateToDelete.id);
        if (!error) setAffiliates(affiliates.filter(a => a.id !== affiliateToDelete.id));
        setAffiliateToDelete(null);
    };

    const handlePayout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!showPayoutModal) return;

        try {
            const { data, error } = await supabase.from('payouts').insert([{
                affiliate_id: showPayoutModal,
                amount: newPayout.amount,
                date: new Date(newPayout.date).toISOString()
            }]).select();

            if (error) throw error;
            setPayouts([...payouts, data[0]]);
            setShowPayoutModal(null);
            setNewPayout({ amount: 0, date: new Date().toISOString().split('T')[0] });
        } catch (err: any) {
            alert('Erro ao registrar pagamento: ' + err.message);
        }
    };

    const getAffiliateStats = (affiliateId: string) => {
        const affiliateCommissions = commissions.filter(c => c.affiliate_id === affiliateId && c.status === 'PAID');
        const totalCommission = affiliateCommissions.reduce((sum, c) => sum + c.amount, 0);
        const salesCount = affiliateCommissions.length;
        const totalPayouts = payouts.filter(p => p.affiliate_id === affiliateId).reduce((sum, p) => sum + p.amount, 0);
        const balance = totalCommission - totalPayouts;
        return { totalCommission, totalPayouts, balance, salesCount };
    };

    const getStatement = (affiliateId: string): Transaction[] => {
        const affiliateCommissions = commissions
            .filter(c => c.affiliate_id === affiliateId && c.status === 'PAID')
            .map(c => ({
                id: c.id,
                date: c.created_at,
                type: 'COMMISSION' as const,
                amount: c.amount,
                description: 'Comissão de Venda'
            }));

        const affiliatePayouts = payouts
            .filter(p => p.affiliate_id === affiliateId)
            .map(p => ({
                id: p.id,
                date: p.date,
                type: 'PAYOUT' as const,
                amount: p.amount,
                description: 'Pagamento Enviado'
            }));

        return [...affiliateCommissions, ...affiliatePayouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
                        <div className="p-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl text-indigo-500 shadow-lg shadow-indigo-500/5">
                            <Users size={20} />
                        </div>
                        <h3 className="text-xl font-black tracking-tighter uppercase">Gestão de Afiliados</h3>
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] ml-1">PARCEIROS E COMISSÕES</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.1em] flex items-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                >
                    <Plus size={16} /> Novo Afiliado
                </button>
            </div>

            {/* Search */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search size={16} className="text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-[#0f172a]/60 border border-slate-800 rounded-2xl text-slate-200 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium"
                    placeholder="Buscar afiliado por nome ou código..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAffiliates.map(affiliate => (
                    <div key={affiliate.id} className="bg-[#0f172a]/60 border border-slate-800 p-6 rounded-3xl shadow-lg hover:border-indigo-500/30 transition-all group relative overflow-hidden">

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-bold text-lg text-white">{affiliate.name}</h4>
                                <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                                    <div className="px-2 py-0.5 rounded-md bg-slate-800 font-mono text-indigo-400 border border-slate-700">
                                        ?ref={affiliate.code}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-2xl font-black text-indigo-500">{affiliate.commission_rate}%</span>
                                <span className="text-[9px] uppercase font-bold text-slate-600 tracking-wider">Comissão</span>
                            </div>
                        </div>

                        {/* Commission Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 relative overflow-hidden">
                                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Comissões Geradas</div>
                                <div className="text-xl font-black text-emerald-400">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getAffiliateStats(affiliate.id).totalCommission)}
                                </div>
                                <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">
                                    {getAffiliateStats(affiliate.id).salesCount} Vendas
                                </div>
                            </div>
                            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Pagamentos</div>
                                <div className="text-xl font-black text-blue-400">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getAffiliateStats(affiliate.id).totalPayouts)}
                                </div>
                            </div>
                        </div>

                        {/* Balance Card */}
                        <div className={`p-4 rounded-2xl border mb-6 flex justify-between items-center ${getAffiliateStats(affiliate.id).balance > 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-800/50 border-slate-700'}`}>
                            <div>
                                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Saldo a Pagar</div>
                                <div className={`text-xl font-black ${getAffiliateStats(affiliate.id).balance > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getAffiliateStats(affiliate.id).balance)}
                                </div>
                            </div>
                            {getAffiliateStats(affiliate.id).balance > 0 && (
                                <button
                                    onClick={() => {
                                        setNewPayout({ amount: getAffiliateStats(affiliate.id).balance, date: new Date().toISOString().split('T')[0] });
                                        setShowPayoutModal(affiliate.id);
                                    }}
                                    className="p-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all font-bold text-xs flex items-center gap-2"
                                >
                                    <span className="text-lg">$</span> Pagar
                                </button>
                            )}
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
                                onClick={() => setShowStatementModal(affiliate.id)}
                                className="px-3 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                                title="Ver Extrato"
                            >
                                <FileText size={16} />
                            </button>
                            <button
                                onClick={() => copyLink(affiliate.code, affiliate.id)}
                                className="flex-1 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 group/btn"
                            >
                                {copiedId === affiliate.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="group-hover/btn:text-indigo-400" />}
                                {copiedId === affiliate.id ? 'Copiado!' : 'Copiar Link'}
                            </button>
                            <button
                                onClick={() => handleDeleteClick(affiliate)}
                                className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-all"
                                title="Remover Afiliado"
                                aria-label="Remover Afiliado"
                            >
                                <Trash2 size={16} aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                ))
                }

                {
                    filteredAffiliates.length === 0 && !isLoading && (
                        <div className="col-span-full py-12 text-center text-slate-500">
                            Nehum afiliado encontrado.
                        </div>
                    )
                }
            </div >

            {/* Modal Criar */}
            {
                showModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                        <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 w-full max-w-lg shadow-2xl relative">
                            <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Novo Afiliado</h3>

                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-1">Nome Completo</label>
                                    <input autoFocus type="text" className="w-full mt-1 p-3 bg-[#020617] border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500"
                                        value={newAffiliate.name || ''} onChange={e => setNewAffiliate({ ...newAffiliate, name: e.target.value })}
                                        placeholder="Ex: João Silva" required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-1">Código (Ref)</label>
                                        <input type="text" className="w-full mt-1 p-3 bg-[#020617] border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500 font-mono text-indigo-400"
                                            value={newAffiliate.code || ''} onChange={e => setNewAffiliate({ ...newAffiliate, code: e.target.value.replace(/[^a-zA-Z0-9_-]/g, '') })}
                                            placeholder="joao123" required />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-1">Comissão (%)</label>
                                        <input type="number" className="w-full mt-1 p-3 bg-[#020617] border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500"
                                            value={newAffiliate.commission_rate} onChange={e => setNewAffiliate({ ...newAffiliate, commission_rate: parseFloat(e.target.value) })}
                                            placeholder="30" title="Taxa de Comissão" required />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-1">CPF / CNPJ</label>
                                    <input type="text" className="w-full mt-1 p-3 bg-[#020617] border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500"
                                        value={newAffiliate.cpf || ''} onChange={e => setNewAffiliate({ ...newAffiliate, cpf: e.target.value })}
                                        placeholder="000.000.000-00" />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-1">Chave PIX</label>
                                    <input type="text" className="w-full mt-1 p-3 bg-[#020617] border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500"
                                        value={newAffiliate.pix_key || ''} onChange={e => setNewAffiliate({ ...newAffiliate, pix_key: e.target.value })}
                                        placeholder="Email, Telefone ou Aleatória" />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition-all">Cancelar</button>
                                    <button type="submit" className="flex-1 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all">Criar Parceria</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Modal Confirmar Exclusão */}
            {
                affiliateToDelete && (
                    <div className="fixed inset-0 z-[250] flex items-center justify-center p-8 bg-black/95 backdrop-blur-md animate-fade-in-up">
                        <div className="w-full max-w-md bg-[#0f172a] rounded-[2.5rem] border border-red-900/50 overflow-hidden shadow-2xl flex flex-col items-center text-center p-8">
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-red-500/5">
                                <Trash2 size={32} className="text-red-500" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Encerrar Parceria?</h3>
                            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                                Você está prestes a remover o afiliado <strong className="text-white">{affiliateToDelete.name}</strong>.
                                O link <code className="bg-slate-800 px-1 py-0.5 rounded text-pink-400 text-xs">{affiliateToDelete.code}</code> deixará de funcionar imediatamente.
                            </p>
                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={() => setAffiliateToDelete(null)}
                                    className="flex-1 py-4 rounded-xl font-bold bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
                                >
                                    Manter
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-4 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            {/* Modal Registrar Pagamento */}
            {showPayoutModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 w-full max-w-lg shadow-2xl relative">
                        <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight flex items-center gap-3">
                            <span className="text-emerald-500 text-3xl">$</span> Registrar Pagamento
                        </h3>

                        <form onSubmit={handlePayout} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-1">Valor do Pagamento (R$)</label>
                                <input autoFocus type="number" step="0.01" className="w-full mt-1 p-4 bg-[#020617] border border-slate-700 rounded-xl text-emerald-400 font-mono text-2xl font-bold outline-none focus:border-emerald-500"
                                    value={newPayout.amount} onChange={e => setNewPayout({ ...newPayout, amount: parseFloat(e.target.value) })}
                                    placeholder="0.00" title="Valor do pagamento" required />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-1">Data do Pagamento</label>
                                <input type="date" className="w-full mt-1 p-3 bg-[#020617] border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500"
                                    value={newPayout.date} onChange={e => setNewPayout({ ...newPayout, date: e.target.value })}
                                    title="Data do pagamento" required />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowPayoutModal(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition-all">Cancelar</button>
                                <button type="submit" className="flex-1 py-3 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition-all">Confirmar Baixa</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal Extrato Financeiro */}
            {showStatementModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                    <FileText className="text-indigo-500" size={24} /> Extrato Financeiro
                                </h3>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">
                                    {affiliates.find(a => a.id === showStatementModal)?.name}
                                </p>
                            </div>
                            <button onClick={() => setShowStatementModal(null)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                                <span className="font-bold text-xs uppercase">Fechar</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            {getStatement(showStatementModal).length === 0 ? (
                                <div className="text-center py-12 text-slate-500 text-sm">Nenhuma movimentação registrada.</div>
                            ) : (
                                getStatement(showStatementModal).map(transaction => (
                                    <div key={transaction.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#020617] border border-slate-800/50">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${transaction.type === 'COMMISSION' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {transaction.type === 'COMMISSION' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-200">{transaction.description}</div>
                                                <div className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">
                                                    {new Date(transaction.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`text-lg font-black ${transaction.type === 'COMMISSION' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {transaction.type === 'COMMISSION' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(transaction.amount)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-center">
                            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Saldo Atual</span>
                            <span className={`text-2xl font-black ${getAffiliateStats(showStatementModal).balance > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getAffiliateStats(showStatementModal).balance)}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
