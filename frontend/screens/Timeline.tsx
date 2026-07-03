import React, { useState, useEffect, useRef } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useAppStore } from '../store';
import { formatTime, getBlockKey } from '../utils';
import { EntryModal } from '../components/EntryModal';

export const TimelineScreen: React.FC = () => {
  const { state } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const dateStr = format(currentDate, 'yyyy-MM-dd');

  useEffect(() => {
    if (format(new Date(), 'yyyy-MM-dd') === dateStr && scrollRef.current) {
      const currentHour = new Date().getHours();
      const blockIndex = currentHour * 2;
      const blockElement = document.getElementById(`block-${blockIndex}`);
      if (blockElement) {
        blockElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [dateStr]);

  const handleBlockClick = (index: number) => {
    setSelectedBlock(index);
    setModalOpen(true);
  };

  const renderBlock = (index: number) => {
    const key = getBlockKey(dateStr, index);
    const blockData = state.blocks[key];
    const activity = blockData ? state.activities.find(a => a.id === blockData.activityId) : null;
    
    let trackName = '';
    let partName = '';
    let itemName = '';

    if (blockData?.trackId) {
      const track = state.tracks.find(t => t.id === blockData.trackId);
      if (track) {
        trackName = track.name;
        if (blockData.partId) {
          const part = track.parts.find(p => p.id === blockData.partId);
          if (part) {
            partName = part.name;
            if (blockData.itemId) {
              const item = [...(part.lectures || []), ...(part.assignments || [])].find(i => i.id === blockData.itemId);
              if (item) itemName = item.name;
            }
          }
        }
      }
    }

    return (
      <div 
        key={index} 
        id={`block-${index}`}
        onClick={() => handleBlockClick(index)}
        className="flex items-stretch group cursor-pointer min-h-[64px] relative"
      >
        {/* Time Column */}
        <div className="w-16 flex-shrink-0 flex flex-col items-end pr-4 py-3 relative">
          <span className="text-xs font-medium text-white/40 tracking-wide">{formatTime(index)}</span>
          {/* Elegant Timeline line connector */}
          {index !== 47 && (
            <div className="absolute right-[-1px] top-8 bottom-[-8px] w-[1px] bg-white/10 group-hover:bg-white/20 transition-colors" />
          )}
          {/* Node dot */}
          <div className="absolute right-[-3px] top-[18px] w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-white/40 transition-colors" />
        </div>

        {/* Content Column */}
        <div className="flex-1 pl-6 py-1.5">
          {activity ? (
            <div 
              className="h-full rounded-2xl p-3 flex flex-col justify-center transition-all duration-200 active:scale-[0.98] border border-white/5"
              style={{ 
                backgroundColor: `${activity.color}10`, 
                borderLeft: `4px solid ${activity.color}` 
              }}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm tracking-tight" style={{ color: activity.color }}>
                  {activity.name} {trackName ? <span className="opacity-70 font-medium">· {trackName}</span> : ''}
                </span>
              </div>
              {partName && (
                <span className="text-xs text-white/60 mt-1 font-medium tracking-wide">
                  {partName} {itemName ? <span className="opacity-60">({itemName})</span> : ''}
                </span>
              )}
            </div>
          ) : (
            <div className="h-full rounded-2xl border border-transparent bg-white/[0.02] group-hover:bg-white/[0.05] group-hover:border-white/10 transition-all duration-200 flex items-center px-4 active:scale-[0.98]">
              <span className="text-xs text-white/30 font-medium tracking-wide">Tap to track</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-app-bg animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-app-bg/80 backdrop-blur-xl sticky top-0 z-10 border-b border-app-border">
        <button 
          onClick={() => setCurrentDate(subDays(currentDate, 1))}
          className="p-2 rounded-full hover:bg-white/10 text-white/60 transition-colors active:scale-95"
        >
          <ChevronLeft size={24} />
        </button>
        
        <div 
          className="flex items-center gap-2 cursor-pointer hover:bg-white/5 px-4 py-2 rounded-full transition-colors active:scale-95" 
          onClick={() => setCurrentDate(new Date())}
        >
          <CalendarIcon size={16} className="text-white/50" />
          <h2 className="text-sm font-semibold text-white tracking-wide">
            {format(currentDate, 'EEEE, MMM d')}
          </h2>
        </div>

        <button 
          onClick={() => setCurrentDate(addDays(currentDate, 1))}
          className="p-2 rounded-full hover:bg-white/10 text-white/60 transition-colors active:scale-95"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto pb-32 px-2 no-scrollbar" ref={scrollRef}>
        <div className="max-w-2xl mx-auto py-6">
          {Array.from({ length: 48 }).map((_, i) => renderBlock(i))}
        </div>
      </div>

      <EntryModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        date={dateStr}
        blockIndex={selectedBlock}
      />
    </div>
  );
};
