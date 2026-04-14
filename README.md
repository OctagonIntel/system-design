# ArchSync

**Interactive system design and threat modelling tool for engineers and security-minded developers.**

ArchSync is a browser-based diagramming tool built for designing distributed systems and mapping their security posture. Drag components onto a canvas, connect them, annotate attack paths, and export a structured risk report — all without leaving the browser.

Built with React + Vite. No external diagram libraries. All geometry is hand-rolled.

---

## Features

### Core Diagramming
- **8 component types** — API Gateway, Service, Database, Cache, Queue, CDN, Load Balancer, Client
- **Drag-and-drop canvas** — place nodes from the sidebar onto a 4000×3000 dot-grid canvas
- **Bezier edge connections** — hover any node to expose ports, drag to connect
- **Pan and zoom** — navigate large diagrams freely
- **Inline rename** — double-click any node label to rename it
- **Delete** — select a node and press `Delete` / `Backspace`, or click an edge to remove it

### Cybersecurity Layer *(in progress)*
- **Threat Model mode** — toggle on to assign risk levels (Critical / High / Medium / Low) per node with visual indicators
- **Attack Path edges** — animated dashed red edges showing lateral movement and attack vectors, with labels (e.g. SQL Injection, Privilege Escalation)
- **Security Controls panel** — per-node checklist of relevant controls (encryption, auth, rate limiting, etc.) with a live compliance score
- **Diagram Overview** — full-screen read-only minimap with risk summary, node breakdown, and unassessed node warnings
- **Risk Report export** — download a structured `.md` report: risk matrix, attack paths, critical findings

### Export
- **JSON** — save and reload full diagram state including threat levels, controls, and attack paths
- **PNG** — export the canvas as an image
- **Markdown risk report** — structured security posture summary

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install and run

```bash
git clone https://github.com/YOUR_USERNAME/archsync.git
cd archsync
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
npm run preview
```

---

## Usage

| Action | How |
|---|---|
| Place a node | Drag a component from the left sidebar onto the canvas |
| Move a node | Click and drag the node body |
| Connect nodes | Hover a node → drag from any port dot to another node |
| Rename a node | Double-click the label |
| Delete a node | Select it → `Delete` or `Backspace` |
| Delete an edge | Click the edge line |
| Pan the canvas | Scroll or drag on empty canvas space |
| Deselect | Click empty canvas or press `Escape` |
| Export JSON | Click "Export JSON" in the sidebar |
| Export PNG | Click "Export PNG" in the sidebar |

---

## Project Structure

```
src/
├── main.jsx                  Entry point
├── App.jsx                   Root layout — sidebar + canvas
├── constants.js              Node type definitions, port math, bezier helpers
├── hooks/
│   └── useDiagram.js         Nodes + edges state management
└── components/
    ├── Toolbar.jsx            Left sidebar — component palette
    ├── Canvas.jsx             Scrollable viewport, dot-grid, status bar
    ├── DiagramNode.jsx        Draggable node card with ports and selection
    ├── EdgeLayer.jsx          SVG overlay — bezier edges + rubber-band temp edge
    ├── NodeIcon.jsx           8 custom SVG icons (no icon library)
    └── ExportBar.jsx          JSON / PNG export
```

---

## Tech Stack

- **React 18** + **Vite**
- **CSS Modules** — scoped component styles, no CSS-in-JS
- **CSS custom properties** — `--nc` (node color) drives all per-type theming
- `color-mix(in srgb, ...)` for badge backgrounds
- Zero external diagram, icon, or animation libraries

---

## Roadmap

- [x] Core canvas with drag-and-drop node placement
- [x] Bezier edge connections with port system
- [x] Pan/zoom, inline rename, delete
- [x] JSON and PNG export
- [ ] Threat Model mode with risk levels
- [ ] Attack path edge type with labels
- [ ] Security Controls panel with compliance scoring
- [ ] Diagram Overview modal with risk summary
- [ ] Markdown risk report export
- [ ] GitHub Pages auto-deploy

---

## Contributing

Issues and PRs welcome. For major changes, open an issue first to discuss scope.

---

## License

MIT
