import { useState, useCallback } from 'react'
import { NODE_WIDTH, NODE_HEIGHT } from '../constants.js'

let _uid = 1
const uid = () => `n${_uid++}`

const DEFAULT_LABELS = {
  client:       'Client',
  gateway:      'API Gateway',
  service:      'Service',
  loadbalancer: 'Load Balancer',
  database:     'Database',
  cache:        'Cache',
  queue:        'Message Queue',
  storage:      'Storage',
}

export function useDiagram() {
  const [nodes, setNodes]           = useState([])
  const [edges, setEdges]           = useState([])
  const [selectedId, setSelectedId] = useState(null)

  /** Add a node centered at (cx, cy) */
  const addNode = useCallback((type, cx, cy) => {
    const id = uid()
    setNodes(prev => [...prev, {
      id,
      type,
      x: cx - NODE_WIDTH  / 2,
      y: cy - NODE_HEIGHT / 2,
      label:       DEFAULT_LABELS[type] ?? type,
      threatLevel: null,
    }])
    setSelectedId(id)
    return id
  }, [])

  /** Update a node's top-left position */
  const moveNode = useCallback((id, x, y) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n))
  }, [])

  /** Rename a node */
  const updateLabel = useCallback((id, label) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, label } : n))
  }, [])

  /** Set (or clear) the threat level on a node */
  const setThreatLevel = useCallback((id, level) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, threatLevel: level } : n))
  }, [])

  /** Delete the currently selected node and its edges */
  const deleteSelected = useCallback(() => {
    setNodes(prev => {
      const next = prev.filter(n => n.id !== selectedId)
      if (next.length === prev.length) return prev
      setEdges(e => e.filter(ed => ed.from !== selectedId && ed.to !== selectedId))
      setSelectedId(null)
      return next
    })
  }, [selectedId])

  /** Add a directed edge between two ports (deduplicates) */
  const addEdge = useCallback((from, fromPort, to, toPort) => {
    if (from === to) return
    const id = `e|${from}:${fromPort}→${to}:${toPort}`
    setEdges(prev => prev.some(e => e.id === id) ? prev : [...prev, { id, from, fromPort, to, toPort }])
  }, [])

  /** Remove a single edge by id */
  const deleteEdge = useCallback((id) => {
    setEdges(prev => prev.filter(e => e.id !== id))
  }, [])

  /** Clear the whole diagram */
  const clearAll = useCallback(() => {
    setNodes([])
    setEdges([])
    setSelectedId(null)
  }, [])

  /**
   * Replace the diagram with imported data.
   * Ensures imported nodes always carry a threatLevel field.
   */
  const loadDiagram = useCallback((data) => {
    if (!data || typeof data !== 'object') return
    if (Array.isArray(data.nodes)) {
      setNodes(data.nodes.map(n => ({ threatLevel: null, ...n })))
    }
    if (Array.isArray(data.edges)) {
      setEdges(data.edges)
    }
    setSelectedId(null)
  }, [])

  return {
    nodes, edges, selectedId,
    setSelectedId,
    addNode, moveNode, updateLabel, setThreatLevel,
    deleteSelected, addEdge, deleteEdge,
    clearAll, loadDiagram,
  }
}
