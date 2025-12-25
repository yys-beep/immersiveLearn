import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../services/types';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading
}) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="absolute top-0 right-0 h-full w-full md:w-[450px] z-30 pointer-events-none flex flex-col justify-end p-4 md:p-6">
      
      {/* Message Container - Bottom Right */}
      {/* FIX: Increased max-h from 70vh to 85vh to stretch higher */}
      <div className="flex-1 overflow-y-auto mb-4 pointer-events-auto mask-image-gradient max-h-[85vh] pr-2 custom-scrollbar">
        
        <div className="flex flex-col justify-end min-h-full gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[85%] p-3 rounded-2xl backdrop-blur-md border shadow-sm ${
                msg.role === 'user'
                  ? 'self-end bg-blue-600/30 border-blue-400/30 text-white rounded-br-none'
                  : 'self-start bg-slate-800/60 border-slate-600/30 text-gray-100 rounded-bl-none'
              }`}
            >
              <div className="text-xs opacity-50 mb-1 font-mono uppercase">
                {msg.role === 'user' ? 'Pilot' : 'ImmersiLearn Core'}
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}
          
          {isLoading && (
            <div className="self-start bg-slate-800/60 border border-slate-600/30 p-3 rounded-2xl rounded-bl-none backdrop-blur-md">
              <div className="flex gap-1.5 items-center h-5">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="pointer-events-auto relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl opacity-30 group-hover:opacity-75 transition duration-500 blur"></div>
        <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-700 p-1.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask to create a knowledge map..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-400 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors ${
              isLoading || !input.trim()
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;