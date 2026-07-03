import React, { useState, useMemo } from 'react';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../store';
import { calculateStats } from '../utils';

type Period = 'Today' | 'Week' | 'Month';

export const DashboardScreen: React.FC = () => {
  const { state } = useAppStore();
  const [period, setPeriod] = useState<Period>('Today');

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

  const topicData = Object.entries(stats.topicBreakdown)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5

  return (
    <div className="flex flex-col h-full bg-neutral-950 overflow-y-auto pb-24 no-scrollbar">
      <div className="px-6 pt-8 pb-4 sticky top-0 bg-neutral-950/90 backdrop-blur-md z-10">
        <h1 className="text-2xl font-bold text-neutral-100 mb-6">Analytics</h1>
        
        {/* Period Selector */}
        <div className="flex bg-neutral-900 p-1 rounded-xl">
          {(['Today', 'Week', 'Month'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                period === p 
                  ? 'bg-neutral-800 text-neutral-100 shadow-sm' 
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 space-y-6 max-w-2xl mx-auto w-full">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-neutral-900 p-5 rounded-3xl border border-neutral-800">
            <p className="text-sm text-neutral-500 font-medium mb-1">Productivity Score</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-neutral-100">{stats.score}%</span>
            </div>
          </div>
          <div className="bg-neutral-900 p-5 rounded-3xl border border-neutral-800">
            <p className="text-sm text-neutral-500 font-medium mb-1">Tracked Time</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-neutral-100">{stats.totalTracked}</span>
              <span className="text-neutral-500 font-medium mb-1">hrs</span>
            </div>
          </div>
        </div>

        {/* Activity Distribution */}
        <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800">
          <h3 className="text-base font-semibold text-neutral-100 mb-6">Activity Distribution</h3>
          {activityData.length > 0 ? (
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={activityData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {activityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f1f1f', border: 'none', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: number) => [`${value} hrs`, 'Time']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 w-full space-y-3">
                {activityData.map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-neutral-300">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-neutral-100">{item.value}h</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-neutral-500 text-sm">
              No data for this period
            </div>
          )}
        </div>

        {/* Top Topics */}
        {topicData.length > 0 && (
          <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800">
            <h3 className="text-base font-semibold text-neutral-100 mb-6">Top Study Topics</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#a3a3a3', fontSize: 12 }} width={100} />
                  <Tooltip 
                    cursor={{ fill: '#2d2d2d' }}
                    contentStyle={{ backgroundColor: '#1f1f1f', border: 'none', borderRadius: '12px', color: '#fff' }}
                    formatter={(value: number) => [`${value} hrs`, 'Time']}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
