import React from 'react';
import { AlertCircle, Zap, ShieldAlert, X } from 'lucide-react';
import { Announcement } from '../types';

interface AnnouncementBannerProps {
    announcements: Announcement[];
    onDismiss?: (id: string) => void;
}

const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ announcements, onDismiss }) => {
    if (!announcements || announcements.length === 0) return null;

    return (
        <div className="flex flex-col w-full z-40">
            {announcements.filter(a => a.isActive).map(ann => (
                <div
                    key={ann.id}
                    className={`
                        w-full px-4 py-3 flex items-center justify-between gap-4 border-b
                        ${ann.type === 'ALERT' ? 'bg-red-600 text-white border-red-700' :
                            ann.type === 'WARNING' ? 'bg-amber-500 text-slate-900 border-amber-600' :
                                'bg-indigo-600 text-white border-indigo-700'}
                    `}
                >
                    <div className="flex items-center gap-3 container mx-auto max-w-7xl">
                        <div className="shrink-0">
                            {ann.type === 'ALERT' ? <ShieldAlert size={20} /> :
                                ann.type === 'WARNING' ? <AlertCircle size={20} /> :
                                    <Zap size={20} />}
                        </div>
                        <div className="flex-1 text-sm font-medium">
                            <span className="font-bold uppercase tracking-wider text-xs mr-2 opacity-80">{ann.title}:</span>
                            {ann.message}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AnnouncementBanner;
