import React from 'react';

interface InteractionPromptProps {
  promptText: string | null;
}

export const InteractionPrompt: React.FC<InteractionPromptProps> = ({ promptText }) => {
  if (!promptText) return null;

  return (
    <div className="absolute top-[68%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 transition-all duration-150 animate-in fade-in zoom-in-95">
      <div className="glass-panel rounded-full px-5 py-2.5 flex items-center gap-3 border border-amber-500/40 shadow-2xl">
        <span className="bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-lg text-xs shadow">
          E
        </span>
        <span className="font-bold text-white text-xs tracking-wide">
          {promptText}
        </span>
      </div>
    </div>
  );
};
