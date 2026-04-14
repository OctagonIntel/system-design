import { useEffect, useMemo } from 'react'
import { NODE_WIDTH, NODE_HEIGHT, TYPE_MAP, THREAT_MAP } from '../constants.js'
import NodeIcon from './NodeIcon.jsx'
import styles from './DiagramOverview.module.css'

const LEVEL_SCORE = { critical: 4, high: 3, medium: 2, low: 1 }
const SEVERE = new Set(['critical', 'high'])
const MINIMAP_PAD = 60

function riskRating(nodes) {
  const rated = nodes.filter(n => n.threatLevel)
  if (rated.length === 0) return null
  const avg = rated.reduce((s, n) => s + LEVEL_SCORE[n.threatLevel], 0) / rated.length
  if (avg >= 3.5) return { label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' }
  if (avg >= 2.5) return { label: 'At Risk',  color: '#f97316', bg: 'rgba(249,115,22,0.12)' }
  if (avg >= 1.5) return { label: 'Moderate', color: '#eab308', bg: 'rgba(234,179,8,0.12)' }
  return               { label: 'Secure',    color: '#22c55e', bg: 'rgba(34,197,94,0.12)' }
}

export default function DiagramOverview({ nodes, edges, onClose }) {
  /* ── Escape key ────────────────────────────────────── */
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  /* ── Computed values ───────────────────────────────── */
  const nodeMap = useMemo(
    () => Object.fromEntries(nodes.map(n => [n.id, n])),
    [nodes]
  )

  const { viewBox, scaledNodes, scaledEdges } = useMemo(() => {
    if (nodes.length === 0) {
      return { viewBox: '0 0 800 400', scaledNodes: [], scaledEdges: [] }
    }
    const minX = Math.min(...nodes.map(n => n.x)) - MINIMAP_PAD
    const minY = Math.min(...nodes.map(n => n.y)) - MINIMAP_PAD
    const maxX = Math.max(...nodes.map(n => n.x + NODE_WIDTH))  + MINIMAP_PAD
    const maxY = Math.max(...nodes.map(n => n.y + NODE_HEIGHT)) + MINIMAP_PAD
    return {
      viewBox: `${minX} ${minY} ${maxX - minX} ${maxY - minY}`,
      scaledNodes: nodes,
      scaledEdges: edges,
    }
  }, [nodes, edges])

  const byType = useMemo(() => {
    const map = {}
    for (const n of nodes) {
      map[n.type] = (map[n.type] || 0) + 1
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [nodes])

  const attackPaths = useMemo(
    () => edges.filter(e =>
      SEVERE.has(nodeMap[e.from]?.threatLevel) || SEVERE.has(nodeMap[e.to]?.threatLevel)
    ),
    [edges, nodeMap]
  )

  const risk       = useMemo(() => riskRating(nodes), [nodes])
  const unassessed = useMemo(() => nodes.filter(n => !n.threatLevel), [nodes])

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* ── Header ─────────────────────────────────── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            <span className={styles.title}>Diagram Overview</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} title="Close (Esc)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Minimap ─────────────────────────────────── */}
        <div className={styles.minimapWrapper}>
          {nodes.length === 0 ? (
            <div className={styles.minimapEmpty}>No nodes on canvas</div>
          ) : (
            <svg
              className={styles.minimap}
              viewBox={viewBox}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Edges — straight lines */}
              {scaledEdges.map(edge => {
                const from = nodeMap[edge.from]
                const to   = nodeMap[edge.to]
                if (!from || !to) return null
                const x1 = from.x + NODE_WIDTH  / 2
                const y1 = from.y + NODE_HEIGHT / 2
                const x2 = to.x   + NODE_WIDTH  / 2
                const y2 = to.y   + NODE_HEIGHT / 2
                return (
                  <line
                    key={edge.id}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="2"
                  />
                )
              })}

              {/* Nodes */}
              {scaledNodes.map(node => {
                const meta    = TYPE_MAP[node.type]
                const threat  = node.threatLevel ? THREAT_MAP[node.threatLevel] : null
                const color   = meta?.color ?? '#818cf8'
                const rx      = 8

                return (
                  <g key={node.id}>
                    {/* Threat glow ring */}
                    {threat && (
                      <rect
                        x={node.x - 3} y={node.y - 3}
                        width={NODE_WIDTH + 6} height={NODE_HEIGHT + 6}
                        rx={rx + 2}
                        fill="none"
                        stroke={threat.color}
                        strokeWidth="2.5"
                        opacity="0.6"
                      />
                    )}
                    {/* Node body */}
                    <rect
                      x={node.x} y={node.y}
                      width={NODE_WIDTH} height={NODE_HEIGHT}
                      rx={rx}
                      fill={`color-mix(in srgb, ${color} 10%, #0e0e1a)`}
                      stroke={color}
                      strokeWidth="1.2"
                      strokeOpacity="0.4"
                    />
                    {/* Label */}
                    <text
                      x={node.x + NODE_WIDTH / 2}
                      y={node.y + NODE_HEIGHT / 2 + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="11"
                      fill="#cbd5e1"
                      fontFamily="system-ui, sans-serif"
                    >
                      {node.label || meta?.label || node.type}
                    </text>
                  </g>
                )
              })}
            </svg>
          )}
        </div>

        {/* ── Summary grid ────────────────────────────── */}
        <div className={styles.summaryGrid}>

          {/* Card 1 — Nodes by type */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Nodes by Type</div>
            {byType.length === 0 ? (
              <p className={styles.cardEmpty}>No nodes</p>
            ) : (
              <table className={styles.typeTable}>
                <tbody>
                  {byType.map(([type, count]) => {
                    const meta = TYPE_MAP[type]
                    return (
                      <tr key={type} className={styles.typeRow}>
                        <td className={styles.typeIcon}>
                          <NodeIcon type={type} size={14} color={meta?.color ?? '#818cf8'} />
                        </td>
                        <td className={styles.typeName}>{meta?.label ?? type}</td>
                        <td className={styles.typeCount}>{count}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Card 2 — Connections */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Connections</div>
            <div className={styles.statRow}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
              <span className={styles.statLabel}>Total edges</span>
              <span className={styles.statValue}>{edges.length}</span>
            </div>
            <div className={styles.statRow}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <circle cx="12" cy="16" r="1" fill="#f97316" stroke="none" />
              </svg>
              <span className={styles.statLabel}>Attack paths</span>
              <span className={`${styles.statValue} ${attackPaths.length > 0 ? styles.statDanger : ''}`}>
                {attackPaths.length}
              </span>
            </div>
            {attackPaths.length > 0 && (
              <p className={styles.attackNote}>
                Edges touching Critical or High nodes
              </p>
            )}
          </div>

          {/* Card 3 — Risk score */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Overall Risk</div>
            {risk ? (
              <div
                className={styles.riskBadge}
                style={{ color: risk.color, background: risk.bg, borderColor: risk.color + '44' }}
              >
                {risk.label}
              </div>
            ) : (
              <div className={styles.riskNone}>No threat data</div>
            )}

            {unassessed.length > 0 && (
              <div className={styles.unassessedList}>
                <div className={styles.unassessedHeader}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span>{unassessed.length} unassessed node{unassessed.length !== 1 ? 's' : ''}</span>
                </div>
                <ul className={styles.unassessedItems}>
                  {unassessed.map(n => (
                    <li key={n.id} className={styles.unassessedItem}>
                      {n.label || TYPE_MAP[n.type]?.label || n.type}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
