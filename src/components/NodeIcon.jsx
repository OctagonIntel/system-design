/**
 * Crisp Lucide-style SVG icons for each node type.
 * All paths use a 24×24 viewBox with stroke rendering.
 */
export default function NodeIcon({ type, size = 22, color = 'currentColor' }) {
  const p = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  switch (type) {
    // Monitor / screen
    case 'client':
      return (
        <svg {...p}>
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      )

    // Shield with checkmark
    case 'gateway':
      return (
        <svg {...p}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      )

    // CPU chip — microservice
    case 'service':
      return (
        <svg {...p}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9"  y1="1"  x2="9"  y2="4"  />
          <line x1="15" y1="1"  x2="15" y2="4"  />
          <line x1="9"  y1="20" x2="9"  y2="23" />
          <line x1="15" y1="20" x2="15" y2="23" />
          <line x1="20" y1="9"  x2="23" y2="9"  />
          <line x1="20" y1="14" x2="23" y2="14" />
          <line x1="1"  y1="9"  x2="4"  y2="9"  />
          <line x1="1"  y1="14" x2="4"  y2="14" />
        </svg>
      )

    // Network tree — load balancer
    case 'loadbalancer':
      return (
        <svg {...p}>
          <rect x="16" y="16" width="6" height="6" rx="1" />
          <rect x="2"  y="16" width="6" height="6" rx="1" />
          <rect x="9"  y="2"  width="6" height="6" rx="1" />
          <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
          <line x1="12" y1="8" x2="12" y2="12" />
        </svg>
      )

    // Classic cylinder
    case 'database':
      return (
        <svg {...p}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4.03 3-9 3S3 13.66 3 12" />
          <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
        </svg>
      )

    // Lightning bolt — fast in-memory cache
    case 'cache':
      return (
        <svg {...p}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      )

    // Stacked layers — message queue
    case 'queue':
      return (
        <svg {...p}>
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      )

    // Hard drive — object storage
    case 'storage':
      return (
        <svg {...p}>
          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
          <line x1="2"  y1="12" x2="22" y2="12" />
          <circle cx="6"  cy="16" r="1" fill={color} stroke="none" />
          <circle cx="10" cy="16" r="1" fill={color} stroke="none" />
        </svg>
      )

    default:
      return (
        <svg {...p}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      )
  }
}
