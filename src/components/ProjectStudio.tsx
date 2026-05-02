import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Plus, 
  Trash2, 
  Clock, 
  Search, 
  Grid,
  List as ListIcon,
  ChevronRight,
  FileText
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  itemCount: number;
}

export default function ProjectStudio() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newProjectTitle.trim()) return;

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newProjectTitle,
          description: newProjectDesc,
        })
      });

      if (response.ok) {
        const newProj = await response.json();
        setProjects([newProj, ...projects]);
        setNewProjectTitle('');
        setNewProjectDesc('');
        setIsCreateModalOpen(false);
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        const response = await fetch(`/api/projects/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setProjects(projects.filter(p => p.id !== id));
        }
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f9fbfb] relative overflow-hidden overflow-y-auto scrollbar-hide">
      <div className="absolute inset-0 fiesta-blur pointer-events-none opacity-40" />
      
      <div className="max-w-7xl mx-auto w-full p-6 md:p-10 z-10 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight">
               Project <span className="text-nepal-blue">Studio</span>
            </h1>
            <p className="text-slate-500 font-medium">Manage your AI-powered workspace and assets. 🇳🇵</p>
          </div>
          
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-slate-900/10"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/60 backdrop-blur-xl p-3 border border-slate-200 rounded-[32px] shadow-sm">
           <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-transparent border-none focus:ring-0 text-sm font-medium outline-none"
              />
           </div>
           <div className="flex items-center gap-2 px-2 border-l border-slate-200">
              <button className="p-2 bg-slate-100 rounded-xl text-slate-600"><Grid className="w-4 h-4" /></button>
              <button className="p-2 text-slate-400 hover:text-slate-600"><ListIcon className="w-4 h-4" /></button>
           </div>
        </div>

        {/* Project Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="h-64 bg-slate-100 rounded-[40px] animate-pulse" />
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group bg-white border border-slate-100 rounded-[40px] p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer relative"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-nepal-blue/10 rounded-2xl flex items-center justify-center text-nepal-blue group-hover:bg-nepal-blue group-hover:text-white transition-all">
                      <FolderOpen className="w-7 h-7" />
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }}
                      className="p-2 text-slate-300 hover:text-nepal-red transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-2 mb-8">
                    <h3 className="text-xl font-bold text-slate-900">{project.title}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2 font-medium">{project.description || 'No description provided.'}</p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                           <FileText className="w-3.5 h-3.5" />
                           {project.itemCount} Items
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                           <Clock className="w-3.5 h-3.5" />
                           {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-nepal-blue group-hover:text-white transition-all">
                        <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-24 text-center space-y-6">
             <div className="w-24 h-24 bg-white rounded-[40px] shadow-sm flex items-center justify-center mx-auto border border-slate-100">
                <FolderOpen className="w-10 h-10 text-slate-200" />
             </div>
             <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-800">No projects found</h3>
                <p className="text-slate-500 max-w-sm mx-auto font-medium">Create your first project to start organizing your AI creations.</p>
             </div>
             <button 
               onClick={() => setIsCreateModalOpen(true)}
               className="px-8 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
             >
                Get Started
             </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsCreateModalOpen(false)}
               className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-lg bg-white rounded-[48px] shadow-2xl p-10 space-y-8"
             >
                <div className="space-y-2">
                  <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Create <span className="text-nepal-blue">Project</span></h2>
                  <p className="text-slate-500 font-medium">Name your space and start building.</p>
                </div>

                <form onSubmit={handleCreateProject} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Project Name</label>
                      <input 
                        autoFocus
                        value={newProjectTitle}
                        onChange={(e) => setNewProjectTitle(e.target.value)}
                        placeholder="e.g. Nepal Travel Guide"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-lg font-medium outline-none focus:ring-2 focus:ring-nepal-blue/20 transition-all"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Description (Optional)</label>
                      <textarea 
                        value={newProjectDesc}
                        onChange={(e) => setNewProjectDesc(e.target.value)}
                        placeholder="What is this project about?"
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-nepal-blue/20 transition-all resize-none"
                      />
                   </div>

                   <div className="flex gap-4 pt-4">
                      <button 
                        type="button"
                        onClick={() => setIsCreateModalOpen(false)}
                        className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold uppercase tracking-widest text-xs transition-colors"
                      >
                         Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={!newProjectTitle.trim()}
                        className="flex-2 py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-lg active:scale-95"
                      >
                         Create Project
                      </button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
