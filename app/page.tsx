"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Users, AlertTriangle, MessageSquare, Map as MapIcon, 
  Settings, Bell, Search, Menu, Bot, Send, User, Zap, ChevronRight, X
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_ATTENDANCE_DATA = [
  { time: '10:00', attendance: 5000 },
  { time: '11:00', attendance: 8500 },
  { time: '12:00', attendance: 12000 },
  { time: '13:00', attendance: 18000 },
  { time: '14:00', attendance: 25000 },
  { time: '15:00', attendance: 28450 },
];

const MOCK_ZONES = [
  { id: 'z1', name: 'Gate A Entrance', currentCount: 4500, capacity: 5000, status: 'crowded' },
  { id: 'z2', name: 'Food Court North', currentCount: 3200, capacity: 3000, status: 'critical' },
  { id: 'z3', name: 'Merchandise West', currentCount: 800, capacity: 2000, status: 'optimal' },
  { id: 'z4', name: 'Fan Zone Main', currentCount: 15000, capacity: 20000, status: 'optimal' },
];

const MOCK_INCIDENTS = [
  { id: 'i1', type: 'Medical', zone: 'Sector 42', status: 'active', time: '10 mins ago' },
  { id: 'i2', type: 'Security', zone: 'Gate B', status: 'resolved', time: '1 hour ago' },
];

type Recommendation = {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  zone?: string;
};

type Toast = {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'error';
};

export default function App() {
  const [activeTab, setActiveTab] = useState('command-center');
  const [zones, setZones] = useState(MOCK_ZONES);
  const [incidents, setIncidents] = useState(MOCK_INCIDENTS);
  
  const [insights, setInsights] = useState<Recommendation[] | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hello! I am your FIFA World Cup VenueBot, a multi-language AI assistant. How can I help you with schedules, stadium navigation, or facilities today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const addToast = (message: string, type: 'info' | 'warning' | 'error' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const fetchInsights = async () => {
    setLoadingInsights(true);
    addToast("Generating AI crowd management insights...", "info");
    try {
      const res = await fetch('/api/venue-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zones, incidents })
      });
      const data = await res.json();
      if (data.insights) {
        setInsights(data.insights);
        addToast("Insights updated successfully", "info");
      }
    } catch (error) {
      console.error(error);
      addToast("Failed to fetch insights", "error");
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessages = [...chatMessages, { role: 'user' as const, content: inputMessage }];
    setChatMessages(newMessages);
    setInputMessage('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, language }),
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (error) {
      console.error(error);
      addToast("Chat service alert: Failed to connect to assistant", "warning");
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error connecting to the intelligence server.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'command-center' && !insights) {
      fetchInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0C] text-[#E2E8F0] font-sans"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(79,70,229,0.2)] mb-8 relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-2xl"></div>
                <Activity className="w-10 h-10 text-indigo-400 relative z-10" />
              </div>
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-serif italic text-white leading-none mb-4"
              >
                World Cup Ops AI
              </motion.h1>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-3 text-xs text-slate-400 uppercase tracking-widest"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Initializing GenAI Engine...
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <div aria-live="polite" className="fixed bottom-6 right-6 z-[110] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`min-w-[300px] p-4 rounded-xl border shadow-lg flex items-start gap-3 backdrop-blur-md ${
                toast.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' :
                toast.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
                'bg-[#111114] border-slate-700 text-slate-300'
              }`}
            >
              {toast.type === 'error' && <AlertTriangle className="w-5 h-5 shrink-0" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 shrink-0" />}
              {toast.type === 'info' && <Bell className="w-5 h-5 shrink-0" />}
              <p className="text-sm font-medium flex-1">{toast.message}</p>
              <button aria-label="Close notification" onClick={() => removeToast(toast.id)} className="opacity-50 hover:opacity-100">
                <X aria-hidden="true" className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex h-screen w-full bg-[#0A0A0C] overflow-hidden text-[#E2E8F0] font-sans">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-[#0A0A0C] border-r border-slate-800 text-slate-300 flex flex-col z-20">
          <div className="p-6">
            <div className="flex items-center gap-3 text-white mb-2">
              <Activity className="w-6 h-6 text-indigo-400" />
              <h1 className="font-serif italic font-bold text-xl tracking-tight">World Cup Ops AI</h1>
            </div>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Command Center</p>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {[
              { id: 'command-center', icon: Activity, label: 'Command Center' },
              { id: 'heatmap', icon: MapIcon, label: 'Density Map' },
              { id: 'chatbot', icon: MessageSquare, label: 'Staff Assistant' },
            ].map(item => (
              <button
                key={item.id}
                role="tab"
                aria-selected={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id 
                    ? 'bg-indigo-500/20 text-indigo-400 font-medium border border-indigo-500/30' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                }`}
              >
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-indigo-400' : ''}`} />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-full overflow-y-auto">
          <header className="bg-[#0A0A0C] border-b border-slate-800 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
            <div>
              <h2 className="text-2xl font-serif italic text-white capitalize">
                {activeTab.replace('-', ' ')}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Real-time monitoring and GenAI decision support.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">Total Attendance</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">28,450</span>
              </div>
            </div>
          </header>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'command-center' && (
                <motion.div 
                  key="command"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  {/* Top Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                      title="Current Occupancy" 
                      value="76%" 
                      icon={<Users className="w-5 h-5" />}
                      trend="+12% since last hour"
                    />
                    <StatCard 
                      title="Active Incidents" 
                      value={incidents.length.toString()} 
                      icon={<AlertTriangle className="w-5 h-5" />}
                      trend="Requires attention"
                      alert
                    />
                    <StatCard 
                      title="Critical Zones" 
                      value={zones.filter(z => z.status === 'critical').length.toString()} 
                      icon={<Zap className="w-5 h-5" />}
                      trend="Food Court North"
                      alert
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Zones & Chart */}
                    <div className="lg:col-span-2 space-y-8">
                      <div className="bg-[#111114] p-6 rounded-2xl border border-slate-800">
                        <h3 className="text-lg font-serif italic text-slate-300 mb-6 flex items-center gap-2">
                          <Activity className="w-5 h-5 text-slate-400" />
                          Attendance Trend
                        </h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={MOCK_ATTENDANCE_DATA}>
                              <defs>
                                <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#111114', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '12px', border: '1px solid #1e293b' }}
                              />
                              <Area type="monotone" dataKey="attendance" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAtt)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-[#111114] rounded-2xl border border-slate-800 overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-[#0A0A0C]">
                          <h3 className="text-sm font-serif italic text-slate-300">Zone Status</h3>
                        </div>
                        <div className="divide-y divide-slate-800">
                          {zones.map(zone => (
                            <div key={zone.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-900/50 transition-colors">
                              <div>
                                <p className="font-medium text-slate-300">{zone.name}</p>
                                <p className="text-sm text-slate-500">
                                  {zone.currentCount} / {zone.capacity} capacity
                                </p>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      zone.status === 'optimal' ? 'bg-emerald-400' :
                                      zone.status === 'crowded' ? 'bg-amber-400' : 'bg-rose-400'
                                    }`}
                                    style={{ width: `${Math.min(100, (zone.currentCount / zone.capacity) * 100)}%` }}
                                  />
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
                                  zone.status === 'optimal' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                                  zone.status === 'crowded' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                }`}>
                                  {zone.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: AI Insights */}
                    <div className="space-y-6 flex-grow flex flex-col">
                      <div className="bg-[#111114] border border-slate-800 rounded-2xl p-1 relative overflow-hidden flex-grow">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
                        <div className="bg-[#111114]/50 backdrop-blur-xl rounded-xl p-6 relative z-10 h-full flex flex-col">
                          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                            <h3 className="text-sm font-serif italic text-slate-300 flex items-center gap-2">
                              <Zap className="w-5 h-5 text-indigo-500 fill-indigo-500/20" />
                              GenAI Decision Support
                            </h3>
                            <button 
                              aria-label="Refresh AI insights"
                              onClick={fetchInsights}
                              className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                              disabled={loadingInsights}
                            >
                              {loadingInsights ? 'Analyzing...' : 'Refresh'}
                            </button>
                          </div>
                          
                          <div className="space-y-4">
                            {loadingInsights ? (
                              <div className="space-y-3 animate-pulse">
                                <div className="h-24 bg-slate-900/80 rounded-xl"></div>
                                <div className="h-24 bg-slate-900/80 rounded-xl"></div>
                              </div>
                            ) : insights ? (
                              insights.map((insight, idx) => (
                                <motion.div 
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.1 }}
                                  key={idx} 
                                  className="bg-slate-900/80 rounded-r-xl rounded-bl-xl p-4 border border-slate-800"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="text-white font-medium text-sm pr-4 leading-tight">{insight.title}</h4>
                                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                                      insight.priority === 'high' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                                      insight.priority === 'medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    }`}>
                                      {insight.priority}
                                    </span>
                                  </div>
                                  <p className="text-slate-300 text-xs leading-relaxed">
                                    {insight.description}
                                  </p>
                                  {insight.zone && (
                                    <div className="mt-3 inline-block text-[10px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded">
                                      Target: {insight.zone}
                                    </div>
                                  )}
                                </motion.div>
                              ))
                            ) : (
                              <div className="text-center text-slate-500 text-sm py-8">
                                No insights generated yet.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'heatmap' && (
                <motion.div 
                  key="heatmap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-[#111114] rounded-2xl border border-slate-800 p-8 min-h-[600px] flex flex-col items-center justify-center relative overflow-hidden"
                >
                  <div className="absolute top-8 left-8 text-left z-10 bg-[#0A0A0C]/80 backdrop-blur p-4 rounded-xl border border-slate-800">
                    <h3 className="font-serif italic text-sm text-slate-300 mb-2">Venue Density Heatmap</h3>
                    <div className="space-y-2 text-sm text-slate-400">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-500 rounded-full"></div> Critical Crowd</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-500 rounded-full"></div> Dense Crowd</div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div> Optimal</div>
                    </div>
                  </div>

                  <div className="relative w-full max-w-3xl aspect-video bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden mt-10 shadow-inner">
                    <ZoneOverlay top="20%" left="10%" width="20%" height="60%" name={zones[0].name} status={zones[0].status} currentCount={zones[0].currentCount} capacity={zones[0].capacity} />
                    <ZoneOverlay top="10%" left="40%" width="20%" height="30%" name={zones[1].name} status={zones[1].status} currentCount={zones[1].currentCount} capacity={zones[1].capacity} />
                    <ZoneOverlay top="60%" left="35%" width="30%" height="30%" name={zones[3].name} status={zones[3].status} currentCount={zones[3].currentCount} capacity={zones[3].capacity} />
                    <ZoneOverlay top="25%" left="70%" width="20%" height="50%" name={zones[2].name} status={zones[2].status} currentCount={zones[2].currentCount} capacity={zones[2].capacity} />
                  </div>
                </motion.div>
              )}

              {activeTab === 'chatbot' && (
                <motion.div 
                  key="chatbot"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-[calc(100vh-12rem)]"
                >
                  <div className="bg-[#111114] rounded-2xl border border-slate-800 h-full flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-800 bg-[#0A0A0C] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
                          <Bot className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="font-serif italic text-slate-300">World Cup VenueBot</h3>
                          <p className="text-xs text-slate-500">Multilingual Staff & Fan Assistant</p>
                        </div>
                      </div>
                      <select 
                        aria-label="Select language"
                        value={language} 
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-[#111114] border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="Arabic">Arabic</option>
                        <option value="French">French</option>
                      </select>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 max-w-2xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                            msg.role === 'assistant' ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                          </div>
                          <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                            msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-900/80 text-slate-300 border border-slate-800 rounded-tl-none'
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex gap-4 max-w-2xl">
                           <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-indigo-400" />
                          </div>
                          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-300 rounded-tl-none flex items-center gap-2">
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-[#0A0A0C] border-t border-slate-800">
                      <form onSubmit={handleSendMessage} className="flex gap-3">
                        <input 
                          aria-label="Chat input message"
                          type="text" 
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          placeholder={`Ask about navigation, policies, or translate a message in ${language}...`}
                          className="flex-1 rounded-xl bg-[#111114] border border-slate-800 text-slate-300 placeholder-slate-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        <button 
                          aria-label="Send message"
                          type="submit"
                          disabled={!inputMessage.trim() || chatLoading}
                          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </>
  );
}

function StatCard({ title, value, icon, trend, alert = false }: { title: string, value: string, icon: React.ReactNode, trend: string, alert?: boolean }) {
  return (
    <div className="bg-[#111114] p-6 rounded-2xl border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
        <div className={`p-2 rounded-xl border ${alert ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'}`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold font-mono text-[#E2E8F0] mb-2">{value}</div>
      <div className={`text-sm font-medium ${alert ? 'text-amber-400' : 'text-emerald-400'}`}>
        {trend}
      </div>
    </div>
  );
}

function ZoneOverlay({ top, left, width, height, name, status, currentCount, capacity }: { top: string, left: string, width: string, height: string, name: string, status: string, currentCount: number, capacity: number }) {
  const [isHovered, setIsHovered] = useState(false);

  const bgColor = status === 'optimal' ? 'bg-emerald-500/20' : status === 'crowded' ? 'bg-amber-500/20' : 'bg-rose-500/20';
  const borderColor = status === 'optimal' ? 'border-emerald-500/50' : status === 'crowded' ? 'border-amber-500/50' : 'border-rose-500/50';
  
  return (
    <div 
      className={`absolute border-2 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all duration-300 cursor-pointer group ${bgColor} ${borderColor} ${isHovered ? 'z-20 scale-[1.02]' : 'z-10'}`}
      style={{ top, left, width, height }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-700 text-[10px] font-mono text-slate-300 whitespace-nowrap z-10 transition-transform group-hover:scale-105">
        {name}
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute -top-36 left-1/2 -translate-x-1/2 bg-[#111114] border border-slate-700 rounded-xl p-4 shadow-2xl z-50 w-64 pointer-events-none"
          >
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
              <span className="font-medium text-white text-sm truncate pr-2">{name}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                status === 'optimal' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                status === 'crowded' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              }`}>
                {status}
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>Occupancy</span>
                  <span className="font-mono text-slate-300">{Math.round((currentCount / capacity) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${status === 'optimal' ? 'bg-emerald-400' : status === 'crowded' ? 'bg-amber-400' : 'bg-rose-400'}`}
                    style={{ width: `${Math.min(100, (currentCount / capacity) * 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Current / Capacity</span>
                <span className="font-mono text-slate-300">{currentCount.toLocaleString()} / {capacity.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#111114] border-b border-r border-slate-700 rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
