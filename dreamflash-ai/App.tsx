
import React, { useState, useCallback, useEffect } from 'react';
import { AspectRatio, GeneratedImage, GenerationState } from './types';
import { GeminiService } from './services/geminiService';
import HistoryGrid from './components/HistoryGrid';

const ASPECT_RATIOS: AspectRatio[] = ["1:1", "3:4", "4:3", "9:16", "16:9"];

const App: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    error: null,
    currentImage: null,
    history: []
  });

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dreamflash_history');
    if (saved) {
      try {
        setState(prev => ({ ...prev, history: JSON.parse(saved) }));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dreamflash_history', JSON.stringify(state.history));
  }, [state.history]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const url = await GeminiService.generateImage(prompt, aspectRatio);
      
      const newImage: GeneratedImage = {
        id: Math.random().toString(36).substring(7),
        url,
        prompt,
        aspectRatio,
        timestamp: Date.now()
      };

      setState(prev => ({
        ...prev,
        isGenerating: false,
        currentImage: url,
        history: [newImage, ...prev.history].slice(0, 20) // Keep last 20
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error.message || "Failed to generate image"
      }));
    }
  };

  const handleDownload = () => {
    if (!state.currentImage) return;
    const link = document.createElement('a');
    link.href = state.currentImage;
    link.download = `dreamflash-${Date.now()}.png`;
    link.click();
  };

  const handleSelectHistory = (image: GeneratedImage) => {
    setState(prev => ({ ...prev, currentImage: image.url }));
    setPrompt(image.prompt);
    setAspectRatio(image.aspectRatio);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8">
      {/* Background decoration */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full -z-10 animate-pulse-slow"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full -z-10 animate-pulse-slow"></div>

      <header className="w-full max-w-4xl text-center mb-10 mt-8">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          Dream<span className="gradient-text">Flash</span> AI
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Create breathtaking AI art in seconds with Gemini 2.5 Flash. Fast, free, and infinite possibilities.
        </p>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Input Controls */}
        <section className="glass rounded-3xl p-6 md:p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic cyber-city at sunset with flying vehicles and neon lights..."
              className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Aspect Ratio</label>
            <div className="flex flex-wrap gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                    aspectRatio === ratio
                      ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={state.isGenerating || !prompt.trim()}
            className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
              state.isGenerating || !prompt.trim()
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-xl shadow-blue-500/20 active:scale-[0.98]"
            }`}
          >
            {state.isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Dreaming...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9.06 11.9 8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.21 0 4-1.79 4-4.04 0-1.65-1.35-3.02-3-3.02Z"/><path d="m9.06 11.9-2.85 2.86a2.85 2.85 0 1 1 4.03-4.03l-1.18 1.17"/></svg>
                Generate Image
              </>
            )}
          </button>

          {state.error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
              {state.error}
            </div>
          )}
        </section>

        {/* Right Column: Display Area */}
        <section className="relative min-h-[400px] flex items-center justify-center">
          <div className="w-full glass rounded-3xl overflow-hidden p-4 shadow-2xl relative">
            {!state.currentImage && !state.isGenerating ? (
              <div className="h-[400px] flex flex-col items-center justify-center text-slate-500 text-center px-8">
                <div className="w-16 h-16 mb-4 rounded-2xl bg-slate-800 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </div>
                <p className="text-lg font-medium text-slate-400">Your masterpiece will appear here</p>
                <p className="text-sm mt-2 opacity-60">Describe what you want to see and hit generate.</p>
              </div>
            ) : (
              <div className="relative group">
                <img
                  src={state.currentImage || ''}
                  alt="Generated"
                  className={`w-full h-auto rounded-2xl object-contain transition-all duration-700 max-h-[70vh] ${
                    state.isGenerating ? "blur-md opacity-50 scale-95" : "blur-0 opacity-100 scale-100"
                  }`}
                />
                
                {state.isGenerating && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                     <div className="relative w-20 h-20">
                        <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                     </div>
                     <p className="text-white font-medium animate-pulse">Analyzing prompt...</p>
                  </div>
                )}

                {state.currentImage && !state.isGenerating && (
                  <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={handleDownload}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-xl transition-all"
                      title="Download Image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <HistoryGrid images={state.history} onSelect={handleSelectHistory} />

      <footer className="mt-20 py-10 border-t border-slate-800 w-full text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} DreamFlash AI. Powered by Google Gemini 2.5 Flash.</p>
        <div className="flex justify-center gap-6 mt-4">
          <a href="#" className="hover:text-blue-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-blue-400 transition-colors">Terms</a>
          <a href="#" className="hover:text-blue-400 transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
