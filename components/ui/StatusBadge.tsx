import React from 'react';
import { ComplaintStatus, ComplaintPriority } from '@/lib/types';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  UserCheck,
  RotateCw,
  XCircle,
  HelpCircle,
  ArrowRightCircle,
} from 'lucide-react';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<
  ComplaintStatus,
  { label: string; icon: React.ComponentType<{ className?: string }>; colorClass: string }
> = {
  DRAFT: {
    label: 'Draf',
    icon: Clock,
    colorClass: 'text-slate-600 bg-slate-100 border-slate-200',
  },
  SUBMITTED: {
    label: 'Terkirim',
    icon: Clock,
    colorClass: 'text-blue-700 bg-blue-50 border-blue-200',
  },
  VERIFICATION: {
    label: 'Verifikasi RT',
    icon: FileCheck,
    colorClass: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  ACCEPTED: {
    label: 'Diterima',
    icon: CheckCircle2,
    colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  },
  REJECTED: {
    label: 'Ditolak',
    icon: XCircle,
    colorClass: 'text-rose-700 bg-rose-50 border-rose-200',
  },
  ASSIGNED: {
    label: 'Ditugaskan',
    icon: UserCheck,
    colorClass: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  },
  IN_PROGRESS: {
    label: 'Sedang Diproses',
    icon: RotateCw,
    colorClass: 'text-sky-700 bg-sky-50 border-sky-200',
  },
  RESOLVED: {
    label: 'Selesai',
    icon: CheckCircle2,
    colorClass: 'text-teal-700 bg-teal-50 border-teal-200',
  },
  CLOSED: {
    label: 'Ditutup',
    icon: CheckCircle2,
    colorClass: 'text-slate-700 bg-slate-100 border-slate-200',
  },
  NEED_MORE_INFORMATION: {
    label: 'Butuh Info Tambahan',
    icon: HelpCircle,
    colorClass: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  FORWARDED: {
    label: 'Diteruskan ke RW',
    icon: ArrowRightCircle,
    colorClass: 'text-purple-700 bg-purple-50 border-purple-200',
  },
  CANCELLED: {
    label: 'Dibatalkan',
    icon: XCircle,
    colorClass: 'text-neutral-600 bg-neutral-100 border-neutral-200',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const cfg = statusConfig[status] || {
    label: status,
    icon: AlertCircle,
    colorClass: 'text-slate-700 bg-slate-50 border-slate-200',
  };
  const Icon = cfg.icon;

  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-md ${
        isSmall ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
      } ${cfg.colorClass}`}
    >
      <Icon className={isSmall ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />
      <span className="whitespace-nowrap">{cfg.label}</span>
    </span>
  );
};

interface PriorityBadgeProps {
  priority: ComplaintPriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const configs: Record<
    ComplaintPriority,
    { label: string; textClass: string; dotClass: string }
  > = {
    LOW: { label: 'Rendah', textClass: 'text-slate-600', dotClass: 'bg-slate-400' },
    MEDIUM: { label: 'Sedang', textClass: 'text-amber-700', dotClass: 'bg-amber-500' },
    HIGH: { label: 'Tinggi', textClass: 'text-orange-700', dotClass: 'bg-orange-500' },
    URGENT: { label: 'Mendesak', textClass: 'text-rose-700 font-semibold', dotClass: 'bg-rose-600 animate-pulse' },
  };

  const cfg = configs[priority] || configs.MEDIUM;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${cfg.textClass}`}>
      <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dotClass}`} />
      <span>{cfg.label}</span>
    </span>
  );
};
