import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic2, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Play, 
  Volume2, 
  Music,
  Waves,
  Wand2,
  Share2,
  Clock,
  AudioLines,
  Pause,
  Repeat
} from 'lucide-react';
import { generateAudio } from '../services/aiService';
import { cn } from '../lib/utils';

interface GeneratedAudio {
  id: string;
  text: string;
  voice: string;
  duration: string;
  createdAt: number;
}

const VOICES = [
  { id: 'narration-m', label: 'Male Narrator', emoji: '🎙️', description: 'Deep, professional voice' },
  { id: 'warm-f', label: 'Warm Female', emoji: '🎙️', description: 'Clear, friendly tone' },
  { id: 'story-m', label: 'Storyteller', emoji: '📖', description: 'Dramatic and expressive' },
  { id: 'promo-f', label: 'Promo Voice', emoji: '📢', description: 'Energetic and bold' },
];

export default function AudioStudio() {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioHistory, setAudioHistory] = useState<GeneratedAudio[]>([]);
  const [activeAudio, setActiveAudio] = useState<GeneratedAudio | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleGenerate = async () => {
    if (!text.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const result = await generateAudio(text);
      if (result.success && result.text) {
        const newAudio: GeneratedAudio = {
          id: Date.now().toString(),
          text: result.text,
          voice: selectedVoice.label,
          duration: '0:12',
          createdAt: Date.now(),
        };
        setAudioHistory(prev => [newAudio, ...prev]);
        setActiveAudio(newAudio);
        
        // Auto play the generated audio
        playSpeech(result.text);
      }
    } catch (error) {
      console.error("Audio generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  React.useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const playSpeech = (content: string) => {
    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(content);
    
    // Find Nepali voice or a suitable substitute
    const nepalVoice = availableVoices.find(v => v.lang.toLowerCase().includes('ne')) || 
                       availableVoices.find(v => v.lang.toLowerCase().includes('hi')) || 
                       availableVoices[0];
    
    if (nepalVoice) {
      utterance.voice = nepalVoice;
      utterance.lang = nepalVoice.lang;
    }

    // Adjust parameters for different "Style Presets"
    if (selectedVoice.id === 'narration-m') {
      utterance.pitch = 0.8;
      utterance.rate = 0.9;
    } else if (selectedVoice.id === 'warm-f') {
      utterance.pitch = 1.1;
      utterance.rate = 1.0;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const togglePlayback = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else if (activeAudio) {
      playSpeech(activeAudio.text);
    }
  };

  const downloadMP3 = () => {
    if (!activeAudio) return;
    const blob = new Blob([activeAudio.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nepal-ai-script-${activeAudio.id}.txt`;
    link.click();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f9fbfb] relative overflow-hidden overflow-y-auto scrollbar-hide">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(239,68,68,0.05),transparent)] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto w-full p-6 md:p-10 z-10 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2 bg-nepal-red/5 text-nepal-red rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border border-nepal-red/10"
          >
            <Mic2 className="w-4 h-4" />
            Neural Voice Engine
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 tracking-tight">
            Sonic <span className="text-nepal-red">Studio</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
            Convert text to high-fidelity human speech with Nepali-optimized accents. 🎙️
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Editor */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-[48px] p-10 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-nepal-blue/5 blur-3xl rounded-full" />
                
                <div className="space-y-8 relative z-10">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Volume2 className="w-4 h-4" />
                                Script Editor
                            </label>
                            <span className="text-[10px] font-bold text-slate-400">{text.length} / 2000 CHARS</span>
                        </div>
                        <textarea 
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Write your script here... (e.g. Namaste! Hamro naya AI prabidhi ma swagat chha.)"
                            className="w-full bg-slate-50 border border-slate-100 rounded-[24px] px-8 py-8 text-xl font-medium focus:ring-4 focus:ring-nepal-blue/5 outline-none transition-all min-h-[240px] resize-none placeholder:text-slate-300"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                        <div className="space-y-4">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <AudioLines className="w-4 h-4" />
                                Select Voice Identity
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {VOICES.map((voice) => (
                                    <button 
                                        key={voice.id}
                                        onClick={() => setSelectedVoice(voice)}
                                        className={cn(
                                            "flex flex-col items-start gap-1 p-4 rounded-2xl border-2 transition-all text-left",
                                            selectedVoice.id === voice.id 
                                                ? "bg-nepal-red/5 border-nepal-red/30 shadow-lg shadow-nepal-red/5" 
                                                : "bg-white border-slate-100 hover:border-slate-200"
                                        )}
                                    >
                                        <span className={cn(
                                          "text-sm font-black",
                                          selectedVoice.id === voice.id ? "text-nepal-red" : "text-slate-800"
                                        )}>{voice.label}</span>
                                        <span className="text-[10px] font-bold text-slate-400">{voice.description}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={handleGenerate}
                            disabled={!text.trim() || isGenerating}
                            className="h-[104px] bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-[32px] font-black text-xl flex items-center justify-center gap-4 shadow-2xl transition-all active:scale-95"
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw className="w-7 h-7 animate-spin" />
                                    Synthesizing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-7 h-7 text-nepal-red" />
                                    Generate Audio
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
          </div>

          {/* Player & Waves */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-[48px] p-8 shadow-sm flex flex-col items-center justify-between min-h-[400px]">
                <div className="w-full flex items-center justify-between mb-8">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Live Preview</h3>
                    <div className="flex items-center gap-1">
                        {[1,2,3,4].map(i => (
                            <motion.div 
                                key={i}
                                animate={isPlaying ? { height: [4, 12, 4] } : { height: 4 }}
                                transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                className="w-1 bg-nepal-red rounded-full"
                            />
                        ))}
                    </div>
                </div>

                <div className="flex flex-col items-center text-center space-y-6 flex-1 justify-center">
                    <div className="relative cursor-pointer" onClick={togglePlayback}>
                        <div className={cn(
                          "absolute inset-0 bg-nepal-red/10 blur-3xl transition-opacity",
                          isPlaying ? "opacity-100 animate-pulse" : "opacity-0"
                        )} />
                        <div className="relative w-40 h-40 bg-slate-50 rounded-[48px] border border-slate-100 flex items-center justify-center shadow-xl ring-1 ring-slate-100">
                             <AnimatePresence mode="wait">
                                {isPlaying ? (
                                    <motion.div key="pause" initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                                        <Pause className="w-16 h-16 text-nepal-red fill-current" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="play" initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                                        <Play className="w-16 h-16 text-nepal-red fill-current ml-2" />
                                    </motion.div>
                                )}
                             </AnimatePresence>
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <h4 className="text-xl font-black text-slate-900">{activeAudio ? activeAudio.voice : 'No Audio Selected'}</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{activeAudio ? activeAudio.duration : '--:--'}</p>
                    </div>

                    <div className="w-full max-w-[200px] h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={isPlaying ? { width: '100%' } : { width: 0 }}
                            transition={{ duration: 8, ease: "linear" }}
                            className="absolute top-0 left-0 h-full bg-nepal-red"
                        />
                    </div>
                </div>

                <div className="w-full grid grid-cols-2 gap-4 mt-8">
                     <button 
                        onClick={togglePlayback}
                        disabled={!activeAudio}
                        className="py-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-900 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
                     >
                        {isPlaying ? 'Stop' : 'Preview'}
                     </button>
                     <button 
                        onClick={downloadMP3}
                        disabled={!activeAudio}
                        className="py-4 bg-nepal-blue hover:bg-blue-600 disabled:opacity-50 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl transition-all shadow-nepal-blue/20"
                      >
                        Export Voice
                     </button>
                </div>
            </div>

            <div className="bg-slate-900 rounded-[48px] p-8 text-white relative overflow-hidden group border border-white/5 shadow-2xl">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-nepal-red/20 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
                 <div className="absolute bottom-0 left-0 w-32 h-32 bg-nepal-blue/20 blur-3xl rounded-full -ml-16 -mb-16 pointer-events-none" />
                 
                 <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-2">
                        <Waves className="w-5 h-5 text-nepal-red" />
                        <h3 className="text-sm font-black uppercase tracking-widest">Voice Library</h3>
                    </div>
                    {audioHistory.length > 0 && (
                        <div className="px-2 py-1 bg-white/10 rounded-lg text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                            {audioHistory.length} Saved
                        </div>
                    )}
                 </div>

                 <div className="space-y-3 relative z-10">
                    {audioHistory.slice(0, 4).map((audio) => (
                        <motion.div 
                          key={audio.id} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => {
                            setActiveAudio(audio);
                            playSpeech(audio.text);
                          }}
                          className={cn(
                            "group flex items-center justify-between p-4 rounded-[24px] border transition-all cursor-pointer transform active:scale-[0.98]",
                            activeAudio?.id === audio.id 
                                ? "bg-white/10 border-white/20 shadow-xl shadow-black/20" 
                                : "bg-white/[0.03] border-white/5 hover:bg-white/5 hover:border-white/10"
                          )}
                        >
                             <div className="flex items-center gap-4 min-w-0 pr-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-inner",
                                    activeAudio?.id === audio.id ? "bg-nepal-red" : "bg-white/5 group-hover:bg-white/10"
                                )}>
                                    {activeAudio?.id === audio.id && isPlaying ? (
                                        <div className="flex gap-0.5">
                                            {[1,2,3].map(i => (
                                                <motion.div 
                                                    key={i}
                                                    animate={{ height: [4, 10, 4] }}
                                                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                                    className="w-1 bg-white rounded-full"
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <Music className="w-5 h-5 text-white/80" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-white/90 line-clamp-1 leading-none mb-1.5">{audio.text}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider bg-black/20 px-2 py-0.5 rounded-full">{audio.voice}</span>
                                        <span className="text-[9px] font-medium text-slate-600 flex items-center gap-1">
                                            <Clock className="w-2.5 h-2.5" />
                                            {audio.duration}
                                        </span>
                                    </div>
                                </div>
                             </div>
                             <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                                activeAudio?.id === audio.id ? "bg-white text-slate-900" : "bg-white/5 text-white/30 group-hover:bg-white/10 group-hover:text-white"
                             )}>
                                <Play className={cn("w-4 h-4", activeAudio?.id === audio.id ? "fill-current" : "")} />
                             </div>
                        </motion.div>
                    ))}
                    {audioHistory.length === 0 && (
                        <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[40px] bg-white/[0.01]">
                            <Music className="w-10 h-10 text-white/5 mx-auto mb-4" />
                            <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">Your creations live here</p>
                        </div>
                    )}
                 </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
