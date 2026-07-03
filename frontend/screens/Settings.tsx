import React, { useState, useRef } from 'react';
import { Trash2, Database, Info, ChevronRight, Plus, Download, Upload, AlertTriangle, FileJson, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAppStore } from '../store';
import { Track } from '../types';

export const SettingsScreen: React.FC = () => {
  const { state, clearData, addTrack, deleteTrack, importData } = useAppStore();
  const [view, setView] = useState<'main' | 'tracks' | 'paste_json' | 'preview_json'>('main');
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [previewTrack, setPreviewTrack] = useState<Track | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(state);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `TimeOS-Backup-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (importData(content)) {
        alert('Data imported successfully!');
      } else {
        alert('Failed to import data. Invalid format.');
      }
    };
    reader.readAsText(file);
  };

  const handleEraseData = () => {
    if (deleteInput === 'DELETE') {
      clearData();
      setShowDangerZone(false);
      setDeleteInput('');
      alert('All data has been erased.');
    }
  };

  const handlePreviewJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!parsed.name) throw new Error("Track must have a 'name' field.");
      
      const newTrack: Track = {
        id: `track_${Date.now()}`,
        name: parsed.name,
        description: parsed.description,
        parts: (parsed.parts || []).map((p: any, i: number) => ({
          id: `part_${Date.now()}_${i}`,
          name: p.name || `Part ${i+1}`,
          lectures: (p.lectures || []).map((l: string, j: number) => ({
            id: `lec_${Date.now()}_${i}_${j}`,
            name: l,
            type: 'lecture'
          })),
          assignments: (p.assignments || []).map((a: string, j: number) => ({
            id: `ass_${Date.now()}_${i}_${j}`,
            name: a,
            type: 'assignment'
          }))
        }))
      };
      
      setPreviewTrack(newTrack);
      setView('preview_json');
      setJsonError('');
    } catch (e: any) {
      setJsonError(e.message || "Invalid JSON format");
    }
  };

  const handleSaveTrack = () => {
    if (previewTrack) {
      addTrack(previewTrack);
      setJsonInput('');
      setPreviewTrack(null);
      setView('tracks');
    }
  };

  if (view === 'preview_json' && previewTrack) {
    const totalLectures = previewTrack.parts.reduce((acc, p) => acc + (p.lectures?.length || 0), 0);
    const totalAssignments = previewTrack.parts.reduce((acc, p) => acc + (p.assignments?.length || 0), 0);

    return (
      <div className="flex flex-col h-full bg-app-bg overflow-y-auto pb-32 no-scrollbar animate-fade-in-up">
        <div className="px-6 pt-12 pb-6 sticky top-0 bg-app-bg/90 backdrop-blur-xl z-10 flex items-center gap-4">
          <button onClick={() => setView('paste_json')} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white/60 transition-colors active:scale-95">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-white tracking-tight">Preview Track</h1>
        </div>

        <div className="px-6 space-y-6 max-w-2xl mx-auto w-full">
          <div className="bg-app-surface p-8 rounded-[32px] border border-app-border text-center">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
              <CheckCircle2 size={40} className="text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">{previewTrack.name}</h2>
            {previewTrack.description && <p className="text-white/50 text-sm mb-8 font-medium">{previewTrack.description}</p>}
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white/[0.02] p-5 rounded-[24px] border border-white/5">
                <p className="text-3xl font-bold text-white tracking-tighter">{previewTrack.parts.length}</p>
                <p className="text-xs text-white/40 font-bold uppercase tracking-wider mt-2">Parts</p>
              </div>
              <div className="bg-white/[0.02] p-5 rounded-[24px] border border-white/5">
                <p className="text-3xl font-bold text-white tracking-tighter">{totalLectures}</p>
                <p className="text-xs text-white/40 font-bold uppercase tracking-wider mt-2">Lectures</p>
              </div>
              <div className="bg-white/[0.02] p-5 rounded-[24px] border border-white/5">
                <p className="text-3xl font-bold text-white tracking-tighter">{totalAssignments}</p>
                <p className="text-xs text-white/40 font-bold uppercase tracking-wider mt-2">Tasks</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSaveTrack}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg transition-colors active:scale-[0.98]"
          >
            Import Track
          </button>
        </div>
      </div>
    );
  }

  if (view === 'paste_json') {
    return (
      <div className="flex flex-col h-full bg-app-bg overflow-y-auto pb-32 no-scrollbar animate-fade-in-up">
        <div className="px-6 pt-12 pb-6 sticky top-0 bg-app-bg/90 backdrop-blur-xl z-10 flex items-center gap-4">
          <button onClick={() => setView('tracks')} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white/60 transition-colors active:scale-95">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-white tracking-tight">Paste JSON</h1>
        </div>

        <div className="px-6 space-y-6 max-w-2xl mx-auto w-full flex-1 flex flex-col">
          <p className="text-sm text-white/50 font-medium">Paste your structured learning track JSON below.</p>
          
          <textarea 
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`{\n  "name": "DSA",\n  "parts": [\n    {\n      "name": "Arrays",\n      "lectures": ["Intro"]\n    }\n  ]\n}`}
            className="flex-1 w-full bg-app-surface border border-app-border rounded-[24px] p-6 text-sm text-white/80 font-mono focus:outline-none focus:border-blue-500/50 resize-none min-h-[300px] shadow-inner"
          />
          
          {jsonError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium">
              {jsonError}
            </div>
          )}

          <button 
            onClick={handlePreviewJSON}
            disabled={!jsonInput.trim()}
            className="w-full py-4 bg-white hover:bg-white/90 text-black rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50"
          >
            Preview
          </button>
        </div>
      </div>
    );
  }

  if (view === 'tracks') {
    return (
      <div className="flex flex-col h-full bg-app-bg overflow-y-auto pb-32 no-scrollbar animate-fade-in-up">
        <div className="px-6 pt-12 pb-6 sticky top-0 bg-app-bg/90 backdrop-blur-xl z-10 flex items-center gap-4">
          <button onClick={() => setView('main')} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white/60 transition-colors active:scale-95">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-white tracking-tight">Learning Tracks</h1>
        </div>

        <div className="px-6 space-y-6 max-w-2xl mx-auto w-full">
          <button 
            onClick={() => setView('paste_json')}
            className="w-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 p-5 rounded-[24px] flex items-center justify-center gap-2 text-blue-400 font-bold transition-colors active:scale-[0.98]"
          >
            <Plus size={20} /> Add Track via JSON
          </button>

          <div className="space-y-4">
            {state.tracks.map(track => (
              <div key={track.id} className="bg-app-surface rounded-[24px] border border-app-border p-6 flex justify-between items-center group hover:border-white/10 transition-colors">
                <div>
                  <h3 className="font-bold text-white text-lg tracking-tight">{track.name}</h3>
                  <p className="text-white/40 text-sm mt-1 font-medium">{track.parts.length} Parts</p>
                </div>
                <button 
                  onClick={() => {
                    if(window.confirm(`Delete track "${track.name}"?`)) deleteTrack(track.id);
                  }} 
                  className="p-3 bg-white/[0.02] rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors active:scale-95"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {state.tracks.length === 0 && (
              <div className="text-center py-16 text-white/30 font-medium">
                No tracks added yet.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-app-bg overflow-y-auto pb-32 no-scrollbar animate-fade-in-up">
      <div className="px-6 pt-12 pb-6 sticky top-0 bg-app-bg/90 backdrop-blur-xl z-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
      </div>

      <div className="px-6 space-y-8 max-w-2xl mx-auto w-full">
        
        <section>
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 ml-4">Customization</h2>
          <div className="bg-app-surface rounded-[32px] border border-app-border overflow-hidden">
            <button 
              onClick={() => setView('tracks')}
              className="w-full p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left group active:bg-white/[0.04]"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20">
                  <FileJson size={20} />
                </div>
                <div>
                  <p className="text-white font-semibold">Learning Tracks</p>
                  <p className="text-white/40 text-sm font-medium">Manage JSON roadmaps</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-white/20 group-hover:text-white/50 transition-colors" />
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 ml-4">Data Management</h2>
          <div className="bg-app-surface rounded-[32px] border border-app-border overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-2xl text-white/60 border border-white/5">
                <Database size={20} />
              </div>
              <div>
                <p className="text-white font-semibold">Local Storage</p>
                <p className="text-white/40 text-sm font-medium">All data is stored on this device.</p>
              </div>
            </div>
            
            <button onClick={handleExport} className="w-full p-5 border-b border-white/5 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left active:bg-white/[0.04]">
              <span className="text-white/80 font-semibold">Export App Data</span>
              <Download size={18} className="text-white/40" />
            </button>
            
            <button onClick={() => fileInputRef.current?.click()} className="w-full p-5 border-b border-white/5 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left active:bg-white/[0.04]">
              <span className="text-white/80 font-semibold">Import App Data</span>
              <Upload size={18} className="text-white/40" />
            </button>
            <input type="file" accept=".json" ref={fileInputRef} onChange={handleImport} className="hidden" />

            <div className="p-5">
              {!showDangerZone ? (
                <button 
                  onClick={() => setShowDangerZone(true)}
                  className="w-full py-3.5 rounded-2xl border border-red-500/20 text-red-400 font-bold hover:bg-red-500/10 transition-colors active:scale-[0.98]"
                >
                  Advanced: Danger Zone
                </button>
              ) : (
                <div className="bg-red-500/10 border border-red-500/20 rounded-[24px] p-5 animate-scale-in">
                  <div className="flex items-start gap-3 mb-5">
                    <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-red-200/90 space-y-2">
                      <p className="font-bold text-red-400 text-base">This will permanently delete:</p>
                      <ul className="list-disc pl-4 space-y-1 font-medium">
                        <li>All tracked days</li>
                        <li>All study history</li>
                        <li>All analytics & reports</li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-sm text-white/50 mb-3 font-medium">Type <strong className="text-white">DELETE</strong> to continue.</p>
                  <input 
                    type="text" 
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                    placeholder="DELETE"
                    className="w-full bg-black border border-red-500/30 rounded-2xl px-4 py-3.5 text-white font-bold focus:outline-none focus:border-red-500 mb-4"
                  />
                  <div className="flex gap-3">
                    <button 
                      onClick={() => { setShowDangerZone(false); setDeleteInput(''); }}
                      className="flex-1 py-3.5 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors active:scale-95"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleEraseData}
                      disabled={deleteInput !== 'DELETE'}
                      className="flex-1 py-3.5 rounded-2xl bg-red-600 text-white font-bold disabled:opacity-50 disabled:bg-red-600/50 transition-colors active:scale-95"
                    >
                      Erase All
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 ml-4">About</h2>
          <div className="bg-app-surface rounded-[32px] border border-app-border p-6 flex gap-5 items-start">
             <div className="p-3 bg-white/5 rounded-2xl text-white/60 shrink-0 border border-white/5">
                <Info size={24} />
              </div>
              <div>
                <p className="text-white font-bold text-lg mb-1 tracking-tight">TimeOS v3.0</p>
                <p className="text-white/50 text-sm leading-relaxed font-medium">
                  A premium, offline-first personal productivity tracker. Designed to help you understand where every 30 minutes of your life is invested.
                </p>
              </div>
          </div>
        </section>

      </div>
    </div>
  );
};
