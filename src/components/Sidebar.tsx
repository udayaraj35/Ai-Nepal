import React from 'react';
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Search, 
  Gamepad2, 
  Users, 
  FolderOpen,
  Plus,
  ChevronRight,
  Sun,
  ChevronLeft,
  LogOut,
  Zap,
  LayoutDashboard,
  Video,
  Mic2,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  Shield,
  Cpu,
  BarChart3
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  onNewChat: () => void;
  isAdmin?: boolean;
}

export default function Sidebar({ activeTool, setActiveTool, onNewChat, isAdmin }: SidebarProps) {
  const { user, logout } = useAuth();
  const [isToolsOpen, setIsToolsOpen] = React.useState(true);

  const creativeTools = [
    { id: 'avatars', name: 'Avatars', icon: Users, color: 'text-nepal-red', bg: 'bg-nepal-red/10' },
    { id: 'projects', name: 'Projects', icon: FolderOpen, color: 'text-nepal-blue', bg: 'bg-nepal-blue/10' },
    { id: 'games', name: 'Games', icon: Gamepad2, color: 'text-nepal-red', bg: 'bg-nepal-red/10' },
  ];

  const adminTools = [
    { id: 'admin', name: 'System Command', icon: Shield, color: 'text-slate-900', bg: 'bg-slate-100' },
    { id: 'admin-users', name: 'User Control', icon: Users, color: 'text-nepal-blue', bg: 'bg-nepal-blue/5' },
    { id: 'admin-models', name: 'Model Lab', icon: Cpu, color: 'text-nepal-red', bg: 'bg-nepal-red/5' },
    { id: 'admin-stats', name: 'System Stats', icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="hidden md:flex w-72 h-full bg-[#f9fbfb] border-r border-slate-200 flex-col z-20 overflow-hidden">
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <motion.div 
            whileHover={{ rotate: [0, -10, 10, 0] }}
            className="w-9 h-9 bg-gradient-to-br from-nepal-red to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-nepal-red/20"
          >
            <span className="text-xl font-bold">🇳🇵</span>
          </motion.div>
          <span className="font-display font-bold text-xl text-slate-900 tracking-tight">AI Nepal</span>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-8">
        <div className="relative group p-1 bg-white border border-slate-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-nepal-blue/20 transition-all">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-nepal-blue transition-colors" />
          <input 
            type="text" 
            placeholder="Search everything..." 
            className="w-full pl-10 pr-4 py-2 bg-transparent border-none rounded-xl text-sm outline-none placeholder:text-slate-400 font-medium"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-slate-400">
            ⌘K
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-hide">
        <button 
          onClick={onNewChat}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all mb-1 group",
            activeTool === 'chat' ? "bg-white border border-slate-100 shadow-sm text-nepal-red" : "text-slate-600 hover:bg-slate-200/50"
          )}
        >
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm",
            activeTool === 'chat' ? "bg-nepal-red text-white" : "bg-white border border-slate-200 group-hover:bg-slate-50"
          )}>
            <Plus className="w-5 h-5" />
          </div>
          New Chat
          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>
        </button>

        <button 
          onClick={() => setActiveTool('image')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all group",
            activeTool === 'image' ? "bg-white border border-slate-100 shadow-sm text-nepal-blue" : "text-slate-600 hover:bg-slate-200/50"
          )}
        >
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm",
            activeTool === 'image' ? "bg-nepal-blue/10 text-nepal-blue border border-nepal-blue/20" : "bg-white border border-slate-200 group-hover:bg-slate-50"
          )}>
            <ImageIcon className="w-5 h-5" />
          </div>
          Image Studio
          <span className="ml-auto flex h-2 w-2 rounded-full bg-nepal-red animate-pulse" />
        </button>

        <div className="pt-8 pb-2">
          <div className="flex items-center justify-between px-4 mb-3">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Creative Studio</span>
             <button 
               onClick={() => setIsToolsOpen(!isToolsOpen)}
               className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
             >
               {isToolsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
             </button>
          </div>
          
          {isToolsOpen && (
            <div className="space-y-1 px-1">
              {creativeTools.map((tool) => (
                <button 
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl group transition-all",
                    activeTool === tool.id ? "bg-white border border-slate-100 shadow-sm" : "hover:bg-slate-200/50"
                  )}
                >
                  <div className={cn(
                    "flex items-center gap-3 text-sm font-bold transition-colors",
                    activeTool === tool.id ? tool.color : "text-slate-600 group-hover:text-slate-900"
                  )}>
                    <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                        activeTool === tool.id ? tool.bg : "bg-slate-100 group-hover:bg-white"
                    )}>
                        <tool.icon className="w-4 h-4" />
                    </div>
                    {tool.name}
                  </div>
                  <ChevronRight className={cn(
                    "w-4 h-4 text-slate-300 transform group-hover:translate-x-1 transition-transform",
                    activeTool === tool.id && "text-nepal-red"
                  )} />
                </button>
              ))}
            </div>
          )}

          {isAdmin && (
            <div className="mt-8">
              <div className="flex items-center justify-between px-4 mb-3">
                <span className="text-[10px] font-bold text-nepal-red uppercase tracking-widest">Admin Orchestration</span>
              </div>
              <div className="space-y-1 px-1">
                {adminTools.map((tool) => (
                  <button 
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-xl group transition-all",
                      activeTool === tool.id ? "bg-slate-900 border-none shadow-xl shadow-slate-900/10 text-white" : "hover:bg-slate-200/50"
                    )}
                  >
                    <div className={cn(
                      "flex items-center gap-3 text-sm font-bold transition-colors",
                      activeTool === tool.id ? "text-white" : "text-slate-600 group-hover:text-slate-900"
                    )}>
                      <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                          activeTool === tool.id ? "bg-white/10" : tool.bg
                      )}>
                          <tool.icon className={cn("w-4 h-4", activeTool === tool.id ? "text-white" : tool.color)} />
                      </div>
                      {tool.name}
                    </div>
                    <ChevronRight className={cn(
                      "w-4 h-4 transform group-hover:translate-x-1 transition-transform",
                      activeTool === tool.id ? "text-white/40" : "text-slate-300"
                    )} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 space-y-4 bg-white/40 backdrop-blur-sm border-t border-slate-100">
        {!isAdmin && (
          <div className="relative overflow-hidden bg-white rounded-3xl p-5 border border-slate-100 shadow-sm group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-nepal-blue/5 blur-2xl group-hover:bg-nepal-blue/10 transition-colors" />
            
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-nepal-blue/10 rounded-lg">
                      <Zap className="w-3.5 h-3.5 text-nepal-blue" />
                  </div>
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Free Plan</p>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">0 / 10</p>
            </div>
            
            <div className="w-full h-1.5 bg-slate-100 rounded-full mb-5 overflow-hidden">
              <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "10%" }}
                  className="h-full bg-nepal-blue transition-all" 
              />
            </div>

            <button 
              onClick={() => setActiveTool('subscription')}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-[18px] text-[10px] font-bold flex items-center justify-center gap-2 transition-all active:scale-95 uppercase tracking-widest shadow-lg shadow-slate-900/10"
            >
               Upgrade to Pro ✨
            </button>
          </div>
        )}

        <div className="flex items-center justify-between px-1">
            <button 
              onClick={() => setActiveTool('profile')}
              className={cn(
                "flex items-center gap-3 group/profile flex-1 transition-all p-1 rounded-2xl hover:bg-slate-100",
                activeTool === 'profile' && "bg-slate-100"
              )}
            >
              <div className="relative">
                {user?.photoURL ? (
                    <img src={user.photoURL} alt="avatar" className="w-10 h-10 rounded-2xl border border-white shadow-sm object-cover" />
                ) : (
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm border border-white shadow-sm">
                    {user?.displayName?.charAt(0) || 'U'}
                    </div>
                )}
                <div className="absolute -right-1 -bottom-1 w-3.5 h-3.5 bg-nepal-green border-2 border-white rounded-full transition-transform group-hover/profile:scale-110" />
              </div>
              <div className="max-w-[120px] text-left">
                <p className="text-xs font-bold text-slate-800 truncate leading-none mb-1 uppercase tracking-tight group-hover/profile:text-nepal-blue">
                  {user?.displayName?.split(' ')[0] || 'User'}
                </p>
                <p className="text-[9px] text-slate-400 truncate tracking-tight lowercase">Manage Account</p>
              </div>
            </button>
            <button onClick={logout} className="p-2.5 text-slate-400 hover:text-nepal-red hover:bg-nepal-red/5 rounded-xl transition-all" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
      </div>
    </div>
  );
}

