'use client';
import { useEffect, useState } from "react";
import { executeCode } from "./api";
import { useRouter } from "next/navigation";
import { 
  Play, 
  Lightbulb, 
  RefreshCw, 
  AlertCircle, 
  ChevronRight, 
  Terminal,
  X,
  CheckCircle2
} from "lucide-react";
import "./ide.css";

// ── INTERNAL COMPONENTS ──
function InternalLoader({ show }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-50 bg-background/50 backdrop-blur-[2px] flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );
}

function InternalToast({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div className={`absolute bottom-4 right-4 z-[100] p-3 rounded-xl shadow-xl flex items-center gap-3 border ${
      type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
    }`}>
      <span className="text-[10px] font-black uppercase">{message}</span>
      <button onClick={onClose} className="opacity-50 hover:opacity-100"><X size={12} /></button>
    </div>
  );
}

const Output = ({ editorRef, language, challengeContent, selectedType, backToMainComponent }) => {
  const router = useRouter();
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;
    try {
      setIsLoading(true);
      const result = await executeCode(language, sourceCode);
      const runResult = result.run;
      setOutput(runResult.output.split("\n"));
      setIsError(!!runResult.stderr);
    } catch (error) {
       console.error("Execution API Error:", error);
       setToast({ message: "Failed to execute code. Check your connection.", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setOutput(null);
    setIsError(false);
  }, [challengeContent]);

  return (
    <div className="editor-output flex flex-col h-full bg-[#1e1e1e] border-l border-glass-border">
      <div className="h-12 px-4 border-b border-glass-border flex items-center justify-between bg-background/20">
        <div className="flex items-center gap-2">
           <Terminal size={14} className="text-primary" />
           <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Console</span>
        </div>

        <button
          className="bg-primary text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          disabled={isLoading}
          onClick={runCode}
        >
          {isLoading ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
          Run
        </button>
      </div>

      <div className="flex-grow overflow-auto p-4 font-mono text-sm relative">
        {output ? (
          <div className={`space-y-1 ${isError ? 'text-red-400' : 'text-green-400'}`}>
            {output.map((line, i) => (
              <div key={i} className="flex gap-2">
                <span className="opacity-30">[{i + 1}]</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] opacity-20 select-none">
            <Terminal size={48} className="mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Ready for execution</p>
          </div>
        )}
      </div>

      <InternalToast 
        {...toast} 
        onClose={() => setToast({ message: '', type: '' })} 
      />
    </div>
  );
};

export default Output;
