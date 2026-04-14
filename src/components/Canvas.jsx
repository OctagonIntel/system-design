import { useState, useRef, useEffect, useCallback } from 'react'
import { getPortPosition, NODE_WIDTH, NODE_HEIGHT, PORTS, bestPort } from '../constants.js'
import DiagramNode from './DiagramNode.jsx'
import EdgeLayer   from './EdgeLayer.jsx'
import styles from './Canvas.module.css'

const CANVAS_W = 4000
const CANVAS_H = 3000

export default function Canvas({
  nodes,
  edges,
  selectedId,
  onDrop,
  onSelectNode,
  onMoveNode,
  onAddEdge,
  onDeleteEdge,
  onLabelChange,
  onDeleteSelected,
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

  /* ── Scroll to a nice starting position ─────────────── */
  useEffect(() => {
    const s = scrollRef.current
    if (s) { s.scrollLeft = 200; s.scrollTop = 160 }
  }, [])

  /* ── Keyboard shortcuts ──────────────────────────────── */
  useEffect(() => {
    function onKey(e) {
      if (document.activeElement.tagName === 'INPUT') return
      if (e.key === 'Delete' || e.key === 'Backspace') onDeleteSelected()
      if (e.key === 'Escape') cancelConnect()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDeleteSelected])

  /* ── Helpers ─────────────────────────────────────────── */
  /** Canvas-relative coords from a pointer event */
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

  /* ── Node body drag (repositioning) ─────────────────── */
  function handleNodeMouseDown(e, nodeId) {
    if (e.button !== 0) return
    e.stopPropagation()
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

  /* ── Mouse move ──────────────────────────────────────── */
  function onMouseMove(e) {
    const { x, y } = canvasCoords(e)

    if (dragging) {
      onMoveNode(dragging.nodeId, x - dragging.offsetX, y - dragging.offsetY)
      return
    }

    if (connecting) {
      setTempEdgeEnd({ x, y })
    }
  }

  /* ── Mouse up ────────────────────────────────────────── */
  function onMouseUp(e) {
    if (dragging) {
      setDragging(null)
      return
    }

    if (connecting) {
      const { x, y } = canvasCoords(e)
      tryFinishEdge(x, y)
    }
  }

  function tryFinishEdge(x, y) {
    const HIT = 14  // px radius for port snapping

    for (const node of nodes) {
      if (node.id === connecting.fromNodeId) continue

      // 1. Check individual ports first (tighter snap)
      for (const port of PORTS) {
        const pp = getPortPosition(node, port)
        if (Math.abs(pp.x - x) <= HIT && Math.abs(pp.y - y) <= HIT) {
          onAddEdge(connecting.fromNodeId, connecting.fromPort, node.id, port)
          cancelConnect()
          return
        }
      }

      // 2. Accept a drop anywhere on the node body
      if (
        x >= node.x && x <= node.x + NODE_WIDTH &&
        y >= node.y && y <= node.y + NODE_HEIGHT
      ) {
        const toPort = bestPort(connecting.fromX, connecting.fromY, node)
        onAddEdge(connecting.fromNodeId, connecting.fromPort, node.id, toPort)
        cancelConnect()
        return
      }
    }

    cancelConnect()
  }

  /* ── Canvas click (deselect) ─────────────────────────── */
  function onCanvasClick() {
    onSelectNode(null)
  }

  /* ── Cursor class ────────────────────────────────────── */
  const cursorClass = connecting ? styles.connecting
                    : dragging  ? styles.dragging
                    : ''

  return (
    <div className={styles.wrapper}>
      {/* Scrollable viewport */}
      <div ref={scrollRef} className={styles.scroll}>
        <div
          ref={canvasRef}
          className={`${styles.canvas} ${cursorClass}`}
          style={{ width: CANVAS_W, height: CANVAS_H }}
          onDragOver={onDragOver}
          onDrop={onDropCanvas}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={() => {
            setDragging(null)
            cancelConnect()
          }}
          onClick={onCanvasClick}
        >
        {/* Edge / connection overlay */}
        <EdgeLayer
          nodes={nodes}
          edges={edges}
          connecting={connecting}
          tempEdgeEnd={tempEdgeEnd}
          onEdgeClick={onDeleteEdge}
        />

        {/* Nodes */}
        {nodes.map(node => (
          <DiagramNode
            key={node.id}
            node={node}
            isSelected={node.id === selectedId}
            showPorts={connecting !== null}
            onClick={onSelectNode}
            onMouseDown={handleNodeMouseDown}
            onPortMouseDown={handlePortMouseDown}
            onLabelChange={onLabelChange}
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

      {/* Status bar — outside the scroll area so it stays fixed */}
      <div className={styles.statusBar}>
        <span>{nodes.length} node{nodes.length !== 1 ? 's' : ''}</span>
        <span className={styles.dot} />
        <span>{edges.length} edge{edges.length !== 1 ? 's' : ''}</span>
        {selectedId && (
          <>
            <span className={styles.dot} />
            <span className={styles.hint}>Delete — remove selected &nbsp;·&nbsp; Double-click — rename</span>
          </>
        )}
        {!selectedId && nodes.length > 0 && (
          <>
            <span className={styles.dot} />
            <span className={styles.hint}>Drag port circles to connect nodes</span>
          </>
        )}
      </div>
    </div>
  )
}

