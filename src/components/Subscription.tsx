import React, { useState, useEffect } from 'react';
import { Check, Zap, Crown, Award, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../lib/AuthContext';

const plans = [
  {
    name: 'Free',
    price: 'रू 0',
    description: 'Basic access for starters',
    features: ['10 messages / day', 'Basic AI model', 'Standard response time', 'Project save'],
    icon: Zap,
    color: 'slate',
    buttonText: 'Current Plan',
    current: true,
    value: 'free'
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
    popular: true,
    value: 'pro'
  },
  {
    name: 'Premium',
    price: 'रू 999',
    period: '/month',
    description: 'For teams and professionals',
    features: ['Custom AI avatars', 'API access for devs', 'Team collaboration', 'Dedicated support'],
    icon: Crown,
    color: 'nepal-blue',
    buttonText: 'Go Premium',
    value: 'premium'
  }
];

export default function Subscription() {
  const { user } = useAuth();
  const [view, setView] = useState<'plans' | 'payment'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [txNumber, setTxNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetch('/api/payment-methods')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const activeMethods = data.filter((m: any) => m.isActive);
          setPaymentMethods(activeMethods);
          if (activeMethods.length > 0) setSelectedMethod(activeMethods[0]);
        }
      })
      .catch(console.error);
  }, []);

  const handleSelectPlan = (plan: any) => {
    if (plan.current) return;
    if (!user) {
      alert("Please login first!");
      return;
    }
    setSelectedPlan(plan);
    setView('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txNumber.trim()) return;
    setIsSubmitting(true);
    setStatusMsg('');

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan.value,
          amount: selectedPlan.price.replace('रू ', ''),
          methodId: selectedMethod.id,
          transactionNumber: txNumber
        })
      });

      if (res.ok) {
        setStatusMsg('Payment submitted successfully! Waiting for admin approval.');
        setTxNumber('');
        setTimeout(() => setView('plans'), 3000);
      } else {
        setStatusMsg('Failed to submit. Please try again.');
      }
    } catch (error) {
      setStatusMsg('Error submitting payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (view === 'payment' && selectedPlan) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#f9fbfb] p-4 md:p-8 h-full">
        <div className="max-w-4xl mx-auto py-8">
          <button 
            onClick={() => setView('plans')} 
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-8 font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Plans
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Plan Summary */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-xl h-fit">
              <h3 className="text-xl font-bold mb-4">Plan Summary</h3>
              <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between mb-4">
                <span className="font-bold text-slate-700">{selectedPlan.name} Plan</span>
                <span className="text-xl font-black text-slate-900">{selectedPlan.price}</span>
              </div>
              <p className="text-sm text-slate-500 font-medium mb-6">Total payable amount: {selectedPlan.price}</p>
              
              <h4 className="font-bold text-sm text-slate-900 mb-3">Select Payment Method</h4>
              <div className="space-y-2">
                {paymentMethods.map(m => (
                  <button 
                    key={m.id}
                    onClick={() => setSelectedMethod(m)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
                      selectedMethod?.id === m.id 
                        ? "border-nepal-blue bg-blue-50/50 shadow-md" 
                        : "border-slate-100 hover:border-slate-300"
                    )}
                  >
                    <span className="font-bold text-sm text-slate-800">{m.name}</span>
                    <div className={cn("w-4 h-4 rounded-full border-2", selectedMethod?.id === m.id ? "border-nepal-blue bg-nepal-blue" : "border-slate-300")} />
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Details & Form */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-xl">
              <h3 className="text-xl font-bold mb-6">Payment Details</h3>
              {selectedMethod && selectedMethod.type === 'integration' ? (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 border border-slate-100 rounded-3xl h-full">
                  <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-6">
                    <Zap className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-2">Pay with {selectedMethod.name}</h4>
                  <p className="text-sm text-slate-500 mb-8">You will be redirected to the secure {selectedMethod.name} gateway to complete your payment.</p>
                  
                  <button 
                    onClick={() => {
                        alert(`Redirecting to ${selectedMethod.name} interface... (This is a simulation because actual API keys are needed to process)`);
                        const fakeTx = "API_TX_" + Math.floor(Math.random() * 1000000);
                        setTxNumber(fakeTx);
                        setTimeout(() => {
                           handlePaymentSubmit({ preventDefault: () => {} } as any);
                        }, 1000);
                    }}
                    className="w-full py-4 bg-[#6c48d2] hover:bg-[#5a3cb5] text-white rounded-2xl font-bold uppercase tracking-widest text-sm shadow-xl transition-all active:scale-95 flex flex-col items-center justify-center gap-1"
                  >
                    <span>Proceed to Gateway</span>
                  </button>
                  {statusMsg && (
                    <div className={cn("mt-4 p-4 rounded-xl text-xs font-bold w-full", statusMsg.includes('success') ? "bg-green-50 text-nepal-green" : "bg-red-50 text-nepal-red")}>
                      {statusMsg}
                    </div>
                  )}
                </div>
              ) : selectedMethod ? (
                <>
                  <div className="mb-8">
                    <p className="text-sm text-slate-500 mb-2 font-medium">Please send <span className="font-bold text-slate-900">{selectedPlan.price}</span> to the {selectedMethod.name} account below:</p>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-4 whitespace-pre-wrap font-mono text-sm text-slate-800 mb-4 h-32 overflow-y-auto">
                      {selectedMethod.details || 'No details provided.'}
                    </div>
                    
                    {selectedMethod.qrCode && (
                      <div className="mb-6 flex flex-col items-center">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Or Scan QR Code</p>
                        <div className="w-32 h-32 bg-white rounded-xl border border-slate-200 p-2 shadow-sm">
                          <img src={selectedMethod.qrCode} alt="QR Code" className="w-full h-full object-contain" />
                        </div>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Transaction Number / Reference ID</label>
                      <input 
                        required
                        value={txNumber}
                        onChange={e => setTxNumber(e.target.value)}
                        placeholder="Enter tx number..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold outline-none focus:ring-4 focus:ring-slate-100 transition-all font-mono text-sm"
                      />
                    </div>
                    {statusMsg && (
                      <div className={cn("p-4 rounded-xl text-xs font-bold", statusMsg.includes('success') ? "bg-green-50 text-nepal-green" : "bg-red-50 text-nepal-red")}>
                        {statusMsg}
                      </div>
                    )}
                    <button 
                      type="submit"
                      disabled={isSubmitting || !txNumber.trim()}
                      className="w-full py-4 bg-nepal-blue hover:bg-nepal-blue/90 text-white rounded-2xl font-bold uppercase tracking-widest text-sm shadow-xl shadow-nepal-blue/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Payment Proof'}
                    </button>
                  </form>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          {plans.map((plan) => {
            // override current based on user subscription
            const isCurrent = user?.subscription === plan.value || (plan.value === 'free' && !user?.subscription);
            return (
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
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrent}
                  className={cn(
                    "w-full py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-lg",
                    isCurrent 
                      ? "bg-slate-100 text-slate-400 cursor-default" 
                      : plan.popular 
                        ? "bg-nepal-green text-white hover:bg-nepal-green/90 shadow-nepal-green/20" 
                        : "bg-slate-900 text-white hover:bg-slate-800"
                  )}
                >
                  {isCurrent ? 'Current Plan' : plan.buttonText}
                </button>
              </motion.div>
            )
          })}
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
