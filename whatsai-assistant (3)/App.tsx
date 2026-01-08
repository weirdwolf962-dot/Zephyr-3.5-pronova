
import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Zap, 
  Settings2, 
  MessageSquareText, 
  Cpu, 
  Trash2, 
  Plus, 
  LogOut,
  Power,
  RefreshCw,
  Copy,
  CheckCircle,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { Personality, PersonalityType, Message, BotStatus } from './types';
import { generateAiReply, analyzeStyle } from './services/geminiService';

const PERSONALITIES: Personality[] = [
  { type: PersonalityType.CASUAL, description: 'Relaxed, lowercase, plenty of emojis, chill vibes.' },
  { type: PersonalityType.PROFESSIONAL, description: 'Structured, grammatically correct, concise, polite.' },
  { type: PersonalityType.WITTY, description: 'Sharp, funny, uses clever wordplay.' },
  { type: PersonalityType.FRIENDLY, description: 'Warm, supportive, enthusiastic.' },
];

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [botStatus, setBotStatus] = useState<BotStatus>({
    isActive: true,
    connected: true,
    repliesSent: 24,
    lastActive: new Date()
  });
  const [activePersonality, setActivePersonality] = useState<Personality>(PERSONALITIES[0]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingText, setTrainingText] = useState('');
  const [showTrainer, setShowTrainer] = useState(false);
  const [logs, setLogs] = useState<string[]>(["[SYSTEM] WhatsAi v2.0 initialized", "[NETWORK] Connected to WhatsApp Gateway", "[AI] Gemini-3-Flash ready"]);
  
  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 19)]);
  };

  const toggleBot = () => {
    const newState = !botStatus.isActive;
    setBotStatus(prev => ({ ...prev, isActive: newState }));
    addLog(`Bot ${newState ? 'ENABLED' : 'DISABLED'} by user`);
  };

  const handleTrain = async () => {
    if (!trainingText.trim()) return;
    setIsTraining(true);
    try {
      addLog("Starting style analysis...");
      const result = await analyzeStyle(trainingText);
      const custom: Personality = {
        type: PersonalityType.CUSTOM,
        description: result.tone,
        customInstructions: result.systemInstruction
      };
      setActivePersonality(custom);
      setShowTrainer(false);
      setTrainingText('');
      addLog("Custom personality trained and applied.");
    } catch (e) {
      addLog("ERROR: Style analysis failed.");
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0b141a] text-gray-100 font-sans">
      {/* Side Navigation */}
      <nav className="w-20 bg-[#202c33] flex flex-col items-center py-6 border-r border-gray-700">
        <div className="w-12 h-12 bg-[#00a884] rounded-full flex items-center justify-center mb-10 shadow-lg">
          <Zap className="text-white w-7 h-7" fill="currentColor" />
        </div>
        <div className="flex-1 flex flex-col gap-8">
          <Activity className="w-6 h-6 text-[#00a884] cursor-pointer" />
          <Settings2 className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
          <MessageSquareText className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
        </div>
        <LogOut className="w-6 h-6 text-gray-500 hover:text-red-400 cursor-pointer" />
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-[#202c33] border-b border-gray-700 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight">WhatsAi Control Center</h1>
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${botStatus.connected ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
              <div className={`w-2 h-2 rounded-full ${botStatus.connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              {botStatus.connected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-400 uppercase font-bold">Total Replies</span>
              <span className="text-lg font-mono text-[#00a884]">{botStatus.repliesSent}</span>
            </div>
            <button 
              onClick={toggleBot}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all shadow-md ${
                botStatus.isActive 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' 
                  : 'bg-[#00a884] text-white hover:bg-[#008f70]'
              }`}
            >
              <Power className="w-4 h-4" />
              {botStatus.isActive ? 'STOP BOT' : 'START BOT'}
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#0b141a] custom-scrollbar">
          <div className="grid grid-cols-12 gap-8 max-w-7xl mx-auto">
            
            {/* Left: Configuration */}
            <div className="col-span-12 lg:col-span-4 space-y-8">
              <section className="bg-[#202c33] rounded-2xl p-6 border border-gray-700/50 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-[#00a884]" />
                    AI Persona
                  </h2>
                  <button onClick={() => setShowTrainer(true)} className="text-xs text-[#00a884] hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Custom
                  </button>
                </div>
                <div className="space-y-3">
                  {PERSONALITIES.map(p => (
                    <button 
                      key={p.type}
                      onClick={() => {
                        setActivePersonality(p);
                        addLog(`Personality changed to: ${p.type}`);
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        activePersonality.type === p.type 
                          ? 'border-[#00a884] bg-[#00a884]/10' 
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        {p.type}
                        {activePersonality.type === p.type && <ShieldCheck className="w-4 h-4 text-[#00a884]" />}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{p.description}</p>
                    </button>
                  ))}
                  {activePersonality.type === PersonalityType.CUSTOM && (
                    <div className="p-4 rounded-xl border border-purple-500/50 bg-purple-500/10">
                       <div className="text-purple-400 font-bold flex items-center gap-2">
                         <RefreshCw className="w-4 h-4" /> Custom Trained
                       </div>
                       <p className="text-xs text-purple-300/70 mt-1 italic">"{activePersonality.description}"</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="bg-[#202c33] rounded-2xl p-6 border border-gray-700/50">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#00a884]" />
                  Activity Log
                </h2>
                <div className="bg-[#0b141a] rounded-lg p-4 font-mono text-[11px] h-64 overflow-y-auto space-y-1.5 border border-gray-800">
                  {logs.map((log, idx) => (
                    <div key={idx} className={log.includes('ERROR') ? 'text-red-400' : 'text-gray-400'}>
                      <span className="text-[#00a884]/60 mr-2">»</span>
                      {log}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right: Bot Visualization */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              {/* Bot State Visualization */}
              <div className="bg-[#202c33] rounded-2xl p-8 border border-gray-700/50 relative overflow-hidden">
                 <div className="relative z-10">
                   <h2 className="text-2xl font-black mb-2 italic">BOT OPERATING STATE</h2>
                   <div className="flex gap-12 mt-8">
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Efficiency</span>
                        <span className="text-4xl font-mono text-white">99.2%</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Avg Latency</span>
                        <span className="text-4xl font-mono text-white">1.4s</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Safety Score</span>
                        <span className="text-4xl font-mono text-white">A+</span>
                      </div>
                   </div>
                 </div>
                 {/* Decorative background grid */}
                 <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                    <div className="w-full h-full border-l border-b border-gray-400/20 grid grid-cols-10 grid-rows-10">
                      {Array.from({length: 100}).map((_, i) => <div key={i} className="border-r border-t border-gray-400/10" />)}
                    </div>
                 </div>
              </div>

              {/* Bot Preview / Emulator */}
              <div className="bg-[#0b141a] rounded-2xl border border-gray-700/50 overflow-hidden flex flex-col h-[500px]">
                <div className="p-4 bg-[#202c33] flex items-center gap-3 border-b border-gray-700">
                   <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                     <RefreshCw className={`w-5 h-5 text-gray-300 ${botStatus.isActive ? 'animate-spin' : ''}`} />
                   </div>
                   <div>
                     <div className="font-bold">Live Interception View</div>
                     <div className="text-[10px] text-green-400 font-bold flex items-center gap-1 uppercase">
                       Monitoring Active Chats
                     </div>
                   </div>
                </div>
                
                <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                   <div className="flex justify-center mb-8">
                     <span className="bg-[#111b21] px-3 py-1 rounded-md text-[10px] text-gray-400 uppercase tracking-widest border border-gray-800">Today</span>
                   </div>

                   <div className="flex justify-start">
                     <div className="bg-[#202c33] p-3 rounded-lg rounded-tl-none max-w-md shadow-sm border border-gray-700">
                        <div className="text-xs font-bold text-[#00a884] mb-1">Incoming Message</div>
                        <p className="text-sm">Yo, are you coming to the match tonight? Everyone is waiting!</p>
                        <div className="text-[9px] text-gray-400 text-right mt-1">09:42 PM</div>
                     </div>
                   </div>

                   {botStatus.isActive ? (
                     <div className="flex justify-end animate-in slide-in-from-right duration-500 delay-700">
                        <div className="bg-[#005c4b] p-3 rounded-lg rounded-tr-none max-w-md shadow-sm border border-green-800/30">
                           <div className="text-[9px] font-bold text-green-300 mb-1 flex items-center gap-1">
                             <ShieldCheck className="w-3 h-3" /> REPLIED BY WHATS-AI ({activePersonality.type})
                           </div>
                           <p className="text-sm">For sure! Just finished up some work, heading that way now. ⚽️</p>
                           <div className="text-[9px] text-green-300/60 text-right mt-1">09:42 PM</div>
                        </div>
                     </div>
                   ) : (
                     <div className="flex justify-center italic text-gray-500 text-xs">
                        Bot paused. No auto-reply sent.
                     </div>
                   )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Style Training Modal */}
      {showTrainer && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
           <div className="bg-[#202c33] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-gray-700">
              <div className="p-8 border-b border-gray-700 bg-[#2a3942]">
                 <h3 className="text-2xl font-black italic flex items-center gap-3">
                   <Zap className="w-6 h-6 text-[#00a884]" fill="currentColor" />
                   CLONE YOUR VOICE
                 </h3>
                 <p className="text-gray-400 text-sm mt-2">
                   Paste a sample of your messages. Gemini 3 will perform deep linguistic analysis to replicate your exact tone, slang, and personality.
                 </p>
              </div>
              <div className="p-8 space-y-6">
                 <textarea 
                    value={trainingText}
                    onChange={(e) => setTrainingText(e.target.value)}
                    placeholder="Paste 5-10 messages you've sent recently here..."
                    className="w-full h-48 bg-[#0b141a] border border-gray-700 rounded-2xl p-6 text-sm focus:ring-2 focus:ring-[#00a884] focus:border-transparent resize-none transition-all"
                 />
                 <div className="flex gap-4">
                    <button 
                       onClick={handleTrain}
                       disabled={isTraining || trainingText.length < 50}
                       className="flex-1 bg-[#00a884] hover:bg-[#008f70] disabled:opacity-30 py-4 rounded-xl font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2"
                    >
                       {isTraining ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'START TRAINING'}
                    </button>
                    <button 
                       onClick={() => setShowTrainer(false)}
                       className="px-8 py-4 bg-gray-700/50 hover:bg-gray-700 rounded-xl font-bold transition-all"
                    >
                       CLOSE
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
