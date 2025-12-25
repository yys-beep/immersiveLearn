import React, { useState, useCallback } from 'react';
import Scene from './components/Scene';
import ChatInterface from './components/ChatInterface';
import Tutorial from './components/Tutorial';
import { generateGraphUpdate } from './services/geminiService';
// FIX: Import from services/types
import { GraphData, Message, GraphNode } from './services/types';

// FIX: Increased initial node value to 40 for bigger size
const INITIAL_GRAPH: GraphData = {
  nodes: [
    { id: 'immersilearn', label: 'ImmersiLearn', category: 'Root System', val: 40, desc: 'Your Augmented Knowledge Base' }
  ],
  links: []
};

const INITIAL_MESSAGE: Message = {
  id: 'init-1',
  role: 'model',
  content: 'SYSTEM REBOOTED. Welcome, explorer. I am ready to construct your knowledge architecture. What topic shall we visualize today?',
  timestamp: Date.now()
};

const stringToColor = (str: string = '') => {
  if (!str) return '#ffffff';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 90%, 60%)`;
};

const App: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData>(INITIAL_GRAPH);
  const [historySnapshots, setHistorySnapshots] = useState<Record<string, GraphData>>({});
  
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);

  const handleNodeSelect = useCallback((node: GraphNode) => {
    console.log("Selected Node:", node);
  }, []);

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    setHoveredNode(node);
  }, []);

  const processUserMessage = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const allNodeIds = graphData.nodes.map((n) => n.id);
      const contextNodeIds = allNodeIds.slice(-50); 
      
      const response = await generateGraphUpdate(text, contextNodeIds);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.markdown_reply,
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, aiMsg]);

      setGraphData((currentData) => {
        const newNodes = [...currentData.nodes];
        const newLinks = [...currentData.links];
        const nodeIds = new Set(newNodes.map(n => n.id));

        if (response.graph_actions) {
          response.graph_actions.forEach(action => {
            if (action.action === 'create' || action.action === 'connect') {
              if (!action.subject) return;
              if (!nodeIds.has(action.subject.id)) {
                newNodes.push({
                  id: action.subject.id,
                  label: action.subject.label || action.subject.id,
                  category: action.subject.category || 'Concept',
                  desc: action.subject.desc,
                  // FIX: Default new node size to 30 so they appear large
                  val: 30 
                });
                nodeIds.add(action.subject.id);
              }
              if ((action.action === 'connect' && action.object) || action.object) {
                if (nodeIds.has(action.object!)) {
                  const linkExists = newLinks.some(l => 
                    // @ts-ignore
                    (l.source?.id || l.source) === action.subject.id && (l.target?.id || l.target) === action.object ||
                    // @ts-ignore
                    (l.source?.id || l.source) === action.object && (l.target?.id || l.target) === action.subject.id
                  );
                  if (!linkExists) {
                    newLinks.push({
                      source: action.subject.id,
                      target: action.object!,
                      relation: action.relation || "related"
                    });
                  }
                }
              }
            }
          });
        }
        
        const newData = { nodes: newNodes, links: newLinks };
        
        setHistorySnapshots(prev => ({ ...prev, [text]: newData }));
        setSearchHistory((prev) => {
          const newHistory = [text, ...prev.filter(item => item !== text)];
          return newHistory.slice(0, 10);
        });

        return newData;
      });

    } catch (error) {
      console.error("Interaction Error:", error);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: "System alert: Data packet loss. Please retry your query.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryItemClick = (query: string) => {
    if (historySnapshots[query]) {
      setGraphData(historySnapshots[query]);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: `🔄 Restored knowledge graph state for: "${query}"`,
        timestamp: Date.now()
      }]);
    } else {
      processUserMessage(query);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-black font-sans text-white overflow-hidden">
      <Scene 
        graphData={graphData} 
        onNodeSelect={handleNodeSelect} 
        onNodeHover={handleNodeHover}
      />
      
      <div className="absolute top-4 left-4 z-30 flex flex-col items-start w-64 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto mb-4">
          <h1 className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            Immersi<span className="text-white">Learn</span>
          </h1>
          <button
            onClick={() => setShowTutorial(true)}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/20"
          >
            ? Tutorial
          </button>
        </div>
        
        <div className="flex items-center gap-2 mt-1 mb-6">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-xs text-gray-400 uppercase tracking-widest">System Online</span>
        </div>

        {searchHistory.length > 0 && (
          <div className="pointer-events-auto w-full mb-6">
            <button
               onClick={() => setIsHistoryOpen(!isHistoryOpen)}
               className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2 hover:text-cyan-300 transition-colors"
            >
              <span>📂 Memory Archives ({searchHistory.length})</span>
              <span className={`transform transition-transform ${isHistoryOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            
            {isHistoryOpen && (
              <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-lg p-2 max-h-48 overflow-y-auto w-full">
                {searchHistory.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistoryItemClick(query)}
                    className="w-full text-left px-3 py-2 rounded-md text-xs text-gray-300 hover:bg-cyan-600/30 hover:text-white transition-all border-l-2 border-transparent hover:border-cyan-400 truncate mb-1"
                    title={query}
                  >
                    {query}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className={`transition-all duration-300 transform w-full ${hoveredNode ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4 shadow-xl shadow-cyan-900/20 relative overflow-hidden pointer-events-auto">
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400"></div>
            {hoveredNode && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full shadow-[0_0_8px] shadow-current"
                    style={{ color: stringToColor(hoveredNode.category || 'Unknown') }}
                  >
                    <div className="w-full h-full rounded-full bg-current"></div>
                  </div>
                  <span className="text-xs font-mono uppercase tracking-wider text-gray-300">
                    {hoveredNode.category || 'Unknown'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white leading-tight mb-2">
                  {hoveredNode.label}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed border-t border-white/10 pt-2">
                  {hoveredNode.desc || "No additional data available."}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <Tutorial isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
      
      <ChatInterface 
        messages={messages} 
        onSendMessage={processUserMessage} 
        isLoading={isLoading}
      />
    </div>
  );
};

export default App;