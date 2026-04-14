import { useDiagram } from './hooks/useDiagram.js'
import Toolbar from './components/Toolbar.jsx'
import Canvas  from './components/Canvas.jsx'
import styles  from './App.module.css'

export default function App() {
  const {
    nodes, edges, selectedId,
    setSelectedId,
    addNode, moveNode, updateLabel,
    deleteSelected, addEdge, deleteEdge,
    clearAll,
  } = useDiagram()

  return (
    <div className={styles.app}>
      <Toolbar onClear={clearAll} nodeCount={nodes.length} />
      <Canvas
        nodes={nodes}
        edges={edges}
        selectedId={selectedId}
        onDrop={addNode}
        onSelectNode={setSelectedId}
        onMoveNode={moveNode}
        onAddEdge={addEdge}
        onDeleteEdge={deleteEdge}
        onLabelChange={updateLabel}
        onDeleteSelected={deleteSelected}
      />
    </div>
  )
}
