import React from 'react';
import { Trash2, Edit3, MapPin, Sparkles, Bed, Bath, Maximize } from 'lucide-react';

export default function AgentPropertyCard({ property, onDelete }) {
  
  const backendBase = import.meta.env.PROD 
    ? import.meta.env.VITE_IMAGE_API_URL 
    : "http://localhost:5000";

  const imageUrl = property.images?.[0]?.startsWith('http') 
    ? property.images[0] 
    : `${backendBase}/${property.images?.[0]}`;

  return (
    <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden group">
      <div className="relative h-56 overflow-hidden">
        <img 
          src={imageUrl} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          alt="property" 
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black uppercase text-blue-600">
          {property.listingType}
        </div>
        
        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            onClick={() => onDelete(property._id)}
            className="p-2 bg-white/90 backdrop-blur-md text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 truncate uppercase">
            {property.type} in {property.subcity}
          </h3>
        </div>
        
        <p className="text-xl font-black text-blue-600 mb-4">
          {property.price?.toLocaleString()} <span className="text-xs">ETB</span>
        </p>

        <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl mb-4">
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 mb-1">
            <Sparkles size={12} /> AI Marketing Text
          </p>
          <p className="text-xs text-indigo-900 italic line-clamp-2 leading-relaxed">
            "{property.aiDescription}"
          </p>
        </div>

        <div className="flex items-center justify-between text-gray-400">
          <div className="flex items-center gap-1 text-[11px] font-bold">
            <Bed size={14} /> {property.bedrooms}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold">
            <Bath size={14} /> {property.bathrooms}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold">
            <Maximize size={14} /> {property.size}m²
          </div>
        </div>
      </div>
    </div>
  );
}