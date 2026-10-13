import React from 'react';
import { ComplaintStatusHistory } from '@/lib/types';
import { StatusBadge } from '../ui/StatusBadge';
import { CheckCircle2, User, Clock } from 'lucide-react';

interface ComplaintTimelineProps {
  history: ComplaintStatusHistory[];
}

export const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="py-4 text-center text-xs text-slate-400">
        Belum ada riwayat perkembangan status.
      </div>
    );
  }

  // Sort ascending for chronological timeline flow
  const sorted = [...history].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {sorted.map((item, idx) => {
        const isLatest = idx === sorted.length - 1;

        return (
          <div key={item.id} className="relative group">
            {/* Timeline node */}
            <div
              className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                isLatest
                  ? 'bg-emerald-600 border-white ring-4 ring-emerald-100'
                  : 'bg-white border-slate-300'
              }`}
            >
              {isLatest ? (
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                <div className="flex items-center gap-2">
                  <StatusBadge status={item.new_status} size="sm" />
                  {item.previous_status && (
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      (sebelumnya: {item.previous_status})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">
                    {new Date(item.created_at).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {item.notes && (
                <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                  {item.notes}
                </p>
              )}

              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                <User className="w-3 h-3 text-slate-400" />
                <span className="font-medium text-slate-700">{item.changed_by_user_name}</span>
                <span>·</span>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                  {item.changed_by_role}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
