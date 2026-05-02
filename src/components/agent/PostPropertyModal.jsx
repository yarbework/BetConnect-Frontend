import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import MapPicker from '../agent/MapPicker'; 
import { 
  X, Upload, Sparkles, Home, MapPin, 
  CheckCircle, Loader2, Camera, AlignLeft, 
  Trash2, Info 
} from 'lucide-react';

export default function PostPropertyModal({ isOpen, onClose, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [successData, setSuccessData] = useState(null);
  
  const [formData, setFormData] = useState({
    listingType: 'rent',
    type: 'apartment', 
    subcity: 'Bole',
    woreda: '',
    kebele: '',
    price: '',
    size: '',
    floor: '',
    specialName: '',
    description: '',
    bedrooms: '0',
    bathrooms: '0',  
    lat: 9.03,
    lng: 38.74,
  });

  // Clean up previews when modal closes to prevent memory leaks
  useEffect(() => {
    return () => previews.forEach(url => URL.revokeObjectURL(url));
  }, [previews]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationSelect = (lat, lng) => {
    setFormData(prev => ({ ...prev, lat, lng }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setSuccessData(null);
    setSelectedFiles([]);
    setPreviews([]);
    setFormData({
      listingType: 'rent', type: 'apartment', subcity: 'Bole',
      woreda: '', kebele: '', price: '', size: '', floor: '',
      specialName: '', description: '', bedrooms: '0', bathrooms: '0',
      lat: 9.03, lng: 38.74
    });
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      
      // Construct exact keys for backend destructuring
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      selectedFiles.forEach(file => {
        data.append('images', file);
      });

      const res = await API.post('/property', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccessData(res.data);
      onRefresh(); 
    } catch (err) {
      alert(err.response?.data?.message || "Error: Please check all required fields.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // --- SUCCESS VIEW: AI RESULT ---
  if (successData) {
    return (
      <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-[3rem] w-full max-w-lg p-12 text-center shadow-2xl border border-white">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={56} className="animate-in zoom-in duration-500" />
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-2">Listing Live!</h2>
          <p className="text-gray-500 font-medium mb-8">AI has generated your professional description.</p>
          
          <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 text-left mb-10">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <Sparkles size={14} /> AI Marketing Copy
            </p>
            <p className="text-gray-700 text-sm leading-relaxed italic font-medium">
              "{successData.aiDescription}"
            </p>
          </div>

          <button
            onClick={handleClose}
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    );
  }

  // --- MAIN FORM VIEW ---
  return (
    <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-md z-90 flex items-center justify-center p-4">
      <div className="bg-white rounded-[3.5rem] w-full max-w-6xl max-h-[92vh] overflow-y-auto p-10 md:p-14 relative shadow-2xl border border-white no-scrollbar">
        
        <button onClick={handleClose} className="absolute top-10 right-10 p-3 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 rounded-full transition-all active:scale-90">
          <X size={32} />
        </button>

        <div className="mb-12">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
               <Home className="text-white" size={24} />
            </div>
            <h2 className="text-5xl font-black text-gray-900 tracking-tight">List Property</h2>
          </div>
          <p className="text-gray-500 font-medium text-xl">Fill the details. Let our AI handle the rest.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* LEFT SECTION: TEXT DATA */}
          <div className="space-y-10">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Listing Type</label>
                <select name="listingType" value={formData.listingType} onChange={handleChange} className="w-full p-5 rounded-3xl bg-gray-50 border-none font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all">
                  <option value="rent">For Rent</option>
                  <option value="sale">For Sale</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Property Category</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full p-5 rounded-3xl bg-gray-50 border-none font-bold outline-none">
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="studio">Studio</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <select name="subcity" value={formData.subcity} onChange={handleChange} className="p-4 rounded-2xl bg-white border-none font-bold text-sm shadow-sm">
                  {["Bole", "Yeka", "Arada", "Kirkos", "Lebu"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input name="woreda" placeholder="Woreda" value={formData.woreda} onChange={handleChange} className="p-4 rounded-2xl bg-white border-none font-bold text-sm shadow-sm" required />
                <input name="kebele" placeholder="Kebele" value={formData.kebele} onChange={handleChange} className="p-4 rounded-2xl bg-white border-none font-bold text-sm shadow-sm" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1"><Info size={12}/> Specific Area Name</label>
                <input name="specialName" placeholder="e.g. Near Edna Mall" value={formData.specialName} onChange={handleChange} className="w-full p-5 rounded-2xl bg-white border-none font-bold shadow-sm" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Price (ETB)</label>
                <input name="price" type="number" value={formData.price} onChange={handleChange} className="w-full p-5 rounded-3xl bg-gray-50 border-none font-black text-blue-600 text-2xl" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Size (m²)</label>
                <input name="size" type="number" value={formData.size} onChange={handleChange} className="w-full p-5 rounded-3xl bg-gray-50 border-none font-black text-gray-900 text-2xl" required />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <input name="floor" placeholder="Floor (G+1)" value={formData.floor} onChange={handleChange} className="p-5 rounded-3xl bg-gray-50 border-none font-bold" required />
              <input name="bedrooms" type="number" placeholder="Beds" value={formData.bedrooms} onChange={handleChange} className="p-5 rounded-3xl bg-gray-50 border-none font-bold" />
              <input name="bathrooms" type="number" placeholder="Baths" value={formData.bathrooms} onChange={handleChange} className="p-5 rounded-3xl bg-gray-50 border-none font-bold" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase px-1 flex items-center gap-2"><AlignLeft size={16}/> Description / Private Notes</label>
              <textarea name="description" value={formData.description} rows="3" placeholder="Negotiable price, parking included..." onChange={handleChange} className="w-full p-6 rounded-4xl bg-gray-50 border-none font-medium resize-none outline-none focus:ring-2 focus:ring-blue-500/10" />
            </div>
          </div>

          {/* RIGHT SECTION: MAP & IMAGES */}
          <div className="space-y-10">
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 uppercase px-1 flex items-center gap-2"><MapPin size={16} className="text-red-500"/> Pin Point Location</label>
              <MapPicker onLocationSelect={handleLocationSelect} />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 uppercase px-1 flex items-center gap-2"><Camera size={16} className="text-blue-500"/> Property Photos</label>
              <div className="relative group border-4 border-dashed border-gray-100 rounded-[2.5rem] p-12 hover:border-blue-400 hover:bg-blue-50/30 transition-all text-center cursor-pointer bg-gray-50/50">
                <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <Upload size={40} className="mx-auto text-gray-300 mb-4 group-hover:text-blue-500 transition-colors" />
                <p className="text-lg font-black text-gray-500 group-hover:text-blue-600 transition-colors">
                  {selectedFiles.length > 0 ? `${selectedFiles.length} photos ready` : "Drag photos here"}
                </p>
              </div>

              {/* IMAGE PREVIEW SCROLLER */}
              <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                {previews.map((url, index) => (
                  <div key={index} className="relative shrink-0 w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 shadow-sm group">
                    <img src={url} className="w-full h-full object-cover" alt="preview" />
                    <button type="button" onClick={() => removeFile(index)} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-7 bg-blue-600 text-white rounded-[2.5rem] font-black text-2xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-900/20 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-4"
            >
              {loading ? (
                <><Loader2 className="animate-spin" size={28} /> Analyzing Listing...</>
              ) : (
                <><Sparkles size={28} className="text-blue-200" /> Confirm & Post Listing</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}