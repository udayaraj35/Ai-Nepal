/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import ChatInterface from './components/ChatInterface';
import Login from './components/Login';
import Subscription from './components/Subscription';
import AdminPanel from './components/AdminPanel';
import ImageStudio from './components/ImageStudio';
import AvatarStudio from './components/AvatarStudio';
import ProjectStudio from './components/ProjectStudio';
import GameStudio from './components/GameStudio';
import VideoStudio from './components/VideoStudio';
import AudioStudio from './components/AudioStudio';
import { Message } from './types';
import { chatWithAI } from './services/aiService';
import { useAuth } from './lib/AuthContext';
import { 
  LayoutDashboard, ChevronRight, LogOut, 
  User as UserIcon, CreditCard, Shield, Zap, BarChart3, 
  Settings, Bell, Mail, Compass, ShieldCheck
} from 'lucide-react';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export default function App() {
  const { user, loading, isAdmin, logout } = useAuth();
  const [activeTool, setActiveTool] = useState(isAdmin ? 'admin' : 'chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Error handler as per guidelines
  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: user?.uid,
        email: user?.email,
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  useEffect(() => {
    if (isAdmin) {
      setActiveTool('admin');
    } else {
      setActiveTool('chat');
    }
  }, [isAdmin]);

  // Load chat messages when session changes
  useEffect(() => {
    if (!user || !currentSessionId) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/chat/sessions/${currentSessionId}/messages`);
        if (response.ok) {
          const msgs = await response.json();
          setMessages(msgs.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.createdAt).getTime()
          })));
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Polling for now as no websocket
    return () => clearInterval(interval);
  }, [user, currentSessionId]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-nepal-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setActiveTool('chat');
  };

  const handleSendMessage = async (content: string, attachments: { data: string, mimeType: string }[] = []) => {
    if (!user) return;

    let sessionId = currentSessionId;

    try {
      // 1. Create session if it doesn't exist
      if (!sessionId) {
        const sessionRes = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: content.substring(0, 30) + '...' })
        });
        if (!sessionRes.ok) throw new Error('Failed to create session');
        const session = await sessionRes.json();
        sessionId = session.id;
        setCurrentSessionId(sessionId);
      }

      // 2. Add user message
      await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user', content })
      });

      setIsLoading(true);

      // 3. Get AI Response
      const response = await chatWithAI(content, messages.slice(-5).map(m => ({
        role: m.role,
        content: m.content
      })), attachments);

      // 4. Add AI response
      await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          role: 'model', 
          content: response || "Sorry, I couldn't process that." 
        })
      });

    } catch (error) {
      console.error("AI/API Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden relative">
      <Sidebar 
        activeTool={activeTool} 
        setActiveTool={setActiveTool} 
        onNewChat={startNewChat}
        isAdmin={isAdmin}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {activeTool === 'chat' ? (
          <ChatInterface 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading} 
            userDisplayName={user.displayName || 'User'}
          />
        ) : activeTool === 'subscription' ? (
          <Subscription />
        ) : activeTool === 'image' ? (
          <ImageStudio />
        ) : activeTool === 'avatars' ? (
          <AvatarStudio />
        ) : activeTool === 'projects' ? (
          <ProjectStudio />
        ) : activeTool === 'games' ? (
          <GameStudio />
        ) : activeTool === 'video' ? (
          <VideoStudio />
        ) : activeTool === 'audio' ? (
          <AudioStudio />
        ) : activeTool === 'admin' || activeTool === 'admin-users' || activeTool === 'admin-models' || activeTool === 'admin-stats' ? (
          <AdminPanel 
            initialTab={
              activeTool === 'admin-users' ? 'users' : 
              activeTool === 'admin-models' ? 'models' : 
              activeTool === 'admin-stats' ? 'analysis' : 
              'analysis'
            } 
          />
        ) : activeTool === 'profile' ? (
          <ProfileView 
            user={user} 
            isAdmin={isAdmin} 
            setActiveTool={setActiveTool} 
            logout={logout} 
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 grid-bg">
            <div className="text-center bg-white p-12 rounded-[40px] shadow-2xl border border-slate-100 max-w-lg z-10">
              <div className="w-20 h-20 bg-nepal-red/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl text-nepal-red">🇳🇵</span>
              </div>
              <h2 className="text-2xl font-display font-bold mb-4">{activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} Studio</h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                We are building the future of AI in Nepal. The {activeTool} tool is being optimized for excellence.
              </p>
              <button 
                onClick={() => setActiveTool('chat')}
                className="mt-8 px-10 py-4 bg-nepal-blue text-white rounded-2xl font-bold font-display shadow-lg hover:shadow-nepal-blue/20 transition-all active:scale-95"
              >
                Return to Admin
              </button>
            </div>
          </div>
        )}
      </main>

      <MobileNav 
        activeTool={activeTool} 
        setActiveTool={setActiveTool} 
        isAdmin={isAdmin}
      />
    </div>
  );
}

function ProfileView({ user, isAdmin, setActiveTool, logout }: { user: any, isAdmin: boolean, setActiveTool: (tool: string) => void, logout: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const { updateProfile } = useAuth();

  const handleUpdate = async () => {
    try {
      await updateProfile({ displayName: newName });
      setIsEditing(false);
    } catch (e) {
      alert("Failed to update profile");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-12 scroll-smooth">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Account Hub</h1>
            <p className="text-slate-500 font-medium font-nepal italic">Welcome back to your creative sanctuary</p>
          </div>
          <button 
            onClick={() => setActiveTool('chat')}
            className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Compass className="w-6 h-6 text-slate-400" />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: User Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/20 border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-24 bg-slate-900" />
              <div className="relative pt-4 flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-[40px] bg-white p-1 shadow-2xl relative z-10 transition-transform group-hover:scale-105">
                     <div className="w-full h-full rounded-[39px] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-4xl font-black text-slate-400 overflow-hidden">
                        {user?.photoURL ? (
                          <img src={user.photoURL} alt="profile" className="w-full h-full object-cover" />
                        ) : (
                          user?.displayName?.[0] || user?.email?.[0]?.toUpperCase()
                        )}
                     </div>
                  </div>
                  <div className="absolute -right-2 -bottom-2 w-10 h-10 bg-nepal-green border-4 border-white rounded-[14px] shadow-lg flex items-center justify-center text-white">
                     <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>

                <div className="text-center w-full px-2">
                  {isEditing ? (
                    <div className="space-y-4">
                      <input 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-center outline-none focus:ring-4 focus:ring-nepal-blue/10"
                        placeholder="Enter full name"
                      />
                      <div className="flex gap-2">
                        <button onClick={handleUpdate} className="flex-1 py-2 bg-nepal-blue text-white rounded-xl text-xs font-black uppercase">Save</button>
                        <button onClick={() => setIsEditing(false)} className="flex-1 py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-black uppercase">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="group/name relative inline-block">
                      <h2 className="text-2xl font-bold text-slate-900 group-hover/name:text-nepal-blue transition-colors">{user?.displayName || 'Nepal Creative'}</h2>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover/name:opacity-100 transition-opacity bg-slate-50 rounded-lg"
                      >
                         <Settings className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                  )}
                  <p className="text-slate-400 font-medium mb-6 mt-1 lowercase truncate">{user?.email}</p>
                </div>

                <div className="w-full space-y-3">
                   {!isAdmin && (
                     <>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl border border-slate-100 group/item hover:bg-white hover:border-nepal-blue transition-all">
                          <div className="flex items-center gap-3">
                             <Zap className="w-5 h-5 text-nepal-red" />
                             <span className="text-sm font-bold text-slate-600">Tokens</span>
                          </div>
                          <span className="text-sm font-black text-slate-900">{user?.tokensUsed || 0}</span>
                       </div>
                       <div className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl border border-slate-100 group/item hover:bg-white hover:border-nepal-blue transition-all">
                          <div className="flex items-center gap-3">
                             <CreditCard className="w-5 h-5 text-nepal-blue" />
                             <span className="text-sm font-bold text-slate-600">Plan</span>
                          </div>
                          <span className="text-[10px] font-black text-white bg-nepal-blue px-3 py-1 rounded-full uppercase italic tracking-tighter">
                            {user?.subscription || 'Premium'}
                          </span>
                       </div>
                     </>
                   )}
                   {isAdmin && (
                     <div className="p-4 bg-slate-900 text-white rounded-3xl text-center space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Authority Status</p>
                        <p className="text-lg font-bold">System Operator</p>
                     </div>
                   )}
                </div>
              </div>
            </div>

            <button 
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-3 p-6 bg-nepal-red/5 text-nepal-red rounded-[32px] font-black uppercase tracking-widest hover:bg-nepal-red hover:text-white transition-all shadow-xl shadow-nepal-red/5"
            >
              <LogOut className="w-5 h-5" />
              Terminate Session
            </button>
          </div>

          {/* Right Column: Details & Stats */}
          <div className="lg:col-span-2 space-y-8">
            {!isAdmin && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/20 border border-slate-100 group hover:border-nepal-blue/20 transition-all">
                    <div className="w-12 h-12 bg-nepal-red/10 rounded-2xl flex items-center justify-center mb-6">
                      <Shield className="w-6 h-6 text-nepal-red" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Access & Permissions</h3>
                    <p className="text-slate-400 font-medium text-sm mb-6">Your role defines available workspace features.</p>
                    <div className="flex gap-2">
                      <span className="px-5 py-2 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">{user?.role === 'admin' ? 'System Administrator' : 'Creative Professional'}</span>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/20 border border-slate-100 group hover:border-nepal-blue/20 transition-all">
                    <div className="w-12 h-12 bg-nepal-blue/10 rounded-2xl flex items-center justify-center mb-6">
                      <BarChart3 className="w-6 h-6 text-nepal-blue" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Platform Activity</h3>
                    <p className="text-slate-400 font-medium text-sm mb-6">Current creative workflow analytics.</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-nepal-blue w-[75%]" />
                      </div>
                      <span className="text-xs font-black text-slate-600">75%</span>
                    </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-[40px] p-10 shadow-xl shadow-slate-200/20 border border-slate-100">
               <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">System Information</h3>
                    <p className="text-slate-400 font-medium">Platform metadata and account provenance</p>
                  </div>
                  <Settings className="w-8 h-8 text-slate-100" />
               </div>

               <div className="divide-y divide-slate-50">
                  <div className="py-6 flex items-center justify-between group">
                     <div className="flex items-center gap-4">
                        <Mail className="w-5 h-5 text-slate-300 group-hover:text-nepal-blue transition-colors" />
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Login Email</p>
                           <p className="text-sm font-bold text-slate-900">{user?.email}</p>
                        </div>
                     </div>
                     <span className="text-[10px] font-black text-nepal-green uppercase tracking-[0.2em]">Verified</span>
                  </div>

                  <div className="py-6 flex items-center justify-between group">
                     <div className="flex items-center gap-4">
                        <Bell className="w-5 h-5 text-slate-300 group-hover:text-nepal-red transition-colors" />
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Language</p>
                           <p className="text-sm font-bold text-slate-900">English (US)</p>
                        </div>
                     </div>
                     <p className="text-[10px] font-black text-slate-400 uppercase">Default</p>
                  </div>

                  <div className="py-6 flex items-center justify-between group">
                     <div className="flex items-center gap-4">
                        <Compass className="w-5 h-5 text-slate-300 group-hover:text-nepal-blue transition-colors" />
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Region</p>
                           <p className="text-sm font-bold text-slate-900 flex items-center gap-2">Kathmandu, NP <span className="text-xs">🇳🇵</span></p>
                        </div>
                     </div>
                     <button className="text-[10px] font-black text-nepal-blue hover:underline uppercase tracking-widest">Change</button>
                  </div>
             </div>

             {isAdmin && (
                <div className="mt-10 p-10 bg-slate-900 rounded-[40px] relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-10">
                      <ShieldCheck className="w-32 h-32 text-white" />
                   </div>
                   <h4 className="text-2xl font-bold text-white mb-2">Operator Console</h4>
                   <p className="text-white/40 text-sm mb-8 max-w-sm">You have administrative override privileges. System integrity is your responsibility.</p>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <button 
                         onClick={() => setActiveTool('admin')}
                         className="py-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                      >
                         Control Panel
                      </button>
                      <button 
                         onClick={() => setActiveTool('admin-users')}
                         className="py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                      >
                         User Registry
                      </button>
                   </div>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}

