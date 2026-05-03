import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Dice5,
  Camera,
  Wand2,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Plus
} from 'lucide-react';
import { generateImageAI } from '../services/aiService';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';

interface GeneratedAvatar {
  id: string;
  url: string;
  prompt: string;
  style: string;
}

const AVATAR_STYLES = [
  { id: 'traditional', label: 'Traditional Nepali', emoji: '🇳🇵', promptSuffix: 'wearing traditional Nepali Dhaka topi and Daura Suruwal, authentic portrait style, culturally rich' },
  { id: 'professional', label: 'Professional', emoji: '👔', promptSuffix: 'professional LinkedIn headshot, corporate attire, studio lighting, highly detailed' },
  { id: '3d-render', label: '3D Character', emoji: '🎨', promptSuffix: '3D Pixar animated character style, cute, highly detailed, vibrant colors, soft lighting' },
  { id: 'anime', label: 'Anime Style', emoji: '🎌', promptSuffix: 'high quality anime style, Studio Ghibli inspired, beautiful line art, soft emotional lighting' },
  { id: 'cyberpunk', label: 'Cyberpunk', emoji: '⚡', promptSuffix: 'cyberpunk aesthetic, neon city lighting, futuristic wear, digital painting' },
  { id: 'fantasy', label: 'Fantasy RPG', emoji: '🗡️', promptSuffix: 'fantasy RPG character portrait, magical lighting, epic background, detailed armor or robes' },
];

interface AvatarStudioProps {
  isGuest?: boolean;
  onRequireLogin?: () => void;
}

export default function AvatarStudio({ isGuest, onRequireLogin }: AvatarStudioProps) {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [referencePhoto, setReferencePhoto] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState(AVATAR_STYLES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GeneratedAvatar[]>([]);
  const [currentAvatar, setCurrentAvatar] = useState<GeneratedAvatar | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (isGuest && onRequireLogin) {
      onRequireLogin();
      return;
    }

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
        setHistory(prev => [newAvatar, ...prev].slice(0, 10)); // Keep last 10
        setCurrentAvatar(newAvatar);
      }
    } catch (error) {
      console.error("Avatar generation failed:", error);
      alert("Failed to generate avatar. Please try again.");
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
    <div className="flex-1 flex flex-col md:flex-row h-full bg-[#f9fbfb] relative overflow-hidden">
      {/* Left Sidebar - Configuration */}
      <div className="w-full md:w-96 bg-white border-r border-slate-200 flex flex-col h-full z-10 shadow-sm relative overflow-y-auto">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white text-nepal-red rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border border-slate-200 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            AI Avatar Engine
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Design Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Transform your photo into a stylized avatar.</p>
        </div>

        <div className="p-6 space-y-8 flex-1">
          {/* Reference Photo */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Source Photo <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              {!referencePhoto ? (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-40 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl hover:bg-slate-100 hover:border-slate-400 transition-colors flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700">Upload your face</p>
                    <p className="text-xs text-slate-400 mt-0.5">Clear, front-facing image</p>
                  </div>
                </button>
              ) : (
                <div className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-nepal-blue shadow-sm group">
                  <img src={referencePhoto} alt="Reference" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <button 
                      onClick={() => setReferencePhoto(null)}
                      className="px-4 py-2 bg-white/20 hover:bg-red-500 text-white rounded-full text-xs font-bold backdrop-blur-md transition-colors"
                    >
                      Remove
                    </button>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-white text-slate-900 rounded-full text-xs font-bold shadow-sm hover:bg-slate-100 transition-colors"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
              />
            </div>
          </div>

          {/* Style Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Choose Style
            </label>
            <div className="grid grid-cols-2 gap-3">
              {AVATAR_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style)}
                  className={cn(
                    "flex flex-col items-start gap-1 p-3 rounded-2xl border-2 transition-all text-left",
                    selectedStyle.id === style.id 
                      ? "bg-blue-50/50 border-nepal-blue shadow-sm" 
                      : "bg-white border-slate-100 hover:border-slate-200"
                  )}
                >
                  <span className="text-2xl mb-1">{style.emoji}</span>
                  <span className={cn(
                    "text-xs font-bold leading-tight",
                    selectedStyle.id === style.id ? "text-nepal-blue" : "text-slate-600"
                  )}>{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Custom Instructions (Optional)
            </label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Make me look like a king, wearing sunglasses, in the mountains..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-nepal-blue/20 focus:border-nepal-blue outline-none transition-all resize-none"
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0">
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || !referencePhoto}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 transition-all active:scale-95"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                {referencePhoto ? 'Generate Avatar' : 'Upload Photo First'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Content - Canvas & History */}
      <div className="flex-1 flex flex-col relative bg-[#f4f7f8] overflow-y-auto">
        <div className="flex-1 p-6 md:p-12 flex flex-col items-center justify-center min-h-[500px]">
          <div className="w-full max-w-lg">
            <div className="relative aspect-square w-full bg-white rounded-[40px] shadow-2xl flex items-center justify-center overflow-hidden border border-slate-100">
              <AnimatePresence mode="wait">
                {currentAvatar ? (
                  <motion.div
                    key={currentAvatar.id}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full h-full relative group"
                  >
                    <img 
                      src={currentAvatar.url} 
                      alt="Generated Avatar"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                       <button 
                          onClick={() => downloadAvatar(currentAvatar.url)}
                          className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-lg"
                        >
                          <Download className="w-5 h-5" />
                          Download Image
                        </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center gap-4 text-slate-300">
                    <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center border-2 border-dashed border-slate-200">
                      <User className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-400">Your avatar will appear here</p>
                  </div>
                )}
              </AnimatePresence>

              {isGenerating && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                    className="w-16 h-16 border-4 border-slate-200 border-t-nepal-blue rounded-full mb-6"
                  />
                  <p className="text-sm font-bold text-slate-800">Applying Style: {selectedStyle.label}</p>
                  <p className="text-xs text-slate-500 mt-1">This takes about 5-10 seconds...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Gallery */}
        {history.length > 0 && (
          <div className="bg-white border-t border-slate-200 p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Recent Creations</h3>
            <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
              {history.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => setCurrentAvatar(avatar)}
                  className={cn(
                    "relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all",
                    currentAvatar?.id === avatar.id ? "border-nepal-blue shadow-md" : "border-transparent hover:border-slate-300"
                  )}
                >
                  <img src={avatar.url} alt="History" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

