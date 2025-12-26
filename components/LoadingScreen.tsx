import React from 'react';
import { Sparkles } from 'lucide-react';

export const LoadingScreen = () => (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles size={16} className="text-indigo-400 animate-pulse" />
            </div>
        </div>
        <h1 className="text-xl font-black text-white tracking-widest uppercase opacity-80 animate-pulse">Carregando FluxFunnel...</h1>
    </div>
);
