import { getPortPosition, edgePath, tempEdgePath } from '../constants.js'
import styles from './EdgeLayer.module.css'

/**
 * SVG overlay for all permanent edges and the in-progress rubber-band edge.
 *
 * Edge types:
 *   'connect' — default bezier, grey, click-to-delete
 *   'attack'  — dashed animated red bezier, filled arrowhead, click-to-select
 *
 * The SVG is pointer-events:none so only explicit hit-area paths receive events.
 */
export default function EdgeLayer({
  nodes,
  edges,
  edgeMode,       // 'connect' | 'attack' — colours the rubber-band edge
  connecting,     // { fromNodeId, fromPort, fromX, fromY } | null
  tempEdgeEnd,    // { x, y } cursor position while connecting
  selectedEdgeId, // id of the currently selected attack edge | null
  onEdgeClick,    // (edgeId) => void  — for connect edges (delete)
  onEdgeSelect,   // (edgeId) => void  — for attack edges (select/label)
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
        {/* Arrowhead — connect edges (open, grey) */}
        <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3"
          orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L8,3 L0,6" fill="none" stroke="rgba(148,163,184,0.55)" strokeWidth="1" />
        </marker>

        {/* Arrowhead — connect rubber-band (open, indigo) */}
        <marker id="arrow-live" markerWidth="8" markerHeight="6" refX="7" refY="3"
          orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L8,3 L0,6" fill="none" stroke="rgba(129,140,248,0.85)" strokeWidth="1" />
        </marker>

        {/* Arrowhead — attack edges (solid, red) */}
        <marker id="attack-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3"
          orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L8,3 L0,6 Z" fill="rgba(239,68,68,0.9)" stroke="none" />
        </marker>

        {/* Arrowhead — attack rubber-band (solid, red, dimmer) */}
        <marker id="attack-arrow-live" markerWidth="8" markerHeight="6" refX="7" refY="3"
          orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L8,3 L0,6 Z" fill="rgba(239,68,68,0.6)" stroke="none" />
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

        if (edge.type === 'attack') {
          const isSelected = edge.id === selectedEdgeId
          return (
            <g key={edge.id}>
              {/* Wide hit area — select on click */}
              <path
                d={d}
                fill="none"
                stroke="transparent"
                strokeWidth={14}
                style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                onClick={e => { e.stopPropagation(); onEdgeSelect(edge.id) }}
              />
              {/* Visible attack edge */}
              <path
                d={d}
                fill="none"
                stroke={isSelected ? 'rgba(239,68,68,0.95)' : 'rgba(239,68,68,0.72)'}
                strokeWidth={isSelected ? 2 : 1.5}
                markerEnd="url(#attack-arrow)"
                className={isSelected ? styles.attackPathSelected : styles.attackPath}
                style={{ pointerEvents: 'none' }}
              />
            </g>
          )
        }

        /* default: connect edge */
        return (
          <g key={edge.id}>
            <path
              d={d}
              fill="none"
              stroke="transparent"
              strokeWidth={14}
              style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
              onClick={e => { e.stopPropagation(); onEdgeClick(edge.id) }}
            />
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
        edgeMode === 'attack' ? (
          <path
            d={tempEdgePath(
              connecting.fromX, connecting.fromY, connecting.fromPort,
              tempEdgeEnd.x, tempEdgeEnd.y,
            )}
            fill="none"
            stroke="rgba(239,68,68,0.65)"
            strokeWidth={1.5}
            strokeDasharray="8 6"
            markerEnd="url(#attack-arrow-live)"
            style={{ pointerEvents: 'none' }}
          />
        ) : (
          <path
            d={tempEdgePath(
              connecting.fromX, connecting.fromY, connecting.fromPort,
              tempEdgeEnd.x, tempEdgeEnd.y,
            )}
            fill="none"
            stroke="rgba(129,140,248,0.7)"
            strokeWidth={1.5}
            strokeDasharray="6 3"
            markerEnd="url(#arrow-live)"
            style={{ pointerEvents: 'none' }}
          />
        )
      )}
    </svg>
  )
}
