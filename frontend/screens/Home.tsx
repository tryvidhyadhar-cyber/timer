import React, { useMemo } from 'react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { Flame, Target, Trophy, Clock } from 'lucide-react';
import { useAppStore } from '../store';
import { calculateStats, calculateStreak } from '../utils';

export const HomeScreen: React.FC = () => {
  const { state } = useAppStore();

  const todayStats = useMemo(() => {
    const now = new Date();
    return calculateStats(state.blocks, state, startOfDay(now), endOfDay(now));
  }, [state]);

  const streak = useMemo(() => calculateStreak(state.blocks, state.activities), [state]);

  const topPart = Object.entries(todayStats.partBreakdown).sort((a, b) => b[1] - a[1])[0];
  
  const studyHours = todayStats.activityBreakdown['Study'] || 0;
  const gymHours = todayStats.activityBreakdown['Gym'] || 0;
  const sleepHours = todayStats.activityBreakdown['Sleep'] || 0;

  const progressPercentage = Math.min((todayStats.totalTracked / 24) * 100, 100);

  return (
    <div className="flex flex-col h-full bg-app-bg overflow-y-auto pb-32 no-scrollbar animate-fade-in-up">
      <div className="px-6 pt-12 pb-6">
        <p className="text-white/50 text-sm font-medium tracking-widest uppercase mb-1">{format(new Date(), 'EEEE, MMMM d')}</p>
        <h1 className="text-4xl font-bold text-white tracking-tight">Today</h1>
      </div>

      <div className="px-6 space-y-6 max-w-2xl mx-auto w-full">
        
        {/* Main Progress Card */}
        <div className="bg-app-surface p-6 rounded-[32px] border border-app-border shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="flex justify-between items-end mb-6 relative z-10">
            <div>
              <p className="text-sm text-white/50 font-medium mb-1">Tracked Time</p>
              <div className="flex items-baseline gap-1">
                <p className="text-4xl font-bold text-white tracking-tighter">{todayStats.totalTracked}</p>
                <p className="text-lg text-white/40 font-medium">/ 24h</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/50 font-medium mb-1">Productivity</p>
              <p className="text-4xl font-bold text-blue-400 tracking-tighter">{todayStats.score}%</p>
            </div>
          </div>
          
          <div className="h-4 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 relative z-10">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-app-surface p-5 rounded-[24px] border border-app-border flex flex-col items-center justify-center text-center hover:bg-white/[0.02] transition-colors">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 border border-blue-500/20">
              <Target size={18} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{studyHours}<span className="text-sm text-white/40 ml-0.5">h</span></p>
            <p className="text-xs text-white/50 font-medium mt-1">Study</p>
          </div>
          <div className="bg-app-surface p-5 rounded-[24px] border border-app-border flex flex-col items-center justify-center text-center hover:bg-white/[0.02] transition-colors">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center mb-3 border border-orange-500/20">
              <Flame size={18} className="text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{gymHours}<span className="text-sm text-white/40 ml-0.5">h</span></p>
            <p className="text-xs text-white/50 font-medium mt-1">Gym</p>
          </div>
          <div className="bg-app-surface p-5 rounded-[24px] border border-app-border flex flex-col items-center justify-center text-center hover:bg-white/[0.02] transition-colors">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-3 border border-purple-500/20">
              <Clock size={18} className="text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{sleepHours}<span className="text-sm text-white/40 ml-0.5">h</span></p>
            <p className="text-xs text-white/50 font-medium mt-1">Sleep</p>
          </div>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-app-surface to-app-bg p-6 rounded-[24px] border border-app-border relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 text-white/5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
              <Trophy size={100} strokeWidth={1} />
            </div>
            <p className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-2 relative z-10">Top Focus</p>
            <p className="text-xl font-bold text-white relative z-10 truncate tracking-tight">
              {topPart ? topPart[0] : 'None yet'}
            </p>
            {topPart && <p className="text-sm text-blue-400 font-medium mt-1 relative z-10">{topPart[1]} hours</p>}
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-app-surface p-6 rounded-[24px] border border-orange-500/20 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 text-orange-500/10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12">
              <Flame size={100} strokeWidth={1} />
            </div>
            <p className="text-xs text-orange-500/70 font-semibold uppercase tracking-wider mb-2 relative z-10">Current Streak</p>
            <div className="flex items-baseline gap-1 relative z-10">
              <p className="text-4xl font-bold text-orange-400 tracking-tighter">{streak}</p>
              <p className="text-sm text-orange-500/70 font-medium mb-1">Days</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
