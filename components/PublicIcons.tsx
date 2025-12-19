import React from 'react';
import { ArrowLeft, GitGraph, Lock } from 'lucide-react';
import { NODE_CONFIG, NODE_CATEGORY } from '../constants';
import { NodeType } from '../types';

interface PublicIconsProps {
  onBack: () => void;
  t: (key: any) => string;
}

const PublicIcons = ({ onBack, t }: PublicIconsProps) => {
  // Group icons by category logic similar to Sidebar
  const categories = [
    { id: 'TRAFFIC', label: t('trafficSources'), types: [] as NodeType[] },
    { id: 'CHANNELS', label: t('communication'), types: [] as NodeType[] },
    { id: 'PAGES', label: t('funnelPages'), types: [] as NodeType[] },
    { id: 'OPS', label: t('opsLogic'), types: [] as NodeType[] },
  ];

  // Manual sorting to match sidebar roughly, or iterating NODE_CONFIG
  // Using the same grouping logic manually for visual consistency with sidebar
  const TRAFFIC_TYPES = [
      NodeType.META_ADS, NodeType.FACEBOOK_ADS, NodeType.INSTAGRAM, NodeType.GOOGLE_ADS, 
      NodeType.GOOGLE_SEARCH, NodeType.YOUTUBE, NodeType.BING_ADS, NodeType.TIKTOK_ADS, 
      NodeType.KWAI, NodeType.TWITCH, NodeType.PINTEREST, NodeType.ORGANIC_SOCIAL
  ];
  const CHANNEL_TYPES = [
      NodeType.WHATSAPP, NodeType.TELEGRAM, NodeType.DISCORD, NodeType.ZOOM, 
      NodeType.GOOGLE_MEET, NodeType.EMAIL, NodeType.SMS, NodeType.CALL
  ];
  const PAGE_TYPES = [
      NodeType.LANDING_PAGE, NodeType.OPTIN_PAGE, NodeType.VSL, NodeType.CHECKOUT, 
      NodeType.ORDER_PAGE, NodeType.UPSELL, NodeType.DOWNSELL, NodeType.THANK_YOU, 
      NodeType.WEBINAR, NodeType.LIVE_WEBINAR, NodeType.POPUP, NodeType.DOWNLOAD_PAGE, 
      NodeType.CALENDAR_PAGE, NodeType.GENERIC_PAGE, NodeType.BLOG, NodeType.QUIZ, NodeType.MEMBERSHIP_AREA
  ];
  const OPS_TYPES = [
      NodeType.NOTE, NodeType.ADD_TO_CART, NodeType.ADD_TO_LIST, NodeType.AB_TEST,
      NodeType.LEAD, NodeType.SUBSCRIBER, NodeType.REVENUE, NodeType.CRM_PIPELINE, NodeType.MEETING
  ];

  categories[0].types = TRAFFIC_TYPES;
  categories[1].types = CHANNEL_TYPES;
  categories[2].types = PAGE_TYPES;
  categories[3].types = OPS_TYPES;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
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
             <span className="font-bold text-lg">{t('footerLinkIntegrations')}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Biblioteca de Elementos</h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                Mais de 40 integrações e elementos visuais para mapear qualquer estratégia digital.
            </p>
        </div>

        <div className="space-y-16">
            {categories.map((cat) => (
                <div key={cat.id}>
                    <div className="flex items-center gap-4 mb-8">
                        <h2 className="text-2xl font-bold text-slate-800">{cat.label}</h2>
                        <div className="h-px bg-slate-200 flex-1"></div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        {cat.types.map((type) => {
                            const config = NODE_CONFIG[type];
                            return (
                                <div key={type} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-3 hover:shadow-md hover:-translate-y-1 transition-all group">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${config.bg} relative`}>
                                        {React.cloneElement(config.icon as React.ReactElement<any>, { size: 24, color: 'white' })}
                                        {config.isPro && (
                                            <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 border border-slate-100 shadow-sm">
                                                <Lock size={10} className="text-amber-500" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs font-bold text-center text-slate-600 group-hover:text-indigo-600">{config.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PublicIcons;