import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store';
import { Activity, Track, TrackPart, TrackItem } from '../types';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  blockIndex: number;
}

type Step = 'ACTIVITY' | 'TRACK' | 'PART' | 'ITEM';

export const EntryModal: React.FC<EntryModalProps> = ({ isOpen, onClose, date, blockIndex }) => {
  const { state, saveBlock } = useAppStore();
  const [step, setStep] = useState<Step>('ACTIVITY');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [selectedPart, setSelectedPart] = useState<TrackPart | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('ACTIVITY');
      setSelectedActivity(null);
      setSelectedTrack(null);
      setSelectedPart(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleActivitySelect = (activity: Activity) => {
    if (activity.requiresTrack) {
      setSelectedActivity(activity);
      setStep('TRACK');
    } else {
      saveBlock(date, blockIndex, activity.id);
      onClose();
    }
  };

  const handleTrackSelect = (track: Track) => {
    setSelectedTrack(track);
    setStep('PART');
  };

  const handlePartSelect = (part: TrackPart) => {
    setSelectedPart(part);
    const hasItems = (part.lectures && part.lectures.length > 0) || (part.assignments && part.assignments.length > 0);
    
    if (hasItems) {
      setStep('ITEM');
    } else {
      if (selectedActivity && selectedTrack) {
        saveBlock(date, blockIndex, selectedActivity.id, selectedTrack.id, part.id);
        onClose();
      }
    }
  };

  const handleItemSelect = (item?: TrackItem) => {
    if (selectedActivity && selectedTrack && selectedPart) {
      saveBlock(date, blockIndex, selectedActivity.id, selectedTrack.id, selectedPart.id, item?.id);
      onClose();
    }
  };

  const handleClear = () => {
    saveBlock(date, blockIndex, 'clear');
    onClose();
  };

  const goBack = () => {
    if (step === 'ITEM') setStep('PART');
    else if (step === 'PART') setStep('TRACK');
    else if (step === 'TRACK') setStep('ACTIVITY');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 animate-fade-in-up">
      <div className="bg-app-surface w-full max-w-md rounded-t-[32px] sm:rounded-[32px] overflow-hidden border border-app-border shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh] animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            {step !== 'ACTIVITY' && (
              <button 
                onClick={goBack}
                className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white/60 transition-colors active:scale-95"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h3 className="text-xl font-bold text-white tracking-tight">
              {step === 'ACTIVITY' ? 'Select Activity' : 
               step === 'TRACK' ? 'Select Track' : 
               step === 'PART' ? 'Select Part' : 'Select Detail'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-white/10 text-white/60 transition-colors active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 no-scrollbar">
          {step === 'ACTIVITY' && (
            <div className="grid grid-cols-2 gap-3">
              {state.activities.map(activity => (
                <button
                  key={activity.id}
                  onClick={() => handleActivitySelect(activity)}
                  className="flex items-center justify-between p-5 rounded-[24px] bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all text-left group active:scale-95"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: activity.color }} />
                    <span className="font-semibold text-white/90">{activity.name}</span>
                  </div>
                  {activity.requiresTrack && (
                    <ChevronRight size={16} className="text-white/20 group-hover:text-white/50" />
                  )}
                </button>
              ))}
              <button
                onClick={handleClear}
                className="col-span-2 mt-2 p-5 rounded-[24px] bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold transition-colors border border-red-500/20 active:scale-[0.98]"
              >
                Clear Block
              </button>
            </div>
          )}

          {step === 'TRACK' && (
            <div className="flex flex-col gap-3">
              {state.tracks.map(track => (
                <button
                  key={track.id}
                  onClick={() => handleTrackSelect(track)}
                  className="flex items-center justify-between p-5 rounded-[24px] bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all text-left group active:scale-[0.98]"
                >
                  <span className="font-semibold text-white/90">{track.name}</span>
                  <ChevronRight size={18} className="text-white/20 group-hover:text-white/50" />
                </button>
              ))}
              {state.tracks.length === 0 && (
                <div className="p-10 text-center text-white/40 font-medium">
                  No tracks found. Add them in Settings.
                </div>
              )}
            </div>
          )}

          {step === 'PART' && selectedTrack && (
            <div className="flex flex-col gap-3">
              {selectedTrack.parts.map(part => (
                <button
                  key={part.id}
                  onClick={() => handlePartSelect(part)}
                  className="flex items-center justify-between p-5 rounded-[24px] bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all text-left group active:scale-[0.98]"
                >
                  <span className="font-semibold text-white/90">{part.name}</span>
                  {((part.lectures && part.lectures.length > 0) || (part.assignments && part.assignments.length > 0)) && (
                    <ChevronRight size={18} className="text-white/20 group-hover:text-white/50" />
                  )}
                </button>
              ))}
            </div>
          )}

          {step === 'ITEM' && selectedPart && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleItemSelect()}
                className="flex items-center justify-center gap-2 p-5 rounded-[24px] bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all mb-2 active:scale-[0.98]"
              >
                <CheckCircle2 size={20} />
                Just track "{selectedPart.name}"
              </button>

              {selectedPart.lectures && selectedPart.lectures.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 ml-2">Lectures</p>
                  {selectedPart.lectures.map(lec => (
                    <button
                      key={lec.id}
                      onClick={() => handleItemSelect(lec)}
                      className="w-full flex items-center p-5 rounded-[24px] bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all text-left mb-2 active:scale-[0.98]"
                    >
                      <span className="font-semibold text-white/90">{lec.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {selectedPart.assignments && selectedPart.assignments.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 ml-2">Assignments</p>
                  {selectedPart.assignments.map(ass => (
                    <button
                      key={ass.id}
                      onClick={() => handleItemSelect(ass)}
                      className="w-full flex items-center p-5 rounded-[24px] bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all text-left mb-2 active:scale-[0.98]"
                    >
                      <span className="font-semibold text-white/90">{ass.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
