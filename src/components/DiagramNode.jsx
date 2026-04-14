import { useState, useRef } from 'react'
import { NODE_WIDTH, NODE_HEIGHT, TYPE_MAP, PORTS, THREAT_LEVELS, THREAT_MAP } from '../constants.js'
import NodeIcon from './NodeIcon.jsx'
import styles from './DiagramNode.module.css'

const PORT_R = 5   // radius in px

/** Pixel offsets for each port dot relative to node top-left */
function portStyle(port) {
  const half = PORT_R
  switch (port) {
    case 'top':    return { top:  -half,                   left: NODE_WIDTH  / 2 - half }
    case 'bottom': return { top:  NODE_HEIGHT - half,      left: NODE_WIDTH  / 2 - half }
    case 'left':   return { top:  NODE_HEIGHT / 2 - half,  left: -half }
    case 'right':  return { top:  NODE_HEIGHT / 2 - half,  left: NODE_WIDTH - half }
  }
}

export default function DiagramNode({
  node,
  isSelected,
  showPorts,          // true while any edge-connect drag is active
  threatMode,         // bool — threat model mode is active
  threatDropdownOpen, // bool — this node's dropdown is open
  onClick,
  onMouseDown,        // (e, nodeId) — start moving
  onPortMouseDown,    // (e, nodeId, port) — start connecting
  onLabelChange,
  onThreatClick,      // (nodeId) — toggle dropdown
  onSetThreat,        // (nodeId, level | null) — commit a level
}) {
  const { id, type, x, y, label, threatLevel } = node
  const meta   = TYPE_MAP[type]   ?? { color: '#64748b', label: type }
  const threat = THREAT_MAP[threatLevel] ?? null

  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(label)
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

  /* ── click routing ──────────────────────────────────── */
  function handleClick(e) {
    e.stopPropagation()
    if (threatMode) {
      onThreatClick(id)
    } else {
      onClick(id)
    }
  }

  /* ── threat glow ring ───────────────────────────────── */
  const threatStyle = threat
    ? { '--tc': threat.color, boxShadow: `0 0 0 2px ${threat.color}, 0 0 14px color-mix(in srgb, ${threat.color} 40%, transparent)` }
    : {}

  return (
    <div
      className={[
        styles.node,
        isSelected && !threatMode ? styles.selected : '',
        threatMode ? styles.threatModeActive : '',
      ].join(' ')}
      style={{
        left: x,
        top:  y,
        width:  NODE_WIDTH,
        height: NODE_HEIGHT,
        '--nc': meta.color,
        ...threatStyle,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
      onMouseDown={e => { onMouseDown(e, id) }}
      onDoubleClick={threatMode ? undefined : startEdit}
    >
      {/* Colored left accent stripe */}
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

      {/* Threat level badge — visible in threat mode or when level is set */}
      {(threatMode || threat) && (
        <div
          className={styles.threatBadge}
          style={threat ? { '--tc': threat.color, background: threat.bg, borderColor: threat.color } : {}}
        >
          {threat ? threat.label : '—'}
        </div>
      )}

      {/* Connection ports */}
      {!threatMode && PORTS.map(port => (
        <div
          key={port}
          className={`${styles.port} ${portsVisible ? styles.portOn : ''}`}
          style={{ width: PORT_R * 2, height: PORT_R * 2, ...portStyle(port) }}
          onMouseDown={e => {
            e.stopPropagation()
            e.preventDefault()
            onPortMouseDown(e, id, port)
          }}
        />
      ))}

      {/* Threat level dropdown */}
      {threatMode && threatDropdownOpen && (
        <div className={styles.dropdown} onClick={e => e.stopPropagation()}>
          <div className={styles.dropdownHeader}>Set threat level</div>
          {THREAT_LEVELS.map(t => (
            <button
              key={t.level}
              className={`${styles.dropdownOption} ${threatLevel === t.level ? styles.optionActive : ''}`}
              style={{ '--tc': t.color }}
              onClick={e => {
                e.stopPropagation()
                onSetThreat(id, t.level)
                onThreatClick(null)
              }}
            >
              <span className={styles.optionDot} />
              {t.label}
              {threatLevel === t.level && (
                <svg className={styles.checkIcon} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
          {threatLevel && (
            <button
              className={styles.clearOption}
              onClick={e => {
                e.stopPropagation()
                onSetThreat(id, null)
                onThreatClick(null)
              }}
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  )
}
