import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Bed, 
  Bath, 
  Maximize, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function PropertyCard({ property, isBookmarked, onBookmarkToggle }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const getImageUrl = (path) => {
    if (!path) return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800';
    if (path.startsWith('http')) return path;
    
    const normalized = path.replace(/\\/g, '/');
    const base = import.meta.env.PROD ? import.meta.env.VITE_IMAGE_API_URL : "http://localhost:5000";
    return `${base}/${normalized}`;
  };

  const handleBookmarkClick = (e) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    
    if (!isAuthenticated) {
      alert("Please login to save properties!");
      navigate('/login');
      return;
    }
    onBookmarkToggle(property._id);
  };

  return (
    <div 
      onClick={() => navigate(`/property/${property._id}`)} 
      className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col h-full overflow-hidden"
    >
      {/* IMAGE SECTION */}
      <div className="relative h-64 overflow-hidden bg-gray-100">
        <img 
          src={getImageUrl(property.images?.[0])} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          alt="property"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800' }}
        />
        
        {/* Status Badge */}
        <div className={`absolute top-5 left-5 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${
          property.listingType === 'sale' ? 'bg-[#0B3B60]' : 'bg-[#F2994A]'
        }`}>
          For {property.listingType}
        </div>

        <div className={`absolute bottom-4 left-5 px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tight shadow-sm border border-white/20 ${
          property.aiFlagged 
            ? 'bg-red-500/90 text-white' 
            : 'bg-emerald-500/90 text-white'
        }`}>
          {property.aiFlagged ? <AlertTriangle size={12}/> : <CheckCircle2 size={12}/>}
          {property.aiFlagged ? "AI Flagged" : "AI Verified"}
        </div>

        <button 
          onClick={handleBookmarkClick}
          className="absolute top-5 right-5 w-11 h-11 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-md hover:bg-white transition-all active:scale-90 z-10"
        >
          <Heart 
            size={22} 
            className={`transition-colors duration-300 ${isBookmarked ? "fill-red-500 text-red-500" : "text-gray-300"}`} 
          />
        </button>
      </div>

      <div className="p-7 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight">
          {property.type} in {property.subcity}
        </h3>
        
        <p className="text-2xl font-black text-[#0B3B60] mt-1.5">
          {property.price?.toLocaleString()} <span className="text-xs uppercase opacity-60">ETB</span>
          {property.listingType === 'rent' && <span className="text-sm font-bold text-gray-400">/mo</span>}
        </p>

        <div className="flex items-center gap-1 text-gray-400 text-sm mt-2 font-medium">
          <MapPin size={14} className="text-blue-400" />
          <span className="truncate">{property.subcity}, Woreda {property.woreda}, {property.kebele}</span>
        </div>

        <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-50">
          <div className="flex items-center gap-2 text-gray-500">
            <Bed size={18} className="text-gray-300" />
            <span className="text-xs font-black">{property.bedrooms || 0} <span className="font-medium text-gray-400">bed</span></span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Bath size={18} className="text-gray-300" />
            <span className="text-xs font-black">{property.bathrooms || 0} <span className="font-medium text-gray-400">bath</span></span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Maximize size={18} className="text-gray-300" />
            <span className="text-xs font-black">{property.size} <span className="font-medium text-gray-400">m²</span></span>
          </div>
        </div>

        <div className="mt-5">
          <span className="px-4 py-1.5 bg-gray-50 border border-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xs">
            {property.floor}
          </span>
        </div>
      </div>
    </div>
  );
}