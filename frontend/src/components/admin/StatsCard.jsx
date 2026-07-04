import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color }) => {
  const colorMaps = {
    primary: 'bg-primary-50 text-primary-600 border-primary-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  const currentColor = colorMaps[color] || colorMaps.indigo;

  return (
    <div className={`bg-white border rounded-2xl p-6 shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md`}>
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-gray-900 leading-none">{value}</p>
      </div>
      <div className={`p-4 rounded-2xl border ${currentColor} flex items-center justify-center`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

export default StatsCard;
