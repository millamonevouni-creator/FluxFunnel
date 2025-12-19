import React from 'react';
import { ArrowLeft, GitGraph, Sparkles } from 'lucide-react';
import { PROJECT_TEMPLATES } from '../constants';

interface PublicGalleryProps {
  onBack: () => void;
  onUseTemplate: (templateId: string) => void;
  t: (key: any) => string;
}

const PublicGallery = ({ onBack, onUseTemplate, t }: PublicGalleryProps) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium transition-colors">
            <ArrowLeft size={20} />
            {t('backToHome')}
          </button>
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                 <GitGraph className="text-white" size={18} />
             </div>
             <span className="font-bold text-lg">{t('footerLinkSims')}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Galeria de Estratégias</h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                Explore modelos prontos de funis de alta conversão. Escolha um e comece a editar em segundos.
            </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PROJECT_TEMPLATES.map((template) => (
                <div key={template.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden">
                    {/* Preview Area */}
                    <div className="bg-slate-100 h-48 flex items-center justify-center border-b border-slate-100 group-hover:bg-indigo-50 transition-colors relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
                        <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-500">
                            {React.cloneElement(template.icon as React.ReactElement<any>, { size: 64, className: "text-indigo-600 drop-shadow-md" })}
                        </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col">
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">{t(template.labelKey)}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
                            {t(template.descriptionKey)}
                        </p>
                        
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {template.nodes.slice(0, 3).map((node: any, i: number) => (
                                    <span key={i} className="text-[10px] px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium border border-slate-200">
                                        {node.data.label}
                                    </span>
                                ))}
                                {template.nodes.length > 3 && (
                                    <span className="text-[10px] px-2 py-1 bg-slate-100 text-slate-400 rounded-md font-medium">
                                        +{template.nodes.length - 3}
                                    </span>
                                )}
                            </div>

                            <button 
                                onClick={() => onUseTemplate(template.id)}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group-hover:translate-y-0"
                            >
                                <Sparkles size={18} />
                                Usar este Modelo
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PublicGallery;