import { getPortPosition, edgePath, tempEdgePath } from '../constants.js'

/**
 * SVG overlay that renders all permanent edges and the in-progress
 * "rubber-band" edge while the user is dragging from a port.
 *
 * The SVG has pointer-events:none so it is transparent to interactions
 * except for the invisible wide hit-area on each edge (pointer-events:stroke).
 */
export default function EdgeLayer({
  nodes,
  edges,
  connecting,    // { fromNodeId, fromPort, fromX, fromY } | null
  tempEdgeEnd,   // { x, y } cursor position while connecting
  onEdgeClick,   // (edgeId) => void  — clicking an edge deletes it
}) {
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]))

  return (
    <svg
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <defs>
        {/* Arrowhead for permanent edges */}
        <marker
          id="arrow"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L8,3 L0,6" fill="none" stroke="rgba(148,163,184,0.55)" strokeWidth="1" />
        </marker>

        {/* Arrowhead for the live rubber-band edge */}
        <marker
          id="arrow-live"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L8,3 L0,6" fill="none" stroke="rgba(129,140,248,0.85)" strokeWidth="1" />
        </marker>
      </defs>

      {/* ── Permanent edges ─────────────────────────────── */}
      {edges.map(edge => {
        const fromNode = nodeMap[edge.from]
        const toNode   = nodeMap[edge.to]
        if (!fromNode || !toNode) return null

        const fp = getPortPosition(fromNode, edge.fromPort)
        const tp = getPortPosition(toNode,   edge.toPort)
        const d  = edgePath(fp.x, fp.y, edge.fromPort, tp.x, tp.y, edge.toPort)

        return (
          <g key={edge.id}>
            {/* Wide transparent hit-area for clicking */}
            <path
              d={d}
              fill="none"
              stroke="transparent"
              strokeWidth={14}
              style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
              onClick={e => { e.stopPropagation(); onEdgeClick(edge.id) }}
            />
            {/* Visible edge */}
            <path
              d={d}
              fill="none"
              stroke="rgba(148,163,184,0.38)"
              strokeWidth={1.5}
              markerEnd="url(#arrow)"
              style={{ pointerEvents: 'none' }}
            />
          </g>
        )
      })}

      {/* ── Rubber-band (in-progress) edge ──────────────── */}
      {connecting && tempEdgeEnd && (
        <path
          d={tempEdgePath(
            connecting.fromX,
            connecting.fromY,
            connecting.fromPort,
            tempEdgeEnd.x,
            tempEdgeEnd.y,
          )}
          fill="none"
          stroke="rgba(129,140,248,0.7)"
          strokeWidth={1.5}
          strokeDasharray="6 3"
          markerEnd="url(#arrow-live)"
          style={{ pointerEvents: 'none' }}
        />
      )}
    </svg>
  )
}
