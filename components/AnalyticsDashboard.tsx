import React from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, MousePointer2 } from 'lucide-react';

const AnalyticsDashboard = ({ isDark }: { isDark: boolean }) => {
  const cardClass = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const textClass = isDark ? 'text-white' : 'text-slate-900';
  const subTextClass = isDark ? 'text-slate-400' : 'text-slate-500';

  const metrics = [
    { label: 'Total Visits', value: '24.5k', change: '+12%', icon: <Users className="text-blue-500" /> },
    { label: 'Conversion Rate', value: '3.2%', change: '+0.8%', icon: <TrendingUp className="text-green-500" /> },
    { label: 'Total Revenue', value: '$12,450', change: '+24%', icon: <DollarSign className="text-emerald-500" /> },
    { label: 'Clicks', value: '8,100', change: '-5%', icon: <MousePointer2 className="text-purple-500" /> },
  ];

  return (
    <div className={`h-full p-8 overflow-y-auto ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="max-w-6xl mx-auto">
        <h2 className={`text-2xl font-bold mb-6 ${textClass}`}>Analytics Overview (Simulation)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((m, i) => (
            <div key={i} className={`p-6 rounded-2xl border shadow-sm ${cardClass}`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-opacity-10 ${isDark ? 'bg-white' : 'bg-slate-100'}`}>
                  {m.icon}
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${m.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {m.change}
                </span>
              </div>
              <h3 className={`text-2xl font-bold mb-1 ${textClass}`}>{m.value}</h3>
              <p className={`text-sm ${subTextClass}`}>{m.label}</p>
            </div>
          ))}
        </div>

        <div className={`p-8 rounded-2xl border flex flex-col items-center justify-center text-center h-64 ${cardClass}`}>
            <BarChart3 size={48} className={`mb-4 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
            <h3 className={`text-lg font-bold ${textClass}`}>Detailed Reports</h3>
            <p className={`max-w-md mt-2 ${subTextClass}`}>
                Connect your real data sources (GA4, Meta Ads) to see live performance metrics overlaying your funnel.
            </p>
            <button className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-all">
                Connect Data Source
            </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;