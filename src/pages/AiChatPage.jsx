import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Search } from 'lucide-react';
import API from '../services/api';
import PropertyCard from '../components/common/PropertyCard'; // Import our reusable card

const MessageBubble = ({ message }) => {
  const isAi = message.sender === 'ai';

  return (
    <div className={`flex flex-col mb-8 ${isAi ? 'items-start' : 'items-end'}`}>
      <div className={`flex items-start gap-4 max-w-[95%] md:max-w-[85%] ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar Area */}
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
          isAi ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-blue-600 border-blue-400 text-white'
        }`}>
          {isAi ? <Bot size={22} /> : <User size={22} />}
        </div>

        {/* Content Area */}
        <div className="flex flex-col gap-4 w-full">
          {/* Text Bubble */}
          <div className={`p-5 rounded-3xl shadow-xs text-[15px] leading-relaxed ${
            isAi 
              ? 'bg-white text-gray-800 border border-gray-100 rounded-tl-none' 
              : 'bg-blue-600 text-white rounded-tr-none shadow-blue-100 shadow-lg'
          }`}>
            {message.text}
          </div>

          {/* DYNAMIC PROPERTY CARDS - Renders real cards inside the chat */}
          {isAi && message.properties && message.properties.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {message.properties.map((prop) => (
                <div key={prop._id} className="w-full">
                   <PropertyCard 
                     property={prop} 
                     isBookmarked={false} // Connect to global context if needed
                     onBookmarkToggle={() => {}} 
                   />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Timestamp */}
      <span className={`text-[10px] text-gray-400 mt-2 font-black uppercase tracking-widest ${isAi ? 'ml-14' : 'mr-14'}`}>
        {message.time}
      </span>
    </div>
  );
};

const AIChatPage = () => {
  const [messages, setMessages] = useState([{
    id: 1,
    sender: 'ai',
    text: "Hello! I'm your BetConnect Smart Assistant. Tell me exactly what you're looking for (location, budget, size), and I'll find the best matches from our database instantly.",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    properties: []
  }]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { id: Date.now(), sender: 'user', text: inputValue, time: userTime };
    
    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await API.post('/ai/chat', { message: currentInput });
      
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: res.data.response, 
        properties: res.data.properties || [], 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: "I'm having trouble searching the database. Could you try rephrasing your search?",
        time: userTime,
        properties: []
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto px-4">
      {/* Chat Header */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Sparkles size={24} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">AI Smart Search</h1>
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Connected to Live Database</p>
          </div>
        </div>
      </div>

      {/* Chat History Area */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
        {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
        
        {isTyping && (
          <div className="flex items-center gap-3 text-gray-400 text-sm animate-pulse ml-14 mb-10">
            <Loader2 className="animate-spin" size={18} />
            <span className="font-bold tracking-tight">AI is analyzing listings...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer Input Section */}
      <div className="pt-6 shrink-0">
        <div className="bg-white p-3 rounded-4xl shadow-2xl shadow-indigo-100 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="pl-4 text-indigo-400">
              <Search size={22} />
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Search e.g. '2 bedroom in Bole under 30k'"
              className="flex-1 py-4 bg-transparent outline-none text-[16px] font-medium text-gray-700 placeholder:text-gray-300"
            />
            <button 
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white w-14 h-14 rounded-2xl transition-all shadow-lg shadow-indigo-200 flex items-center justify-center active:scale-90"
            >
              <Send size={24} />
            </button>
          </div>
          
          {/* Quick Suggestions Chips */}
          <div className="flex gap-2 mt-3 px-2 overflow-x-auto no-scrollbar pb-1">
            {['Bole Apartments', 'CMC Villas', 'Rent under 15k'].map((tag) => (
              <button 
                key={tag}
                onClick={() => setInputValue(tag)}
                className="text-[10px] font-black text-gray-400 bg-gray-50 hover:bg-gray-100 border border-gray-100 px-4 py-2 rounded-xl transition-all whitespace-nowrap uppercase tracking-widest"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <p className="text-center text-[10px] text-gray-300 mt-4 font-medium italic">
          BetConnect AI uses real-time data to find your match.
        </p>
      </div>
    </div>
  );
};

export default AIChatPage;