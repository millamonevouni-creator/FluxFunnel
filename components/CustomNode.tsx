
import React, { memo, useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow, useUpdateNodeInternals } from 'reactflow';
import { NODE_CONFIG, NODE_CATEGORY } from '../constants';
import { FunnelNodeData, NodeType } from '../types';
import { CreditCard, Trash2, Pencil, BadgeCheck, Play, Check, Link as LinkIcon, Split, Download, XCircle, CalendarDays, ArrowRightLeft, X, Lock, Eye, EyeOff } from 'lucide-react';

// --- Wireframe Components (Canvas Only) ---

const BrowserHeader = () => (
    <div className="h-4 w-full bg-slate-100 border-b border-slate-200 flex items-center px-2 gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
    </div>
);

const WireframeVideo = () => (
    <div className="w-full aspect-video bg-slate-100 rounded border border-slate-200 flex items-center justify-center mb-2">
        <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
            <Play size={10} className="text-slate-400 ml-0.5 fill-slate-400" />
        </div>
    </div>
);

// New Distinct Component for Webinar
const WireframeWebinar = () => (
    <div className="px-1 w-full">
        {/* Dark "Cinema Mode" Video Player with LIVE badge */}
        <div className="relative w-full aspect-video bg-slate-800 rounded border border-slate-700 flex items-center justify-center mb-2 shadow-sm overflow-hidden group-hover:border-slate-600 transition-colors">
            <div className="absolute top-1 left-1 bg-red-600 text-[4px] leading-tight text-white font-bold px-1 rounded-sm animate-pulse z-10 tracking-wider">LIVE</div>
            <div className="w-6 h-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Play size={8} className="text-white ml-0.5 fill-white" />
            </div>
        </div>

        <div className="flex gap-1.5 w-full h-[45px]">
            <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                    <div className="h-1 w-full bg-slate-100 rounded-sm"></div>
                    <div className="h-1 w-3/4 bg-slate-100 rounded-sm"></div>
                </div>
                <div className="h-4 w-full rounded bg-indigo-600 flex items-center justify-center shadow-sm">
                    <span className="text-[5px] font-bold text-white uppercase tracking-wide">JOIN ROOM</span>
                </div>
            </div>
            {/* Chat Sidebar Simulation */}
            <div className="w-7 bg-slate-50 border border-slate-100 rounded-sm p-0.5 flex flex-col gap-0.5 justify-end">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-0.5 bg-slate-300 rounded-sm ${i % 2 === 0 ? 'w-full' : 'w-4/5'}`}></div>
                ))}
                <div className="h-1 w-full bg-white border border-slate-200 rounded-sm mt-0.5"></div>
            </div>
        </div>
    </div>
);

const WireframeLines = ({ count = 3 }: { count?: number }) => (
    <div className="space-y-1 mb-2 w-full px-1">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className={`h-1 bg-slate-100 rounded ${i === count - 1 ? 'w-2/3' : 'w-full'}`}></div>
        ))}
    </div>
);

const WireframeForm = ({ fields = 2 }) => (
    <div className="space-y-1 mb-2 w-full px-1">
        {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="h-4 w-full border border-slate-200 bg-slate-50 rounded"></div>
        ))}
    </div>
);

const WireframeButton = ({ color = "bg-blue-500", text = "CTA", width = "w-3/4" }) => (
    <div className={`h-5 ${width} mx-auto rounded ${color} flex items-center justify-center shadow-sm`}>
        <span className="text-[6px] font-bold text-white uppercase tracking-tight">{text}</span>
    </div>
);

const WireframeCheckout = () => (
    <div className="px-1 w-full">
        <div className="flex gap-1 mb-2">
            <div className="w-1/3 h-10 border border-slate-200 bg-slate-50 rounded flex items-center justify-center">
                <div className="w-4 h-6 bg-slate-200 rounded-sm"></div>
            </div>
            <div className="flex-1 space-y-1">
                <div className="h-1 w-full bg-slate-100 rounded"></div>
                <div className="h-1 w-3/4 bg-slate-100 rounded"></div>
                <div className="h-1 w-1/2 bg-slate-100 rounded"></div>
            </div>
        </div>
        <div className="h-6 w-full border border-slate-200 bg-slate-50 rounded mb-1 flex items-center px-1">
            <CreditCard size={8} className="text-slate-300" />
        </div>
    </div>
);

const WireframeQuiz = () => (
    <div className="px-2 w-full space-y-2 mt-1">
        <div className="h-2 w-3/4 bg-slate-200 rounded mx-auto mb-2"></div>
        <div className="flex gap-2 items-center">
            <div className="w-3 h-3 rounded-full border border-slate-300"></div>
            <div className="h-1.5 w-full bg-slate-100 rounded"></div>
        </div>
        <div className="flex gap-2 items-center">
            <div className="w-3 h-3 rounded-full border border-slate-300"></div>
            <div className="h-1.5 w-full bg-slate-100 rounded"></div>
        </div>
        <div className="flex gap-2 items-center">
            <div className="w-3 h-3 rounded-full border border-blue-400 bg-blue-50"></div>
            <div className="h-1.5 w-full bg-slate-100 rounded"></div>
        </div>
    </div>
);

const WireframeBlog = () => (
    <div className="px-1 w-full">
        <div className="h-16 w-full bg-slate-100 rounded mb-2 flex items-center justify-center">
            <div className="w-8 h-8 opacity-20">
                {/* Placeholder img */}
                <div className="w-full h-full bg-slate-400 rounded-sm transform rotate-12"></div>
            </div>
        </div>
        <div className="space-y-1">
            <div className="h-2 w-full bg-slate-200 rounded"></div>
            <div className="h-1 w-full bg-slate-100 rounded"></div>
            <div className="h-1 w-full bg-slate-100 rounded"></div>
            <div className="h-1 w-2/3 bg-slate-100 rounded"></div>
        </div>
    </div>
);

const WireframeCourseArea = () => (
    <div className="px-1 w-full pt-1">
        <div className="flex justify-between items-center mb-1.5 px-1">
            <div className="h-1.5 w-1/3 bg-slate-300 rounded"></div>
            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
        </div>
        <div className="grid grid-cols-2 gap-1">
            <div className="h-8 bg-slate-100 border border-slate-200 rounded flex flex-col justify-end p-0.5">
                <div className="h-1 w-3/4 bg-slate-300 rounded mb-0.5"></div>
            </div>
            <div className="h-8 bg-slate-100 border border-slate-200 rounded flex flex-col justify-end p-0.5">
                <div className="h-1 w-1/2 bg-slate-300 rounded mb-0.5"></div>
            </div>
            <div className="h-8 bg-slate-100 border border-slate-200 rounded flex flex-col justify-end p-0.5">
                <div className="h-1 w-2/3 bg-slate-300 rounded mb-0.5"></div>
            </div>
            <div className="h-8 bg-slate-100 border border-slate-200 rounded flex flex-col justify-end p-0.5">
                <div className="h-1 w-full bg-slate-300 rounded mb-0.5"></div>
            </div>
        </div>
    </div>
);

// --- New Wireframes ---

const WireframePopup = () => (
    <div className="relative w-full h-full bg-slate-50 flex items-center justify-center">
        {/* Background Site dim */}
        <div className="absolute inset-0 opacity-20 space-y-2 p-2">
            <div className="h-2 w-full bg-slate-300 rounded"></div>
            <div className="h-2 w-2/3 bg-slate-300 rounded"></div>
            <div className="h-20 w-full bg-slate-200 rounded"></div>
        </div>
        {/* Overlay Modal */}
        <div className="relative z-10 w-4/5 h-3/4 bg-white border border-slate-300 rounded shadow-xl flex flex-col items-center justify-center p-1">
            <div className="absolute top-1 right-1">
                <XCircle size={6} className="text-slate-400" />
            </div>
            <div className="h-1.5 w-3/4 bg-purple-200 rounded mb-1"></div>
            <div className="h-1 w-full bg-slate-100 rounded mb-2"></div>
            <WireframeButton color="bg-purple-500" text="GET OFFER" width="w-[90%]" />
        </div>
    </div>
);

const WireframeDownload = () => (
    <div className="px-1 w-full flex flex-col items-center justify-center h-full pb-2">
        <div className="w-10 h-10 bg-teal-50 rounded-full border border-teal-100 flex items-center justify-center mb-2">
            <Download size={16} className="text-teal-500" />
        </div>
        <div className="h-1.5 w-3/4 bg-slate-200 rounded mb-1"></div>
        <div className="h-1 w-1/2 bg-slate-100 rounded mb-2"></div>
        <WireframeButton color="bg-teal-500" text="DOWNLOAD" width="w-3/4" />
    </div>
);

const WireframeCalendar = () => (
    <div className="px-1 w-full pt-1">
        <div className="flex items-center gap-1 mb-2 justify-center">
            <CalendarDays size={10} className="text-blue-500" />
            <div className="h-1 w-1/2 bg-slate-200 rounded"></div>
        </div>
        <div className="grid grid-cols-4 gap-0.5 p-1 bg-slate-50 rounded border border-slate-100">
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className={`h-3 rounded-sm ${i === 7 ? 'bg-blue-500' : 'bg-slate-200'}`}></div>
            ))}
        </div>
        <div className="mt-2">
            <WireframeButton color="bg-blue-500" text="BOOK NOW" width="w-full" />
        </div>
    </div>
);

const WireframeOptin = () => (
    <div className="px-1 w-full flex flex-col justify-center h-full pb-1">
        <div className="h-2 w-3/4 bg-emerald-100 rounded mx-auto mb-2 border border-emerald-50"></div>
        <div className="h-1.5 w-full bg-slate-100 rounded mb-3"></div>
        <WireframeForm fields={1} />
        <WireframeButton color="bg-emerald-500" text="SIGN UP" width="w-full" />
    </div>
);

const WireframeLive = () => (
    <div className="w-full h-full flex flex-col">
        {/* Video Area */}
        <div className="relative w-full h-16 bg-slate-900 rounded-t border-b border-red-900 flex items-center justify-center">
            <div className="absolute top-1 left-1 flex items-center gap-0.5 bg-red-600 px-1 rounded-sm">
                <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                <span className="text-[3px] text-white font-bold tracking-widest">LIVE</span>
            </div>
            <Play size={10} className="text-red-500 fill-red-500 opacity-80" />
        </div>
        {/* Chat/Info Area */}
        <div className="flex-1 bg-slate-50 flex gap-1 p-1">
            <div className="flex-1 space-y-1">
                <div className="h-1 w-full bg-slate-200 rounded"></div>
                <div className="h-1 w-2/3 bg-slate-200 rounded"></div>
            </div>
            <div className="w-6 bg-slate-100 border border-slate-200"></div>
        </div>
    </div>
);

const WireframeGeneric = () => (
    <div className="px-2 w-full pt-2">
        <div className="h-2 w-1/2 bg-slate-300 rounded mb-3"></div>
        <div className="flex gap-2 mb-2">
            <div className="w-8 h-8 bg-slate-200 rounded"></div>
            <div className="flex-1 space-y-1">
                <div className="h-1 w-full bg-slate-100 rounded"></div>
                <div className="h-1 w-full bg-slate-100 rounded"></div>
                <div className="h-1 w-2/3 bg-slate-100 rounded"></div>
            </div>
        </div>
        <div className="space-y-1">
            <div className="h-1 w-full bg-slate-100 rounded"></div>
            <div className="h-1 w-full bg-slate-100 rounded"></div>
            <div className="h-1 w-full bg-slate-100 rounded"></div>
        </div>
    </div>
);

const WireframeOrderPage = () => (
    <div className="px-1 w-full flex flex-col h-full pt-1">
        <div className="h-1.5 w-1/3 bg-slate-300 rounded mb-2"></div>
        <div className="flex-1 space-y-1 border border-slate-100 rounded p-0.5 mb-1 bg-slate-50">
            <div className="flex justify-between">
                <div className="h-1 w-8 bg-slate-200 rounded"></div>
                <div className="h-1 w-4 bg-slate-200 rounded"></div>
            </div>
            <div className="flex justify-between">
                <div className="h-1 w-6 bg-slate-200 rounded"></div>
                <div className="h-1 w-4 bg-slate-200 rounded"></div>
            </div>
            <div className="h-px w-full bg-slate-200 my-0.5"></div>
            <div className="flex justify-between">
                <div className="h-1 w-5 bg-slate-300 rounded"></div>
                <div className="h-1 w-5 bg-slate-300 rounded"></div>
            </div>
        </div>
        <WireframeButton color="bg-violet-600" text="CONFIRM" width="w-full" />
    </div>
);

const WireframeSystem = () => (
    <div className="w-full h-full flex flex-col p-1 bg-slate-50">
        <div className="flex gap-1 h-full">
            <div className="w-1/4 bg-slate-200 rounded-sm h-full"></div>
            <div className="flex-1 flex flex-col gap-1">
                <div className="h-2 w-full bg-slate-200 rounded-sm"></div>
                <div className="flex-1 bg-slate-100 rounded-sm border border-slate-200 p-0.5 grid grid-cols-2 gap-0.5">
                    <div className="bg-slate-200 rounded-sm h-full"></div>
                    <div className="bg-slate-200 rounded-sm h-full"></div>
                    <div className="col-span-2 bg-slate-200 rounded-sm h-full"></div>
                </div>
            </div>
        </div>
    </div>
);

const WireframeEcommerce = () => (
    <div className="w-full h-full flex flex-col p-1 pt-2">
        <div className="w-full h-2 bg-slate-200 mb-1 rounded-sm"></div>
        <div className="grid grid-cols-2 gap-1 flex-1">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-sm flex flex-col items-center justify-center p-0.5">
                    <div className="w-3 h-3 bg-slate-200 rounded-full mb-0.5"></div>
                    <div className="w-3/4 h-0.5 bg-slate-200"></div>
                </div>
            ))}
        </div>
    </div>
);


// --- Main Node Component ---

const CustomNode = ({ id, data, selected }: NodeProps<FunnelNodeData>) => {
    const { deleteElements, setNodes } = useReactFlow();
    const updateNodeInternals = useUpdateNodeInternals();
    const config = NODE_CONFIG[data.type];
    const userPlan = data.userPlan || 'FREE';

    // -- Editing State --
    const [isEditing, setIsEditing] = useState(false);
    const [currentLabel, setCurrentLabel] = useState(data.label);
    const inputRef = useRef<HTMLInputElement>(null);

    // -- Swap Menu State --
    const [showSwapMenu, setShowSwapMenu] = useState(false);

    // Presentation Mode Flag
    const isPresentation = data.isPresentationMode;
    // Is global connection active?
    const isGlobalConnecting = data.isConnectionActive;

    // IMPORTANT: Force handle position update when node type changes (resizes)
    // Wrapped in setTimeout to ensure DOM is updated before recalcing handles
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            updateNodeInternals(id);
        }, 0);
        return () => clearTimeout(timeoutId);
    }, [data.type, id, updateNodeInternals]);

    useEffect(() => {
        setCurrentLabel(data.label);
    }, [data.label]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            setTimeout(() => inputRef.current?.select(), 10);
        }
    }, [isEditing]);

    useEffect(() => {
        // Close swap menu when unselected
        if (!selected) setShowSwapMenu(false);
    }, [selected]);

    // CATEGORIZATION
    const isDiamondShape = data.type === NodeType.PURCHASE_SUB || data.type === NodeType.AB_TEST;
    const isPage = config.category === NODE_CATEGORY.PAGE;
    const isNote = data.type === NodeType.NOTE;
    // If not a page, not a diamond, and not a note, it's an App Icon
    const isAppIcon = !isPage && !isDiamondShape && !isNote;

    // --- Note Logic ---
    const noteTextAreaRef = useRef<HTMLTextAreaElement>(null);

    // Note specific update handler for the body text (not the label/name)
    const [noteBody, setNoteBody] = useState(data.description || '');

    const handleNoteBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setNoteBody(val);
        setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, description: val } } : n));
    };

    // Toggle Note Transparency/Visibility
    const handleToggleVisibility = (e: React.MouseEvent) => {
        e.stopPropagation();
        setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, isTransparent: !n.data.isTransparent } } : n));
    };

    // Auto-resize logic for the note
    useLayoutEffect(() => {
        if (isNote && noteTextAreaRef.current) {
            // 1. Reset height to allow shrinking
            noteTextAreaRef.current.style.height = '0px';

            const scrollHeight = noteTextAreaRef.current.scrollHeight;

            // 2. Set new height based on content, minimum 96px to maintain look (Reduced from 120px)
            noteTextAreaRef.current.style.height = `${Math.max(96, scrollHeight)}px`;

            // 3. Force handle update as dimensions changed
            updateNodeInternals(id);
        }
    }, [noteBody, isNote, id, updateNodeInternals]);

    // --- Click to Connect Handlers ---
    const handleConnect = (e: React.MouseEvent, handleId: string) => {
        if (isPresentation) {
            e.stopPropagation();
            return;
        }
        // We explicitly STOP propagation so the node selection doesn't override the handle click
        // But for dragging, React Flow uses onMouseDown. 
        e.stopPropagation();
        if (data.onConnectAction) {
            data.onConnectAction(id, 'source', handleId);
        }
    };

    // --- Smart Connect: Start Connection ---
    const handleStartSmartConnect = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (data.onConnectAction) {
            data.onConnectAction(id, 'start-auto');
        }
    };

    // --- Smart Connect: End Connection (Target) ---
    const handleNodeClick = (e: React.MouseEvent) => {
        // If we are in "connecting mode" (isGlobalConnecting) and this node is NOT the source
        // Then this click acts as selecting the TARGET.
        if (isGlobalConnecting && !data.isConnectSource && data.onConnectAction) {
            e.stopPropagation();
            data.onConnectAction(id, 'end-auto');
        }
        // If not connecting, ReactFlow handles selection automatically.
    };

    // --- Swap Action ---
    const handleSelectNewType = (type: NodeType) => {
        if (data.onSwapType) {
            data.onSwapType(id, type);
        }
        setShowSwapMenu(false);
    };


    // --- Helper to Render 4 Handles ---
    const renderHandles = () => {
        const interact = isPresentation ? "pointer-events-none" : "cursor-crosshair";
        // Standardized Hit Area: w-12 h-12 (48px) - SUPER LARGE for easy clicking
        const baseClasses = `absolute w-12 h-12 !bg-transparent !border-none flex items-center justify-center ${interact} pointer-events-auto nodrag`;

        // Hide handles if swap menu is open
        if (showSwapMenu) return null;

        const VisualDot = () => (
            <div className={`
            w-3.5 h-3.5 min-w-[14px] min-h-[14px] bg-indigo-500 rounded-full border-2 border-white shadow-sm transition-all duration-200 pointer-events-none
            ${isPresentation ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}
            group-hover:scale-125
        `}></div>
        );

        // Positioned TIGHT to the border (standard React Flow behavior)
        const positions = [
            { pos: Position.Top, id: 'top', class: '-top-3 left-1/2 -translate-x-1/2' },
            { pos: Position.Right, id: 'right', class: '-right-3 top-1/2 -translate-y-1/2' },
            { pos: Position.Bottom, id: 'bottom', class: '-bottom-3 left-1/2 -translate-x-1/2' },
            { pos: Position.Left, id: 'left', class: '-left-3 top-1/2 -translate-y-1/2' }
        ];

        return (
            <>
                {positions.map(({ pos, id: hid, class: cls }) => (
                    <React.Fragment key={hid}>
                        <Handle
                            type="target"
                            position={pos}
                            id={`${hid}-target`}
                            className={`${baseClasses} ${cls} opacity-0`}
                            style={{ zIndex: 50 }}
                            isConnectable={true}
                            isConnectableStart={false}
                        />
                        <Handle
                            type="source"
                            position={pos}
                            id={`${hid}-source`}
                            className={`${baseClasses} ${cls} 
                                [&>div]:hover:scale-150 
                                [&>div]:hover:!opacity-100 
                                [&>div]:hover:bg-indigo-500 
                                [&>div]:hover:border-white 
                                [&>div]:hover:shadow-lg
                                active:scale-90 transition-all
                            `}
                            style={{ zIndex: 51 }} // Source slightly above target
                            isConnectable={true}
                            isConnectableStart={true}
                        >
                            <VisualDot />
                        </Handle>
                    </React.Fragment>
                ))}
            </>
        );
    };

    // --- Actions ---
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        deleteElements({ nodes: [{ id }] });
    };

    const handleStartRename = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    const handleFinishRename = () => {
        setIsEditing(false);
        if (currentLabel.trim() !== "") {
            setNodes((nds) =>
                nds.map((n) => {
                    if (n.id === id) {
                        return { ...n, data: { ...n.data, label: currentLabel } };
                    }
                    return n;
                })
            );
        } else {
            // Revert if empty
            setCurrentLabel(data.label);
        }
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
            handleFinishRename();
        }
    };

    // Helper to render the label
    const renderLabel = (className: string = '') => {
        if (isEditing) {
            return (
                <input
                    ref={inputRef}
                    type="text"
                    value={currentLabel}
                    onChange={(e) => setCurrentLabel(e.target.value)}
                    onBlur={handleFinishRename}
                    onKeyDown={onKeyDown}
                    className={`nodrag mb-2 px-1 py-0.5 rounded text-xs font-bold text-center min-w-[80px] w-[100px] bg-white dark:bg-slate-800 border border-blue-500 text-slate-800 dark:text-white outline-none shadow-lg z-50 pointer-events-auto ${className}`}
                    onClick={(e) => e.stopPropagation()}
                    title="Rename Node"
                    placeholder="Nome"
                />
            );
        }
        return (
            <div className={`mb-2 px-2 py-0.5 rounded text-xs font-bold text-center min-w-[80px] transition-colors
            ${selected && !isPresentation ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 bg-transparent group-hover:bg-slate-100 dark:group-hover:bg-slate-800'}
            ${className}
        `}>
                {data.label}
            </div>
        );
    };

    // --- Context Menu (Toolbar) ---
    const NodeToolbar = () => {
        if (isPresentation) return null;

        return (
            <div
                className={`absolute -top-11 left-1/2 -translate-x-1/2 flex gap-1 p-1.5 rounded-lg shadow-xl z-[90] transition-opacity duration-200 border
            ${selected ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
            bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700
            `}
            >
                {/* Link / Connect Button */}
                <button
                    onClick={handleStartSmartConnect}
                    className={`p-1.5 rounded transition-colors 
                    ${data.isConnectSource
                            ? 'bg-cyan-500 text-white shadow-inner pointer-events-none' // Active state
                            : 'text-cyan-600 hover:text-cyan-800 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:text-white dark:hover:bg-cyan-900/30'
                        }
                `}
                    title="Connect Mode: Click here, then click ANY other node"
                >
                    <LinkIcon size={14} strokeWidth={2.5} />
                </button>
                <div className="w-px bg-slate-200 dark:bg-slate-700 my-1"></div>

                {/* Swap Button - NEW */}
                <button
                    onClick={(e) => { e.stopPropagation(); setShowSwapMenu(!showSwapMenu); }}
                    className={`p-1.5 rounded transition-colors ${showSwapMenu ? 'bg-indigo-100 text-indigo-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700'}`}
                    title="Swap Element"
                >
                    <ArrowRightLeft size={14} />
                </button>
                <div className="w-px bg-slate-200 dark:bg-slate-700 my-1"></div>

                {/* Visibility Toggle - NOTE ONLY */}
                {isNote && (
                    <>
                        <button
                            onClick={handleToggleVisibility}
                            className={`p-1.5 rounded transition-colors ${data.isTransparent ? 'text-amber-500 bg-amber-50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white'}`}
                            title={data.isTransparent ? "Show Content" : "Hide Content (Ghost Mode)"}
                        >
                            {data.isTransparent ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <div className="w-px bg-slate-200 dark:bg-slate-700 my-1"></div>
                    </>
                )}

                {/* Rename Button (Enabled for ALL nodes including NOTE) */}
                <button
                    onClick={handleStartRename}
                    className="p-1.5 rounded transition-colors text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700"
                    title="Rename"
                >
                    <Pencil size={14} />
                </button>
                <div className="w-px bg-slate-200 dark:bg-slate-700 my-1"></div>

                <button
                    onClick={handleDelete}
                    className="p-1.5 rounded transition-colors text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    title="Delete"
                >
                    <Trash2 size={14} />
                </button>

                {/* SWAP MENU POPOVER */}
                {showSwapMenu && (
                    <div
                        className="absolute top-10 left-1/2 -translate-x-1/2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-xl z-[200] overflow-hidden flex flex-col"
                        onMouseDown={(e) => e.stopPropagation()} // Stop drag initiation
                        onClick={(e) => e.stopPropagation()} // Stop click propagation
                    >
                        <div className="bg-slate-50 dark:bg-slate-800 p-2 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Replace with...</span>
                            <button onClick={() => setShowSwapMenu(false)} className="text-slate-400 hover:text-slate-600" title="Close"><X size={12} /></button>
                        </div>
                        <div className="p-2 overflow-y-auto max-h-[200px] scrollbar-thin">
                            <div className="grid grid-cols-4 gap-2">
                                {/* Filter based on category for smarter swapping? For now, list typical swaps or same category first */}
                                {Object.entries(NODE_CONFIG)
                                    .sort(([, a], [, b]) => a.label.localeCompare(b.label)) // Alphabetical
                                    .map(([key, cfg]) => {
                                        if (key === NodeType.NOTE) return null; // Don't swap to note usually
                                        const type = key as NodeType;
                                        const isActive = type === data.type;
                                        const isLocked = userPlan === 'FREE' && cfg.isPro;

                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation(); // CRITICAL: Stop propagation so the click doesn't deselect the node
                                                    if (!isLocked && !isActive) {
                                                        handleSelectNewType(type);
                                                    }
                                                }}
                                                className={`relative flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer
                                                ${isActive ? 'bg-indigo-50 border-indigo-200 opacity-50 cursor-default' : ''}
                                                ${isLocked ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:bg-slate-50 hover:border-slate-200 dark:hover:bg-slate-800 dark:hover:border-slate-700'}
                                                ${!isActive && !isLocked ? 'border-transparent' : ''}
                                            `}
                                                title={isLocked ? "Available on Pro Plan" : cfg.label}
                                                disabled={isActive || isLocked}
                                            >
                                                {isLocked && <div className="absolute top-0.5 right-0.5 z-10"><Lock size={8} className="text-slate-500 fill-slate-200" /></div>}
                                                <div className={`w-6 h-6 rounded flex items-center justify-center mb-1 ${cfg.bg}`}>
                                                    {React.cloneElement(cfg.icon as React.ReactElement<any>, { size: 12, color: 'white' })}
                                                </div>
                                                <span className="text-[8px] text-slate-600 dark:text-slate-400 truncate w-full text-center leading-tight">{cfg.label}</span>
                                            </button>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Common styling props for the main node container to support smart connect feedback
    const getContainerProps = () => ({
        onClick: handleNodeClick,
        className: `
         relative flex flex-col items-center group transition-all duration-200
         ${isGlobalConnecting && !data.isConnectSource ? 'cursor-pointer hover:scale-105' : ''}
      `
    });

    // Visual Overlay when waiting for connection target
    const TargetOverlay = () => {
        if (isGlobalConnecting && !data.isConnectSource) {
            return (
                <div className="absolute inset-[-4px] z-[80] rounded-xl bg-cyan-500/20 border-2 border-dashed border-cyan-500 animate-pulse pointer-events-none"></div>
            );
        }
        return null;
    };

    // 0. NOTE (Sticky Note - iOS Style Auto-Grow)
    if (isNote) {
        // Logic for hiding note in presentation mode
        // If presentation mode is active AND showNotes is false, we hide it visually
        // Also, if isTransparent is true, it means it's manually set to "Ghost Mode"
        // Ghost Mode in Builder = 50% opacity. Ghost Mode in Presentation = Hidden.

        const isHiddenInPresentation = isPresentation && (data.showNotes === false || data.isTransparent);

        // If transparent in builder mode, lower opacity significantly to see behind it
        const noteOpacityClass = !isPresentation && data.isTransparent ? 'opacity-50 hover:opacity-100 transition-opacity' : 'opacity-100';

        // Combined class logic
        const containerClass = isHiddenInPresentation ? 'opacity-0 pointer-events-none' : noteOpacityClass;

        return (
            <div {...getContainerProps()} className={`group`}>
                <NodeToolbar />

                {/* Note Content Wrapper - This gets the opacity class, keeping Toolbar visible */}
                <div className={containerClass}>
                    {/* Label floating ABOVE the note */}
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap">
                        {renderLabel()}
                    </div>

                    {/* Note Container - iOS Style: Gold Header, Perforated Edge, White Lined Body */}
                    <div className={`
                      w-[150px] min-h-[130px] h-auto shadow-xl hover:shadow-2xl transition-all duration-300 relative rounded-2xl overflow-hidden
                      bg-[#fdfbf7] border border-slate-200
                      flex flex-col
                      ${selected && !isPresentation ? 'ring-2 ring-cyan-500 rotate-0' : 'hover:scale-105'}
                  `}>
                        <TargetOverlay />

                        {/* 1. Golden Top Header */}
                        <div className="h-8 w-full bg-[#fbbf24] flex-shrink-0 relative z-10"></div>

                        {/* 2. Perforation/Shadow Effect (Below Header) */}
                        {/* Using a dotted border to simulate the torn paper look typical of iOS notes icon */}
                        <div className="h-2 w-full bg-[#fdfbf7] border-b-4 border-dotted border-slate-300/50 flex-shrink-0 relative -top-1 z-0"></div>

                        {/* 3. Content Area (Lined paper effect with gray lines) */}
                        <textarea
                            ref={noteTextAreaRef}
                            className={`
                            nodrag w-full bg-transparent resize-none outline-none p-3 text-xs font-medium text-slate-700 placeholder-slate-400 leading-relaxed overflow-hidden block box-border note-lined-paper
                            ${isPresentation ? 'pointer-events-none' : ''}
                        `}
                            value={noteBody}
                            onChange={handleNoteBodyChange}
                            onKeyDown={(e) => e.stopPropagation()}
                            placeholder="Type your note..."
                            onClick={(e) => e.stopPropagation()}
                            rows={1}
                        />

                        {/* Handles for connecting the note to strategy elements */}
                        {renderHandles()}
                    </div>
                </div>
            </div>
        );
    }

    // 1. PAGE NODES (Browser Wireframe Style)
    if (isPage) {
        let Content = null;
        switch (data.type) {
            case NodeType.WEBINAR:
                Content = <WireframeWebinar />;
                break;
            case NodeType.LIVE_WEBINAR:
                Content = <WireframeLive />;
                break;
            case NodeType.POPUP:
                Content = <WireframePopup />;
                break;
            case NodeType.DOWNLOAD_PAGE:
                Content = <WireframeDownload />;
                break;
            case NodeType.CALENDAR_PAGE:
                Content = <WireframeCalendar />;
                break;
            case NodeType.OPTIN_PAGE:
                Content = <WireframeOptin />;
                break;
            case NodeType.ORDER_PAGE:
                Content = <WireframeOrderPage />;
                break;
            case NodeType.GENERIC_PAGE:
                Content = <WireframeGeneric />;
                break;
            case NodeType.SYSTEM_PAGE:
                Content = <WireframeSystem />;
                break;
            case NodeType.ECOMMERCE_PAGE:
                Content = <WireframeEcommerce />;
                break;
            case NodeType.VSL:
                Content = <><WireframeVideo /><div className="w-full px-1 mb-1"><div className="h-1 w-full bg-slate-100 rounded mb-0.5"></div><div className="h-1 w-2/3 bg-slate-100 rounded"></div></div><WireframeButton color="bg-orange-500" text="YES! I WANT THIS" /></>;
                break;
            case NodeType.LANDING_PAGE:
                Content = <><div className="h-2 w-1/2 bg-slate-200 rounded mb-2 mx-auto"></div><WireframeLines count={2} /><WireframeForm fields={2} /><WireframeButton color="bg-blue-600" text="SUBSCRIBE" /></>;
                break;
            case NodeType.CHECKOUT:
                // Changed color to Black/Slate-900 to match request
                Content = <><div className="h-2 w-full bg-slate-100 mb-2 border-b border-slate-100"></div><WireframeCheckout /><WireframeButton color="bg-slate-900" text="COMPLETE ORDER" /></>;
                break;
            case NodeType.THANK_YOU:
                Content = (
                    <div className="flex flex-col items-center justify-center h-full pt-2">
                        <div className="w-8 h-8 rounded-full border-2 border-green-500 flex items-center justify-center mb-1">
                            <Check size={16} className="text-green-500" />
                        </div>
                        <div className="h-1 w-1/2 bg-slate-100 rounded mb-2"></div>
                        {/* Changed color to Green-600 to match request */}
                        <WireframeButton color="bg-green-600" text="CONGRATULATIONS" width="w-[90%]" />
                    </div>
                );
                break;
            case NodeType.QUIZ:
                Content = <WireframeQuiz />;
                break;
            case NodeType.BLOG:
                Content = <WireframeBlog />;
                break;
            case NodeType.MEMBERSHIP_AREA:
                Content = <WireframeCourseArea />;
                break;
            default:
                Content = <><WireframeVideo /><WireframeButton color={data.type === NodeType.DOWNSELL ? "bg-slate-500" : "bg-red-500"} text={data.type === NodeType.DOWNSELL ? "NO, WAIT..." : "ADD TO ORDER"} /><div className="mt-1 w-1/2 h-1 bg-slate-200 mx-auto rounded"></div></>;
                break;
        }

        return (
            <div {...getContainerProps()}>
                <NodeToolbar />
                {renderLabel()}

                {/* Main Box */}
                <div className={`relative w-[120px] h-[150px] group`}>

                    {/* Visual Content - THIS has overflow hidden */}
                    <div className={`
                absolute inset-0 rounded-md shadow-lg border overflow-hidden flex flex-col transition-all duration-300 bg-white
                ${selected && !isPresentation ? 'ring-2 ring-cyan-500 border-transparent shadow-cyan-500/20' : 'border-slate-300'}
                ${!isPresentation && !isGlobalConnecting ? 'hover:shadow-xl hover:-translate-y-1' : ''}
            `}>
                        <TargetOverlay />
                        <BrowserHeader />
                        <div className="flex-1 p-2 flex flex-col items-center">{Content}</div>
                    </div>

                    {/* Handles - Rendered OUTSIDE */}
                    {renderHandles()}
                </div>
            </div>
        );
    }

    // 2. APP ICON STYLE (Traffic, Communication, Ops)
    if (isAppIcon) {
        const { bg, borderColor, icon: IconComponent } = config;

        return (
            <div {...getContainerProps()} className={`${getContainerProps().className} min-w-[80px]`}>
                <NodeToolbar />

                {renderLabel('mb-1.5')}

                <div className={`
                w-14 h-14 rounded-2xl flex items-center justify-center shadow-md border-b-4 transition-all duration-300 relative
                ${bg} ${borderColor}
                ${selected && !isPresentation ? 'ring-2 ring-offset-2 ring-cyan-500 scale-105' : ''}
                ${!isPresentation && !isGlobalConnecting ? 'hover:scale-110 hover:-translate-y-1' : ''}
            `}>
                    <TargetOverlay />
                    {React.isValidElement(IconComponent) ? React.cloneElement(IconComponent as React.ReactElement<any>, { size: 30, color: 'white' }) : null}
                    {renderHandles()}
                </div>
            </div>
        );
    }

    // 3. DIAMOND SHAPES (Purchase & A/B Test)
    if (isDiamondShape) {
        let diamondBg = 'bg-green-500';
        let ringColor = 'ring-green-400';
        if (data.type === NodeType.AB_TEST) {
            diamondBg = 'bg-orange-500';
            ringColor = 'ring-orange-400';
        }

        return (
            <div {...getContainerProps()}>
                <NodeToolbar />
                {isEditing ? (
                    <input
                        ref={inputRef} type="text" value={currentLabel} onChange={(e) => setCurrentLabel(e.target.value)} onBlur={handleFinishRename} onKeyDown={onKeyDown}
                        className="nodrag mb-1 px-1 py-0.5 rounded text-[10px] font-bold text-center min-w-[60px] w-[80px] bg-white dark:bg-slate-800 border border-cyan-500 text-slate-800 dark:text-white outline-none z-50 pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                        title="Rename Node"
                        placeholder="Nome"
                    />
                ) : (
                    <div className={`mb-1 px-2 py-0.5 rounded text-[10px] font-bold text-center transition-colors ${selected && !isPresentation ? 'bg-cyan-600 text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                        {data.label}
                    </div>
                )}

                <div className={`w-12 h-12 rotate-45 shadow-md flex items-center justify-center border-2 transition-all relative ${selected && !isPresentation ? `border-white ring-2 ${ringColor}` : 'border-white'} ${diamondBg} `}>
                    <div className="absolute inset-0 -rotate-45"><TargetOverlay /></div>

                    {/* Icon Rendering inside Diamond */}
                    <div className="-rotate-45 text-white">
                        {data.type === NodeType.PURCHASE_SUB && <BadgeCheck size={20} />}
                        {data.type === NodeType.AB_TEST && <Split size={20} />}
                    </div>

                    {/* Handles for Diamond */}
                    {(() => {
                        const interact = isPresentation ? "pointer-events-none" : "cursor-crosshair";
                        const base = `absolute w-12 h-12 !bg-transparent !border-none flex items-center justify-center ${interact} pointer-events-auto nodrag`;

                        const VisualDot = () => (
                            <div className={`
                            w-3.5 h-3.5 min-w-[14px] min-h-[14px] bg-cyan-500 rounded-full border-2 border-white shadow-sm transition-all duration-200 pointer-events-none
                            ${isPresentation ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}
                            group-hover:scale-125
                        `}></div>
                        );

                        const positions = [
                            { pos: Position.Top, id: 'top', class: '-top-3 left-1/2 -translate-x-1/2' },
                            { pos: Position.Right, id: 'right', class: '-right-3 top-1/2 -translate-y-1/2' },
                            { pos: Position.Bottom, id: 'bottom', class: '-bottom-3 left-1/2 -translate-x-1/2' },
                            { pos: Position.Left, id: 'left', class: '-left-3 top-1/2 -translate-y-1/2' }
                        ];

                        return (
                            <>
                                {positions.map(({ pos, id: hid, class: cls }) => (
                                    <React.Fragment key={hid}>
                                        <Handle
                                            type="target"
                                            position={pos}
                                            id={`${hid}-target`}
                                            className={`${base} ${cls} opacity-0`}
                                            style={{ zIndex: 50 }}
                                        />
                                        <Handle
                                            type="source"
                                            position={pos}
                                            id={`${hid}-source`}
                                            className={`${base} ${cls} 
                                                [&>div]:hover:scale-150 
                                                [&>div]:hover:!opacity-100 
                                                [&>div]:hover:bg-cyan-500 
                                                [&>div]:hover:border-white 
                                                [&>div]:hover:shadow-lg
                                                active:scale-90 transition-all
                                            `}
                                            style={{ zIndex: 51 }}
                                        >
                                            <VisualDot />
                                        </Handle>
                                    </React.Fragment>
                                ))}
                            </>
                        );
                    })()}
                </div>
            </div>
        );
    }

    return null;
};

export default memo(CustomNode);
