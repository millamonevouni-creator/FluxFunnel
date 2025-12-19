import React, { useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, useReactFlow } from 'reactflow';
import { X } from 'lucide-react';

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected, 
}: EdgeProps) => {
  const { setEdges } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);

  // --- SMART ALIGNMENT LOGIC ---
  // Fixes "wobbly" lines when nodes are vertically aligned but have different widths relative to the grid.
  // If the difference between Source and Target is small (<= 6px), we snap them to the average center.
  
  let sx = sourceX;
  let sy = sourceY;
  let tx = targetX;
  let ty = targetY;

  // Vertical Snap (Force straight vertical line)
  if (Math.abs(sx - tx) <= 6) {
      const avg = (sx + tx) / 2;
      sx = avg;
      tx = avg;
  }

  // Horizontal Snap (Force straight horizontal line)
  if (Math.abs(sy - ty) <= 6) {
      const avg = (sy + ty) / 2;
      sy = avg;
      ty = avg;
  }

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition,
    targetX: tx,
    targetY: ty,
    targetPosition,
  });

  const onEdgeClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    setEdges((edges) => edges.filter((e) => e.id !== id));
  };

  // Dynamic style based on selection
  const edgeStyle = {
    ...style,
    stroke: selected ? '#06b6d4' : (style.stroke || '#64748b'), // Cyan-500 when selected
    strokeWidth: selected ? 3 : (style.strokeWidth || 2),
    filter: selected ? 'drop-shadow(0 0 2px rgba(6, 182, 212, 0.4))' : 'none',
    transition: 'all 0.2s ease',
  };

  return (
    <>
      {/* Visible Path - Rendered first (bottom layer) */}
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={edgeStyle} 
      />

      {/* Invisible thicker path for easier hover/click detection - Rendered second (top layer) to capture events */}
      <path
        d={edgePath}
        fill="none"
        strokeOpacity={0}
        strokeWidth={20}
        className="react-flow__edge-interaction"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ cursor: 'pointer' }}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
            // Show delete button if hovered OR selected
            opacity: isHovered || selected ? 1 : 0, 
            transition: 'opacity 0.2s ease-in-out',
            zIndex: 1000,
          }}
          className="nodrag nopan"
          onMouseEnter={() => setIsHovered(true)} // Keep visible when hovering the button itself
          onMouseLeave={() => setIsHovered(false)}
        >
          <button
            className={`
                w-6 h-6 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer border
                ${selected ? 'bg-red-500 text-white border-red-600 scale-110' : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-red-500 hover:text-white'}
            `}
            onClick={onEdgeClick}
            title="Delete Connection"
          >
            <X size={12} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;