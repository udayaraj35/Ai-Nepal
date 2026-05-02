import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Login() {
  const { loginWithEmail, signupWithEmail } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        if (!name.trim()) throw new Error('Please enter your name');
        await signupWithEmail(email, password, name);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden grid-bg">
      <div className="absolute inset-0 fiesta-blur pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md p-4 md:p-8"
      >
        <div className="bg-white/80 backdrop-blur-2xl border border-white rounded-[40px] p-6 md:p-10 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-nepal-red/5 blur-3xl rounded-full -mr-16 -mt-16" />
          
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl relative z-10">
            <span className="text-3xl">🇳🇵</span>
          </div>
          
          <h1 className="text-2xl font-display font-bold text-slate-900 mb-1">AI Nepal</h1>
          <p className="text-slate-400 text-sm font-medium mb-8 uppercase tracking-[0.2em]">Sasto ra Ramro</p>
          
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-8 relative z-10">
            <button 
              onClick={() => { setIsLogin(true); setError(''); }}
              className={cn(
                "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                isLogin ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Login
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(''); }}
              className={cn(
                "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                !isLogin ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left relative z-10">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Passport Name (Full Name)</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900/5 transition-all text-sm font-medium"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Gmail / Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900/5 transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900/5 transition-all text-sm font-medium"
                />
              </div>
            </div>

            {error && (
              <p className="text-[10px] font-bold text-nepal-red bg-red-50 p-3 rounded-xl border border-red-100">
                {error}
              </p>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-slate-900/20 disabled:bg-slate-200 mt-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {isLogin ? 'Enter Dashboard' : 'Create Account'}
                </>
              )}
            </button>

            {isLogin && (
              <button 
                type="button"
                onClick={() => {
                  setEmail('udayarajkhanal25@gmail.com');
                  setPassword('Udayaraj35@');
                }}
                className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-colors mt-2"
              >
                Sidai Admin Login
              </button>
            )}
          </form>

          <p className="text-[10px] font-bold text-slate-400 mt-8 leading-relaxed relative z-10">
            System managed by AI Nepal. 🇳🇵
          </p>
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-12 opacity-10 grayscale pointer-events-none">
          <span className="text-4xl">🏔️</span>
          <span className="text-4xl">🕉️</span>
          <span className="text-4xl">🔱</span>
        </div>
      </motion.div>
    </div>
  );
}
