import React, { useState, useEffect } from 'react';
import { ArrowLeft, Rocket, Search, Layout } from 'lucide-react';
import { api } from '../services/api_fixed';
import { Template } from '../types';
import { LoadingScreen } from './LoadingScreen';
import { PROJECT_TEMPLATES } from '../constants';

import { SEO } from './SEO';

interface PublicTemplatesPageProps {
    onBack: () => void;
    onUseTemplate: (templateId: string) => void;
}

const PublicTemplatesPage = ({ onBack, onUseTemplate }: PublicTemplatesPageProps) => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadTemplates = async () => {
            try {
                // Combine system templates with public community templates if available
                const systemTemplates = PROJECT_TEMPLATES;
                setTemplates(systemTemplates as any);
            } catch (e) {
                console.error("Failed to load templates", e);
            } finally {
                setLoading(false);
            }
        };
        loadTemplates();
    }, []);

    const getTemplateName = (t: Template) => t.customLabel || t.labelKey || "Modelo sem nome";
    const getTemplateDesc = (t: Template) => t.customDescription || t.descriptionKey || "Modelo de alta conversão";

    const filteredTemplates = templates.filter(t =>
        getTemplateName(t).toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <LoadingScreen />;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
            <SEO
                title="Biblioteca de Modelos de Funis de Vendas | FluxFunnel"
                description="Acesse dezenas de modelos de funis validados gratuitamente. Templates para lançamentos, perpétuo, PLR, webinar e muito mais. Copie e edite agora."
                keywords="modelos de funil, templates funil de vendas, funil meteórico template, funil perpétuo modelo, funil plr"
                url="https://www.fluxfunnel.fun/templates"
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "ItemList",
                    "itemListElement": filteredTemplates.map((t, index) => ({
                        "@type": "ListItem",
                        "position": index + 1,
                        "name": getTemplateName(t),
                        "description": getTemplateDesc(t)
                    }))
                }}
            />

            <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            aria-label="Voltar"
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div className="flex items-center gap-2">
                            <Rocket className="text-indigo-600 dark:text-indigo-400" />
                            <span className="font-bold text-xl">Biblioteca de Modelos</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
                        Comece com o pé direito
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
                        Explore modelos validados para diferentes estratégias e nichos.
                    </p>

                    <div className="max-w-md mx-auto relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar modelos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((template) => (
                        <div key={template.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all group">
                            <div className="h-40 bg-slate-100 dark:bg-slate-700 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
                                <Rocket className="text-slate-300 dark:text-slate-600 w-12 h-12" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => onUseTemplate(template.id)} className="bg-white text-indigo-900 px-6 py-2 rounded-full font-bold transform scale-90 group-hover:scale-100 transition-transform">
                                        Usar Modelo
                                    </button>
                                </div>
                            </div>
                            <h3 className="font-bold text-lg mb-2">{getTemplateName(template)}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                {getTemplateDesc(template)}
                            </p>
                        </div>
                    ))}

                    {filteredTemplates.length === 0 && (
                        <div className="col-span-full text-center py-20 text-slate-500">
                            Nenhum modelo encontrado para sua busca.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PublicTemplatesPage;
