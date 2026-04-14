import { useRef } from 'react'
import { NODE_TYPES } from '../constants.js'
import NodeIcon from './NodeIcon.jsx'
import styles from './Toolbar.module.css'

export default function Toolbar({ onClear, nodeCount, threatMode, onToggleThreat, edgeMode, onToggleEdgeMode, onExport, onImport, onOpenOverview }) {
  const fileInputRef = useRef(null)

  function handleDragStart(e, type) {
    e.dataTransfer.setData('nodeType', type)
    e.dataTransfer.effectAllowed = 'copy'
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e) {
    onImport(e)
    // Reset so the same file can be re-imported
    e.target.value = ''
  }

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
          <line x1="12" y1="22" x2="12" y2="15.5" />
          <polyline points="22 8.5 12 15.5 2 8.5" />
        </svg>
        <span className={styles.brandName}>ArchSync</span>
      </div>

      <div className={styles.divider} />

      {/* ── Threat Model toggle ──────────────────────────── */}
      <button
        className={`${styles.threatBtn} ${threatMode ? styles.threatBtnActive : ''}`}
        onClick={onToggleThreat}
        title={threatMode ? 'Exit Threat Model mode' : 'Enter Threat Model mode'}
      >
        {/* Shield + exclamation SVG */}
        <svg
          className={styles.threatIcon}
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
        </svg>
        Threat Model
        {threatMode && <span className={styles.activeIndicator} />}
      </button>

      <div className={styles.divider} />

      {/* ── Edge mode toggle ────────────────────────── */}
      <div className={styles.edgeModeToggle}>
        <button
          className={`${styles.edgeModeBtn} ${edgeMode === 'connect' ? styles.edgeModeBtnActive : ''}`}
          onClick={() => edgeMode !== 'connect' && onToggleEdgeMode()}
          title="Connect mode — standard bezier edges"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
          Connect
        </button>
        <button
          className={`${styles.edgeModeBtn} ${styles.edgeModeBtnAttack} ${edgeMode === 'attack' ? styles.edgeModeBtnAttackActive : ''}`}
          onClick={() => edgeMode !== 'attack' && onToggleEdgeMode()}
          title="Attack Path mode — draw threat vector edges"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" strokeDasharray="3 2" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
          Attack Path
        </button>
      </div>

      {/* ── Overview button ──────────────────────────── */}
      <button
        className={styles.overviewBtn}
        onClick={onOpenOverview}
        title="Open Diagram Overview"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        Overview
      </button>

      <div className={styles.divider} />

      <div className={styles.sectionLabel}>Components</div>

      {/* Draggable node type items */}
      <div className={styles.items}>
        {NODE_TYPES.map(({ type, label, color, desc }) => (
          <div
            key={type}
            className={`${styles.item} ${threatMode ? styles.itemDisabled : ''}`}
            draggable={!threatMode}
            onDragStart={e => !threatMode && handleDragStart(e, type)}
            title={threatMode ? 'Exit Threat Model mode to add components' : `Drag to canvas to add a ${label}`}
          >
            <div className={styles.iconBox} style={{ '--item-color': color }}>
              <NodeIcon type={type} size={18} color={color} />
            </div>
            <div className={styles.meta}>
              <span className={styles.itemLabel}>{label}</span>
              <span className={styles.itemDesc}>{desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        {/* Export / Import row */}
        <div className={styles.ioRow}>
          <button className={styles.ioBtn} onClick={onExport} title="Export diagram as JSON">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>
          <button className={styles.ioBtn} onClick={handleImportClick} title="Import diagram from JSON">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        {nodeCount > 0 && (
          <button className={styles.clearBtn} onClick={onClear} title="Remove all nodes and edges">
            Clear canvas
          </button>
        )}
        <p className={styles.hint}>
          {threatMode ? 'Click nodes to set threat levels' : 'Drag a component onto the canvas'}
        </p>
      </div>
    </aside>
  )
}
