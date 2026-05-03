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

export default function AdminPanel({ initialTab }: { initialTab?: 'analysis' | 'users' | 'settings' | 'models' | 'payments' }) {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analysis' | 'users' | 'settings' | 'models' | 'payments'>(initialTab || 'analysis');

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
    apiKey?: string;
    apiEndpoint?: string;
  }>({
    provider: '',
    name: '',
    version: '',
    logo: '',
    description: '',
    status: 'active',
    apiKey: '',
    apiEndpoint: ''
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

  const fetchPayments = async () => {
    try {
      const txRes = await fetch('/api/admin/transactions');
      if (txRes.ok) setTransactions(await txRes.json());
      const methodRes = await fetch('/api/payment-methods');
      if (methodRes.ok) setPaymentMethods(await methodRes.json());
    } catch (error) {
      console.error("Failed to fetch payments", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchModels();
    fetchPayments();
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
        setModelForm({ provider: '', name: '', version: '', logo: '', description: '', status: 'active', apiKey: '', apiEndpoint: '' });
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

  const updateTransactionStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/transactions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchPayments();
    } catch (error) {
      console.error("Failed to update transaction", error);
    }
  };

  const savePaymentMethod = async (method: any) => {
    try {
      const res = await fetch(`/api/admin/payment-methods/${method.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(method),
      });
      if (res.ok) fetchPayments();
    } catch (error) {
      console.error("Failed to save payment method", error);
    }
  };

  const createManualMethod = async () => {
    const name = prompt("Enter new payment method name (e.g. Nabil Bank, IME Pay Manual):");
    if (!name) return;
    try {
      const res = await fetch(`/api/admin/payment-methods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) fetchPayments();
    } catch (error) {
      console.error("Failed to create payment method", error);
    }
  };

  const deletePaymentMethod = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment method?")) return;
    try {
      const res = await fetch(`/api/admin/payment-methods/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) fetchPayments();
    } catch (error) {
      console.error("Failed to delete payment method", error);
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
          {(['analysis', 'users', 'models', 'settings', 'payments'] as const).map(tab => (
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
                    setModelForm({ provider: '', name: '', version: '', logo: '', description: '', status: 'active', apiKey: '', apiEndpoint: '' });
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
                      <p className="text-slate-500 font-medium mb-6">Enter detailed specs or choose from presets.</p>
                      
                      {!editingModel && (
                        <div className="mb-6">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Quick Presets</label>
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {[
                              { provider: 'Google', name: 'Gemini 1.5 Pro', version: '1.5.0', description: 'Google\'s most capable model.', logo: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg', apiKey: '', apiEndpoint: '' },
                              { provider: 'Google', name: 'Gemini 1.5 Flash', version: '1.5.0', description: 'Fast and versatile model for scaling.', logo: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg', apiKey: '', apiEndpoint: '' },
                              { provider: 'OpenAI', name: 'GPT-4o', version: 'Omni', description: 'OpenAI\'s flagship multimodal model.', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg', apiKey: '', apiEndpoint: 'https://api.openai.com/v1' },
                              { provider: 'Anthropic', name: 'Claude 3.5 Sonnet', version: '3.5.0', description: 'Anthropic\'s most intelligent model.', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Anthropic_logo.svg/1024px-Anthropic_logo.svg.png', apiKey: '', apiEndpoint: 'https://api.anthropic.com/v1' },
                              { provider: 'Meta', name: 'Llama 3', version: '70B', description: 'Meta\'s fast open-source model.', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Meta-Logo.png/1024px-Meta-Logo.png', apiKey: '', apiEndpoint: '' }
                            ].map((preset, idx) => (
                              <button 
                                key={idx} 
                                type="button"
                                onClick={() => setModelForm({ ...modelForm, ...preset, status: 'active' })}
                                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:border-nepal-blue transition-all"
                              >
                                {preset.logo && <img src={preset.logo} alt={preset.name} className="w-4 h-4 object-contain" />}
                                <span className="text-xs font-bold text-slate-700">{preset.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <form onSubmit={handleModelSubmit} className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Company/Provider</label>
                              <input 
                                required
                                value={modelForm.provider}
                                onChange={(e) => setModelForm({...modelForm, provider: e.target.value})}
                                placeholder="Google, OpenAI..."
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-slate-100 transition-all text-sm"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Model Name</label>
                              <input 
                                required
                                value={modelForm.name}
                                onChange={(e) => setModelForm({...modelForm, name: e.target.value})}
                                placeholder="Gemini-2, GPT-4..."
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-slate-100 transition-all text-sm"
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
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-slate-100 transition-all font-mono text-sm"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Status</label>
                              <select 
                                value={modelForm.status}
                                onChange={(e) => setModelForm({...modelForm, status: e.target.value as 'active' | 'inactive'})}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-slate-100 transition-all appearance-none text-sm"
                              >
                                <option value="active">Operational</option>
                                <option value="inactive">Suspended</option>
                              </select>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 bg-blue-50/50 p-4 rounded-3xl border border-blue-100/50">
                          <h4 className="text-xs font-bold text-nepal-blue uppercase tracking-widest px-1">API Integration Config</h4>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">API Key (Leave empty to use env)</label>
                             <input 
                               type="password"
                               value={modelForm.apiKey || ''}
                               onChange={(e) => setModelForm({...modelForm, apiKey: e.target.value})}
                               placeholder="sk-..."
                               className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all font-mono text-sm"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">API Endpoint (Optional)</label>
                             <input 
                               value={modelForm.apiEndpoint || ''}
                               onChange={(e) => setModelForm({...modelForm, apiEndpoint: e.target.value})}
                               placeholder="https://api.openai.com/v1..."
                               className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all font-mono text-sm"
                             />
                          </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Logo URL</label>
                           <input 
                             value={modelForm.logo}
                             onChange={(e) => setModelForm({...modelForm, logo: e.target.value})}
                             placeholder="https://icon-library.com..."
                             className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-slate-100 transition-all text-sm"
                           />
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Capabilities Description</label>
                           <textarea 
                             value={modelForm.description}
                             onChange={(e) => setModelForm({...modelForm, description: e.target.value})}
                             placeholder="Fast reasoning, high context window..."
                             className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-slate-100 transition-all h-20 resize-none text-sm"
                           />
                        </div>

                        <div className="flex gap-4 pt-4 sticky bottom-0 bg-white pb-2">
                           <button 
                             type="button"
                             onClick={() => setIsModelModalOpen(false)}
                             className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-100 transition-all text-sm"
                           >
                              Cancel
                           </button>
                           <button 
                             type="submit"
                             className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-105 transition-all text-sm"
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

          {activeTab === 'payments' && (
            <motion.div 
              key="payments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              {/* Payment Methods Configuration */}
              <div className="bg-white border border-slate-200 rounded-[48px] p-10 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">Payment Methods Configuration</h2>
                  <button 
                    onClick={createManualMethod}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 flex items-center gap-2"
                  >
                    + Add Custom Method
                  </button>
                </div>
                
                {/* API Integrations */}
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">API Gateways (Auto-Verification)</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                  {paymentMethods.filter((m: any) => m.type === 'integration').map(method => (
                    <div key={method.id} className="p-6 bg-slate-50 border border-slate-200 rounded-3xl relative">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-lg text-slate-800">{method.name}</h4>
                        <button 
                          onClick={() => savePaymentMethod({ ...method, isActive: !method.isActive })}
                          className={cn("px-3 py-1 rounded-full text-xs font-bold transition-all", method.isActive ? "bg-nepal-green/10 text-nepal-green" : "bg-slate-200 text-slate-500")}
                        >
                          {method.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </div>
                      <div className="space-y-4">
                        {method.merchantCode !== undefined && (
                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Merchant Code / ID</label>
                            <input 
                              value={method.merchantCode}
                              onChange={(e) => {
                                const updated = paymentMethods.map(m => m.id === method.id ? { ...m, merchantCode: e.target.value } : m);
                                setPaymentMethods(updated);
                              }}
                              onBlur={(e) => savePaymentMethod({ ...method, merchantCode: e.target.value })}
                              className="mt-1 w-full p-3 rounded-xl border border-slate-200 text-sm font-mono"
                              placeholder="Required for integration"
                            />
                          </div>
                        )}
                        {method.publicKey !== undefined && (
                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Public Key</label>
                            <input 
                              value={method.publicKey}
                              onChange={(e) => {
                                const updated = paymentMethods.map(m => m.id === method.id ? { ...m, publicKey: e.target.value } : m);
                                setPaymentMethods(updated);
                              }}
                              onBlur={(e) => savePaymentMethod({ ...method, publicKey: e.target.value })}
                              className="mt-1 w-full p-3 rounded-xl border border-slate-200 text-sm font-mono"
                            />
                          </div>
                        )}
                        {method.secretKey !== undefined && (
                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Secret Key / Live Secret</label>
                            <input 
                              type="password"
                              value={method.secretKey}
                              onChange={(e) => {
                                const updated = paymentMethods.map(m => m.id === method.id ? { ...m, secretKey: e.target.value } : m);
                                setPaymentMethods(updated);
                              }}
                              onBlur={(e) => savePaymentMethod({ ...method, secretKey: e.target.value })}
                              className="mt-1 w-full p-3 rounded-xl border border-slate-200 text-sm font-mono"
                              placeholder="••••••••••••••••"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Manual Methods */}
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Manual Verification Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paymentMethods.filter((m: any) => m.type === 'manual' || !m.type).map(method => (
                    <div key={method.id} className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm relative group">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-lg text-slate-800">{method.name}</h4>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => savePaymentMethod({ ...method, isActive: !method.isActive })}
                            className={cn("px-3 py-1 rounded-full text-xs font-bold transition-all", method.isActive ? "bg-nepal-green/10 text-nepal-green" : "bg-slate-100 text-slate-500")}
                          >
                            {method.isActive ? 'Active' : 'Disabled'}
                          </button>
                          <button 
                            onClick={() => deletePaymentMethod(method.id)}
                            className="p-1 text-slate-400 hover:text-nepal-red hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete Method"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Details (Account info or Link)</label>
                          <textarea 
                            value={method.details}
                            onChange={(e) => {
                              const updated = paymentMethods.map(m => m.id === method.id ? { ...m, details: e.target.value } : m);
                              setPaymentMethods(updated);
                            }}
                            onBlur={(e) => savePaymentMethod({ ...method, details: e.target.value })}
                            className="mt-1 w-full p-3 rounded-xl border border-slate-200 text-sm font-mono h-24 resize-none bg-slate-50"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">QR Code Image URL</label>
                          <input 
                            value={method.qrCode}
                            onChange={(e) => {
                              const updated = paymentMethods.map(m => m.id === method.id ? { ...m, qrCode: e.target.value } : m);
                              setPaymentMethods(updated);
                            }}
                            onBlur={(e) => savePaymentMethod({ ...method, qrCode: e.target.value })}
                            className="mt-1 w-full p-3 rounded-xl border border-slate-200 text-sm bg-slate-50"
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transactions Log */}
              <div className="bg-white border border-slate-200 rounded-[48px] p-10 shadow-2xl">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">Transactions & Approvals</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 italic">
                          <th className="pb-4 pt-1">User Info</th>
                          <th className="pb-4 pt-1">Subscription Plan</th>
                          <th className="pb-4 pt-1">Payment Proof / Tx ID</th>
                          <th className="pb-4 pt-1">Amount / Time</th>
                          <th className="pb-4 pt-1">Status</th>
                          <th className="pb-4 pt-1 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="group hover:bg-slate-50/50 transition-colors">
                             <td className="py-4">
                                <p className="text-sm font-bold text-slate-800 truncate">{tx.userName || 'Unknown'}</p>
                                <p className="text-xs text-slate-400 truncate">{tx.userEmail}</p>
                             </td>
                             <td className="py-4 font-bold capitalize text-nepal-blue">{tx.plan}</td>
                             <td className="py-4 font-mono text-sm max-w-[200px] truncate" title={tx.transactionNumber}>{tx.transactionNumber}</td>
                             <td className="py-4 text-xs font-bold text-slate-500">
                               रू {tx.amount}
                               <p className="font-normal">{new Date(tx.createdAt).toLocaleString()}</p>
                             </td>
                             <td className="py-4">
                               <span className={cn(
                                 "text-[10px] font-black px-2 py-1 rounded-lg border uppercase tracking-wider",
                                 tx.status === 'approved' ? "bg-green-50 text-nepal-green border-green-100" :
                                 tx.status === 'rejected' ? "bg-red-50 text-nepal-red border-red-100" :
                                 "bg-amber-50 text-amber-500 border-amber-100"
                               )}>{tx.status}</span>
                             </td>
                             <td className="py-4 text-right">
                                {tx.status === 'pending' && (
                                   <div className="flex items-center justify-end gap-2">
                                     <button 
                                       onClick={() => updateTransactionStatus(tx.id, 'approved')}
                                       className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-colors"
                                       title="Approve"
                                     ><CheckCircle2 className="w-5 h-5" /></button>
                                     <button 
                                       onClick={() => updateTransactionStatus(tx.id, 'rejected')}
                                       className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                                       title="Reject"
                                     ><Trash2 className="w-5 h-5" /></button>
                                   </div>
                                )}
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
                </div>
              </div>
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

