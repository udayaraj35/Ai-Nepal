import React, { useState, useEffect } from 'react';
import { 
  Users, CreditCard, BarChart3, Settings, ShieldCheck, 
  Activity, Zap, Database, Globe, Lock, Unlock, 
  MessageSquare, Image as ImageIcon, Headphones, Terminal,
  Search, ShieldAlert, CheckCircle2, UserCog, Cpu, Plus, Edit2, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface PlatformUser {
  uid: string;
  email: string;
  displayName?: string;
  role: string;
  subscription: string;
  tokensUsed: number;
  status?: string;
}

interface AIModel {
  id: string;
  provider: string;
  name: string;
  version: string;
  logo: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export default function AdminPanel({ initialTab }: { initialTab?: 'analysis' | 'users' | 'settings' | 'models' }) {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analysis' | 'users' | 'settings' | 'models'>(initialTab || 'analysis');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Model Form State
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [modelForm, setModelForm] = useState<{
    provider: string;
    name: string;
    version: string;
    logo: string;
    description: string;
    status: 'active' | 'inactive';
  }>({
    provider: '',
    name: '',
    version: '',
    logo: '',
    description: '',
    status: 'active'
  });

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/admin/models');
      if (response.ok) {
        const data = await response.json();
        setModels(data);
      }
    } catch (error) {
      console.error("Failed to fetch models", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchModels();
  }, []);

  const handleModelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingModel ? `/api/admin/models/${editingModel.id}` : '/api/admin/models';
    const method = editingModel ? 'PATCH' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modelForm),
      });

      if (response.ok) {
        fetchModels();
        setIsModelModalOpen(false);
        setEditingModel(null);
        setModelForm({ provider: '', name: '', version: '', logo: '', description: '', status: 'active' });
      }
    } catch (error) {
      console.error("Failed to save model", error);
    }
  };

  const deleteModel = async (id: string) => {
    if (!confirm("Delete this model orchestration?")) return;
    try {
      const response = await fetch(`/api/admin/models/${id}`, { method: 'DELETE' });
      if (response.ok) fetchModels();
    } catch (error) {
      console.error("Failed to delete model", error);
    }
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to update role", error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const stats = [
    { label: 'Total Users', value: users.length.toString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-50', change: '+12%' },
    { label: 'Active Admins', value: users.filter(u => u.role === 'admin').length.toString(), icon: ShieldCheck, color: 'text-nepal-green', bg: 'bg-green-50', change: '+5.2%' },
    { label: 'Platform Revenue', value: 'रू 2.4L', icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-50', change: '+18.4%' },
    { label: 'Token Utilization', value: '890k', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50', change: '-2.1%' },
  ];

  const services = [
    { id: 'chat', label: 'Chat Engine (Gemini)', status: 'Operational', health: 99.8, icon: MessageSquare },
    { id: 'image', label: 'Image Forge (DALL-E)', status: 'High Load', health: 85.2, icon: ImageIcon },
    { id: 'audio', label: 'Sonic Studio (TTS)', status: 'Operational', health: 97.4, icon: Headphones },
    { id: 'vector', label: 'Knowledge Base', status: 'Optimal', health: 100, icon: Database },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#f9fbfb] p-4 md:p-10 pb-32 md:pb-10 h-full scrollbar-hide">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-nepal-red rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Deep Analytics Engine</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight">Admin <span className="text-nepal-red">Control</span></h1>
            <p className="text-slate-500 font-medium mt-1">Global platform orchestration for AI Nepal v3.0</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg",
                maintenanceMode 
                  ? "bg-amber-500 text-white shadow-amber-500/20" 
                  : "bg-white text-slate-600 border border-slate-200 hover:border-nepal-red/30"
              )}
            >
              {maintenanceMode ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              {maintenanceMode ? 'Maintenance ON' : 'Maintenance OFF'}
            </button>
            <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <Settings className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl w-fit">
          {(['analysis', 'users', 'models', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                activeTab === tab ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab === 'analysis' ? 'Analysis' : tab === 'models' ? 'Model Orchestration' : tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'analysis' && (
            <motion.div 
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/20 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                    <div className={cn("absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-50 transition-opacity group-hover:opacity-100", stat.bg)} />
                    <div className="flex items-start justify-between mb-6 relative z-10">
                      <div className={cn("p-4 rounded-3xl shrink-0 shadow-inner", stat.bg)}>
                        <stat.icon className={cn("w-6 h-6", stat.color)} />
                      </div>
                      <span className={cn(
                        "text-[10px] font-black px-2 py-1 rounded-lg",
                        stat.change.startsWith('+') ? "text-nepal-green bg-green-50" : "text-nepal-red bg-red-50"
                      )}>{stat.change}</span>
                    </div>
                    <div className="relative z-10">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-3xl font-display font-bold text-slate-900">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Content Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* System Monitoring Area */}
                <div className="lg:col-span-2 space-y-10">
                  <div className="bg-white border border-slate-200 rounded-[48px] p-10 shadow-2xl shadow-slate-200/10">
                    <div className="flex items-center justify-between mb-10">
                      <h3 className="text-xl font-bold text-slate-900">Infrastructure Health</h3>
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-nepal-green" />
                        <div className="w-3 h-3 rounded-full bg-nepal-green" />
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {services.map(service => (
                         <div key={service.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white rounded-xl shadow-sm">
                                  <service.icon className="w-5 h-5 text-slate-400" />
                                </div>
                                <span className="text-sm font-bold text-slate-800">{service.label}</span>
                              </div>
                              <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest",
                                service.status === 'Operational' ? "text-nepal-green" : "text-amber-500"
                              )}>{service.status}</span>
                           </div>
                           <div className="space-y-2">
                              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                <span>Health Index</span>
                                <span>{service.health}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${service.health}%` }}
                                  className={cn(
                                    "h-full rounded-full transition-all duration-1000",
                                    service.health > 95 ? "bg-nepal-green" : "bg-amber-400"
                                  )}
                                />
                              </div>
                           </div>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                       <Terminal className="w-64 h-64" />
                    </div>
                    <div className="flex items-center justify-between mb-8 relative z-10">
                       <h3 className="text-xl font-bold">System Log (Live)</h3>
                       <div className="flex gap-1.5">
                          {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white/20" />)}
                       </div>
                    </div>
                    <div className="font-mono text-xs text-nepal-green/70 space-y-3 relative z-10 bg-black/30 p-6 rounded-3xl border border-white/5 max-h-[300px] overflow-y-auto scrollbar-hide">
                        <p><span className="text-slate-500">[10:24:02]</span> AUTH_SUCCESS: User "udayaraj" signed in.</p>
                        <p><span className="text-slate-500">[10:24:15]</span> IMAGE_GEN_WEB_REQUEST: prompt="Himalayas at sunrise".</p>
                        <p><span className="text-slate-500">[10:25:01]</span> SERVER_HEARTBEAT: Service cluster "Asia-NP" healthy.</p>
                        <p><span className="text-amber-400">[10:25:22]</span> HIGH_LOAD_WARN: DALL-E worker #4 reported latency.</p>
                        <p><span className="text-slate-500">[10:26:44]</span> CHAT_PERSIST: Session "np-772" synced to Firestore.</p>
                        <p><span className="text-nepal-red animate-pulse">[10:27:00]</span> ANOMALY_DETECTED: Potential rate limit violation user_idx_99.</p>
                    </div>
                  </div>
                </div>

                {/* Performance Side Section */}
                <div className="space-y-10">
                   <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-xl">
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-nepal-red" />
                        Region Performance
                      </h3>
                      <div className="space-y-6">
                        {[
                          { region: 'Kathmandu-CL01', load: 45 },
                          { region: 'Pokhara-EDGE', load: 12 },
                          { region: 'Butwal-AUX', load: 88 },
                          { region: 'Nepalgunj-SRV', load: 30 }
                        ].map(reg => (
                          <div key={reg.region} className="space-y-2">
                             <div className="flex justify-between text-xs font-bold text-slate-700">
                                <span>{reg.region}</span>
                                <span>{reg.load}%</span>
                             </div>
                             <div className="w-full h-1 bg-slate-100 rounded-full">
                                <div className={cn(
                                  "h-full rounded-full",
                                  reg.load > 80 ? 'bg-nepal-red' : 'bg-nepal-blue'
                                )} style={{ width: `${reg.load}%` }} />
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="bg-gradient-to-br from-nepal-blue to-blue-700 rounded-[40px] p-8 text-white shadow-2xl shadow-nepal-blue/30 relative overflow-hidden group">
                      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 blur-3xl rounded-full transition-transform group-hover:scale-150" />
                      <h3 className="text-sm font-black uppercase tracking-widest mb-6 border-b border-white/20 pb-4">Global Network</h3>
                      <div className="flex items-center justify-center py-6">
                         <div className="relative">
                            <Globe className="w-32 h-32 opacity-20" />
                            <div className="absolute inset-0 flex items-center justify-center">
                               <div className="text-center">
                                  <p className="text-4xl font-bold mb-1">12</p>
                                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Active Nodes</p>
                               </div>
                            </div>
                         </div>
                      </div>
                      <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-black uppercase tracking-widest transition-all mt-4">
                        Refresh Map
                      </button>
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'models' && (
            <motion.div 
              key="models"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">AI Model Library</h2>
                  <p className="text-slate-500 font-medium">Orchestrate multiple providers and versions</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingModel(null);
                    setModelForm({ provider: '', name: '', version: '', logo: '', description: '', status: 'active' });
                    setIsModelModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl shadow-slate-900/20"
                >
                  <Plus className="w-5 h-5" />
                  Register New Model
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {models.map(model => (
                  <div key={model.id} className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-xl shadow-slate-200/20 group relative overflow-hidden">
                    <div className="absolute top-6 right-6 flex gap-2">
                      <button 
                         onClick={() => {
                           setEditingModel(model);
                           setModelForm({ ...model });
                           setIsModelModalOpen(true);
                         }}
                         className="p-2 bg-slate-50 text-slate-400 hover:text-nepal-blue hover:bg-nepal-blue/10 rounded-xl transition-all"
                      >
                         <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                         onClick={() => deleteModel(model.id)}
                         className="p-2 bg-slate-50 text-slate-400 hover:text-nepal-red hover:bg-nepal-red/10 rounded-xl transition-all"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center">
                        {model.logo ? (
                          <img src={model.logo} alt={model.name} className="w-full h-full object-contain" />
                        ) : (
                          <Cpu className="w-8 h-8 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{model.provider}</p>
                        <h4 className="text-xl font-bold text-slate-900">{model.name}</h4>
                        <p className="text-xs font-mono font-medium text-nepal-blue">v{model.version}</p>
                      </div>
                    </div>

                    <p className="text-slate-500 text-sm line-clamp-2 mb-6 h-10 font-medium">{model.description}</p>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                       <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", model.status === 'active' ? "bg-nepal-green" : "bg-slate-300")} />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{model.status}</span>
                       </div>
                       <span className="text-[10px] text-slate-400 font-bold italic">Registered {new Date(model.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Model Modal */}
              <AnimatePresence>
                {isModelModalOpen && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                      onClick={() => setIsModelModalOpen(false)}
                    />
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0, y: 20 }}
                      className="relative w-full max-w-lg bg-white rounded-[48px] p-10 shadow-2xl overflow-hidden"
                    >
                      <h3 className="text-3xl font-bold text-slate-900 mb-2">
                        {editingModel ? 'Update Model' : 'Register AI Model'}
                      </h3>
                      <p className="text-slate-500 font-medium mb-8">Enter detailed specs for platform orchestration.</p>
                      
                      <form onSubmit={handleModelSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Company/Provider</label>
                              <input 
                                required
                                value={modelForm.provider}
                                onChange={(e) => setModelForm({...modelForm, provider: e.target.value})}
                                placeholder="Google, OpenAI..."
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Model Name</label>
                              <input 
                                required
                                value={modelForm.name}
                                onChange={(e) => setModelForm({...modelForm, name: e.target.value})}
                                placeholder="Gemini-2, GPT-4..."
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                              />
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Model Version/No.</label>
                              <input 
                                required
                                value={modelForm.version}
                                onChange={(e) => setModelForm({...modelForm, version: e.target.value})}
                                placeholder="2.0-Flash..."
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-slate-100 transition-all font-mono"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Status</label>
                              <select 
                                value={modelForm.status}
                                onChange={(e) => setModelForm({...modelForm, status: e.target.value as 'active' | 'inactive'})}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-slate-100 transition-all appearance-none"
                              >
                                <option value="active">Operational</option>
                                <option value="inactive">Suspended</option>
                              </select>
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Logo URL</label>
                           <input 
                             value={modelForm.logo}
                             onChange={(e) => setModelForm({...modelForm, logo: e.target.value})}
                             placeholder="https://icon-library.com..."
                             className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                           />
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Capabilities Description</label>
                           <textarea 
                             value={modelForm.description}
                             onChange={(e) => setModelForm({...modelForm, description: e.target.value})}
                             placeholder="Fast reasoning, high context window..."
                             className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-slate-100 transition-all h-24 resize-none"
                           />
                        </div>

                        <div className="flex gap-4 pt-4">
                           <button 
                             type="button"
                             onClick={() => setIsModelModalOpen(false)}
                             className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                           >
                              Cancel
                           </button>
                           <button 
                             type="submit"
                             className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-105 transition-all"
                           >
                              {editingModel ? 'Update Specs' : 'Deploy Model'}
                           </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div 
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white border border-slate-200 rounded-[48px] p-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-bold text-slate-900">User Command Center</h2>
                <div className="flex gap-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-nepal-blue/20 outline-none w-64 transition-all"
                    />
                  </div>
                  <button className="px-6 py-3 bg-nepal-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-nepal-blue/20 transition-all hover:scale-105">
                    Export User Data
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic">
                        <th className="pb-4 pt-1">User Identity</th>
                        <th className="pb-4 pt-1">Access Tier</th>
                        <th className="pb-4 pt-1">Usage Activity</th>
                        <th className="pb-4 pt-1">Credit Bal</th>
                        <th className="pb-4 pt-1 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {filteredUsers.map((u, i) => (
                        <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                           <td className="py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 shrink-0 uppercase italic">
                                    {u.displayName?.charAt(0) || u.email?.charAt(0)}
                                 </div>
                                 <div className="max-w-[200px] overflow-hidden">
                                    <p className="text-sm font-bold text-slate-800 truncate">{u.displayName || 'Unknown user'}</p>
                                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="py-6">
                              <span className={cn(
                                "text-[10px] font-black px-3 py-1 rounded-lg border uppercase tracking-wider",
                                u.role === 'admin' ? "bg-red-50 text-nepal-red border-red-100" :
                                u.subscription === 'premium' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                "bg-slate-50 text-slate-400 border-slate-100"
                              )}>{u.role === 'admin' ? 'Operator' : 'Civilian'}</span>
                           </td>
                           <td className="py-6">
                              <p className="text-xs font-bold text-slate-600">{u.tokensUsed || 0} Gen</p>
                           </td>
                           <td className="py-6">
                              <p className="text-xs font-black text-slate-900">रू 0.0</p>
                           </td>
                           <td className="py-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                 <button 
                                   onClick={() => toggleUserRole(u.uid, u.role)}
                                   title={u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                                   className={cn(
                                     "p-2.5 rounded-xl border transition-all",
                                     u.role === 'admin' 
                                       ? "bg-red-50 text-nepal-red border-red-100 hover:bg-red-100" 
                                       : "bg-white text-slate-400 border-slate-200 hover:border-nepal-blue hover:text-nepal-blue"
                                   )}
                                 >
                                    <UserCog className="w-4 h-4" />
                                 </button>
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
             <motion.div 
               key="settings"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="grid grid-cols-1 md:grid-cols-2 gap-10"
             >
                <div className="bg-white border border-slate-200 rounded-[48px] p-10 shadow-2xl">
                    <h3 className="text-xl font-bold mb-8">Model Orchestration</h3>
                    <div className="space-y-6">
                        {[
                          { label: 'Default Chat Model', value: 'Gemini-2.0-Flash (Latest)', options: ['Gemini-2.0-Flash', 'Gemini-1.5-Pro'] },
                          { label: 'Vision Processing', value: 'Google Cloud Vision API', options: ['GCP Vision', 'Azure Cognitive'] },
                          { label: 'Audio Synthesis', value: 'ElevenLabs v2 (High Quality)', options: ['ElevenLabs', 'OpenAI TTS'] }
                        ].map((s, i) => (
                          <div key={i} className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</label>
                             <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <span className="text-sm font-bold text-slate-700">{s.value}</span>
                                <Settings className="w-4 h-4 text-slate-400" />
                             </div>
                          </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-[48px] p-10 shadow-2xl">
                    <h3 className="text-xl font-bold mb-8">System Access Tokens</h3>
                    <div className="space-y-4">
                        {[
                          { id: 'AIS_NP_001', role: 'Full Admin', expires: 'Never' },
                          { id: 'AIS_NP_002', role: 'Support Agent', expires: '2026-12-31' },
                          { id: 'AIS_NP_003', role: 'Analytics Bot', expires: '2027-01-15' }
                        ].map(token => (
                          <div key={token.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100 group">
                             <div className="flex items-center gap-3">
                                <Lock className="w-4 h-4 text-slate-300" />
                                <div>
                                   <p className="text-xs font-mono font-bold text-slate-700">AK_{token.id}****</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{token.role}</p>
                                </div>
                             </div>
                             <button className="text-[8px] font-black uppercase text-nepal-red tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">Revoke</button>
                          </div>
                        ))}
                        <button className="w-full py-4 mt-6 border-2 border-dashed border-slate-100 hover:border-nepal-blue/30 rounded-3xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-nepal-blue transition-all">
                           Generate Service Key
                        </button>
                    </div>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

