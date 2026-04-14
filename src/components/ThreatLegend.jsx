import { THREAT_LEVELS } from '../constants.js'
import styles from './ThreatLegend.module.css'

export default function ThreatLegend({ nodes }) {
  // Count how many nodes have each threat level
  const counts = {}
  for (const node of nodes) {
    if (node.threatLevel) counts[node.threatLevel] = (counts[node.threatLevel] ?? 0) + 1
  }

  const unset = nodes.filter(n => !n.threatLevel).length

  return (
    <div className={styles.legend}>
      <div className={styles.header}>
        {/* Inline shield icon */}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/>
        </svg>
        Threat Model
      </div>

      <div className={styles.rows}>
        {THREAT_LEVELS.map(({ level, label, color }) => (
          <div key={level} className={styles.row}>
            <span className={styles.dot} style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
            <span className={styles.rowLabel}>{label}</span>
            <span className={styles.count} style={{ color }}>
              {counts[level] ?? 0}
            </span>
          </div>
        ))}
        {unset > 0 && (
          <div className={`${styles.row} ${styles.unsetRow}`}>
            <span className={styles.dot} style={{ background: 'rgba(255,255,255,0.15)' }} />
            <span className={styles.rowLabel}>Unrated</span>
            <span className={styles.count}>{unset}</span>
          </div>
        )}
      </div>
    </div>
  )
}
