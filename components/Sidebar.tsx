
import React from 'react';
import { NodeType, UserPlan } from '../types';
import { NODE_CONFIG, NODE_CATEGORY } from '../constants';
import { Monitor, CreditCard, Activity, ArrowRightLeft, Lock } from 'lucide-react';

interface SidebarProps {
  isDark: boolean;
  t: (key: any) => string;
  userPlan: UserPlan;
}

const Sidebar = ({ isDark, t, userPlan }: SidebarProps) => {
  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    // Prevent dragging if locked
    if (userPlan === 'FREE' && NODE_CONFIG[nodeType].isPro) {
        event.preventDefault();
        return;
    }
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const categories = [
    { 
        id: 'TRAFFIC', 
        label: t('trafficSources'), 
        icon: <Activity size={14} />, 
        types: [
            NodeType.META_ADS, 
            NodeType.FACEBOOK_ADS, 
            NodeType.INSTAGRAM, 
            NodeType.GOOGLE_ADS, 
            NodeType.GOOGLE_SEARCH, 
            NodeType.YOUTUBE, 
            NodeType.BING_ADS,      
            NodeType.TIKTOK_ADS, 
            NodeType.KWAI, 
            NodeType.TWITCH,
            NodeType.PINTEREST,
            NodeType.ORGANIC_SOCIAL, 
        ] 
    },
    { 
        id: 'CHANNELS', 
        label: t('communication'), 
        icon: <ArrowRightLeft size={14} />, 
        types: [
            NodeType.WHATSAPP, 
            NodeType.TELEGRAM, 
            NodeType.DISCORD, 
            NodeType.ZOOM, 
            NodeType.GOOGLE_MEET,
            NodeType.EMAIL, 
            NodeType.SMS, 
            NodeType.CALL
        ] 
    },
    { 
        id: 'PAGES', 
        label: t('funnelPages'), 
        icon: <Monitor size={14} />, 
        types: [
            NodeType.LANDING_PAGE, 
            NodeType.OPTIN_PAGE, 
            NodeType.VSL, 
            NodeType.CHECKOUT, 
            NodeType.ORDER_PAGE, 
            NodeType.UPSELL, 
            NodeType.DOWNSELL, 
            NodeType.THANK_YOU, 
            NodeType.WEBINAR, 
            NodeType.LIVE_WEBINAR, 
            NodeType.POPUP, 
            NodeType.DOWNLOAD_PAGE, 
            NodeType.CALENDAR_PAGE, 
            NodeType.GENERIC_PAGE, 
            NodeType.BLOG, 
            NodeType.QUIZ,
            NodeType.MEMBERSHIP_AREA,
            NodeType.SYSTEM_PAGE, // New
            NodeType.ECOMMERCE_PAGE, // New
        ] 
    },
    { 
        id: 'OPS', 
        label: t('opsLogic'), 
        icon: <CreditCard size={14} />, 
        types: [
            NodeType.NOTE, 
            NodeType.ADD_TO_CART, 
            NodeType.ADD_TO_LIST, 
            NodeType.AB_TEST,
            NodeType.LEAD, 
            NodeType.SUBSCRIBER, 
            NodeType.REVENUE, 
            NodeType.CRM_PIPELINE, 
            NodeType.MEETING, 
        ] 
    },
  ];

  const bgColor = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const textColor = isDark ? 'text-white' : 'text-slate-800';
  const subTextColor = isDark ? 'text-slate-400' : 'text-slate-500';

  return (
    <aside className={`w-80 border-r flex flex-col h-full z-10 shadow-xl transition-colors duration-300 ${bgColor}`}>
      <div className={`p-5 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <h2 className={`font-bold text-lg tracking-tight ${textColor}`}>
          {t('componentLib')}
        </h2>
        <p className={`text-xs mt-1 ${subTextColor}`}>{t('dragElements')}</p>
      </div>
      
      <div className="flex-1 overflow-y-auto min-h-0 p-5 space-y-8 scrollbar-thin scrollbar-thumb-slate-400">
        {categories.map((cat) => (
          <div key={cat.id}>
            <div className="flex items-center gap-2 mb-4">
                <span className="text-indigo-600">{cat.icon}</span>
                <h3 className={`text-xs font-bold uppercase tracking-widest ${subTextColor}`}>{cat.label}</h3>
            </div>
            
            <div className="grid gap-3 grid-cols-3">
              {cat.types.map((type) => {
                const config = NODE_CONFIG[type];
                const isLocked = userPlan === 'FREE' && config.isPro;
                
                return (
                    <div
                        key={type}
                        onDragStart={(event) => onDragStart(event, type)}
                        draggable={!isLocked}
                        className={`group flex flex-col items-center ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-grab active:cursor-grabbing'}`}
                        title={isLocked ? "Upgrade to Pro to use" : config.label}
                    >
                        {/* The App Icon Miniature (Unified Style for ALL types) */}
                        <div className={`
                            w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border-b-2 transition-all duration-200 
                            ${!isLocked ? 'hover:scale-110 hover:-translate-y-1 hover:shadow-lg' : ''}
                            ${config.bg} ${isDark ? 'border-black/20' : 'border-slate-300'}
                            relative
                        `}>
                            {/* Force white icon for these colored tiles */}
                            {React.cloneElement(config.icon as React.ReactElement<any>, { size: 28, color: 'white' })}

                            {isLocked && (
                                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
                                    <Lock size={16} className="text-white" />
                                </div>
                            )}
                        </div>
                        
                        {/* Label */}
                        <span className={`mt-2 text-[10px] font-medium text-center leading-tight max-w-[70px] ${subTextColor} ${!isLocked && `group-hover:${textColor}`}`}>
                            {config.label}
                        </span>
                    </div>
                );
              })}
            </div>
          </div>
        ))}
        <div className="h-10"></div>
      </div>
    </aside>
  );
};

export default Sidebar;
