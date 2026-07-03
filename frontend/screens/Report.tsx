import React, { useRef, useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { Share, Download, Loader2, Sparkles } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { useAppStore } from '../store';
import { calculateStats, calculateStreak } from '../utils';

export const ReportScreen: React.FC = () => {
  const { state } = useAppStore();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const stats = useMemo(() => {
    const now = new Date();
    return calculateStats(state.blocks, state, startOfWeek(now, { weekStartsOn: 1 }), endOfWeek(now, { weekStartsOn: 1 }));
  }, [state]);

  const streak = useMemo(() => calculateStreak(state.blocks, state.activities), [state]);

  const topPart = Object.entries(stats.partBreakdown).sort((a, b) => b[1] - a[1])[0];
  const studyHours = stats.activityBreakdown['Study'] || 0;
  const gymHours = stats.activityBreakdown['Gym'] || 0;
  const sleepHours = stats.activityBreakdown['Sleep'] || 0;

  const topTracks = Object.entries(stats.trackBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const generateImage = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const dataUrl = await htmlToImage.toPng(reportRef.current, {
        quality: 1.0,
        pixelRatio: 3,
        backgroundColor: '#000000'
      });
      setGeneratedImage(dataUrl);
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('Failed to generate report.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.download = `TimeOS-Report-${format(new Date(), 'yyyy-MM-dd')}.png`;
      link.href = generatedImage;
      link.click();
    }
  };

  return (
    <div className="flex flex-col h-full bg-app-bg overflow-y-auto pb-32 no-scrollbar animate-fade-in-up">
      <div className="px-6 pt-12 pb-6 sticky top-0 bg-app-bg/90 backdrop-blur-xl z-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Share</h1>
          <p className="text-white/40 text-sm mt-2 font-medium">Generate a beautiful summary.</p>
        </div>
        {!generatedImage && (
          <button 
            onClick={generateImage}
            disabled={isGenerating}
            className="bg-white text-black px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-white/90 transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Share size={18} />}
            Generate
          </button>
        )}
      </div>

      <div className="px-6 max-w-md mx-auto w-full flex flex-col items-center">
        
        {generatedImage ? (
          <div className="w-full flex flex-col items-center gap-8 animate-scale-in">
            <img src={generatedImage} alt="Generated Report" className="w-full rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10" />
            <div className="flex gap-4 w-full">
              <button 
                onClick={handleDownload}
                className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors active:scale-95"
              >
                <Download size={20} />
                Save to Photos
              </button>
              <button 
                onClick={() => setGeneratedImage(null)}
                className="px-6 bg-white/10 text-white py-4 rounded-2xl font-bold hover:bg-white/20 transition-colors active:scale-95"
              >
                Back
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full relative">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-[32px]">
               <p className="text-white/60 font-semibold tracking-wide">Tap Generate to create image</p>
            </div>
            
            {/* Social Media Report Design */}
            <div 
              ref={reportRef} 
              className="w-[400px] h-[711px] bg-[#050505] p-8 rounded-[40px] flex flex-col justify-between relative overflow-hidden border border-white/5"
              style={{ transformOrigin: 'top left', transform: 'scale(1)' }}
            >
              {/* Background Gradients */}
              <div className="absolute top-[-15%] left-[-15%] w-80 h-80 bg-blue-600/40 rounded-full blur-[100px]"></div>
              <div className="absolute bottom-[-15%] right-[-15%] w-80 h-80 bg-purple-600/40 rounded-full blur-[100px]"></div>

              {/* Header */}
              <div className="relative z-10 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={18} className="text-blue-400" />
                    <h2 className="text-xs font-bold text-blue-400 tracking-[0.2em] uppercase">TimeOS Daily</h2>
                  </div>
                  <p className="text-4xl font-extrabold text-white tracking-tighter">{format(new Date(), 'MMMM d, yyyy')}</p>
                </div>
              </div>

              {/* Main Stats Grid */}
              <div className="relative z-10 grid grid-cols-2 gap-4 my-8">
                <div className="bg-white/[0.03] backdrop-blur-xl p-6 rounded-[28px] border border-white/[0.05]">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">Study</p>
                  <p className="text-4xl font-bold text-white tracking-tighter">{studyHours}<span className="text-xl text-white/40 ml-1">h</span></p>
                </div>
                <div className="bg-white/[0.03] backdrop-blur-xl p-6 rounded-[28px] border border-white/[0.05]">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">Productivity</p>
                  <p className="text-4xl font-bold text-white tracking-tighter">{stats.score}%</p>
                </div>
                <div className="bg-white/[0.03] backdrop-blur-xl p-6 rounded-[28px] border border-white/[0.05]">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">Gym</p>
                  <p className="text-4xl font-bold text-white tracking-tighter">{gymHours}<span className="text-xl text-white/40 ml-1">h</span></p>
                </div>
                <div className="bg-white/[0.03] backdrop-blur-xl p-6 rounded-[28px] border border-white/[0.05]">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">Sleep</p>
                  <p className="text-4xl font-bold text-white tracking-tighter">{sleepHours}<span className="text-xl text-white/40 ml-1">h</span></p>
                </div>
              </div>

              {/* Highlights */}
              <div className="relative z-10 space-y-4 flex-1">
                {topPart && (
                  <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 rounded-[28px] border border-white/10">
                    <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2">Top Focus</p>
                    <p className="text-3xl font-bold text-white tracking-tight">{topPart[0]}</p>
                  </div>
                )}

                {topTracks.length > 0 && (
                  <div className="bg-white/[0.03] backdrop-blur-xl p-6 rounded-[28px] border border-white/[0.05]">
                    <div className="space-y-4">
                      {topTracks.map(([name, hours]) => (
                        <div key={name} className="flex justify-between items-center">
                          <span className="text-white/80 font-semibold text-lg">{name}</span>
                          <span className="text-white font-bold text-lg">{hours}h</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="relative z-10 mt-8 flex justify-between items-end">
                <div className="bg-orange-500/20 px-5 py-2.5 rounded-full border border-orange-500/30">
                  <p className="text-orange-400 font-bold text-sm tracking-wide">🔥 {streak} Day Streak</p>
                </div>
                <p className="text-white/20 text-[10px] font-bold tracking-[0.2em] uppercase">Generated by TimeOS</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
