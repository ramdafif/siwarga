import React from 'react';
import Link from 'next/link';
import { Complaint } from '@/lib/types';
import { StatusBadge, PriorityBadge } from '../ui/StatusBadge';
import { MapPin, MessageSquare, Paperclip, Calendar, User } from 'lucide-react';

interface ComplaintCardProps {
  complaint: Complaint;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint }) => {
  return (
    <Link
      href={`/complaints/${complaint.id}`}
      className="group block p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-150"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
          <span className="font-mono font-semibold text-slate-800 tracking-tight">
            #{complaint.ticket_number}
          </span>
          <span>·</span>
          <span>{complaint.category_name || 'Umum'}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {new Date(complaint.created_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <PriorityBadge priority={complaint.priority} />
          <StatusBadge status={complaint.status} size="sm" />
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
          {complaint.title}
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {complaint.description}
        </p>
      </div>

      <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-50">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-slate-700 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              RT {complaint.rt_number || '01'} / RW {complaint.rw_number || '01'}
            </span>
          </span>

          <span className="flex items-center gap-1">
            <User className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate max-w-[120px]">{complaint.reporter_name || 'Warga'}</span>
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
          {complaint.attachments && complaint.attachments.length > 0 && (
            <span className="flex items-center gap-1 text-slate-600">
              <Paperclip className="w-3.5 h-3.5" />
              {complaint.attachments.length}
            </span>
          )}

          {complaint.comments && complaint.comments.length > 0 && (
            <span className="flex items-center gap-1 text-slate-600">
              <MessageSquare className="w-3.5 h-3.5" />
              {complaint.comments.length}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
