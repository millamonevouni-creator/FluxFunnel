
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, X, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateFunnelInsights } from '../services/geminiService';
import { ChatMessage } from '../types';
import { useReactFlow } from 'reactflow';

interface AIAssistantProps {
    onClose: () => void;
    t: (key: any) => string;
}

const AIAssistant = ({ onClose, t }: AIAssistantProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: t('aiWelcome'),
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Access ReactFlow internal state to get nodes/edges for context
  const { getNodes, getEdges } = useReactFlow();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const nodes = getNodes();
    const edges = getEdges();

    try {
      const responseText = await generateFunnelInsights(nodes, edges, userMsg.text);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I had trouble connecting to the AI core.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[400px] bg-slate-900 border-l border-slate-800 flex flex-col h-full shadow-2xl relative z-20">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/50">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">FluxFunnel AI</h3>
            <span className="text-[10px] text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              Online
            </span>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
              }`}
            >
              {msg.role === 'model' ? (
                <ReactMarkdown 
                  components={{
                    ul: ({node, ...props}) => <ul className="list-disc ml-4 my-2 space-y-1" {...props} />,
                    strong: ({node, ...props}) => <strong className="text-cyan-400 font-bold" {...props} />
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex justify-start">
             <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 rounded-bl-none flex items-center gap-2">
               <Loader2 className="animate-spin text-purple-400" size={16} />
               <span className="text-xs text-slate-400">Analyzing metrics...</span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800 bg-slate-900">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI..."
            className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl py-3 pl-4 pr-12 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 p-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={16} />
          </button>
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setInput("Audit this funnel for leaks")} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full border border-slate-700 whitespace-nowrap transition-colors">
            {t('aiAuditBtn')}
          </button>
           <button onClick={() => setInput("Simulate doubling ad spend")} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full border border-slate-700 whitespace-nowrap transition-colors">
            {t('aiSimulateBtn')}
          </button>
           <button onClick={() => setInput("How to improve conversion rate?")} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full border border-slate-700 whitespace-nowrap transition-colors">
            {t('aiImproveBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
