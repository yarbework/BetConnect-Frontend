import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { 
  ChevronLeft, ChevronRight, MapPin, Bed, Bath, Maximize, 
  Layers, Sparkles, Calendar, CheckCircle2, Lock, User, Phone, Navigation 
} from 'lucide-react';

// 1. IMPORT MAP COMPONENTS
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 2. FIX FOR LEAFLET MARKER ICON (Standard Vite/Webpack issue)
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImg, setCurrentImg] = useState(0);

  const backendBase = import.meta.env.PROD 
    ? import.meta.env.VITE_IMAGE_API_URL 
    : "http://localhost:5000";

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await API.get(`/property/${id}`);
        setProperty(res.data);
      } catch (err) {
        console.error("Error fetching property", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center animate-pulse text-gray-400 font-bold">Loading Property...</div>;
  if (!property) return <div className="p-20 text-center">Property not found.</div>;

  const nextImg = () => setCurrentImg((prev) => (prev + 1) % property.images.length);
  const prevImg = () => setCurrentImg((prev) => (prev - 1 + property.images.length) % property.images.length);

  // 3. EXTRACT COORDINATES (MongoDB [lng, lat] -> Leaflet [lat, lng])
  const position = property.location?.coordinates 
    ? [property.location.coordinates[1], property.location.coordinates[0]] 
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* SECTION 1: IMAGE CAROUSEL */}
      <div className="relative w-full h-125 rounded-[2.5rem] overflow-hidden shadow-2xl bg-gray-100 mb-10 group">
        <img 
          src={property.images[currentImg]?.replace(/\\/g, '/').startsWith('http')
            ? property.images[currentImg].replace(/\\/g, '/') 
            : `${backendBase}/${property.images[currentImg]?.replace(/\\/g, '/')}`}
          className="w-full h-full object-cover transition-opacity duration-500"
          alt="property"
        />
        
        {property.images.length > 1 && (
          <>
            <button onClick={prevImg} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100">
              <ChevronLeft size={24} />
            </button>
            <button onClick={nextImg} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100">
              <ChevronRight size={24} />
            </button>
            <div className="absolute bottom-6 right-6 bg-black/50 text-white px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-md">
              {currentImg + 1} / {property.images.length}
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-4">
               <h1 className="text-5xl font-black text-[#0B3B60] tracking-tight">
                 {property.type.charAt(0).toUpperCase() + property.type.slice(1)} in {property.subcity}
               </h1>
               <span className={`px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest text-white ${property.listingType === 'sale' ? 'bg-[#0B3B60]' : 'bg-[#F2994A]'}`}>
                 For {property.listingType}
               </span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-lg mb-6">
              <MapPin size={20} className="text-blue-500" />
              <span>{property.subcity}, Woreda {property.woreda}, Kebele {property.kebele} ({property.specialName})</span>
            </div>
            <p className="text-5xl font-black text-[#F2994A]">
              {property.price.toLocaleString()} <span className="text-2xl opacity-60">ETB</span>
              {property.listingType === 'rent' && <span className="text-xl text-gray-400">/mo</span>}
            </p>
          </div>

          {/* Key Features Grid */}
          <div className="space-y-6">
             <h3 className="text-2xl font-bold text-gray-900">Key Features</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: <Bed size={24}/>, label: "Bedrooms", val: property.bedrooms },
                  { icon: <Bath size={24}/>, label: "Bathrooms", val: property.bathrooms },
                  { icon: <Maximize size={24}/>, label: "Square Meters", val: `${property.size} m²` },
                  { icon: <Layers size={24}/>, label: "Floor", val: property.floor },
                ].map((item, i) => (
                  <div key={i} className="bg-white border border-gray-100 p-6 rounded-3xl flex flex-col items-center text-center shadow-xs">
                    <div className="text-blue-600 mb-3">{item.icon}</div>
                    <p className="text-lg font-black text-gray-900">{item.val || 'N/A'}</p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">{item.label}</p>
                  </div>
                ))}
             </div>
          </div>

          {/* AI Description Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-gray-900">Description</h3>
              <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1">
                <Sparkles size={12} /> AI Generated
              </div>
            </div>
            <div className="bg-linear-to-r from-orange-50/50 to-blue-50/30 p-8 rounded-4xl border border-orange-100 leading-relaxed text-gray-700 text-lg italic shadow-inner">
              {property.aiDescription}
            </div>
          </div>

          {/* Additional Features Tags */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Additional Features</h3>
            <div className="flex flex-wrap gap-3">
              {['Parking', 'Garden', 'Security', 'Modern Kitchen'].map(tag => (
                <span key={tag} className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold border border-gray-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Property Details Table */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Property Details</h3>
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
               {[
                 { label: "Type:", val: property.type },
                 { label: "Status:", val: <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-xs font-bold uppercase border border-emerald-100">{property.status}</span> },
                 { label: "Year Built:", val: <div className="flex items-center gap-1"><Calendar size={16}/> 2024</div> }
               ].map((row, i) => (
                 <div key={i} className={`flex justify-between items-center p-5 ${i !== 2 ? 'border-b border-gray-50' : ''}`}>
                    <span className="text-gray-500 font-medium">{row.label}</span>
                    <span className="text-gray-900 font-bold capitalize">{row.val}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* 4. NEW INTERACTIVE MAP SECTION */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Property Location</h3>
              <div className="flex items-center gap-2 text-blue-600 text-sm font-bold bg-blue-50 px-4 py-2 rounded-xl">
                 <Navigation size={16} /> Interactive Map
              </div>
            </div>
            
            <div className="h-100 w-full rounded-4xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50 relative z-0">
               {position ? (
                  <MapContainer 
                    center={position} 
                    zoom={15} 
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={position}>
                      <Popup>
                        <div className="font-bold text-blue-600">
                          {property.type.toUpperCase()} - {property.price.toLocaleString()} ETB
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
               ) : (
                 <div className="h-full w-full flex flex-col items-center justify-center text-gray-400">
                    <MapPin size={48} className="mb-2 opacity-20" />
                    <p className="font-bold">No precise location set for this property.</p>
                 </div>
               )}
            </div>
            <p className="text-sm text-gray-400 italic">
               * Location markers are provided by the agent. Please verify coordinates during viewing.
            </p>
          </div>
        </div>

        {/* SECTION 3: AGENT SIDEBAR (Sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-8 space-y-8">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Agent Contact</h3>
            
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-[#0B3B60] rounded-full flex items-center justify-center text-white text-2xl font-black">
                 {property.agent?.name?.[0].toUpperCase() || <User />}
               </div>
               <div>
                  <h4 className="text-xl font-bold text-gray-900">{property.agent?.name}</h4>
                  <p className="text-sm text-gray-400 font-medium">Licensed Agent</p>
               </div>
            </div>

            {isAuthenticated ? (
              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl text-center space-y-4">
                <p className="text-emerald-700 font-bold text-sm">You have full access to this agent.</p>
                <a 
                  href={`tel:${property.agent?.phone}`}
                  className="flex items-center justify-center gap-3 w-full py-4 bg-[#0B3B60] text-white rounded-2xl font-black text-xl hover:bg-black transition-all"
                >
                  <Phone size={20} /> {property.agent?.phone || "0911-XX-XX-XX"}
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 border border-dashed border-gray-200 p-8 rounded-3xl text-center flex flex-col items-center">
                   <Lock size={48} className="text-gray-300 mb-4" />
                   <h5 className="font-bold text-gray-900 mb-2">Contact information is protected</h5>
                   <p className="text-sm text-gray-400 leading-relaxed mb-6">
                     Please register or log in to view agent contact details and phone number.
                   </p>
                   <p className="text-lg font-black text-gray-200 select-none blur-[6px]">0911000000</p>
                </div>
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full py-4 bg-[#0B3B60] text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all"
                >
                  <User size={18} /> Register / Login to View Contact
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}