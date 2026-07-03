import React, { useMemo } from 'react';
import { X, Clock, Calendar, CalendarDays, Infinity as InfinityIcon } from 'lucide-react';
import { useAppStore } from '../store';
import { calculatePartStats } from '../utils';
import { TrackPart } from '../types';

interface PartStatsModalProps {
  part: TrackPart | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PartStatsModal: React.FC<PartStatsModalProps> = ({ part, isOpen, onClose }) => {
  const { state } = useAppStore();

  const stats = useMemo(() => {
    if (!part) return null;
    return calculatePartStats(state.blocks, part.id);
  }, [part, state.blocks]);

  if (!isOpen || !part || !stats) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-fade-in-up">
      <div className="bg-app-surface w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] overflow-hidden border border-app-border shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col animate-scale-in">
        
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h3 className="text-2xl font-bold text-white tracking-tight">{part.name}</h3>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-white/10 text-white/60 transition-colors active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/[0.02] p-5 rounded-[24px] border border-white/5">
              <div className="flex items-center gap-2 text-white/40 mb-3">
                <Clock size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Today</span>
              </div>
              <p className="text-3xl font-bold text-white tracking-tighter">{stats.today}<span className="text-sm text-white/40 ml-1">h</span></p>
            </div>
            
            <div className="bg-white/[0.02] p-5 rounded-[24px] border border-white/5">
              <div className="flex items-center gap-2 text-white/40 mb-3">
                <Calendar size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">This Week</span>
              </div>
              <p className="text-3xl font-bold text-white tracking-tighter">{stats.week}<span className="text-sm text-white/40 ml-1">h</span></p>
            </div>

            <div className="bg-white/[0.02] p-5 rounded-[24px] border border-white/5">
              <div className="flex items-center gap-2 text-white/40 mb-3">
                <CalendarDays size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">This Month</span>
              </div>
              <p className="text-3xl font-bold text-white tracking-tighter">{stats.month}<span className="text-sm text-white/40 ml-1">h</span></p>
            </div>

            <div className="bg-blue-500/10 p-5 rounded-[24px] border border-blue-500/20">
              <div className="flex items-center gap-2 text-blue-400 mb-3">
                <InfinityIcon size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Lifetime</span>
              </div>
              <p className="text-3xl font-bold text-blue-100 tracking-tighter">{stats.lifetime}<span className="text-sm text-blue-500/70 ml-1">h</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
