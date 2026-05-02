import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Sparkles, Image as ImageIcon, Search, Mic, Plus, 
  ChevronDown, ArrowUpRight, Globe, Copy, Check, RotateCcw, 
  ThumbsUp, ThumbsDown, Paperclip, X, Volume2, VolumeX, FileText,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../lib/utils';
import { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string, attachments?: { data: string, mimeType: string }[]) => void;
  isLoading: boolean;
  userDisplayName: string;
}

interface AIModel {
  id: string;
  provider: string;
  name: string;
  version: string;
  logo: string;
  description: string;
  status: 'active' | 'inactive';
}

const MarkdownComponents = {
  p: ({ children }: any) => <p className="mb-4 last:mb-0">{children}</p>,
  h1: ({ children }: any) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
  ul: ({ children }: any) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
  li: ({ children }: any) => <li className="text-inherit">{children}</li>,
  code: ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline ? (
      <div className="relative group my-4">
        <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md backdrop-blur-sm text-white/70 transition-colors">
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
        <pre className="bg-slate-900 text-slate-100 p-5 rounded-2xl overflow-x-auto font-mono text-sm leading-relaxed shadow-xl border border-white/5">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      </div>
    ) : (
      <code className="bg-slate-100 text-nepal-red px-1.5 py-0.5 rounded-md font-mono text-sm font-bold" {...props}>
        {children}
      </code>
    );
  },
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-nepal-red pl-4 italic my-4 text-slate-600 bg-nepal-red/5 py-2 rounded-r-lg">
      {children}
    </blockquote>
  ),
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-4 border border-slate-200 rounded-xl shadow-sm">
      <table className="w-full text-sm text-left border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }: any) => <th className="bg-slate-50 p-3 font-bold text-slate-700 border-b border-slate-200">{children}</th>,
  td: ({ children }: any) => <td className="p-3 border-b border-slate-100 text-slate-600">{children}</td>,
};

function MessageBubble({ message, userDisplayName }: { message: Message, userDisplayName: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex gap-4 md:gap-6 group w-full",
        message.role === 'user' ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={cn(
        "w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg font-bold text-lg transition-transform group-hover:scale-110",
        message.role === 'user' 
          ? "bg-gradient-to-br from-slate-200 to-slate-100 text-slate-600 border border-white" 
          : "bg-gradient-to-br from-nepal-red to-red-600 text-white shadow-nepal-red/20"
      )}>
        {message.role === 'user' ? (
          userDisplayName.charAt(0).toUpperCase()
        ) : (
          <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
        )}
      </div>
      
      <div className={cn(
        "relative max-w-[85%] md:max-w-[75%] rounded-3xl p-5 md:p-6 text-base leading-relaxed transition-all",
        message.role === 'user' 
          ? "bg-slate-100 text-slate-800 shadow-sm rounded-tr-none hover:bg-slate-200/80" 
          : "bg-white border border-slate-100 text-slate-800 shadow-xl shadow-slate-200/50 rounded-tl-none ring-1 ring-black/[0.02]"
      )}>
        <div className="markdown-body prose prose-slate prose-sm max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={MarkdownComponents as any}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {message.role === 'model' && (
          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={handleCopy}
              className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-nepal-blue" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <div className="h-4 w-[1px] bg-slate-100 mx-1" />
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ChatInterface({ messages, onSendMessage, isLoading, userDisplayName }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<{ data: string, mimeType: string, name: string }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetch('/api/admin/models')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setModels(data);
          const active = data.find((m: AIModel) => m.status === 'active');
          setSelectedModel(active || data[0] || null);
        } else {
          console.error("Models data is not an array:", data);
        }
      })
      .catch(err => console.error("Failed to fetch models", err));
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'ne-NP'; // Support Nepali natively

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(prev => prev + ' ' + transcript);
          setIsRecording(false);
        };

        recognitionRef.current.onerror = () => setIsRecording(false);
        recognitionRef.current.onend = () => setIsRecording(false);
      }
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current?.start();
    }
  };

  const speakResponse = (text: string) => {
    if (!isVoiceMode) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const neVoice = voices.find(v => v.lang.includes('ne') || v.lang.includes('hi')) || voices[0];
    if (neVoice) {
      utterance.voice = neVoice;
      utterance.lang = neVoice.lang;
    }
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'model' && !isLoading) {
        speakResponse(lastMsg.content);
      }
    }
  }, [messages, isLoading, isVoiceMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachments(prev => [...prev, { 
          data: reader.result as string, 
          mimeType: file.type, 
          name: file.name 
        }]);
      };
      reader.readAsDataURL(file);
    });
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || attachments.length > 0) && !isLoading) {
      onSendMessage(input, attachments.map(({ data, mimeType }) => ({ data, mimeType })));
      setInput('');
      setAttachments([]);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f9fbfb] relative overflow-hidden grid-bg">
      <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,application/pdf" />
      <div className="absolute inset-0 fiesta-blur pointer-events-none opacity-40" />
      <div className="absolute bottom-0 left-0 right-0 h-96 pointer-events-none opacity-[0.03] grayscale select-none">
        <svg viewBox="0 0 1000 300" className="w-full h-full preserve-3d">
            <path d="M0,300 L200,100 L400,250 L600,50 L800,200 L1000,300 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="sticky top-0 p-4 flex items-center justify-between z-[60] bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="relative">
          <button 
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center gap-3 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-[11px] font-black text-slate-700 transition-all shadow-sm hover:shadow-md active:scale-95 uppercase tracking-wider group"
          >
            <div className="w-6 h-6 bg-nepal-blue rounded-lg flex items-center justify-center text-white shadow-sm shadow-nepal-blue/20 group-hover:scale-110 transition-transform overflow-hidden">
              {selectedModel?.logo ? (
                <img src={selectedModel.logo} alt="" className="w-full h-full object-contain p-1" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[8px] text-slate-400 font-bold tracking-tight">AI NEPAL INTELLIGENCE</span>
              <span className="text-slate-900">{selectedModel?.name || 'Loading Models...'}</span>
            </div>
            <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", isModelDropdownOpen && "rotate-180")} />
          </button>

          <AnimatePresence>
            {isModelDropdownOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setIsModelDropdownOpen(false)}
                />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 mt-3 w-72 bg-white rounded-[32px] border border-slate-200 shadow-2xl shadow-slate-200/50 p-2 z-50 overflow-hidden"
                >
                  <div className="px-5 py-3 border-b border-slate-50 mb-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Global Model Orchestration</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto scrollbar-hide">
                    {Array.isArray(models) && models.map(model => (
                      <button
                        key={model.id}
                        onClick={() => {
                          if (model.status === 'active') {
                            setSelectedModel(model);
                          }
                          setIsModelDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-2xl transition-all group/model relative",
                          model.status === 'active' 
                            ? "hover:bg-slate-50" 
                            : "opacity-60 grayscale cursor-not-allowed"
                        )}
                      >
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover/model:bg-white transition-colors overflow-hidden">
                          {model.logo ? (
                            <img src={model.logo} alt="" className="w-full h-full object-contain p-1.5" />
                          ) : (
                            <Globe className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{model.name}</p>
                          <p className="text-[10px] font-medium text-slate-400 truncate">{model.provider} • v{model.version}</p>
                        </div>
                        {model.status === 'inactive' && (
                          <span className="shrink-0 text-[8px] font-black uppercase text-nepal-red bg-nepal-red/10 px-2 py-1 rounded-full tracking-tighter">Coming Soon</span>
                        )}
                        {selectedModel?.id === model.id && model.status === 'active' && (
                          <div className="w-2 h-2 bg-nepal-green rounded-full shadow-lg shadow-nepal-green/50" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setIsVoiceMode(!isVoiceMode);
                if (!isVoiceMode) window.speechSynthesis.cancel();
              }}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all uppercase tracking-wider border",
                isVoiceMode ? "bg-nepal-blue text-white border-nepal-blue" : "bg-white text-slate-400 border-slate-200"
              )}
            >
              {isVoiceMode ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
              Voice: {isVoiceMode ? 'ON' : 'OFF'}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Online 🇳🇵</span>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 pb-32 md:pb-8 z-10 scrollbar-hide">
        <div className="max-w-4xl mx-auto space-y-10">
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center pt-8 md:pt-16 pb-12"
            >
              {/* 1. Welcome Header */}
              <div className="w-full max-w-2xl text-center mb-16 px-4">
                <div className="relative inline-block mb-8">
                  <div className="absolute inset-0 bg-nepal-red/20 blur-3xl rounded-full scale-150 animate-pulse" />
                  <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white rounded-[40px] shadow-2xl flex items-center justify-center border border-slate-100 group transition-all duration-700">
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-[32px] bg-gradient-to-tr from-slate-900 to-slate-800 flex items-center justify-center text-white shadow-xl">
                      <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-nepal-red" />
                    </div>
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4 tracking-tight">
                  Welcome to <span className="text-nepal-red italic">AI Nepal</span>
                </h1>
                <p className="text-slate-500 font-medium text-lg md:text-xl">
                  {userDisplayName.split(' ')[0]}, how can I assist your creative workflow today?
                </p>
              </div>

              {/* 2. Chat Input Area */}
              <div className="w-full max-w-4xl relative mb-16">
                <div className="absolute inset-0 bg-slate-900/5 blur-3xl rounded-[64px]" />
                <div className="relative bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[56px] p-4 flex flex-col md:flex-row items-center gap-4 shadow-2xl">
                    <div className="flex-1 w-full flex items-center gap-4 px-6 py-4">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-400 transition-all active:scale-95"
                        >
                          <Paperclip className="w-6 h-6" />
                        </button>
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSubmit(e);
                            }}
                            placeholder="Message AI Nepal Intelligence..."
                            className="w-full bg-transparent border-none focus:ring-0 text-xl font-bold text-slate-800 placeholder:text-slate-400/80 outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-2 p-2 w-full md:w-auto justify-end">
                       <button 
                          onClick={toggleRecording}
                          className={cn(
                            "w-12 h-12 md:w-16 md:h-16 rounded-[28px] flex items-center justify-center transition-all",
                            isRecording ? "bg-nepal-red text-white animate-pulse" : "bg-slate-100 hover:bg-slate-200 text-slate-400"
                          )}
                        >
                        <Mic className={cn("w-6 h-6", isRecording && "fill-current")} />
                      </button>
                      <button 
                        onClick={handleSubmit}
                        disabled={!input.trim() && attachments.length === 0}
                        className="w-12 h-12 md:w-16 md:h-16 bg-slate-900 hover:scale-105 disabled:bg-slate-200 disabled:scale-100 text-white rounded-[28px] flex items-center justify-center transition-all shadow-xl active:scale-95"
                      >
                        <Send className="w-6 h-6" />
                      </button>
                    </div>
                </div>
              </div>
              
              {/* 3. Tool Cards */}
              <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
                 <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/20 border border-slate-100 hover:-translate-y-2 transition-all group">
                    <div className="w-12 h-12 bg-nepal-blue/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-nepal-blue transition-colors">
                       <Zap className="w-6 h-6 text-nepal-blue group-hover:text-white" />
                    </div>
                    <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2">Speed Tools</h3>
                    <h4 className="text-lg font-bold text-slate-900 mb-4">Quick Analysis</h4>
                    <div className="space-y-3">
                       {['Analyze this PDF', 'Summarize notes', 'Fact check data'].map(s => (
                         <button key={s} onClick={() => setInput(s)} className="w-full text-left p-3 rounded-2xl hover:bg-slate-50 text-xs font-bold text-slate-500 hover:text-nepal-blue transition-all border border-transparent hover:border-slate-100 flex items-center justify-between group/btn">
                           {s} <ArrowUpRight className="w-3 h-3 opacity-0 group-hover/btn:opacity-100" />
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/20 border border-slate-100 hover:-translate-y-2 transition-all group">
                    <div className="w-12 h-12 bg-nepal-red/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-nepal-red transition-colors">
                       <ImageIcon className="w-6 h-6 text-nepal-red group-hover:text-white" />
                    </div>
                    <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2">Creative Hub</h3>
                    <h4 className="text-lg font-bold text-slate-900 mb-4">Content Design</h4>
                    <div className="space-y-3">
                       {['Write viral thread', 'Design UI layout', 'Create ad copy'].map(s => (
                         <button key={s} onClick={() => setInput(s)} className="w-full text-left p-3 rounded-2xl hover:bg-slate-50 text-xs font-bold text-slate-500 hover:text-nepal-red transition-all border border-transparent hover:border-slate-100 flex items-center justify-between group/btn">
                           {s} <ArrowUpRight className="w-3 h-3 opacity-0 group-hover/btn:opacity-100" />
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="bg-white rounded-[40px] p-8 shadow-xl shadow-slate-200/20 border border-slate-100 hover:-translate-y-2 transition-all group">
                    <div className="w-12 h-12 bg-slate-900/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-900 transition-colors">
                       <Search className="w-6 h-6 text-slate-900 group-hover:text-white" />
                    </div>
                    <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-2">Nepal Lab</h3>
                    <h4 className="text-lg font-bold text-slate-900 mb-4">Regional Insights</h4>
                    <div className="space-y-3">
                       {['Nepal market trends', 'Cultural context', 'translation help'].map(s => (
                         <button key={s} onClick={() => setInput(s)} className="w-full text-left p-3 rounded-2xl hover:bg-slate-50 text-xs font-bold text-slate-500 hover:text-nepal-red transition-all border border-transparent hover:border-slate-100 flex items-center justify-between group/btn">
                           {s} <ArrowUpRight className="w-3 h-3 opacity-0 group-hover/btn:opacity-100" />
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-10 pb-12">
                <AnimatePresence mode="popLayout">
                    {messages.map((message) => (
                        <MessageBubble 
                            key={message.id} 
                            message={message} 
                            userDisplayName={userDisplayName} 
                        />
                    ))}
                </AnimatePresence>
              
              {isLoading && (
                <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-6"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-nepal-red to-red-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-nepal-red/20">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 max-w-[75%] shadow-xl shadow-slate-200/50 flex items-center gap-2">
                    <div className="w-2 h-2 bg-nepal-red rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-nepal-red rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-nepal-red rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} className="h-10" />
        </div>
      </div>

      {messages.length > 0 && (
        <div className="p-4 md:p-8 relative z-30 bg-white">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative group">
            <AnimatePresence>
              {attachments.length > 0 && (
                <div className="absolute -top-20 left-0 right-0 flex gap-2 p-2 overflow-x-auto z-10">
                  {attachments.map((att, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="relative min-w-[56px] h-14 bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-200 shadow-md"
                    >
                      {att.mimeType.startsWith('image/') ? (
                        <img src={att.data} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-red-500">
                           <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <button 
                        onClick={() => removeAttachment(i)}
                        className="absolute -top-1 -right-1 p-1 bg-nepal-red text-white rounded-full shadow-lg"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>

            <div className="absolute inset-0 bg-nepal-blue/5 blur-2xl group-focus-within:bg-nepal-blue/10 transition-colors rounded-[32px]"></div>
            <div className="relative bg-white/90 backdrop-blur-xl border border-slate-200 rounded-[32px] shadow-2xl p-2 md:p-3 flex flex-col focus-within:border-nepal-blue/30 transition-all ring-1 ring-black/[0.01]">
              <div className="flex items-end gap-2 w-full">
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 w-10 h-10 md:w-12 md:h-12 bg-slate-50 hover:bg-slate-100 text-slate-400 transition-all rounded-2xl flex items-center justify-center shadow-sm shrink-0"
                >
                  <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type or upload to AI Nepal..."
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  className="flex-1 max-h-48 py-3 bg-transparent border-none focus:ring-0 text-base md:text-lg font-medium resize-none outline-none text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* Smaller Action Buttons in Corner */}
              <div className="flex justify-end items-center gap-1.5 mt-1 pr-1 pb-1">
                <button 
                  type="button" 
                  onClick={toggleRecording}
                  title="Voice Input"
                  className={cn(
                    "w-8 h-8 md:w-10 md:h-10 rounded-xl transition-all flex items-center justify-center",
                    isRecording ? "bg-nepal-red text-white animate-pulse" : "bg-slate-50 hover:bg-slate-100 text-slate-400"
                  )}
                >
                  <Mic className={cn("w-3.5 h-3.5 md:w-4 md:h-4", isRecording && "fill-current")} />
                </button>
                <button 
                  type="submit" 
                  disabled={(!input.trim() && attachments.length === 0) || isLoading}
                  title="Send Message"
                  className={cn(
                    "w-8 h-8 md:w-10 md:h-10 bg-nepal-blue text-white rounded-xl transition-all shadow-lg active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none flex items-center justify-center",
                    (input.trim() || attachments.length > 0) && !isLoading ? "hover:scale-105 hover:bg-nepal-blue" : ""
                  )}
                >
                  <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              </div>
            </div>
            <p className="mt-3 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                AI Nepal can handle images & PDFs. Check important info. 🇳🇵
            </p>
          </form>
        </div>
      )}
    </div>
  );
}

