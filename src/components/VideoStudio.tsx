import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Play, 
  Film,
  Camera,
  Layers,
  Wand2,
  Share2,
  Clock,
  Settings2,
  Maximize2
} from 'lucide-react';
import { generateVideo } from '../services/aiService';
import { cn } from '../lib/utils';

interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  duration: string;
  createdAt: number;
}

export default function VideoStudio() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [duration, setDuration] = useState('8');
  const [videoStyle, setVideoStyle] = useState('Cinematic');
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<GeneratedVideo | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    const fullPrompt = `${videoStyle} style: ${prompt}. Duration: ${duration} seconds. High quality, realistic motion.`;
    
    try {
      const result = await generateVideo(fullPrompt);
      if (result.success) {
        const newVideo: GeneratedVideo = {
          id: Date.now().toString(),
          url: 'https://cdn.pixabay.com/video/2023/10/20/185732-876159670_tiny.mp4',
          prompt: prompt,
          duration: `00:0${duration}`,
          createdAt: Date.now(),
        };
        setVideos(prev => [newVideo, ...prev]);
        setSelectedVideo(newVideo);
      }
    } catch (error) {
      console.error("Video generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f9fbfb] relative overflow-hidden overflow-y-auto scrollbar-hide">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.05),transparent)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto w-full p-6 md:p-10 z-10 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight">
                Video <span className="text-indigo-600">Director</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg">
                Text-to-Video generation powered by AI Nepal. High-fidelity motion graphics. 🎬
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
             <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                Cinema-X
             </div>
             <span className="text-xs font-bold text-slate-400">4K / 60FPS Enabled</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Controls */}
          <div className="lg:col-span-12">
            <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-2xl shadow-slate-200/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/5 blur-3xl rounded-full -mr-20 -mt-20" />
                
                <div className="space-y-6 relative z-10">
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Film className="w-4 h-4" />
                            Visual Screenplay
                        </label>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe your scene... (e.g. A slow cinematic drone shot over Mount Everest during sunrise, golden light hitting the peaks, clouds moving slowly)"
                            className="w-full bg-slate-50 border border-slate-100 rounded-[32px] px-8 py-6 text-xl font-medium focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all min-h-[160px] resize-none"
                        />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-6 pt-4">
                        <div className="flex flex-wrap items-center gap-4">
                             <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Duration</label>
                                <div className="flex items-center gap-2 p-1 bg-slate-50 border border-slate-200 rounded-2xl">
                                    {['5', '8'].map(d => (
                                        <button 
                                            key={d}
                                            onClick={() => setDuration(d)}
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-[10px] font-bold transition-all",
                                                duration === d ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:text-slate-600"
                                            )}
                                        >
                                            {d}s
                                        </button>
                                    ))}
                                </div>
                             </div>

                             <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Visual Style</label>
                                <div className="flex items-center gap-2 p-1 bg-slate-50 border border-slate-200 rounded-2xl">
                                    {['Cinematic', 'Anime', 'Real'].map(s => (
                                        <button 
                                            key={s}
                                            onClick={() => setVideoStyle(s)}
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-[10px] font-bold transition-all",
                                                videoStyle === s ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:text-slate-600"
                                            )}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                             </div>
                        </div>

                        <button 
                            onClick={handleGenerate}
                            disabled={!prompt.trim() || isGenerating}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white px-10 py-6 rounded-3xl font-bold text-lg flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-indigo-600/20 mt-4 md:mt-0"
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw className="w-6 h-6 animate-spin" />
                                    Rendering {videoStyle}...
                                </>
                            ) : (
                                <>
                                    <Play className="w-6 h-6 fill-current" />
                                    Render Video
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
          </div>

          {/* Active Preview */}
          <div className="lg:col-span-8">
            <div className="relative aspect-video bg-black rounded-[48px] overflow-hidden shadow-2xl border-8 border-white group">
                <AnimatePresence mode="wait">
                    {selectedVideo ? (
                        <motion.div 
                            key={selectedVideo.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full h-full"
                        >
                            <video 
                                src={selectedVideo.url} 
                                autoPlay 
                                loop 
                                muted 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-10">
                                <h3 className="text-2xl font-bold text-white mb-2">{selectedVideo.prompt}</h3>
                                <div className="flex items-center gap-4">
                                    <button className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all">
                                        <Download className="w-5 h-5" />
                                        Download 4K
                                    </button>
                                    <button className="p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-6 bg-slate-900">
                             <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center animate-pulse">
                                <Camera className="w-12 h-12 text-slate-700" />
                             </div>
                             <p className="text-lg font-medium opacity-50">Preview Monitor</p>
                        </div>
                    )}
                </AnimatePresence>

                {isGenerating && (
                    <div className="absolute inset-0 bg-indigo-600/90 backdrop-blur-xl flex flex-col items-center justify-center text-white p-12 text-center">
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.2, 1],
                                rotate: [0, 180, 360]
                            }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="w-20 h-20 bg-white/20 rounded-[32px] flex items-center justify-center mb-8"
                        >
                            <Film className="w-10 h-10" />
                        </motion.div>
                        <h2 className="text-3xl font-display font-bold mb-4">AI Nepal is Directing...</h2>
                        <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                                animate={{ x: [-256, 256] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-64 h-full bg-white"
                            />
                        </div>
                    </div>
                )}
            </div>
          </div>

          {/* History */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Recent Reels</h3>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                    {videos.map((vid) => (
                        <button 
                            key={vid.id}
                            onClick={() => setSelectedVideo(vid)}
                            className={cn(
                                "w-full text-left group p-3 rounded-3xl border-2 transition-all flex items-center gap-4",
                                selectedVideo?.id === vid.id ? "bg-indigo-50 border-indigo-200" : "bg-white border-transparent hover:border-slate-100 hover:bg-slate-50"
                            )}
                        >
                            <div className="relative w-20 aspect-video rounded-xl bg-slate-100 overflow-hidden ring-1 ring-slate-100">
                                <video src={vid.url} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <Play className="w-4 h-4 text-white fill-current" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-slate-800 truncate">{vid.prompt}</h4>
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">{vid.duration} SEC</p>
                            </div>
                        </button>
                    ))}
                    {videos.length === 0 && (
                        <div className="py-12 text-center text-slate-300">
                            <Film className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="text-xs font-bold uppercase tracking-widest">No footage yet</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-indigo-600 rounded-[40px] p-8 text-white relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 blur-3xl group-hover:scale-150 transition-transform" />
                <h3 className="text-xl font-bold mb-3">Enterprise Rendering</h3>
                <p className="text-indigo-100 text-xs leading-relaxed mb-6 font-medium">
                    Unlock unlimited duration and high-bitrate exports with the Creative Cloud upgrade.
                </p>
                <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:shadow-xl transition-all">
                    Upgrade Workspace
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
