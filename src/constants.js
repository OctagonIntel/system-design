export const NODE_WIDTH = 164
export const NODE_HEIGHT = 68

// The 8 draggable component types
export const NODE_TYPES = [
  { type: 'client',       label: 'Client',        color: '#818cf8', desc: 'User / Browser'       },
  { type: 'gateway',      label: 'API Gateway',   color: '#a78bfa', desc: 'Request routing'      },
  { type: 'service',      label: 'Service',       color: '#22d3ee', desc: 'Microservice'          },
  { type: 'loadbalancer', label: 'Load Balancer', color: '#34d399', desc: 'Traffic distribution'  },
  { type: 'database',     label: 'Database',      color: '#fbbf24', desc: 'Data persistence'      },
  { type: 'cache',        label: 'Cache',         color: '#f87171', desc: 'In-memory store'       },
  { type: 'queue',        label: 'Message Queue', color: '#f472b6', desc: 'Async messaging'       },
  { type: 'storage',      label: 'Storage',       color: '#94a3b8', desc: 'Object / file store'   },
]

export const TYPE_MAP = Object.fromEntries(NODE_TYPES.map(t => [t.type, t]))

// Threat model levels — ordered most-severe first
export const THREAT_LEVELS = [
  { level: 'critical', label: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
  { level: 'high',     label: 'High',     color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  { level: 'medium',   label: 'Medium',   color: '#eab308', bg: 'rgba(234,179,8,0.12)'  },
  { level: 'low',      label: 'Low',      color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  },
]

export const THREAT_MAP = Object.fromEntries(THREAT_LEVELS.map(t => [t.level, t]))

export const PORTS = ['top', 'right', 'bottom', 'left']

/** Returns the canvas-relative {x, y} of a port on a given node */
export function getPortPosition(node, port) {
  const { x, y } = node
  const w = NODE_WIDTH
  const h = NODE_HEIGHT
  switch (port) {
    case 'top':    return { x: x + w / 2,     y }
    case 'bottom': return { x: x + w / 2,     y: y + h }
    case 'left':   return { x,                y: y + h / 2 }
    case 'right':  return { x: x + w,         y: y + h / 2 }
    default:       return { x: x + w / 2,     y: y + h / 2 }
  }
}

const CP_OFF = 72

/** Outgoing control-point direction for a port */
function outCP(x, y, port) {
  switch (port) {
    case 'top':    return [x, y - CP_OFF]
    case 'bottom': return [x, y + CP_OFF]
    case 'left':   return [x - CP_OFF, y]
    case 'right':  return [x + CP_OFF, y]
    default:       return [x, y]
  }
}

/** Cubic bezier path between two anchored ports */
export function edgePath(x1, y1, port1, x2, y2, port2) {
  const [cx1, cy1] = outCP(x1, y1, port1)
  const [cx2, cy2] = outCP(x2, y2, port2)
  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`
}

/** Canvas midpoint of a cubic bezier edge (t = 0.5) */
export function edgeMidpoint(x1, y1, port1, x2, y2, port2) {
  const [cx1, cy1] = outCP(x1, y1, port1)
  const [cx2, cy2] = outCP(x2, y2, port2)
  return {
    x: (x1 + 3 * cx1 + 3 * cx2 + x2) / 8,
    y: (y1 + 3 * cy1 + 3 * cy2 + y2) / 8,
  }
}

/** Cubic bezier path for an in-progress (temp) edge */
export function tempEdgePath(x1, y1, port1, x2, y2) {
  const [cx1, cy1] = outCP(x1, y1, port1)
  // Auto infer incoming direction from angle
  const dx = x2 - x1
  const dy = y2 - y1
  const cx2 = x2 - (Math.abs(dx) >= Math.abs(dy) ? Math.sign(dx) * CP_OFF : 0)
  const cy2 = y2 - (Math.abs(dy) > Math.abs(dx)  ? Math.sign(dy) * CP_OFF : 0)
  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`
}

/** Given a source (fromX, fromY) and a target node, pick the closest incoming port */
export function bestPort(fromX, fromY, toNode) {
  const cx = toNode.x + NODE_WIDTH  / 2
  const cy = toNode.y + NODE_HEIGHT / 2
  const dx = fromX - cx
  const dy = fromY - cy
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? 'left'  : 'right'
  return dy > 0 ? 'top' : 'bottom'
}
