import { useState, useRef, useEffect, useMemo } from 'react'
import { getPortPosition, edgeMidpoint, NODE_WIDTH, NODE_HEIGHT, PORTS, bestPort } from '../constants.js'
import DiagramNode  from './DiagramNode.jsx'
import EdgeLayer    from './EdgeLayer.jsx'
import ThreatLegend from './ThreatLegend.jsx'
import styles from './Canvas.module.css'

const CANVAS_W = 4000
const CANVAS_H = 3000

const ATTACK_LABEL_PRESETS = [
  'SQL Injection', 'XSS', 'CSRF', 'Privilege Escalation',
  'Lateral Movement', 'Data Exfiltration', 'Credential Theft',
  'Man-in-the-Middle', 'Replay Attack', 'Brute Force',
]

export default function Canvas({
  nodes,
  edges,
  selectedId,
  threatMode,
  edgeMode,          // 'connect' | 'attack'
  onDrop,
  onSelectNode,
  onMoveNode,
  onAddEdge,
  onDeleteEdge,
  onLabelChange,
  onDeleteSelected,
  onSetThreat,
  onUpdateEdgeLabel,
}) {
  const scrollRef = useRef(null)   // the overflow:auto viewport
  const canvasRef = useRef(null)   // the large 4000×3000 surface

  // Node-drag state
  const [dragging, setDragging] = useState(null)
  // { nodeId, offsetX, offsetY }

  // Edge-connect state
  const [connecting,  setConnecting]  = useState(null)
  // { fromNodeId, fromPort, fromX, fromY }
  const [tempEdgeEnd, setTempEdgeEnd] = useState(null)
  // { x, y }

  // Which node's threat dropdown is open (null = none)
  const [openThreatId, setOpenThreatId] = useState(null)

  // Selected attack edge (for label editing)
  const [selectedEdgeId, setSelectedEdgeId] = useState(null)

  /* ── Close threat dropdown when exiting threat mode ─── */
  useEffect(() => {
    if (!threatMode) setOpenThreatId(null)
  }, [threatMode])

  /* ── Deselect edge when switching edge modes ─────────── */
  useEffect(() => {
    setSelectedEdgeId(null)
  }, [edgeMode])

  /* ── Scroll to a nice starting position ─────────────── */
  useEffect(() => {
    const s = scrollRef.current
    if (s) { s.scrollLeft = 200; s.scrollTop = 160 }
  }, [])

  /* ── Keyboard shortcuts ──────────────────────────────── */
  useEffect(() => {
    function onKey(e) {
      if (document.activeElement.tagName === 'INPUT') return
      if (!threatMode && (e.key === 'Delete' || e.key === 'Backspace')) {
        if (selectedEdgeId) {
          onDeleteEdge(selectedEdgeId)
          setSelectedEdgeId(null)
        } else {
          onDeleteSelected()
        }
      }
      if (e.key === 'Escape') {
        cancelConnect()
        setOpenThreatId(null)
        setSelectedEdgeId(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDeleteSelected, onDeleteEdge, threatMode, selectedEdgeId])

  /* ── Helpers ─────────────────────────────────────────── */
  function canvasCoords(e) {
    const rect = canvasRef.current.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function cancelConnect() {
    setConnecting(null)
    setTempEdgeEnd(null)
  }

  /* ── Toolbar → canvas drop ───────────────────────────── */
  function onDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  function onDropCanvas(e) {
    e.preventDefault()
    const type = e.dataTransfer.getData('nodeType')
    if (!type) return
    const { x, y } = canvasCoords(e)
    onDrop(type, x, y)
  }

  /* ── Node body mousedown ─────────────────────────────── */
  function handleNodeMouseDown(e, nodeId) {
    if (e.button !== 0) return
    e.stopPropagation()
    if (threatMode) return    // threat mode: no dragging
    const { x, y } = canvasCoords(e)
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return
    setDragging({ nodeId, offsetX: x - node.x, offsetY: y - node.y })
    onSelectNode(nodeId)
  }

  /* ── Port drag (edge creation) ───────────────────────── */
  function handlePortMouseDown(e, nodeId, port) {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return
    const pp = getPortPosition(node, port)
    setConnecting({ fromNodeId: nodeId, fromPort: port, fromX: pp.x, fromY: pp.y })
    setTempEdgeEnd({ x: pp.x, y: pp.y })
  }

  /* ── Threat dropdown toggle ──────────────────────────── */
  function handleThreatClick(nodeId) {
    setOpenThreatId(prev => prev === nodeId ? null : nodeId)
  }

  /* ── Attack edge select (for labeling) ──────────────── */
  function handleEdgeSelect(edgeId) {
    setSelectedEdgeId(prev => prev === edgeId ? null : edgeId)
  }

  /* ── Mouse move ──────────────────────────────────────── */
  function onMouseMove(e) {
    const { x, y } = canvasCoords(e)
    if (dragging) {
      onMoveNode(dragging.nodeId, x - dragging.offsetX, y - dragging.offsetY)
      return
    }
    if (connecting) setTempEdgeEnd({ x, y })
  }

  /* ── Mouse up ────────────────────────────────────────── */
  function onMouseUp(e) {
    if (dragging) { setDragging(null); return }
    if (connecting) {
      const { x, y } = canvasCoords(e)
      tryFinishEdge(x, y)
    }
  }

  function tryFinishEdge(x, y) {
    const HIT = 14
    for (const node of nodes) {
      if (node.id === connecting.fromNodeId) continue

      for (const port of PORTS) {
        const pp = getPortPosition(node, port)
        if (Math.abs(pp.x - x) <= HIT && Math.abs(pp.y - y) <= HIT) {
          onAddEdge(connecting.fromNodeId, connecting.fromPort, node.id, port, edgeMode)
          cancelConnect(); return
        }
      }

      if (x >= node.x && x <= node.x + NODE_WIDTH && y >= node.y && y <= node.y + NODE_HEIGHT) {
        const toPort = bestPort(connecting.fromX, connecting.fromY, node)
        onAddEdge(connecting.fromNodeId, connecting.fromPort, node.id, toPort, edgeMode)
        cancelConnect(); return
      }
    }
    cancelConnect()
  }

  /* ── Canvas background click ─────────────────────────── */
  function onCanvasClick() {
    onSelectNode(null)
    setOpenThreatId(null)
    setSelectedEdgeId(null)
  }

  /* ── Attack edge label midpoints ─────────────────────── */
  const attackEdgePositions = useMemo(() => {
    const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]))
    return edges
      .filter(e => e.type === 'attack')
      .map(edge => {
        const from = nodeMap[edge.from]
        const to   = nodeMap[edge.to]
        if (!from || !to) return null
        const fp  = getPortPosition(from, edge.fromPort)
        const tp  = getPortPosition(to,   edge.toPort)
        const mid = edgeMidpoint(fp.x, fp.y, edge.fromPort, tp.x, tp.y, edge.toPort)
        return { edge, mid }
      })
      .filter(Boolean)
  }, [nodes, edges])

  /* ── Cursor ──────────────────────────────────────────── */
  const cursorClass = connecting  ? styles.connecting
                    : dragging    ? styles.dragging
                    : ''

  /* ── Status bar copy ─────────────────────────────────── */
  const threatsSet  = nodes.filter(n => n.threatLevel).length
  const attackCount = edges.filter(e => e.type === 'attack').length
  const statusHint  = threatMode
    ? `${threatsSet} of ${nodes.length} node${nodes.length !== 1 ? 's' : ''} rated`
    : selectedEdgeId
      ? 'Enter — save label · Esc — close · Delete — remove edge'
      : selectedId
        ? 'Delete — remove selected · Double-click — rename'
        : nodes.length > 0 ? 'Drag port circles to connect nodes' : ''

  return (
    <div className={styles.wrapper}>
      {/* Scrollable viewport */}
      <div ref={scrollRef} className={styles.scroll}>
        <div
          ref={canvasRef}
          className={`${styles.canvas} ${cursorClass} ${threatMode ? styles.threatCanvas : ''}`}
          style={{ width: CANVAS_W, height: CANVAS_H }}
          onDragOver={onDragOver}
          onDrop={onDropCanvas}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={() => { setDragging(null); cancelConnect() }}
          onClick={onCanvasClick}
        >
          {/* Edge / connection overlay */}
          <EdgeLayer
            nodes={nodes}
            edges={edges}
            edgeMode={edgeMode}
            connecting={connecting}
            tempEdgeEnd={tempEdgeEnd}
            selectedEdgeId={selectedEdgeId}
            onEdgeClick={onDeleteEdge}
            onEdgeSelect={handleEdgeSelect}
          />

          {/* Attack edge label badges + edit inputs */}
          {attackEdgePositions.map(({ edge, mid }) => {
            const isSelected = edge.id === selectedEdgeId
            return (
              <div
                key={`label-${edge.id}`}
                style={{
                  position: 'absolute',
                  left: mid.x,
                  top: mid.y,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 50,
                  pointerEvents: 'all',
                }}
              >
                {isSelected ? (
                  <>
                    <input
                      autoFocus
                      list="attack-label-presets"
                      className={styles.attackLabelInput}
                      value={edge.label ?? ''}
                      placeholder="Label attack path…"
                      onChange={ev => onUpdateEdgeLabel(edge.id, ev.target.value)}
                      onKeyDown={ev => {
                        if (ev.key === 'Escape' || ev.key === 'Enter') {
                          setSelectedEdgeId(null)
                        }
                        ev.stopPropagation()
                      }}
                      onClick={ev => ev.stopPropagation()}
                    />
                    <datalist id="attack-label-presets">
                      {ATTACK_LABEL_PRESETS.map(p => <option key={p} value={p} />)}
                    </datalist>
                  </>
                ) : edge.label ? (
                  <span
                    className={styles.attackLabelPill}
                    onClick={ev => { ev.stopPropagation(); setSelectedEdgeId(edge.id) }}
                  >
                    {edge.label}
                  </span>
                ) : null}
              </div>
            )
          })}

          {/* Nodes */}
          {nodes.map(node => (
            <DiagramNode
              key={node.id}
              node={node}
              isSelected={node.id === selectedId}
              showPorts={connecting !== null}
              threatMode={threatMode}
              threatDropdownOpen={node.id === openThreatId}
              onClick={onSelectNode}
              onMouseDown={handleNodeMouseDown}
              onPortMouseDown={handlePortMouseDown}
              onLabelChange={onLabelChange}
              onThreatClick={handleThreatClick}
              onSetThreat={onSetThreat}
            />
          ))}

          {/* Empty-state hint */}
          {nodes.length === 0 && (
            <div className={styles.empty}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                <line x1="12" y1="22" x2="12" y2="15.5" />
                <polyline points="22 8.5 12 15.5 2 8.5" />
              </svg>
              <p className={styles.emptyTitle}>Design your architecture</p>
              <p className={styles.emptyDesc}>Drag components from the sidebar to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Threat legend — floats above the status bar when active */}
      {threatMode && nodes.length > 0 && (
        <ThreatLegend nodes={nodes} />
      )}

      {/* Status bar */}
      <div className={`${styles.statusBar} ${threatMode ? styles.statusThreat : ''}`}>
        {threatMode && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 2 }}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <circle cx="12" cy="16" r="1" fill="#ef4444" stroke="none" />
          </svg>
        )}
        <span>{nodes.length} node{nodes.length !== 1 ? 's' : ''}</span>
        <span className={styles.dot} />
        <span>{edges.length} edge{edges.length !== 1 ? 's' : ''}</span>
        {attackCount > 0 && (
          <>
            <span className={styles.dot} />
            <span style={{ color: 'rgba(239,68,68,0.5)' }}>{attackCount} attack path{attackCount !== 1 ? 's' : ''}</span>
          </>
        )}
        {statusHint && (
          <>
            <span className={styles.dot} />
            <span className={`${styles.hint} ${threatMode ? styles.hintThreat : ''}`}>{statusHint}</span>
          </>
        )}
      </div>
    </div>
  )
}
