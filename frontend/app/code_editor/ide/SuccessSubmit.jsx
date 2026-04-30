'use client';
import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, X, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

function InternalModal({ show, onClose, onAction }) {
  useEffect(() => {
    if (show) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
      });
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-surface border border-glass-border rounded-[40px] p-10 max-w-sm w-full shadow-3xl text-center relative animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
          <X size={20} />
        </button>
        
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        
        <h2 className="text-2xl font-black text-[var(--text-main)] mb-2 uppercase italic tracking-tight">Success!</h2>
        <p className="text-sm font-bold text-[var(--text-muted)] mb-8 leading-relaxed">
          All test cases <span className="text-green-500">passed</span> successfully! Ready for the next one?
        </p>

        <button 
          onClick={onAction}
          className="w-full bg-primary text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Practice More
        </button>
      </div>
    </div>
  );
}

const SuccessSubmit = ({ editorRef, challengeContent, selectedType, backToMainComponent }) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate submission validation
    setTimeout(() => {
      setLoading(false);
      setShowModal(true);
    }, 1200);
  };

  return (
    <>
      <button 
        onClick={handleSubmit} 
        disabled={loading}
        className="bg-green-500 text-white px-6 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
      >
        {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
        Submit
      </button>

      <InternalModal 
        show={showModal} 
        onClose={() => setShowModal(false)} 
        onAction={backToMainComponent} 
      />
    </>
  );
};

export default SuccessSubmit;
