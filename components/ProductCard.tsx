import React from 'react';
import { LuckyProduct } from '../types';

interface ProductCardProps {
  product: LuckyProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Determine color theme based on type
  let borderColor = "border-mystic-gold/50";
  let glowColor = "shadow-mystic-gold/20";
  
  if (product.type === 'Crystal') {
    borderColor = "border-purple-400/50";
    glowColor = "shadow-purple-500/20";
  } else if (product.type === 'Amber') {
    borderColor = "border-amber-600/50";
    glowColor = "shadow-amber-500/20";
  }

  // Generate a keyword for the image based on the product name and type
  const imageKeyword = encodeURIComponent(`${product.type} ${product.name} feng shui jewelry`);
  const imageUrl = `https://image.pollinations.ai/prompt/luxurious%20${imageKeyword}%20product%20photography%20black%20background%20soft%20lighting?width=400&height=300&nologo=true`;

  return (
    <div className={`group bg-mystic-bg border ${borderColor} rounded-xl overflow-hidden shadow-lg hover:shadow-2xl ${glowColor} transition-all duration-300 transform hover:-translate-y-1`}>
      {/* Image Container */}


      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-mystic-gold transition-colors">
            {product.name}
        </h3>
        
        <div className="bg-mystic-deep/50 rounded-lg p-3 border border-white/5">
            <p className="text-xs text-mystic-amber font-bold mb-1 uppercase tracking-wider">大师点评</p>
            <p className="text-gray-300 text-sm font-sans leading-relaxed">
                {product.reason}
            </p>
        </div>
      </div>
    </div>
  );
};