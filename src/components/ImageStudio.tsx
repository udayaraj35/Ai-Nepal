import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ImageIcon, 
  Sparkles, 
  Download, 
  RefreshCw, 
  History, 
  Heart, 
  Share2, 
  ArrowUpRight,
  Maximize2,
  Trash2,
  Save,
  Wand2,
  Image as ImageIconLucide
} from 'lucide-react';
import { generateImageAI } from '../services/aiService';
import { cn } from '../lib/utils';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  createdAt: number;
}

export default function ImageStudio() {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "4:3">("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const imageUrl = await generateImageAI(
        prompt, 
        aspectRatio, 
        isEditing && selectedImage ? selectedImage.url : undefined
      );
      if (imageUrl) {
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          url: imageUrl,
          prompt: isEditing ? `Edit: ${prompt}` : prompt,
          createdAt: Date.now(),
        };
        setHistory(prev => [newImage, ...prev]);
        setSelectedImage(newImage);
        if (isEditing) {
          setIsEditing(false);
          setPrompt('');
        }
      }
    } catch (error) {
      console.error("Failed to generate image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `nepal-ai-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f9fbfb] relative overflow-hidden overflow-y-auto">
      {/* Background Decor */}
      <div className="absolute inset-0 fiesta-blur pointer-events-none opacity-40" />
      
      <div className="max-w-7xl mx-auto w-full p-6 md:p-10 pb-32 md:pb-10 z-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight">
                Image <span className="text-nepal-red">Studio</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg">
                Create beautiful visuals inspired by Nepal's magic. 🇳🇵
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-white border border-slate-200 rounded-2xl flex items-center gap-2 shadow-sm">
                <div className="w-2 h-2 bg-nepal-red rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nano-Banana v2</span>
             </div>
          </div>
        </div>

        {/* Main Generator Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
             {/* Prompt Input */}
             <div className="relative group">
                <div className="absolute inset-0 bg-nepal-red/5 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <div className="relative bg-white border border-slate-200 rounded-[32px] p-4 shadow-xl shadow-slate-200/50 transition-all focus-within:border-nepal-red/30">
                    {isEditing && (
                        <div className="flex items-center justify-between px-3 py-2 bg-nepal-red/10 rounded-2xl mb-2">
                           <div className="flex items-center gap-2">
                               <RefreshCw className="w-4 h-4 text-nepal-red animate-spin" />
                               <span className="text-xs font-bold text-nepal-red">Editing current image...</span>
                           </div>
                           <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600">Cancel</button>
                        </div>
                    )}
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={isEditing ? "Describe what you want to change... (e.g., 'Make it snow', 'Change day to night')" : "Describe what you want to create... (e.g., A photorealistic sunset over Machhapuchhre reflected in Phewa Lake)"}
                        className="w-full min-h-[120px] bg-transparent border-none focus:ring-0 text-lg font-medium text-slate-800 placeholder:text-slate-400 p-2 resize-none outline-none"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                            {(["1:1", "16:9", "4:3"] as const).map(ratio => (
                                <button 
                                    key={ratio} 
                                    onClick={() => setAspectRatio(ratio)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase underline-offset-4",
                                        aspectRatio === ratio 
                                            ? "bg-nepal-red text-white shadow-sm" 
                                            : "bg-slate-50 hover:bg-slate-100 text-slate-500"
                                    )}
                                >
                                    {ratio}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={handleGenerate}
                            disabled={!prompt.trim() || isGenerating}
                            className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    Visualizing...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-5 h-5" />
                                    Generate
                                </>
                            )}
                        </button>
                    </div>
                </div>
             </div>

             {/* Main Preview */}
             <div className="relative aspect-video bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden group">
                <AnimatePresence mode="wait">
                    {selectedImage ? (
                        <motion.div 
                            key={selectedImage.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full"
                        >
                            <img 
                                src={selectedImage.url} 
                                alt={selectedImage.prompt} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                                <p className="text-white font-medium text-lg max-w-2xl mb-4 line-clamp-2">
                                    {selectedImage.prompt}
                                </p>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => handleDownload(selectedImage.url)}
                                        className="bg-white hover:bg-slate-100 text-slate-900 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg"
                                    >
                                        <Download className="w-5 h-5" />
                                        Download
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setIsEditing(true);
                                            setPrompt('');
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className="bg-nepal-blue hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-nepal-blue/20"
                                    >
                                        <Wand2 className="w-5 h-5" />
                                        Magic Edit
                                    </button>
                                    <div className="flex-1" />
                                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-3 rounded-2xl border border-white/20 transition-all active:scale-95">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-3 rounded-2xl border border-white/20 transition-all active:scale-95">
                                        <Heart className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 p-12 text-center bg-slate-50/50">
                            <div className="w-24 h-24 bg-white rounded-[32px] shadow-sm flex items-center justify-center mb-6 border border-slate-100">
                                <ImageIconLucide className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to create?</h3>
                            <p className="max-w-xs text-sm font-medium">Your masterpiece will appear here once generated.</p>
                        </div>
                    )}
                </AnimatePresence>
                
                {isGenerating && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-lg z-20 flex flex-col items-center justify-center text-slate-900">
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="relative mb-8"
                        >
                            <div className="absolute inset-0 bg-nepal-red/20 blur-2xl rounded-full" />
                            <Sparkles className="w-16 h-16 text-nepal-red relative" />
                        </motion.div>
                        <h3 className="text-2xl font-display font-bold mb-2 tracking-tight">AI Nepal is Painting...</h3>
                        <p className="text-slate-500 font-medium">Brewing a cup of Chiya while we wait ☕</p>
                    </div>
                )}
             </div>
          </div>

          {/* Sidebar / History */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white/60 backdrop-blur-xl border border-slate-200 rounded-[32px] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-slate-400" />
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Recent Works</h3>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{history.length} ITEMS</span>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                    {history.length > 0 ? (
                        history.map((img) => (
                            <motion.button 
                                key={img.id}
                                layoutId={img.id}
                                onClick={() => setSelectedImage(img)}
                                className={cn(
                                    "w-full group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all",
                                    selectedImage?.id === img.id ? "border-nepal-red shadow-lg shadow-nepal-red/10" : "border-slate-100/50 hover:border-slate-200"
                                )}
                            >
                                <img 
                                    src={img.url} 
                                    alt={img.prompt} 
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center text-white border border-white/20">
                                        <Maximize2 className="w-4 h-4" />
                                    </div>
                                </div>
                            </motion.button>
                        ))
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-slate-400 text-sm font-medium">No history yet.</p>
                        </div>
                    )}
                </div>
             </div>

             <div className="bg-gradient-to-br from-nepal-blue to-blue-900 rounded-[32px] p-6 text-white relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 blur-3xl group-hover:bg-white/20 transition-all" />
                <h3 className="text-lg font-bold mb-2">Pro Feature</h3>
                <p className="text-blue-100 text-sm mb-4 leading-relaxed">
                    Generate images in 4K resolution and remove watermarks with Image Studio Pro.
                </p>
                <button className="w-full py-3 bg-white text-nepal-blue rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                    Learn More
                    <ArrowUpRight className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
