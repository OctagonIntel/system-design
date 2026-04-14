import { useState, useCallback } from 'react'
import { useDiagram } from './hooks/useDiagram.js'
import Toolbar         from './components/Toolbar.jsx'
import Canvas          from './components/Canvas.jsx'
import DiagramOverview from './components/DiagramOverview.jsx'
import SecurityPanel   from './components/SecurityPanel.jsx'
import styles          from './App.module.css'

export default function App() {
  const {
    nodes, edges, selectedId,
    setSelectedId,
    addNode, moveNode, updateLabel, setThreatLevel,
    deleteSelected, addEdge, deleteEdge, updateEdgeLabel, toggleControl,
    clearAll, loadDiagram,
  } = useDiagram()

  const [threatMode,    setThreatMode]    = useState(false)
  const [overviewOpen,  setOverviewOpen]  = useState(false)
  const [edgeMode,      setEdgeMode]      = useState('connect')

  /* ── Export diagram as JSON ──────────────────────────── */
  const exportDiagram = useCallback(() => {
    const payload = JSON.stringify({ nodes, edges }, null, 2)
    const blob    = new Blob([payload], { type: 'application/json' })
    const url     = URL.createObjectURL(blob)
    const a       = document.createElement('a')
    a.href        = url
    a.download    = 'archsync-diagram.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [nodes, edges])

  /* ── Import diagram from JSON file ──────────────────── */
  const importDiagram = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        loadDiagram(data)
      } catch {
        console.error('ArchSync: invalid diagram JSON')
      }
    }
    reader.readAsText(file)
  }, [loadDiagram])

  return (
    <div className={styles.app}>
      <Toolbar
        nodeCount={nodes.length}
        onClear={clearAll}
        threatMode={threatMode}
        onToggleThreat={() => setThreatMode(m => !m)}
        edgeMode={edgeMode}
        onToggleEdgeMode={() => setEdgeMode(m => m === 'connect' ? 'attack' : 'connect')}
        onExport={exportDiagram}
        onImport={importDiagram}
        onOpenOverview={() => setOverviewOpen(true)}
      />
      <Canvas
        nodes={nodes}
        edges={edges}
        selectedId={selectedId}
        threatMode={threatMode}
        edgeMode={edgeMode}
        onDrop={addNode}
        onSelectNode={setSelectedId}
        onMoveNode={moveNode}
        onAddEdge={addEdge}
        onDeleteEdge={deleteEdge}
        onLabelChange={updateLabel}
        onDeleteSelected={deleteSelected}
        onSetThreat={setThreatLevel}
        onUpdateEdgeLabel={updateEdgeLabel}
      />
      <SecurityPanel
        node={nodes.find(n => n.id === selectedId) ?? null}
        isOpen={threatMode && !!selectedId}
        onToggleControl={toggleControl}
      />
      {overviewOpen && (
        <DiagramOverview
          nodes={nodes}
          edges={edges}
          onClose={() => setOverviewOpen(false)}
        />
      )}
    </div>
  )
}
