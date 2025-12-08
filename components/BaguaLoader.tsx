import React from 'react';

export const BaguaLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-mystic-gold">
      <div className="relative w-32 h-32 animate-spin-slow">
        {/* Outer Ring */}
        <div className="absolute inset-0 border-4 border-mystic-gold rounded-full opacity-80 border-dashed"></div>
        
        {/* Inner Tai Chi Symbol Representation */}
        <div className="absolute inset-2 bg-gradient-to-tr from-mystic-deep to-mystic-accent rounded-full flex items-center justify-center border-2 border-mystic-amber">
           <span className="text-4xl font-serif select-none opacity-80">☯</span>
        </div>
      </div>
      <p className="mt-6 text-xl font-serif animate-pulse text-mystic-amber">
        大师正在开坛做法...
        <br/>
        <span className="text-sm text-mystic-text opacity-70">Analyzing the stars and your document...</span>
      </p>
    </div>
  );
};