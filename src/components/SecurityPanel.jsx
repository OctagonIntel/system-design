import { SECURITY_CONTROLS, TYPE_MAP, THREAT_MAP } from '../constants.js'
import NodeIcon from './NodeIcon.jsx'
import styles from './SecurityPanel.module.css'

export default function SecurityPanel({ node, isOpen, onToggleControl }) {
  const controls  = node ? (SECURITY_CONTROLS[node.type] ?? []) : []
  const meta      = node ? (TYPE_MAP[node.type] ?? { color: '#64748b', label: node.type }) : null
  const threat    = node?.threatLevel ? THREAT_MAP[node.threatLevel] : null

  const checked   = controls.filter(c => !!node?.controls?.[c]).length
  const total     = controls.length
  const pct       = total > 0 ? Math.round((checked / total) * 100) : 0

  const scoreColor = pct === 100 ? '#22c55e'
                   : pct >= 50   ? '#eab308'
                   : '#ef4444'

  return (
    <aside className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
      <div className={styles.inner}>
        {node && (
          <>
            {/* ── Header ──────────────────────────────── */}
            <div className={styles.header}>
              <div className={styles.headerTop}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(239,68,68,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <circle cx="12" cy="16" r="1" fill="rgba(239,68,68,0.7)" stroke="none" />
                </svg>
                <span className={styles.headerLabel}>Security Controls</span>
              </div>

              <div className={styles.nodeCard} style={{ '--nc': meta.color }}>
                <div className={styles.nodeIcon}>
                  <NodeIcon type={node.type} size={15} color={meta.color} />
                </div>
                <div className={styles.nodeMeta}>
                  <span className={styles.nodeName}>{node.label}</span>
                  <span className={styles.nodeType}>{meta.label}</span>
                </div>
                {threat && (
                  <span
                    className={styles.threatBadge}
                    style={{ color: threat.color, background: threat.bg, borderColor: threat.color + '55' }}
                  >
                    {threat.label}
                  </span>
                )}
              </div>
            </div>

            {/* ── Compliance score ─────────────────────── */}
            <div className={styles.scoreSection}>
              <div className={styles.scoreRow}>
                <span className={styles.scoreLabel}>Compliance</span>
                <span className={styles.scoreValue} style={{ color: scoreColor }}>
                  {checked}/{total} controls
                </span>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressBar}
                  style={{ width: `${pct}%`, background: scoreColor }}
                />
              </div>
            </div>

            <div className={styles.divider} />

            {/* ── Controls checklist ───────────────────── */}
            <div className={styles.controlsList}>
              <div className={styles.controlsTitle}>Checklist</div>
              {controls.length === 0 ? (
                <p className={styles.empty}>No controls defined for this type.</p>
              ) : (
                controls.map(control => {
                  const isChecked = !!node.controls?.[control]
                  return (
                    <label key={control} className={styles.controlItem}>
                      <input
                        type="checkbox"
                        className={styles.hiddenCheckbox}
                        checked={isChecked}
                        onChange={() => onToggleControl(node.id, control)}
                      />
                      <span className={`${styles.checkBox} ${isChecked ? styles.checkBoxOn : ''}`}>
                        {isChecked && (
                          <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="1.5 6 4.5 9 10.5 3" />
                          </svg>
                        )}
                      </span>
                      <span className={`${styles.controlLabel} ${isChecked ? styles.controlLabelDone : ''}`}>
                        {control}
                      </span>
                    </label>
                  )
                })
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
