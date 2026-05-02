import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Plus, 
  Trash2, 
  RefreshCw, 
  History,
  X,
  Code2,
  Wand2,
  Trophy,
  Monitor,
  Smartphone,
  Sparkles
} from 'lucide-react';
import { generateGame } from '../services/aiService';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';

interface Game {
  id: string;
  title: string;
  description: string;
  code: string;
  createdAt: string;
}

export default function GameStudio() {
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  const [prompt, setPrompt] = useState('');
  const [gameTitle, setGameTitle] = useState('');

  const fetchGames = async () => {
    try {
      const response = await fetch('/api/games');
      if (response.ok) {
        const data = await response.json();
        setGames(data);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGames();
    }
  }, [user]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating || !user) return;

    setIsGenerating(true);
    try {
      const generatedCode = await generateGame(prompt);
      if (generatedCode) {
        const title = gameTitle || prompt.split(' ').slice(0, 3).join(' ') || 'New Game';
        
        const response = await fetch('/api/games', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title,
            description: prompt,
            code: generatedCode,
          })
        });

        if (response.ok) {
          const newGame = await response.json();
          setGames([newGame, ...games]);
          setActiveGame(newGame);
          setIsEditorOpen(false);
          setPrompt('');
          setGameTitle('');
        }
      }
    } catch (error) {
      console.error("Failed to generate game:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this game forever?")) {
      try {
        const response = await fetch(`/api/games/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setGames(games.filter(g => g.id !== id));
          if (activeGame?.id === id) setActiveGame(null);
        }
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f9fbfb] relative overflow-hidden">
      <div className="absolute inset-0 fiesta-blur pointer-events-none opacity-40" />
      
      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        {/* Sidebar / History */}
        <div className="w-full md:w-80 h-full border-r border-slate-200 bg-white/40 backdrop-blur-xl flex flex-col z-10">
            <div className="p-6 border-b border-slate-100 space-y-4">
                <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Gamepad2 className="w-6 h-6 text-nepal-red" />
                    Game <span className="text-nepal-red">Studio</span>
                </h2>
                <button 
                    onClick={() => setIsEditorOpen(true)}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    Banauna Thala
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                <div className="flex items-center gap-2 px-2 pb-2">
                    <History className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timra Game Haru</span>
                </div>
                
                {loading ? (
                    <div className="space-y-3">
                        {[1,2,3].map(i => (
                            <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : games.length > 0 ? (
                    games.map((game) => (
                        <div 
                            key={game.id}
                            className={cn(
                                "group p-4 rounded-2xl border transition-all cursor-pointer relative",
                                activeGame?.id === game.id 
                                    ? "bg-nepal-red/5 border-nepal-red/20 shadow-sm" 
                                    : "bg-white border-slate-100 hover:border-slate-200"
                            )}
                            onClick={() => setActiveGame(game)}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                    activeGame?.id === game.id ? "bg-nepal-red text-white" : "bg-slate-50 text-slate-400"
                                )}>
                                    <Trophy className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-slate-800 truncate">{game.title}</h4>
                                    <p className="text-[10px] text-slate-400 font-medium">
                                        {new Date(game.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(game.id); }}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-nepal-red/10 hover:text-nepal-red text-slate-300 rounded-lg transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-12 text-center">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No games yet</p>
                    </div>
                )}
            </div>
        </div>

        {/* Main Viewport */}
        <div className="flex-1 h-full flex flex-col relative bg-slate-50 overflow-hidden">
            {activeGame ? (
                <>
                    <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between z-10 px-8">
                        <div className="flex items-center gap-4">
                            <h3 className="text-lg font-bold text-slate-900">{activeGame.title}</h3>
                            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                                <Monitor className="w-3.5 h-3.5 text-slate-400" />
                                <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Cross-Platform</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all">
                                <Code2 className="w-4 h-4" />
                                Edit Code
                             </button>
                             <button className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg active:scale-95 transition-all">
                                <RefreshCw className="w-5 h-5" />
                             </button>
                        </div>
                    </div>
                    <div className="flex-1 p-4 md:p-10 flex items-center justify-center">
                        <div className="w-full h-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
                            <iframe 
                                title={activeGame.title}
                                srcDoc={activeGame.code}
                                className="w-full h-full border-none"
                                sandbox="allow-scripts"
                            />
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                    <motion.div 
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-32 h-32 bg-white rounded-[48px] shadow-2xl flex items-center justify-center mb-8 border border-slate-100"
                    >
                        <Gamepad2 className="w-16 h-16 text-slate-200" />
                    </motion.div>
                    <h2 className="text-3xl font-display font-bold text-slate-900 mb-2 tracking-tight">Khelna Thala! 🎮</h2>
                    <p className="text-slate-500 max-w-sm font-medium mb-10">Select a game from the sidebar or build a new one using AI Nepal.</p>
                    <button 
                        onClick={() => setIsEditorOpen(true)}
                        className="px-8 py-4 bg-slate-900 text-white rounded-3xl font-bold flex items-center gap-3 shadow-2xl active:scale-95 transition-all"
                    >
                        <Wand2 className="w-5 h-5" />
                        Create New Magic Game
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Generation Modal */}
      <AnimatePresence>
        {isEditorOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsEditorOpen(false)}
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-lg"
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    className="relative w-full max-w-2xl bg-white rounded-[48px] shadow-2xl p-10 space-y-10"
                >
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                             <h2 className="text-4xl font-display font-bold text-slate-900 tracking-tight">
                                Build <span className="text-nepal-red">Game</span>
                             </h2>
                             <p className="text-slate-500 font-medium">Describe your dream game, I'll code it for you. 🇳🇵</p>
                        </div>
                        <button onClick={() => setIsEditorOpen(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleGenerate} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Game Title</label>
                            <input 
                                value={gameTitle}
                                onChange={(e) => setGameTitle(e.target.value)}
                                placeholder="e.g. Nepal Adventure Quest"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-lg font-bold text-slate-800 outline-none focus:ring-2 focus:ring-nepal-red/20 transition-all"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">What happens in the game?</label>
                            <textarea 
                                autoFocus
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g. A character collecting momos while dodging monkeys at Swayambhunath. Use touch controls for mobile and arrows for PC. Make it colorful!"
                                rows={5}
                                className="w-full bg-slate-50 border border-slate-100 rounded-[32px] px-6 py-6 text-base font-medium text-slate-800 outline-none focus:ring-2 focus:ring-nepal-red/20 transition-all resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-4">
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <Monitor className="w-6 h-6 text-slate-400" />
                                <div className="leading-none">
                                    <p className="text-xs font-bold text-slate-800">PC READY</p>
                                    <p className="text-[10px] text-slate-400 font-medium">Keyboard Support</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <Smartphone className="w-6 h-6 text-slate-400" />
                                <div className="leading-none">
                                    <p className="text-xs font-bold text-slate-800">MOBILE READY</p>
                                    <p className="text-[10px] text-slate-400 font-medium">Touch Controls</p>
                                </div>
                            </div>
                        </div>

                        <button 
                            disabled={!prompt.trim() || isGenerating}
                            className="w-full py-5 bg-nepal-red hover:bg-red-600 disabled:bg-slate-200 text-white rounded-3xl font-bold text-xl flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95"
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw className="w-6 h-6 animate-spin" />
                                    Coding Gameplay...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-6 h-6" />
                                    Mitho Game Banau
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
