
import React from 'react';
import { GeneratedImage } from '../types';

interface HistoryGridProps {
  images: GeneratedImage[];
  onSelect: (image: GeneratedImage) => void;
}

const HistoryGrid: React.FC<HistoryGridProps> = ({ images, onSelect }) => {
  if (images.length === 0) return null;

  return (
    <div className="mt-12 w-full max-w-6xl">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
        Recent Generations
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img) => (
          <div 
            key={img.id} 
            className="group relative cursor-pointer overflow-hidden rounded-xl bg-slate-800 transition-all hover:ring-2 hover:ring-blue-500"
            onClick={() => onSelect(img)}
          >
            <img 
              src={img.url} 
              alt={img.prompt} 
              className="h-48 w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
              <p className="text-xs text-white line-clamp-2">{img.prompt}</p>
              <p className="text-[10px] text-slate-300 mt-1">{img.aspectRatio}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryGrid;
