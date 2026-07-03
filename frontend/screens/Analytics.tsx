import React, { useState, useMemo } from 'react';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../store';
import { calculateStats } from '../utils';
import { PartStatsModal } from '../components/PartStatsModal';
import { TrackPart } from '../types';

type Period = 'Today' | 'Week' | 'Month';

export const AnalyticsScreen: React.FC = () => {
  const { state } = useAppStore();
  const [period, setPeriod] = useState<Period>('Week');
  const [selectedPart, setSelectedPart] = useState<TrackPart | null>(null);

  const stats = useMemo(() => {
    const now = new Date();
    let start, end;
    
    switch (period) {
      case 'Today':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'Week':
        start = startOfWeek(now, { weekStartsOn: 1 });
        end = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'Month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
    }
    
    return calculateStats(state.blocks, state, start, end);
  }, [state, period]);

  const activityData = Object.entries(stats.activityBreakdown)
    .map(([name, value]) => {
      const activity = state.activities.find(a => a.name === name);
      return { name, value, color: activity?.color || '#8884d8' };
    })
    .sort((a, b) => b.value - a.value);

  const partData = Object.entries(stats.partBreakdown)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const handlePartClick = (partName: string) => {
    for (const track of state.tracks) {
      const part = track.parts.find(p => p.name === partName);
      if (part) {
        setSelectedPart(part);
        return;
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-app-bg overflow-y-auto pb-32 no-scrollbar animate-fade-in-up">
      <div className="px-6 pt-12 pb-4 sticky top-0 bg-app-bg/90 backdrop-blur-xl z-10 border-b border-transparent transition-colors">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-6">Analytics</h1>
        
        <div className="flex bg-app-surface p-1 rounded-2xl border border-app-border">
          {(['Today', 'Week', 'Month'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                period === p 
                  ? 'bg-white/10 text-white shadow-sm' 
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 space-y-6 max-w-2xl mx-auto w-full mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-app-surface p-6 rounded-[24px] border border-app-border">
            <p className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-2">Productivity</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white tracking-tighter">{stats.score}</span>
              <span className="text-xl font-bold text-white/40">%</span>
            </div>
          </div>
          <div className="bg-app-surface p-6 rounded-[24px] border border-app-border">
            <p className="text-xs text-white/50 font-semibold uppercase tracking-wider mb-2">Tracked Time</p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white tracking-tighter">{stats.totalTracked}</span>
              <span className="text-xl font-bold text-white/40">h</span>
            </div>
          </div>
        </div>

        <div className="bg-app-surface p-6 rounded-[32px] border border-app-border">
          <h3 className="text-lg font-bold text-white tracking-tight mb-6">Activity Distribution</h3>
          {activityData.length > 0 ? (
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-48 h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activityData}
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={4}
                    >
                      {activityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
                      itemStyle={{ color: '#fff', fontWeight: 600 }}
                      formatter={(value: number) => [`${value} hrs`, 'Time']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 w-full space-y-4">
                {activityData.map(item => (
                  <div key={item.name} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-white">{item.value}h</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-white/30 text-sm font-medium">
              No data for this period
            </div>
          )}
        </div>

        {partData.length > 0 && (
          <div className="bg-app-surface p-6 rounded-[32px] border border-app-border">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white tracking-tight">Top Focus Areas</h3>
            </div>
            <div className="space-y-2">
              {partData.map((item, index) => (
                <div 
                  key={item.name}
                  onClick={() => handlePartClick(item.name)}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.04] transition-all cursor-pointer group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-white/30 font-bold text-sm w-4">{index + 1}</span>
                    <span className="text-white/80 font-semibold group-hover:text-white transition-colors">{item.name}</span>
                  </div>
                  <span className="text-white/50 font-medium text-sm bg-white/5 px-3 py-1 rounded-full">{item.value}h</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <PartStatsModal 
        part={selectedPart} 
        isOpen={!!selectedPart} 
        onClose={() => setSelectedPart(null)} 
      />
    </div>
  );
};
