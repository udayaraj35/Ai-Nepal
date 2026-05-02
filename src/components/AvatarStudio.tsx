import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Sparkles, 
  Download, 
  RefreshCw, 
  History, 
  Dice5,
  Camera,
  ShieldCheck,
  Check,
  Wand2,
  Smile,
  Palette,
  Upload,
  X
} from 'lucide-react';
import { generateImageAI } from '../services/aiService';
import { cn } from '../lib/utils';

interface GeneratedAvatar {
  id: string;
  url: string;
  prompt: string;
  style: string;
}

const AVATAR_STYLES = [
  { id: 'traditional', label: 'Traditional', emoji: '🇳🇵', promptSuffix: 'wearing traditional Nepali Dhaka topi and Daura Suruwal, oil painting style' },
  { id: 'professional', label: 'Professional', emoji: '👔', promptSuffix: 'professional headshot, studio lighting, business attire, high resolution' },
  { id: '3d-render', label: '3D Render', emoji: '🎨', promptSuffix: '3D Pixar style character, cute, high detail, vibrant colors' },
  { id: 'anime', label: 'Anime', emoji: '🎌', promptSuffix: 'anime style, beautiful line art, soft shading, artistic' },
  { id: 'minimalist', label: 'Minimalist', emoji: '⬛', promptSuffix: 'minimalist vector avatar, flat design, clean lines, solid background' },
  { id: 'cyberpunk', label: 'Cyberpunk', emoji: '⚡', promptSuffix: 'cyberpunk aesthetic, neon lighting, futuristic, digital art' },
];

export default function AvatarStudio() {
  const [description, setDescription] = useState('');
  const [referencePhoto, setReferencePhoto] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState(AVATAR_STYLES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GeneratedAvatar[]>([]);
  const [currentAvatar, setCurrentAvatar] = useState<GeneratedAvatar | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Photo is too large. Please upload an image smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setReferencePhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    
    // Hardened prompt for absolute identity preservation
    let fullPrompt = `STRICT IDENTITY LOCK: You must generate an avatar that is a 100% exact replica of the person in the attached reference photo. 
    FACIAL FEATURES MUST BE IDENTICAL: Do not alter the bone structure, eyes, nose, mouth, or facial proportions. 
    The resulting image must be instantly recognizable as the SAME person. 
    Style: ${selectedStyle.promptSuffix}. 
    Focus: High-fidelity facial reconstruction, maintaining the subject's unique identity while applying the artistic style. 
    Ensure no distortion in facial symmetry.`;
    
    if (description) {
      fullPrompt += ` Additional context: ${description}.`;
    }
    
    fullPrompt += ` Output should be a high-quality, centered portrait.`;
    
    try {
      const imageUrl = await generateImageAI(fullPrompt, "1:1", referencePhoto || undefined);
      if (imageUrl) {
        const newAvatar: GeneratedAvatar = {
          id: Date.now().toString(),
          url: imageUrl,
          prompt: description,
          style: selectedStyle.label
        };
        setHistory(prev => [newAvatar, ...prev]);
        setCurrentAvatar(newAvatar);
      }
    } catch (error) {
      console.error("Avatar generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAvatar = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `nepal-avatar-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f9fbfb] relative overflow-hidden overflow-y-auto scrollbar-hide">
      <div className="absolute inset-0 fiesta-blur pointer-events-none opacity-40" />
      
      <div className="max-w-6xl mx-auto w-full p-6 md:p-10 z-10 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-nepal-red/10 text-nepal-red rounded-full text-xs font-bold uppercase tracking-widest shadow-sm border border-nepal-red/10"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Avatar Engine
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 tracking-tight">
            Create Your <span className="bg-gradient-to-r from-nepal-red to-nepal-blue bg-clip-text text-transparent">Digital Persona</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
            Design unique avatars for your profiles, games, or projects with a touch of Nepali culture. 🇳🇵
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Configuration */}
          <div className="lg:col-span-12 space-y-8">
            <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-2xl shadow-slate-200/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-nepal-red/5 blur-3xl rounded-full -mr-20 -mt-20" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                    <div className="flex flex-col h-full space-y-6">
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Camera className="w-4 h-4" />
                                Your Original Photo
                            </label>
                            <div className="relative">
                                {!referencePhoto ? (
                                    <label className="flex flex-col items-center justify-center w-full h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] cursor-pointer hover:bg-slate-100 transition-colors group">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-10 h-10 text-slate-400 mb-3 group-hover:text-nepal-red transition-colors" />
                                            <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">Tap to Upload Photo</p>
                                            <p className="text-[10px] text-slate-400 mt-1">Facial structure will be locked 100%</p>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                    </label>
                                ) : (
                                    <div className="relative w-full h-48 rounded-[32px] overflow-hidden border-2 border-nepal-red/30 group shadow-lg">
                                        <img src={referencePhoto} alt="Reference" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button 
                                                onClick={() => setReferencePhoto(null)}
                                                className="p-3 bg-white rounded-full text-slate-900 shadow-lg hover:scale-110 transition-transform"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Palette className="w-4 h-4" />
                                Style Preset
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {AVATAR_STYLES.map((style) => (
                                    <button
                                        key={style.id}
                                        onClick={() => setSelectedStyle(style)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-4 rounded-[24px] border-2 transition-all group active:scale-95",
                                            selectedStyle.id === style.id 
                                                ? "bg-nepal-red/5 border-nepal-red shadow-lg shadow-nepal-red/5" 
                                                : "bg-white border-slate-100 hover:border-slate-200"
                                        )}
                                    >
                                        <span className="text-3xl group-hover:scale-110 transition-transform">{style.emoji}</span>
                                        <span className={cn(
                                            "text-xs font-bold uppercase tracking-tight",
                                            selectedStyle.id === style.id ? "text-nepal-red" : "text-slate-500"
                                        )}>{style.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Smile className="w-4 h-4" />
                                    Extra Magic (Optional)
                                </label>
                                <input 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="e.g. Change clothes to suit, or change background"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-base font-medium focus:ring-2 focus:ring-nepal-red/20 outline-none transition-all"
                                />
                            </div>

                            <button 
                                onClick={handleGenerate}
                                disabled={isGenerating || !referencePhoto}
                                className="w-full py-5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-3xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95"
                            >
                                {isGenerating ? (
                                    <>
                                        <RefreshCw className="w-6 h-6 animate-spin" />
                                        Syncing Identity...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-6 h-6" />
                                        {referencePhoto ? 'Generate Same-to-Same' : 'Upload Photo First'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <label className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Generated Result
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-nepal-red/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative w-full aspect-square bg-slate-50 rounded-[48px] border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden ring-1 ring-slate-100">
                                <AnimatePresence mode="wait">
                                    {currentAvatar ? (
                                        <motion.img 
                                            key={currentAvatar.id}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            src={currentAvatar.url} 
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-4 text-slate-300">
                                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                                                <User className="w-8 h-8" />
                                            </div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Waiting for Data</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                                
                                {isGenerating && (
                                    <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center">
                                        <motion.div 
                                            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 180, 270, 360] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="w-12 h-12 bg-nepal-red/20 rounded-xl flex items-center justify-center mb-4"
                                        >
                                            <Sparkles className="w-6 h-6 text-nepal-red" />
                                        </motion.div>
                                        <span className="text-[10px] font-bold text-nepal-red uppercase tracking-[0.3em]">Processing Face...</span>
                                    </div>
                                )}
                            </div>
                            
                            {currentAvatar && (
                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
                                    <button 
                                        onClick={() => downloadAvatar(currentAvatar.url)}
                                        className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-2xl shadow-slate-200/50 transition-all active:scale-95"
                                    >
                                        <Download className="w-5 h-5" />
                                        Download Profile
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Bottom: History */}
          <div className="lg:col-span-12">
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-slate-400" />
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Recent Generations</h3>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{history.length} SAVED</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {history.map((avatar) => (
                        <motion.button
                            key={avatar.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => setCurrentAvatar(avatar)}
                            className={cn(
                                "group relative aspect-square rounded-[32px] overflow-hidden border-4 transition-all active:scale-95",
                                currentAvatar?.id === avatar.id ? "border-nepal-red shadow-xl shadow-nepal-red/20" : "border-white shadow-md hover:border-slate-50"
                            )}
                        >
                            <img 
                                src={avatar.url} 
                                alt="History" 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                                referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Check className="w-8 h-8 text-white" />
                            </div>
                        </motion.button>
                    ))}
                    {history.length === 0 && (
                        <div className="col-span-full py-12 bg-white border border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center text-slate-400">
                             <Dice5 className="w-10 h-10 mb-3 opacity-20" />
                             <p className="text-sm font-bold">Your creations will be saved here</p>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>

        {/* Pro Tip */}
        <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                <span className="text-[200px] leading-none">🏔️</span>
            </div>
            <div className="max-w-xl relative z-10 space-y-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                    <ShieldCheck className="w-6 h-6 text-nepal-red" />
                </div>
                <h3 className="text-2xl font-bold">Verified Avatars</h3>
                <p className="text-slate-400 font-medium">
                    Upgrade to Premium to get the <strong>Blue Badge</strong> mark on your AI Nepal profiles.
                </p>
                <button className="px-6 py-3 bg-nepal-blue hover:bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
                    Claim Badge 👑
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
