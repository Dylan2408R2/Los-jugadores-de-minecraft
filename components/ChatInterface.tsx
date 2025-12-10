import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, Menu, X, LogOut, MessageSquare, Gamepad2 } from 'lucide-react';
import { User, Message, Channel } from '../types';
import FloatingAI from './FloatingAI';

interface ChatInterfaceProps {
  currentUser: User;
  onLogout: () => void;
}

const CHANNELS: Channel[] = [
  { id: 'minecraft', name: 'Los jugadores de Minecraft', description: 'Chat Global de Minecraft en Tiempo Real', type: 'public' },
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentUser, onLogout }) => {
  const [activeChannel, setActiveChannel] = useState<Channel>(CHANNELS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Initialize Data & Broadcast Channel
  useEffect(() => {
    // 1. Initialize Broadcast Channel for Real-time communication between tabs
    const channel = new BroadcastChannel('global_minecraft_chat');
    broadcastChannelRef.current = channel;

    channel.onmessage = (event) => {
      const incomingMsg: Message = event.data;
      setMessages((prev) => [...prev, incomingMsg]);
    };

    // 2. Load initial welcome message
    const initialMsgs: Message[] = [
      { 
        id: 'sys-1', 
        channelId: 'minecraft', 
        text: '¡Bienvenidos al servidor! Este chat es en tiempo real entre todos los usuarios conectados.', 
        sender: 'Servidor', 
        isUser: false, 
        timestamp: new Date(), 
        avatar: 'https://ui-avatars.com/api/?name=Server&background=10b981&color=fff' 
      },
    ];
    
    setMessages(initialMsgs);

    // Cleanup
    return () => {
      channel.close();
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannel]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const currentText = inputText;
    const channelId = activeChannel.id;
    
    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(),
      text: currentText,
      sender: currentUser.username,
      isUser: true,
      timestamp: new Date(),
      channelId: channelId,
      avatar: currentUser.avatar
    };

    // Update local state
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    
    // Real-time: Broadcast to other tabs
    // Note: We flag it as not "isUser" for the receiver so it shows on the left side
    const broadcastMsg = { ...newMessage, isUser: false };
    broadcastChannelRef.current?.postMessage(broadcastMsg);
    
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const formatTime = (date: Date) => {
    // Handle string dates if they come from broadcast/JSON
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredMessages = messages.filter(m => m.channelId === activeChannel.id);

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Channels */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30 w-72 bg-slate-800 border-r border-slate-700/50 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between h-16">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-green-500" />
            Minecraft Chat
          </h2>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {/* Channels List */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Canales</h3>
            <div className="space-y-1">
              {CHANNELS.map(channel => (
                <button
                  key={channel.id}
                  onClick={() => { setActiveChannel(channel); setIsSidebarOpen(false); }}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left group
                    ${activeChannel.id === channel.id 
                      ? 'bg-slate-700 text-white' 
                      : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'}
                  `}
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span className="font-medium truncate">{channel.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Online Users Info */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
              Usuarios
            </h3>
            <div className="space-y-2 px-2">
               <div className="flex items-center gap-2 opacity-80">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-300">{currentUser.username} (Tú)</span>
               </div>
               <div className="text-xs text-slate-500 italic mt-2 px-1">
                  Abre esta app en otra pestaña o navegador para chatear como otro usuario.
               </div>
            </div>
          </div>
        </div>

        {/* User Footer */}
        <div className="p-4 bg-slate-850 border-t border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <img src={currentUser.avatar} alt="User" className="w-9 h-9 rounded-full bg-slate-700 object-cover" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{currentUser.username}</p>
              <p className="text-xs text-slate-400">En línea</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-900 w-full relative">
        {/* Header */}
        <header className="h-16 px-6 border-b border-slate-700/50 flex items-center justify-between bg-slate-900/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-green-500" />
                <h1 className="text-lg font-bold text-white capitalize">{activeChannel.name}</h1>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">{activeChannel.description}</p>
            </div>
          </div>
        </header>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scroll-smooth">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 opacity-50">
               <MessageSquare className="w-16 h-16 mb-4" />
               <p>Este es el comienzo del canal #{activeChannel.name}</p>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-4 group ${msg.isUser ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0 mt-0.5">
                  <img 
                    src={msg.isUser ? currentUser.avatar : (msg.avatar || 'https://ui-avatars.com/api/?background=random')} 
                    alt={msg.sender} 
                    className="w-10 h-10 rounded-full bg-slate-700 object-cover shadow-sm border border-slate-700" 
                  />
                </div>

                {/* Message Content */}
                <div className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[70%]`}>
                  <div className="flex items-baseline gap-2 mb-1 opacity-90">
                    <span className={`text-sm font-semibold ${msg.isUser ? 'text-green-400' : 'text-slate-200'}`}>
                      {msg.sender}
                    </span>
                    <span className="text-[10px] text-slate-500">{formatTime(msg.timestamp)}</span>
                  </div>
                  
                  <div 
                    className={`
                      px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm break-words relative
                      ${msg.isUser 
                        ? 'bg-green-600 text-white rounded-tr-none' 
                        : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/50'
                      }
                    `}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <form 
            onSubmit={handleSendMessage}
            className="max-w-5xl mx-auto relative flex items-center gap-2"
          >
            <div className="flex-1 bg-slate-800/80 rounded-xl border border-slate-700 focus-within:ring-2 focus-within:ring-green-500/50 focus-within:border-green-500 transition-all flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Enviar mensaje a #${activeChannel.name}...`}
                className="flex-1 bg-transparent border-none text-white placeholder-slate-500 px-4 py-3 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className={`
                  mr-2 p-2 rounded-lg transition-all
                  ${!inputText.trim()
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'text-green-400 hover:bg-green-500/10 hover:text-green-300'
                  }
                `}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
          <div className="text-center mt-2">
             <p className="text-[10px] text-slate-600">
               Estás en <strong>#{activeChannel.name}</strong>. Respeta las normas de la comunidad.
             </p>
          </div>
        </div>
      </div>
      
      {/* Floating AI Assistant - Always available */}
      <FloatingAI currentUser={currentUser} />
    </div>
  );
};

export default ChatInterface;