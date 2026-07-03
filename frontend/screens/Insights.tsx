import React, { useMemo } from 'react';
import { Lightbulb, TrendingUp, Target, AlertCircle, Clock } from 'lucide-react';
import { useAppStore } from '../store';
import { generateInsights } from '../utils';

export const InsightsScreen: React.FC = () => {
  const { state } = useAppStore();

  const insights = useMemo(() => {
    return generateInsights(state);
  }, [state]);

  const renderInsightCard = (text: string, index: number) => {
    let icon = <Lightbulb size={24} />;
    let colorClass = "text-yellow-400";
    let bgClass = "bg-yellow-400/10";
    let borderClass = "border-yellow-400/20";

    if (text.includes('score') || text.includes('productivity')) {
      icon = <Target size={24} />;
      colorClass = "text-blue-400";
      bgClass = "bg-blue-400/10";
      borderClass = "border-blue-400/20";
    }
    if (text.includes('consistent') || text.includes('spent')) {
      icon = <TrendingUp size={24} />;
      colorClass = "text-green-400";
      bgClass = "bg-green-400/10";
      borderClass = "border-green-400/20";
    }
    if (text.includes('best between') || text.includes('lost')) {
      icon = <Clock size={24} />;
      colorClass = "text-orange-400";
      bgClass = "bg-orange-400/10";
      borderClass = "border-orange-400/20";
    }

    const lines = text.split('\n');

    return (
      <div key={index} className="bg-app-surface p-6 rounded-[32px] border border-app-border flex flex-col gap-4 relative overflow-hidden group hover:border-white/10 transition-colors">
        <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-[50px] opacity-20 ${bgClass.replace('/10', '')}`} />
        
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${bgClass} ${colorClass} ${borderClass}`}>
          {icon}
        </div>
        
        <div className="pt-2 relative z-10">
          {lines.map((line, i) => (
            <p key={i} className={`text-white/80 leading-relaxed tracking-wide ${i > 0 ? 'font-bold text-xl text-white mt-2 tracking-tight' : 'text-sm font-medium uppercase tracking-wider text-white/50'}`}>
              {line}
            </p>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-app-bg overflow-y-auto pb-32 no-scrollbar animate-fade-in-up">
      <div className="px-6 pt-12 pb-6 sticky top-0 bg-app-bg/90 backdrop-blur-xl z-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">Insights</h1>
        <p className="text-white/40 text-sm mt-2 font-medium">Locally generated analysis of your time.</p>
      </div>

      <div className="px-6 space-y-6 max-w-2xl mx-auto w-full">
        <div className="space-y-4">
          {insights.map((text, i) => renderInsightCard(text, i))}
        </div>
        
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-[24px] flex items-start gap-4 mt-8">
           <AlertCircle size={20} className="text-white/40 shrink-0 mt-0.5" />
           <p className="text-sm text-white/50 font-medium leading-relaxed">All insights are generated locally on your device. Your data never leaves this app.</p>
        </div>
      </div>
    </div>
  );
};
