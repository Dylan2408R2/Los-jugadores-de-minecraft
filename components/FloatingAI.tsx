import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Minus, Send, Maximize2 } from 'lucide-react';
import { Message, User } from '../types';
import { sendToAI, initializeAIChat } from '../services/geminiService';

interface FloatingAIProps {
  currentUser: User;
}

const FloatingAI: React.FC<FloatingAIProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeAIChat(currentUser.username);
    setMessages([{
      id: 'ai-welcome',
      text: `Hola ${currentUser.username}, soy tu asistente personal IA. ¿En qué puedo ayudarte hoy?`,
      sender: 'Asistente IA',
      isUser: false,
      timestamp: new Date(),
      channelId: 'ai-chat'
    }]);
  }, [currentUser.username]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: currentUser.username,
      isUser: true,
      timestamp: new Date(),
      channelId: 'ai-chat'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: botMsgId,
      text: '',
      sender: 'Asistente IA',
      isUser: false,
      timestamp: new Date(),
      channelId: 'ai-chat',
      isTyping: true
    }]);

    try {
      let fullText = '';
      const stream = sendToAI(userMsg.text);
      
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === botMsgId 
            ? { ...msg, text: fullText, isTyping: false } 
            : msg
        ));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg hover:shadow-blue-500/40 transition-all transform hover:scale-110 z-50"
      >
        <Bot className="w-8 h-8" />
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-6 w-72 bg-slate-800 border-t border-l border-r border-slate-600 rounded-t-xl shadow-2xl z-50 flex items-center justify-between p-3 cursor-pointer hover:bg-slate-750 transition-colors"
           onClick={() => setIsMinimized(false)}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-semibold text-white text-sm">Asistente IA</span>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }} 
            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} 
            className="p-1 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-800 p-3 flex items-center justify-between border-b border-slate-700 select-none cursor-move">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-white text-sm">Asistente IA</h3>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsMinimized(true)}
            className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/95">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.isUser ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${msg.isUser ? 'bg-slate-700' : 'bg-blue-600'}`}>
              {msg.isUser ? 'Tú' : <Bot className="w-4 h-4 text-white" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
              msg.isUser 
                ? 'bg-blue-600 text-white rounded-tr-sm' 
                : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm'
            }`}>
               {msg.isTyping && !msg.text ? (
                 <span className="animate-pulse">...</span>
               ) : msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-slate-800 border-t border-slate-700">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregúntale a la IA..."
            className="w-full bg-slate-900 text-white text-sm rounded-xl pl-4 pr-10 py-3 border border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default FloatingAI;