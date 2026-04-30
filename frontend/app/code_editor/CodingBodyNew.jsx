'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sparkles, 
  FileText, 
  Layout, 
  ChevronRight, 
  ChevronLeft,
  Maximize2, 
  Minimize2,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Terminal,
  Code2,
  X
} from 'lucide-react';
import CodeEditor from './ide/CodeEditor';

// ── INTERNAL COMPONENTS (Replacing missing imports) ──

function InternalLoader({ show }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-[100] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-primary" size={48} />
      <p className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">AI is generating your challenge...</p>
    </div>
  );
}

function InternalToast({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div className={`fixed bottom-10 right-10 z-[200] p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10 border ${
      type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
    }`}>
      {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      <span className="text-xs font-bold">{message}</span>
      <button onClick={onClose} className="ml-4 opacity-50 hover:opacity-100 transition-opacity"><X size={14} /></button>
    </div>
  );
}

// ── DATA ──
const LANGUAGE_ITEMS = [
  { value: "javascript", label: "JavaScript", icon: "🟨" },
  { value: "python", label: "Python", icon: "🟦" },
  { value: "java", label: "Java", icon: "☕" },
  { value: "cpp", label: "C++", icon: "💠" },
];

const TYPE_ITEMS = [
  { value: "bug_finding", label: "Bug Hunt", icon: "🐛" },
  { value: "missing_code", label: "Missing Code", icon: "🧩" },
  { value: "new_code", label: "New Code", icon: "✨" },
];

const DIFFICULTY_ITEMS = [
  { value: "easy", label: "Easy", color: "text-green-500" },
  { value: "medium", label: "Moderate", color: "text-yellow-500" },
  { value: "hard", label: "Hard", color: "text-red-500" },
];

const MOCK_DATA = {
  javascript: {
    description: "Write a function that calculates the factorial of a number using recursion.",
    starter_code: "function factorial(n) {\n  // Your code here\n}"
  },
  python: {
    description: "Create a list comprehension that filters even numbers from a given range.",
    starter_code: "def filter_even(n):\n    # Your code here\n    pass"
  }
};

export default function CodingBodyNew({ backToMainComponent }) {
  const [language, setLanguage] = useState("javascript");
  const [selectedType, setSelectedType] = useState("new_code");
  const [selectedDifficulty, setSelectedDifficulty] = useState("easy");
  const [loading, setLoading] = useState(false);
  const [challengeContent, setChallengeContent] = useState("");
  const [starterCode, setStarterCode] = useState("");
  const [showChallenge, setShowChallenge] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  const handleGenerate = async () => {
    setLoading(true);
    // Simulate AI generation
    setTimeout(() => {
      const data = MOCK_DATA[language] || MOCK_DATA.javascript;
      setChallengeContent(data.description);
      setStarterCode(data.starter_code);
      setShowChallenge(true);
      setLoading(false);
      setToast({ message: 'Challenge generated successfully!', type: 'success' });
    }, 1500);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  return (
    <div className={`w-full h-screen bg-[var(--background)] flex flex-col ${isFullScreen ? 'fixed inset-0 z-[300]' : ''}`}>
      
      {/* ── HEADER ── */}
      <div className="min-h-[64px] py-4 px-4 md:px-6 border-b border-glass-border bg-surface/50 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={backToMainComponent}
              className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-glass-border hover:border-primary/50 text-[var(--text-main)] transition-all shadow-sm"
            >
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Exit Editor</span>
            </button>
            <div className="hidden lg:flex items-center gap-2 ml-2">
              <h2 className="text-sm font-black text-[var(--text-main)] uppercase tracking-widest truncate max-w-[120px] md:max-w-none">Code Platform</h2>
              <div className="hidden sm:flex bg-primary/10 text-primary text-[8px] font-black px-2 py-0.5 rounded-full items-center gap-1">
                <Sparkles size={8} /> PREMIUM
              </div>
            </div>
          </div>
          
          <button onClick={toggleFullScreen} className="md:hidden p-2.5 rounded-xl hover:bg-white/5 text-[var(--text-muted)] transition-all">
            {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="flex-grow sm:flex-initial bg-surface border border-glass-border rounded-xl px-3 py-2 text-[10px] font-bold text-[var(--text-main)] outline-none focus:border-primary/50"
            >
              {LANGUAGE_ITEMS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>

            <select 
              value={selectedType} 
              onChange={(e) => setSelectedType(e.target.value)}
              className="flex-grow sm:flex-initial bg-surface border border-glass-border rounded-xl px-3 py-2 text-[10px] font-bold text-[var(--text-main)] outline-none focus:border-primary/50"
            >
              {TYPE_ITEMS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>

            <select 
              value={selectedDifficulty} 
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="flex-grow sm:flex-initial bg-surface border border-glass-border rounded-xl px-3 py-2 text-[10px] font-bold text-[var(--text-main)] outline-none focus:border-primary/50"
            >
              {DIFFICULTY_ITEMS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-full sm:w-auto bg-primary text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={14} /> Generate
          </button>

          <button onClick={toggleFullScreen} className="hidden md:flex p-2.5 rounded-xl hover:bg-white/5 text-[var(--text-muted)] transition-all">
            {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* ── MAIN WORKSPACE ── */}
      <div className="flex-grow flex flex-col relative overflow-hidden">
        <InternalLoader show={loading} />
        
        {/* Challenge Overlay */}
        {showChallenge && (
          <div className="absolute top-6 left-6 right-6 z-40 animate-in slide-in-from-top-4 duration-500">
            <div className="bg-surface/80 backdrop-blur-xl border border-glass-border rounded-[32px] p-8 shadow-2xl relative group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[var(--text-main)] uppercase tracking-widest">Challenge Details</h3>
                    <p className="text-[10px] font-bold text-primary opacity-70">Difficulty: {selectedDifficulty.toUpperCase()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowChallenge(false)}
                  className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-muted)]"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm font-bold text-[var(--text-main)] leading-relaxed pl-4 border-l-2 border-primary/30">
                {challengeContent}
              </p>
            </div>
          </div>
        )}

        {/* Editor Container */}
        <div className="flex-grow flex flex-col relative">
          {!showChallenge && challengeContent && (
            <button 
              onClick={() => setShowChallenge(true)}
              className="absolute top-6 left-6 z-40 bg-surface border border-glass-border px-6 py-3 rounded-2xl flex items-center gap-3 text-xs font-black text-[var(--text-main)] shadow-xl hover:border-primary/50 transition-all"
            >
              <FileText size={16} className="text-primary" />
              View Challenge
            </button>
          )}

          <div className="flex-grow p-4">
            <div className="w-full h-full bg-surface rounded-[32px] border border-glass-border overflow-hidden shadow-inner flex flex-col">
               <div className="h-10 px-6 bg-background/30 border-b border-glass-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-[var(--text-muted)]" />
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">main.{language === 'python' ? 'py' : 'js'}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/30"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/30"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/30"></div>
                  </div>
               </div>
               <div className="flex-grow relative">
                  <CodeEditor 
                    language={language}
                    missingBugCode={starterCode}
                    selectedType={selectedType}
                  />
               </div>
            </div>
          </div>
        </div>
      </div>

      <InternalToast 
        {...toast} 
        onClose={() => setToast({ message: '', type: '' })} 
      />
    </div>
  );
}
