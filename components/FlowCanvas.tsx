
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Node,
  Edge,
  Connection,
  BackgroundVariant,
  Panel,
  useReactFlow,
  ConnectionMode,
  MarkerType,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges
} from 'reactflow';
import Sidebar from './Sidebar';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import UpgradeModal from './UpgradeModal';
import AIAssistant from './AIAssistant';
import { NODE_CONFIG, NODE_CATEGORY } from '../constants';
import { NodeType, Project, UserPlan } from '../types';
import { Save, Moon, Sun, Link as LinkIcon, BookmarkPlus, Undo, Redo, X, Layout, FileText, Lock, Type, Share2, Copy, Check, ShoppingBag } from 'lucide-react';

let id = 1000;
const getId = () => `${id++}`;

export interface FlowCanvasProps {
  project: Project;
  onSaveProject: (nodes: Node[], edges: Edge[]) => void;
  onSaveTemplate?: (nodes: Node[], edges: Edge[], name: string) => void;
  onUnsavedChanges: () => void;
  triggerSaveSignal?: number;
  isDark: boolean;
  toggleTheme: () => void;
  isPresentationMode: boolean;
  showNotesInPresentation: boolean;
  t: (key: any) => string;
  userPlan: UserPlan;
  showAIAssistant?: boolean;
  onToggleAIAssistant?: () => void;
  isSharedView?: boolean;
  onShareToMarketplace?: (name: string, description: string) => void;
}

const FlowCanvas = ({
  project, onSaveProject, onSaveTemplate, onUnsavedChanges, triggerSaveSignal,
  isDark, toggleTheme, isPresentationMode, showNotesInPresentation,
  t, userPlan, showAIAssistant, onToggleAIAssistant, isSharedView, onShareToMarketplace
}: FlowCanvasProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, getNodes, getEdges } = useReactFlow();

  const [nodes, setNodes] = useNodesState(project.nodes);
  const [edges, setEdges] = useEdgesState(project.edges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [saveStep, setSaveStep] = useState<'OPTIONS' | 'TEMPLATE_NAME' | 'MARKETPLACE_DETAILS'>('OPTIONS');
  const [templateNameInput, setTemplateNameInput] = useState('');
  const [marketplaceDescInput, setMarketplaceDescInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [snapLines, setSnapLines] = useState<{ x?: number, y?: number } | null>(null);

  const MAX_NODES = userPlan === 'FREE' ? 20 : (userPlan === 'PRO' ? 100 : 9999);

  const [past, setPast] = useState<{ nodes: Node[], edges: Edge[] }[]>([]);
  const [future, setFuture] = useState<{ nodes: Node[], edges: Edge[] }[]>([]);

  const takeSnapshot = useCallback(() => {
    setPast((old) => {
      const newHistory = [...old, { nodes: getNodes(), edges: getEdges() }];
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setFuture([]);
  }, [getNodes, getEdges]);

  const handleUndo = useCallback(() => {
    if (past.length === 0) return;
    const currentState = { nodes: getNodes(), edges: getEdges() };
    const previousState = past[past.length - 1];
    setPast(old => old.slice(0, old.length - 1));
    setFuture((old) => [currentState, ...old]);
    setNodes(previousState.nodes);
    setEdges(previousState.edges);
    onUnsavedChanges();
  }, [past, getNodes, getEdges, setNodes, setEdges, onUnsavedChanges]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const currentState = { nodes: getNodes(), edges: getEdges() };
    const nextState = future[0];
    setFuture(old => old.slice(1));
    setPast((old) => [...old, currentState]);
    setNodes(nextState.nodes);
    setEdges(nextState.edges);
    onUnsavedChanges();
  }, [future, getNodes, getEdges, setNodes, setEdges, onUnsavedChanges]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPresentationMode) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo(); else handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); handleRedo(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, isPresentationMode]);

  useEffect(() => {
    if (triggerSaveSignal && triggerSaveSignal > 0) {
      onSaveProject(nodes, edges);
    }
  }, [triggerSaveSignal]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const isSelectionChange = changes.every(c => c.type === 'select');
      const isRemoval = changes.some(c => c.type === 'remove');
      if (isRemoval) takeSnapshot();

      setNodes((nds) => applyNodeChanges(changes, nds));
      if (!isSelectionChange) onUnsavedChanges();
    },
    [setNodes, onUnsavedChanges, takeSnapshot]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const isRemoval = changes.some(c => c.type === 'remove');
      if (isRemoval) takeSnapshot();
      setEdges((eds) => applyEdgeChanges(changes, eds));
      if (changes.some(c => c.type !== 'select')) onUnsavedChanges();
    },
    [setEdges, onUnsavedChanges, takeSnapshot]
  );

  const processedEdges = useMemo(() => {
    const hiddenNodeIds = new Set<string>();
    nodes.forEach(node => {
      if (node.data.type === NodeType.NOTE && isPresentationMode) {
        if (!showNotesInPresentation || node.data.isTransparent) hiddenNodeIds.add(node.id);
      }
    });
    return edges.map(edge => ({ ...edge, hidden: hiddenNodeIds.has(edge.source) || hiddenNodeIds.has(edge.target) }));
  }, [edges, nodes, isPresentationMode, showNotesInPresentation]);

  const [connectSource, setConnectSource] = useState<{ nodeId: string, handleId: string } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setNodes(project.nodes);
    setEdges(project.edges);
    setPast([]);
    setFuture([]);
  }, [project.id]);

  const handleSwapType = useCallback((nodeId: string, newType: NodeType) => {
    if (isPresentationMode) return;
    if (userPlan === 'FREE' && NODE_CONFIG[newType].isPro) {
      alert("Disponível nos planos Pro e Premium.");
      return;
    }
    takeSnapshot();
    setNodes((nds) => nds.map((node) => node.id === nodeId ? { ...node, data: { ...node.data, type: newType, label: NODE_CONFIG[newType].label } } : node));
    onUnsavedChanges();
  }, [setNodes, isPresentationMode, userPlan, onUnsavedChanges, takeSnapshot]);

  useEffect(() => {
    setNodes((nds) => nds.map((n) => ({
      ...n,
      data: { ...n.data, isPresentationMode, showNotes: showNotesInPresentation, isConnectionActive: !!connectSource, onConnectAction: handleConnectAction, onSwapType: handleSwapType, userPlan },
      draggable: !isPresentationMode,
      selectable: true,
    })));
  }, [isPresentationMode, showNotesInPresentation, connectSource, setNodes, handleSwapType, userPlan]);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);

  const defaultEdgeOptions = useMemo(() => ({
    type: 'custom',
    markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
    style: { strokeWidth: 2, stroke: '#64748b' },
    animated: true,
  }), []);

  const handleConnectAction = useCallback((nodeId: string, type: 'source' | 'target' | 'start-auto' | 'end-auto', handleId?: string) => {
    if (isPresentationMode) return;
    if (type === 'start-auto') {
      setConnectSource({ nodeId, handleId: 'auto' });
      const node = getNodes().find(n => n.id === nodeId);
      if (node) setMousePos({ x: node.position.x + 50, y: node.position.y + 50 });
      return;
    }
    if (type === 'end-auto' && connectSource) {
      if (connectSource.nodeId === nodeId) return;
      const sourceNode = getNodes().find(n => n.id === connectSource.nodeId);
      const targetNode = getNodes().find(n => n.id === nodeId);
      if (sourceNode && targetNode) {
        takeSnapshot();
        const newEdge = { id: `e${connectSource.nodeId}-${nodeId}-${Date.now()}`, source: connectSource.nodeId, target: nodeId, type: 'custom', animated: true };
        setEdges((eds) => addEdge(newEdge, eds));
        onUnsavedChanges();
      }
      setConnectSource(null);
      return;
    }
    if (type === 'source' && handleId) {
      if (connectSource) {
        if (connectSource.nodeId === nodeId) return;
        takeSnapshot();
        const newEdge = { id: `e${connectSource.nodeId}-${nodeId}-${Date.now()}`, source: connectSource.nodeId, sourceHandle: connectSource.handleId === 'auto' ? 'right' : connectSource.handleId, target: nodeId, targetHandle: handleId, type: 'custom', animated: true };
        setEdges((eds) => addEdge(newEdge, eds));
        onUnsavedChanges();
        setConnectSource(null);
      } else setConnectSource({ nodeId, handleId });
    }
  }, [connectSource, setEdges, getNodes, isPresentationMode, onUnsavedChanges, takeSnapshot]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (connectSource) {
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      setMousePos(position);
    }
  }, [connectSource, screenToFlowPosition]);

  const onPaneClick = useCallback(() => { if (connectSource) setConnectSource(null); }, [connectSource]);

  const onConnect = useCallback((params: Connection) => {
    if (isPresentationMode) return;
    takeSnapshot();
    setEdges((eds) => addEdge({ ...params, type: 'custom', animated: true }, eds));
    onUnsavedChanges();
  }, [setEdges, isPresentationMode, onUnsavedChanges, takeSnapshot]);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (isPresentationMode) return;
    if (nodes.length >= MAX_NODES) { setShowUpgradeModal(true); return; }
    const type = event.dataTransfer.getData('application/reactflow') as NodeType;
    if (!type) return;
    if (userPlan === 'FREE' && NODE_CONFIG[type].isPro) return;
    takeSnapshot();
    const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const newNode: Node = { id: getId(), type: 'custom', position, data: { label: NODE_CONFIG[type].label, type, isPresentationMode, showNotes: showNotesInPresentation, userPlan, onConnectAction: handleConnectAction, onSwapType: handleSwapType } };
    setNodes((nds) => nds.concat(newNode));
    onUnsavedChanges();
  }, [reactFlowInstance, setNodes, isPresentationMode, showNotesInPresentation, onUnsavedChanges, nodes.length, MAX_NODES, userPlan, handleConnectAction, handleSwapType, takeSnapshot]);

  // SMART SNAP LOGIC FOR DRAGGING
  const onNodeDrag = useCallback((event: React.MouseEvent, node: Node) => {
    if (isPresentationMode) return;
    const allNodes = getNodes().filter(n => n.id !== node.id);
    let foundX: number | undefined;
    let foundY: number | undefined;
    const SNAP_DISTANCE = 5;

    for (const n of allNodes) {
      if (Math.abs(n.position.x - node.position.x) < SNAP_DISTANCE) foundX = n.position.x;
      if (Math.abs(n.position.y - node.position.y) < SNAP_DISTANCE) foundY = n.position.y;
    }
    if (foundX || foundY) setSnapLines({ x: foundX, y: foundY }); else setSnapLines(null);
  }, [getNodes, isPresentationMode]);

  const onNodeDragStop = useCallback(() => { setSnapLines(null); onUnsavedChanges(); }, [onUnsavedChanges]);

  return (
    <div className="flex h-full w-full relative">
      {!isPresentationMode && <Sidebar isDark={isDark} t={t} userPlan={userPlan} />}

      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} onUpgrade={() => { alert("Redirecionando..."); setShowUpgradeModal(false); }} isDark={isDark} limitType="NODES" />}

      {showShareModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
            <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 p-2 text-slate-400"><X size={20} /></button>
            <div className="text-center mb-6"><Share2 size={28} className="mx-auto text-indigo-600 mb-4" /><h2 className="text-xl font-bold mb-1">Compartilhar</h2></div>
            <div className="flex items-center gap-2 p-2 rounded-lg border bg-slate-50 dark:bg-slate-800"><div className="flex-1 truncate text-xs px-2 font-mono">{window.location.origin}/?share={project.id}</div><button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/?share=${project.id}`); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }} className="p-2 rounded-lg bg-white border text-sm font-bold">{copiedLink ? 'Copiado' : 'Copiar'}</button></div>
          </div>
        </div>
      )}

      {showSaveOptions && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl p-8 border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
            <button onClick={() => setShowSaveOptions(false)} className="absolute top-4 right-4 p-2 text-slate-400"><X size={20} /></button>
            {saveStep === 'OPTIONS' ? (
              <div className="grid grid-cols-3 gap-4">
                <button onClick={() => { onSaveProject(nodes, edges); setShowSaveOptions(false); alert("Salvo!"); }} className="flex flex-col items-center p-4 rounded-xl border-2 hover:border-indigo-500 transition-all"><FileText size={28} className="mb-2 text-indigo-600" /> <span className="font-bold text-sm">Projeto</span></button>
                <button onClick={() => { if (userPlan === 'FREE') setShowUpgradeModal(true); else { setTemplateNameInput(''); setSaveStep('TEMPLATE_NAME'); } }} className="flex flex-col items-center p-4 rounded-xl border-2 hover:border-purple-500 transition-all"><Layout size={28} className="mb-2 text-purple-600" /> <span className="font-bold text-sm">Modelo</span></button>
                <button onClick={() => { if (userPlan === 'FREE') setShowUpgradeModal(true); else { setTemplateNameInput(''); setMarketplaceDescInput(''); setSaveStep('MARKETPLACE_DETAILS'); } }} className="flex flex-col items-center p-4 rounded-xl border-2 hover:border-pink-500 transition-all"><ShoppingBag size={28} className="mb-2 text-pink-600" /> <span className="font-bold text-sm">Marketplace</span></button>
              </div>
            ) : saveStep === 'TEMPLATE_NAME' ? (
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold">Salvar como Modelo</h3>
                <input type="text" value={templateNameInput} onChange={e => setTemplateNameInput(e.target.value)} placeholder="Nome do modelo" className="p-3 rounded-xl border-2 outline-none" />
                <button onClick={() => { onSaveTemplate?.(nodes, edges, templateNameInput); setShowSaveOptions(false); }} className="py-3 bg-purple-600 text-white rounded-xl font-bold">Salvar Modelo</button>
                <button onClick={() => setSaveStep('OPTIONS')} className="text-sm text-slate-500 hover:underline">Voltar</button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold">Publicar no Marketplace</h3>
                <input type="text" value={templateNameInput} onChange={e => setTemplateNameInput(e.target.value)} placeholder="Nome da estratégia" className="p-3 rounded-xl border-2 outline-none" />
                <textarea value={marketplaceDescInput} onChange={e => setMarketplaceDescInput(e.target.value)} placeholder="Descreva como funciona esta estratégia..." className="p-3 rounded-xl border-2 outline-none h-24 resize-none"></textarea>
                <button onClick={() => { onShareToMarketplace?.(templateNameInput, marketplaceDescInput); setShowSaveOptions(false); }} className="py-3 bg-pink-600 text-white rounded-xl font-bold">Enviar para Análise</button>
                <button onClick={() => setSaveStep('OPTIONS')} className="text-sm text-slate-500 hover:underline">Voltar</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 h-full relative transition-colors duration-300" ref={reactFlowWrapper} onMouseMove={handleMouseMove}>
        <ReactFlow
          nodes={nodes}
          edges={processedEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          connectionMode={ConnectionMode.Loose}
          nodesDraggable={!isPresentationMode}
          fitView
          snapToGrid={true}
        >
          {snapLines && (
            <div className="absolute inset-0 pointer-events-none z-[10]">
              {snapLines.x !== undefined && <div className="absolute top-0 bottom-0 border-l border-cyan-400/50" style={{ left: reactFlowInstance?.project({ x: snapLines.x, y: 0 }).x }} />}
              {snapLines.y !== undefined && <div className="absolute left-0 right-0 border-t border-cyan-400/50" style={{ top: reactFlowInstance?.project({ x: 0, y: snapLines.y }).y }} />}
            </div>
          )}
          <Background color={isDark ? "#334155" : "#cbd5e1"} gap={24} variant={BackgroundVariant.Dots} />
          <Controls />
          <MiniMap />
          <Panel position="top-right" className="flex gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg bg-white dark:bg-slate-800 border">{isDark ? <Sun /> : <Moon />}</button>
            <button onClick={() => setShowSaveOptions(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold">Salvar</button>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};

const FlowCanvasWrapped: React.FC<FlowCanvasProps> = (props) => (<ReactFlowProvider><FlowCanvas {...props} /></ReactFlowProvider>);
export default FlowCanvasWrapped;
