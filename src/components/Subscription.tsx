import React from 'react';
import { Check, Zap, Crown, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const plans = [
  {
    name: 'Free',
    price: 'रू 0',
    description: 'Basic access for starters',
    features: ['10 messages / day', 'Basic AI model', 'Standard response time', 'Project save'],
    icon: Zap,
    color: 'slate',
    buttonText: 'Current Plan',
    current: true
  },
  {
    name: 'Pro',
    price: 'रू 499',
    period: '/month',
    description: 'Perfect for power users',
    features: ['Unlimited messages', 'Fastest AI models', 'Image generation included', 'Priority storage'],
    icon: Award,
    color: 'nepal-green',
    buttonText: 'Get Pro',
    popular: true
  },
  {
    name: 'Premium',
    price: 'रू 999',
    period: '/month',
    description: 'For teams and professionals',
    features: ['Custom AI avatars', 'API access for devs', 'Team collaboration', 'Dedicated support'],
    icon: Crown,
    color: 'nepal-blue',
    buttonText: 'Go Premium'
  }
];

export default function Subscription() {
  return (
    <div className="flex-1 overflow-y-auto bg-white p-8 grid-bg h-full">
      <div className="max-w-6xl mx-auto py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-4 tracking-tight">Choose Your Plan 🇳🇵</h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
            Sasto ra Ramro pricing for everyone in Nepal. Unlock the full potential of AI Nepal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              whileHover={{ y: -8 }}
              className={cn(
                "relative bg-white rounded-[40px] p-8 border border-slate-100 flex flex-col transition-all",
                plan.popular ? "shadow-2xl border-nepal-green/20 ring-1 ring-nepal-green/5" : "shadow-xl"
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 right-10 -translate-y-1/2 px-4 py-1 bg-nepal-green text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-nepal-green/20">
                  Most Popular
                </div>
              )}

              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg",
                plan.color === 'slate' ? "bg-slate-100 text-slate-600" : 
                plan.color === 'nepal-green' ? "bg-nepal-green/10 text-nepal-green" : 
                "bg-nepal-blue/10 text-nepal-blue"
              )}>
                <plan.icon className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-display font-bold text-slate-900 mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                {plan.period && <span className="text-slate-400 font-medium">{plan.period}</span>}
              </div>
              <p className="text-slate-500 text-sm mb-8 font-medium">{plan.description}</p>

              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-nepal-green/5 rounded-full flex items-center justify-center text-nepal-green">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-sm text-slate-600 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                disabled={plan.current}
                className={cn(
                  "w-full py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg",
                  plan.current 
                    ? "bg-slate-100 text-slate-400 cursor-default" 
                    : plan.popular 
                      ? "bg-nepal-green text-white hover:bg-nepal-green/90 shadow-nepal-green/20" 
                      : "bg-slate-900 text-white hover:bg-slate-800"
                )}
              >
                {plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 p-8 bg-slate-50 rounded-[40px] border border-slate-100 text-center">
            <h4 className="text-xl font-bold text-slate-900 mb-2">Need a custom plan for your business?</h4>
            <p className="text-slate-500 mb-6 font-medium">Contact our team for bulk pricing or custom AI integrations.</p>
            <button className="px-8 py-3 bg-white border border-slate-200 rounded-xl font-bold shadow-sm hover:shadow-md transition-all">
                Contact Sales 🇳🇵
            </button>
        </div>
      </div>
    </div>
  );
}
