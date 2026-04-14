import { useState, useRef } from 'react'
import { NODE_WIDTH, NODE_HEIGHT, TYPE_MAP, PORTS } from '../constants.js'
import NodeIcon from './NodeIcon.jsx'
import styles from './DiagramNode.module.css'

const PORT_R = 5   // radius in px

/** Pixel offsets for each port dot relative to node top-left */
function portStyle(port) {
  const half = PORT_R
  switch (port) {
    case 'top':    return { top:  -half,           left: NODE_WIDTH  / 2 - half }
    case 'bottom': return { top:  NODE_HEIGHT - half, left: NODE_WIDTH  / 2 - half }
    case 'left':   return { top:  NODE_HEIGHT / 2 - half, left: -half }
    case 'right':  return { top:  NODE_HEIGHT / 2 - half, left: NODE_WIDTH - half }
  }
}

export default function DiagramNode({
  node,
  isSelected,
  showPorts,          // true while any edge-connect drag is active
  onClick,
  onMouseDown,        // (e, nodeId) — start moving
  onPortMouseDown,    // (e, nodeId, port) — start connecting
  onLabelChange,
}) {
  const { id, type, x, y, label } = node
  const meta = TYPE_MAP[type] ?? { color: '#64748b', label: type }

  const [hovered, setHovered]   = useState(false)
  const [editing, setEditing]   = useState(false)
  const [draft,   setDraft]     = useState(label)
  const inputRef = useRef(null)

  const portsVisible = hovered || isSelected || showPorts

  /* ── label editing ──────────────────────────────────── */
  function startEdit(e) {
    e.stopPropagation()
    setDraft(label)
    setEditing(true)
    requestAnimationFrame(() => inputRef.current?.select())
  }

  function commitEdit() {
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed && trimmed !== label) onLabelChange(id, trimmed)
  }

  function onInputKey(e) {
    e.stopPropagation()
    if (e.key === 'Enter')  commitEdit()
    if (e.key === 'Escape') setEditing(false)
  }

  return (
    <div
      className={`${styles.node} ${isSelected ? styles.selected : ''}`}
      style={{
        left: x,
        top:  y,
        width:  NODE_WIDTH,
        height: NODE_HEIGHT,
        '--nc': meta.color,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={e => { e.stopPropagation(); onClick(id) }}
      onMouseDown={e => {
        // Ports stop propagation themselves; this handles the node body
        onMouseDown(e, id)
      }}
      onDoubleClick={startEdit}
    >
      {/* Accent stripe */}
      <div className={styles.stripe} />

      {/* Body */}
      <div className={styles.body}>
        <div className={styles.iconWrap}>
          <NodeIcon type={type} size={17} color={meta.color} />
        </div>
        <div className={styles.text}>
          {editing ? (
            <input
              ref={inputRef}
              className={styles.labelInput}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={onInputKey}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <span className={styles.label}>{label}</span>
          )}
          <span className={styles.typeTag}>{meta.label}</span>
        </div>
      </div>

      {/* Connection ports */}
      {PORTS.map(port => (
        <div
          key={port}
          className={`${styles.port} ${portsVisible ? styles.portOn : ''}`}
          style={{
            width:  PORT_R * 2,
            height: PORT_R * 2,
            ...portStyle(port),
          }}
          onMouseDown={e => {
            e.stopPropagation()
            e.preventDefault()
            onPortMouseDown(e, id, port)
          }}
        />
      ))}
    </div>
  )
}
