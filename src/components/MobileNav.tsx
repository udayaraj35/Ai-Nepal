import React from 'react';
import { 
  Home, MessageSquare, ImageIcon, 
  Video, User, LayoutGrid, Gamepad2, Headphones
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface MobileNavProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  isAdmin?: boolean;
}

export default function MobileNav({ activeTool, setActiveTool, isAdmin }: MobileNavProps) {
  const primaryIcons = [
    { id: 'image', icon: ImageIcon, label: 'Studio' },
    { id: 'chat', icon: MessageSquare, label: 'Chat', isCenter: true },
    { id: 'projects', icon: LayoutGrid, label: 'Tools' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-6 right-6 z-[100]">
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[32px] p-2 flex items-center justify-between shadow-2xl shadow-black/40">
        {primaryIcons.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTool(item.id)}
            className={cn(
              "relative flex flex-col items-center justify-center transition-all",
              item.isCenter ? "w-14 h-14 translate-y-[-12px]" : "w-12 h-10"
            )}
          >
            {item.isCenter ? (
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl ring-4 ring-slate-900",
                activeTool === item.id ? "bg-nepal-red text-white scale-110" : "bg-white text-slate-900"
              )}>
                <item.icon className="w-6 h-6" />
              </div>
            ) : (
              <>
                <item.icon className={cn(
                  "w-5 h-5 transition-all",
                  activeTool === item.id ? "text-white scale-110" : "text-slate-500"
                )} />
                <span className={cn(
                  "text-[8px] font-black uppercase mt-1 tracking-tighter transition-all",
                  activeTool === item.id ? "text-white opacity-100" : "text-slate-500 opacity-0"
                )}>
                  {item.label}
                </span>
                {activeTool === item.id && (
                  <motion.div 
                    layoutId="bubble"
                    className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"
                  />
                )}
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
