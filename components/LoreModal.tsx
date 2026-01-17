import React, { useEffect, useState } from 'react';
import { LoreTablet } from '../types';
import { generateLore } from '../services/geminiService';
import { X } from 'lucide-react';

interface LoreModalProps {
  tablet: LoreTablet | null;
  onClose: () => void;
}

export const LoreModal: React.FC<LoreModalProps> = ({ tablet, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<string>("");

  useEffect(() => {
    if (tablet) {
      if (tablet.content) {
        setText(tablet.content);
      } else {
        setLoading(true);
        // Add a slight delay to simulate "deciphering"
        generateLore(tablet.prompt).then(generatedText => {
          setText(generatedText);
          tablet.content = generatedText; // Cache it
          setLoading(false);
        });
      }
    }
  }, [tablet]);

  if (!tablet) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border-2 border-slate-700 p-8 shadow-2xl rounded-sm animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors"
        >
          <X />
        </button>

        <div className="mb-6 flex justify-center opacity-50">
           {/* Decorative glyph */}
           <svg width="40" height="40" viewBox="0 0 100 100" className="stroke-slate-400 fill-none stroke-2">
             <circle cx="50" cy="50" r="40" />
             <path d="M50 10 L50 90 M10 50 L90 50" />
             <rect x="35" y="35" width="30" height="30" transform="rotate(45 50 50)" />
           </svg>
        </div>

        <div className="min-h-[150px] flex items-center justify-center">
          {loading ? (
            <div className="text-slate-500 animate-pulse italic font-serif text-lg">
              Deciphering ancient runes...
            </div>
          ) : (
            <p className="text-slate-200 font-serif text-xl leading-relaxed text-center italic">
              "{text}"
            </p>
          )}
        </div>

        <div className="mt-8 text-center">
           <span className="text-slate-600 text-xs uppercase tracking-widest border-t border-slate-800 pt-4 px-8">
             Lore Tablet
           </span>
        </div>
      </div>
    </div>
  );
};