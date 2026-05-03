import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ImageIcon, 
  Sparkles, 
  Download, 
  RefreshCw, 
  History, 
  Heart, 
  Share2, 
  Wand2,
  Image as ImageIconLucide,
  Settings2,
  Camera,
  Paintbrush,
  Layers,
  Zap,
  Lock,
  ChevronDown
} from 'lucide-react';
import { generateImageAI } from '../services/aiService';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  ratio: string;
  createdAt: number;
}

interface ImageStudioProps {
  isGuest?: boolean;
  onRequireLogin?: () => void;
}

const IMAGE_STYLES = [
  { id: 'cinematic', label: 'Cinematic', icon: Camera, promptSuffix: 'cinematic lighting, ultra-detailed, 8k resolution, photorealistic, epic composition' },
  { id: 'anime', label: 'Anime', icon: Paintbrush, promptSuffix: 'high quality anime style, Studio Ghibli inspired, beautiful line art, soft emotional lighting, highly detailed background' },
  { id: 'digital-art', label: 'Digital Art', icon: Layers, promptSuffix: 'trending on artstation, masterpiece, digital painting, vibrant colors, stunning details' },
  { id: '3d-render', label: '3D Render', icon: ImageIcon, promptSuffix: 'unreal engine 5 render, octane render, global illumination, incredibly detailed 3d, ray tracing' },
];

const ASPECT_RATIOS = [
  { id: '1:1', label: 'Square', icon: '◻️', class: 'aspect-square' },
  { id: '16:9', label: 'Widescreen', icon: '▭', class: 'aspect-[16/9]' },
  { id: '9:16', label: 'Portrait', icon: '▯', class: 'aspect-[9/16]' }
];

export default function ImageStudio({ isGuest, onRequireLogin }: ImageStudioProps) {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [selectedStyle, setSelectedStyle] = useState(IMAGE_STYLES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);


  const handleGenerate = async () => {
    if (isGuest && onRequireLogin) {
      onRequireLogin();
      return;
    }
    
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      let finalPrompt = `${prompt}. Style: ${selectedStyle.promptSuffix}.`;
      if (negativePrompt) {
        finalPrompt += ` Do not include: ${negativePrompt}.`;
      }
      finalPrompt += ' Ensure highest quality possible, masterpiece.';

      const imageUrl = await generateImageAI(
        finalPrompt, 
        aspectRatio.id as "1:1" | "16:9" | "4:3", 
        isEditing && selectedImage ? selectedImage.url : undefined
      );
      if (imageUrl) {
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          url: imageUrl,
          prompt: isEditing ? `Edit: ${prompt}` : prompt,
          style: selectedStyle.label,
          ratio: aspectRatio.id,
          createdAt: Date.now(),
        };
        setHistory(prev => [newImage, ...prev].slice(0, 15));
        setSelectedImage(newImage);
        if (isEditing) {
          setIsEditing(false);
          setPrompt('');
        }
      }
    } catch (error) {
      console.error("Failed to generate image:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ainepal-studio-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full bg-[#f4f7f8] relative overflow-hidden">
      
      {/* Left Sidebar - Settings Controls */}
      <div className={cn(
         "w-full md:w-80 bg-white border-r border-slate-200 flex-col h-full z-30 shadow-2xl md:shadow-sm absolute md:relative overflow-y-auto transition-transform duration-300 md:transform-none md:flex",
         showMobileMenu ? "flex translate-x-0" : "-translate-x-full hidden md:flex md:translate-x-0"
      )}>
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white text-nepal-blue rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border border-slate-200 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Studio Engine v2
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">AI Settings</h2>
            <p className="text-slate-500 text-xs mt-1">Configure parameters for your masterpiece.</p>
          </div>
          <button 
             onClick={() => setShowMobileMenu(false)}
             className="md:hidden p-2 bg-slate-200 text-slate-700 rounded-full"
          >
             <Settings2 className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8 flex-1">
          {/* Style Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Art Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {IMAGE_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style)}
                  className={cn(
                    "flex flex-col items-start gap-2 p-3 rounded-xl border-2 transition-all text-left",
                    selectedStyle.id === style.id 
                      ? "bg-blue-50/50 border-nepal-blue shadow-sm text-nepal-blue" 
                      : "bg-white border-slate-100 hover:border-slate-300 text-slate-600"
                  )}
                >
                  <style.icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-bold leading-tight">{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Aspect Ratio
            </label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.id}
                  onClick={() => setAspectRatio(ratio)}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex flex-col items-center gap-1",
                    aspectRatio.id === ratio.id 
                      ? "bg-white shadow-sm text-slate-900" 
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  )}
                >
                  <span className="text-lg leading-none">{ratio.icon}</span>
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Mode Toggle */}
          <div className="pt-2">
             <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
             >
                <div className="flex items-center gap-2">
                   <Settings2 className="w-4 h-4 text-slate-500" />
                   Advanced Parameters
                </div>
                <ChevronDown className={cn("w-4 h-4 transition-transform", showAdvanced ? "rotate-180" : "")} />
             </button>

             <AnimatePresence>
                {showAdvanced && (
                   <motion.div 
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     className="overflow-hidden"
                   >
                      <div className="pt-4 space-y-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Negative Prompt</label>
                            <textarea 
                              value={negativePrompt}
                              onChange={(e) => setNegativePrompt(e.target.value)}
                              placeholder="e.g., blurry, bad anatomy, watermark..."
                              rows={2}
                              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-nepal-blue/20 focus:border-nepal-blue outline-none transition-all resize-none"
                            />
                         </div>
                         <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium flex items-start gap-2 border border-red-100">
                             <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                             <div>
                                 <strong className="block font-bold mb-0.5">High-Res 4K Upscaling</strong>
                                 Requires AI Nepal Premium
                             </div>
                         </div>
                      </div>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Generation Area */}
      <div className="flex-1 flex flex-col relative h-full">
         <div className="absolute inset-0 pattern-grid-lg text-slate-900/[0.02] pointer-events-none" />
         
         <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col">
            
            {/* Header (Mobile only) */}
            <div className="md:hidden flex items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div>
                   <h1 className="text-xl font-bold tracking-tight text-slate-900">Image Studio</h1>
                   <p className="text-xs text-slate-500 font-medium mt-1">AI Nepal Visual Engine</p>
                </div>
                <button 
                   onClick={() => setShowMobileMenu(!showMobileMenu)} 
                   className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 active:scale-95 transition-all text-slate-700"
                >
                   <Settings2 className="w-5 h-5" />
                </button>
            </div>

            {/* Prompt Input Box */}
            <div className="bg-white rounded-[32px] p-2 pr-2 shadow-2xl shadow-slate-200/50 border border-slate-100 mb-8 max-w-4xl mx-auto w-full z-20 group transition-all focus-within:border-nepal-blue/30 focus-within:shadow-nepal-blue/10">
               {isEditing && (
                   <div className="flex items-center justify-between px-4 py-2 bg-nepal-blue/10 rounded-2xl mb-2 mx-2 mt-2 border border-nepal-blue/20">
                      <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-nepal-blue animate-pulse" />
                          <span className="text-xs font-bold text-nepal-blue uppercase tracking-widest">Magic Remix Active</span>
                      </div>
                      <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-white/50 px-3 py-1 rounded-lg">Cancel</button>
                   </div>
               )}
               <div className="flex flex-col md:flex-row gap-2 relative">
                  <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={isEditing ? "Describe what to edit... e.g. 'Make it winter'" : "Imagine anything... e.g. 'A futuristic Kathmandu city with flying vehicles, cinematic lighting'"}
                      className="flex-1 min-h-[60px] md:min-h-[80px] bg-transparent border-none focus:ring-0 text-base md:text-lg font-medium text-slate-800 placeholder:text-slate-400 p-4 pt-6 resize-none outline-none leading-relaxed"
                  />
                  <div className="absolute left-4 top-2 flex gap-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prompt</span>
                  </div>
                  
                  <div className="p-2 flex items-end justify-end">
                      <button 
                          onClick={handleGenerate}
                          disabled={!prompt.trim() || isGenerating}
                          className="w-full md:w-auto h-14 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white px-8 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-slate-900/10 whitespace-nowrap"
                      >
                          {isGenerating ? (
                              <>
                                  <RefreshCw className="w-5 h-5 animate-spin" />
                                  <span>Generating...</span>
                              </>
                          ) : (
                              <>
                                  <Sparkles className="w-5 h-5" />
                                  <span>Generate</span>
                              </>
                          )}
                      </button>
                  </div>
               </div>
            </div>

            {/* Stage / Preview Area */}
            <div className="flex-1 flex items-center justify-center min-h-[400px] w-full max-w-5xl mx-auto">
               <div className={cn(
                   "relative bg-white rounded-[40px] shadow-2xl flex items-center justify-center overflow-hidden border border-slate-200 transition-all duration-500 max-h-full max-w-full",
                   aspectRatio.class
               )}>
                  <AnimatePresence mode="wait">
                      {selectedImage ? (
                          <motion.div 
                              key={selectedImage.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 1.05 }}
                              className="w-full h-full relative group"
                          >
                              <img 
                                  src={selectedImage.url} 
                                  alt={selectedImage.prompt} 
                                  className="w-full h-full object-contain bg-slate-900"
                                  referrerPolicy="no-referrer"
                              />
                              
                              {/* Hover Overlay Controls */}
                              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end">
                                  <div className="flex items-center justify-between">
                                      <p className="text-white font-medium text-sm md:text-base max-w-[70%] line-clamp-2">
                                          "{selectedImage.prompt}"
                                      </p>
                                      
                                      <div className="flex items-center gap-2 md:gap-3">
                                          <button 
                                              onClick={() => {
                                                  setIsEditing(true);
                                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                              }}
                                              className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white p-2.5 md:px-4 md:py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition-all border border-white/10"
                                          >
                                              <Zap className="w-4 h-4 md:w-5 md:h-5" />
                                              <span className="hidden md:inline">Remix</span>
                                          </button>
                                          
                                          <button 
                                              onClick={() => handleDownload(selectedImage.url)}
                                              className="bg-nepal-blue hover:bg-blue-600 text-white p-2.5 md:px-6 md:py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-nepal-blue/30"
                                          >
                                              <Download className="w-4 h-4 md:w-5 md:h-5" />
                                              <span className="hidden md:inline">Save</span>
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          </motion.div>
                      ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 p-12 text-center absolute inset-0">
                              <div className="w-24 h-24 bg-slate-50 rounded-[32px] shadow-sm flex items-center justify-center mb-6 border-2 border-dashed border-slate-200 pb-2">
                                  <Sparkles className="w-10 h-10 text-slate-300 mt-2" />
                              </div>
                              <h3 className="text-xl font-bold text-slate-800 mb-2">Canvas Ready</h3>
                              <p className="max-w-xs text-sm font-medium text-slate-500">Describe your vision above to start rendering.</p>
                          </div>
                      )}
                  </AnimatePresence>
                  
                  {isGenerating && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl z-20 flex flex-col items-center justify-center text-slate-900 border border-slate-200 rounded-[40px]">
                          <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              className="relative mb-6"
                          >
                              <div className="absolute inset-0 bg-nepal-blue/20 blur-xl rounded-full scale-150" />
                              <div className="w-16 h-16 border-4 border-slate-200 border-t-nepal-blue rounded-full relative z-10" />
                          </motion.div>
                          <h3 className="text-xl font-bold mb-1 tracking-tight text-slate-800">Synthesizing Imagery...</h3>
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Resolving {aspectRatio.label} Canvas</p>
                      </div>
                  )}
               </div>
            </div>

         </div>

         {/* History Gallery Bottom Bar */}
         {history.length > 0 && (
         <div className="h-32 bg-white border-t border-slate-200 p-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-20 shrink-0">
            <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
               <div className="flex items-center justify-between mb-3 px-2">
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <History className="w-3.5 h-3.5" />
                       Recent Generation History
                   </h3>
                   <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{history.length}</span>
               </div>
               <div className="flex-1 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide px-2">
                   {history.map((img) => (
                       <button
                           key={img.id}
                           onClick={() => setSelectedImage(img)}
                           className={cn(
                               "relative h-16 min-w-[4rem] flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all hover:-translate-y-1",
                               selectedImage?.id === img.id ? "border-nepal-blue shadow-lg shadow-nepal-blue/20 ring-2 ring-white/50 ring-offset-1" : "border-transparent opacity-70 hover:opacity-100"
                           )}
                       >
                           <img src={img.url} alt="History" className="w-full h-full object-cover bg-slate-100" referrerPolicy="no-referrer" />
                       </button>
                   ))}
               </div>
            </div>
         </div>
         )}
      </div>
    </div>
  );
}
