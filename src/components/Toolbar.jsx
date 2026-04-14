import { NODE_TYPES } from '../constants.js'
import NodeIcon from './NodeIcon.jsx'
import styles from './Toolbar.module.css'

export default function Toolbar({ onClear, nodeCount }) {
  function handleDragStart(e, type) {
    e.dataTransfer.setData('nodeType', type)
    e.dataTransfer.effectAllowed = 'copy'
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

      <div className={styles.sectionLabel}>Components</div>

      {/* Draggable node type items */}
      <div className={styles.items}>
        {NODE_TYPES.map(({ type, label, color, desc }) => (
          <div
            key={type}
            className={styles.item}
            draggable
            onDragStart={e => handleDragStart(e, type)}
            title={`Drag to canvas to add a ${label}`}
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
        {nodeCount > 0 && (
          <button className={styles.clearBtn} onClick={onClear} title="Remove all nodes and edges">
            Clear canvas
          </button>
        )}
        <p className={styles.hint}>Drag a component onto the canvas</p>
      </div>
    </aside>
  )
}
