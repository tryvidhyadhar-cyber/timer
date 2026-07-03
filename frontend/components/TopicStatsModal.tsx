import React, { useMemo } from 'react';
import { X, Clock, Calendar, CalendarDays, Infinity as InfinityIcon } from 'lucide-react';
import { useAppStore } from '../store';
import { calculateTopicStats } from '../utils';
import { Topic } from '../types';

interface TopicStatsModalProps {
  topic: Topic | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TopicStatsModal: React.FC<TopicStatsModalProps> = ({ topic, isOpen, onClose }) => {
  const { state } = useAppStore();

  const stats = useMemo(() => {
    if (!topic) return null;
    return calculateTopicStats(state.blocks, topic.id);
  }, [topic, state.blocks]);

  if (!isOpen || !topic || !stats) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-0 animate-in fade-in duration-200">
      <div className="bg-neutral-900 w-full max-w-sm rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-5 border-b border-neutral-800">
          <h3 className="text-xl font-bold text-neutral-100">{topic.name}</h3>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-neutral-800 text-neutral-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-850 p-4 rounded-2xl border border-neutral-800">
              <div className="flex items-center gap-2 text-neutral-400 mb-2">
                <Clock size={16} />
                <span className="text-xs font-medium uppercase tracking-wider">Today</span>
              </div>
              <p className="text-2xl font-bold text-neutral-100">{stats.today}<span className="text-sm text-neutral-500 ml-1">hrs</span></p>
            </div>
            
            <div className="bg-neutral-850 p-4 rounded-2xl border border-neutral-800">
              <div className="flex items-center gap-2 text-neutral-400 mb-2">
                <Calendar size={16} />
                <span className="text-xs font-medium uppercase tracking-wider">This Week</span>
              </div>
              <p className="text-2xl font-bold text-neutral-100">{stats.week}<span className="text-sm text-neutral-500 ml-1">hrs</span></p>
            </div>

            <div className="bg-neutral-850 p-4 rounded-2xl border border-neutral-800">
              <div className="flex items-center gap-2 text-neutral-400 mb-2">
                <CalendarDays size={16} />
                <span className="text-xs font-medium uppercase tracking-wider">This Month</span>
              </div>
              <p className="text-2xl font-bold text-neutral-100">{stats.month}<span className="text-sm text-neutral-500 ml-1">hrs</span></p>
            </div>

            <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <InfinityIcon size={16} />
                <span className="text-xs font-medium uppercase tracking-wider">Lifetime</span>
              </div>
              <p className="text-2xl font-bold text-blue-100">{stats.lifetime}<span className="text-sm text-blue-500/70 ml-1">hrs</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
