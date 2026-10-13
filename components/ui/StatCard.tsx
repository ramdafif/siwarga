import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'urgent' | 'success' | 'info';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}) => {
  const variantStyles = {
    default: 'bg-white border-slate-200 text-slate-900',
    urgent: 'bg-rose-50/50 border-rose-200 text-rose-950',
    success: 'bg-emerald-50/40 border-emerald-200 text-emerald-950',
    info: 'bg-blue-50/40 border-blue-200 text-blue-950',
  };

  const iconColors = {
    default: 'text-slate-600 bg-slate-100',
    urgent: 'text-rose-700 bg-rose-100',
    success: 'text-emerald-700 bg-emerald-100',
    info: 'text-blue-700 bg-blue-100',
  };

  return (
    <div className={`p-4 rounded-xl border transition-all ${variantStyles[variant]}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-slate-500 line-clamp-1">{title}</span>
        <div className={`p-2 rounded-lg shrink-0 ${iconColors[variant]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight font-mono tabular-nums">
          {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
        </span>
        {trend && <span className="text-xs text-slate-500">{trend}</span>}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500 line-clamp-1">{subtitle}</p>}
    </div>
  );
};
