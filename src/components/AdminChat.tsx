import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Code, Sparkles, Bot, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Message } from '../types';
import { chatWithAdminAI } from '../services/aiService';
import Markdown from 'react-markdown';

export default function AdminChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'greeting',
      role: 'model',
      content: 'System Initialized. I am your Admin AI Assistant. I can help you configure the platform, analyze logs, or update settings. How can I assist you today?',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithAdminAI(input, messages);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response,
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error("Admin Chat Error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "Admin System Error: Unable to process request. Check system logs.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e293b] font-mono relative z-10 p-6 md:p-10">
      <div className="w-full max-w-4xl mx-auto flex flex-col h-full bg-[#0f172a] rounded-[32px] shadow-2xl border border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 bg-[#1e293b] border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-500/10 flex items-center justify-center rounded-lg text-emerald-500">
                <Terminal className="w-5 h-5" />
             </div>
             <div>
               <h3 className="text-white font-bold text-sm">Root Access Terminal</h3>
               <p className="text-[10px] text-emerald-500 tracking-widest uppercase">Encrypted Connection</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-xs text-slate-400">Online</span>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {messages.map((message) => (
            <motion.div 
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex max-w-[85%]",
                message.role === 'user' ? "ml-auto" : "mr-auto"
              )}
            >
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed",
                message.role === 'user' 
                  ? "bg-emerald-600 text-white rounded-br-none" 
                  : "bg-slate-800 text-slate-300 rounded-bl-none border border-slate-700"
              )}>
                {message.role === 'model' ? (
                  <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700">
                    <Markdown>{message.content}</Markdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mr-auto max-w-[85%] flex items-center gap-3 p-4 bg-slate-800 rounded-2xl border border-slate-700 rounded-bl-none text-emerald-500 text-sm"
            >
              <Terminal className="w-4 h-4 animate-pulse" />
              <span>Executing command...</span>
            </motion.div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#1e293b] border-t border-slate-800 z-10">
          <form onSubmit={handleSend} className="relative flex items-center">
            <span className="absolute left-4 text-emerald-500 font-bold">$</span>
            <input 
               value={input}
               onChange={e => setInput(e.target.value)}
               placeholder="Execute admin command..."
               className="w-full bg-[#0f172a] border border-slate-700 rounded-xl py-4 pl-10 pr-14 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-3 bg-emerald-600 text-white rounded-lg disabled:opacity-50 disabled:bg-slate-700 hover:bg-emerald-500 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
