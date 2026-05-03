import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Shield, Settings, Users, Cpu, MessageSquare, LogOut, Code2, Terminal, Database, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import AdminPanel from './AdminPanel';
import AdminChat from './AdminChat';

export default function AdminLayout({ onGoToWebsite }: { onGoToWebsite: () => void }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Control Center', icon: Settings },
    { id: 'chat', label: 'Admin AI Assistant', icon: Terminal },
    { id: 'website', label: 'AI Nepal Website', icon: Globe, action: onGoToWebsite },
  ];

  return (
    <div className="flex h-screen w-full bg-[#f4f7f8] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-nepal-red/20 rounded-xl flex items-center justify-center text-nepal-red">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-bold tracking-tight leading-tight">Admin OS</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">v3.0.0</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => item.action ? item.action() : setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === item.id 
                  ? "bg-nepal-blue text-white shadow-lg shadow-nepal-blue/20" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="p-4 bg-slate-800 rounded-2xl mb-4">
             <p className="text-xs font-bold text-white mb-1 truncate">{user?.displayName || 'Admin User'}</p>
             <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f4f7f8] relative">
        <div className="absolute inset-0 pattern-grid-lg text-slate-900/[0.02] pointer-events-none" />
        
        {activeTab === 'dashboard' ? (
          <AdminPanel />
        ) : activeTab === 'chat' ? (
           <AdminChat />
        ) : null}
      </main>
    </div>
  );
}
