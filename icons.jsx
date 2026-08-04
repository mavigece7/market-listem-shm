// Basit, bağımsız (CDN gerektirmeyen) çizgi ikon seti — lucide-react'e benzer stilde.
// Uygulama offline çalışabilsin diye harici pakete bağımlı değildir.
const LucideIcon = ({ children, size = 20, color = "currentColor", strokeWidth = 2, style, ...rest }) =>
  React.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: color,
      strokeWidth,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      style,
      ...rest,
    },
    children
  );

const L = (...children) => (props) => React.createElement(LucideIcon, props, ...children);
const el = React.createElement;

window.LucideReact = {
  ShoppingBasket: L(
    el("path", { key: 1, d: "m5 11 4-7" }),
    el("path", { key: 2, d: "m19 11-4-7" }),
    el("path", { key: 3, d: "M2 11h20" }),
    el("path", { key: 4, d: "m3.5 11 1.7 7.4a2 2 0 0 0 2 1.6h9.6a2 2 0 0 0 2-1.6l1.7-7.4" }),
    el("path", { key: 5, d: "M4.5 15h15" })
  ),
  Plus: L(el("line", { key: 1, x1: 12, y1: 5, x2: 12, y2: 19 }), el("line", { key: 2, x1: 5, y1: 12, x2: 19, y2: 12 })),
  Minus: L(el("line", { key: 1, x1: 5, y1: 12, x2: 19, y2: 12 })),
  Trash2: L(
    el("polyline", { key: 1, points: "3 6 5 6 21 6" }),
    el("path", { key: 2, d: "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" }),
    el("path", { key: 3, d: "M10 11v6" }),
    el("path", { key: 4, d: "M14 11v6" }),
    el("path", { key: 5, d: "M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" })
  ),
  Carrot: L(
    el("path", { key: 1, d: "M2.27 21.7s9.87-3.5 12.73-6.36a4.5 4.5 0 0 0-6.36-6.37C5.77 11.84 2.27 21.7 2.27 21.7z" }),
    el("path", { key: 2, d: "m8.65 12 3.87-3.87" }),
    el("path", { key: 3, d: "M18 3c.32 1.36.28 4.7-3 6" }),
    el("path", { key: 4, d: "M17 6c1.3.3 3.24 1.24 4 3" })
  ),
  Pencil: L(
    el("path", { key: 1, d: "M12 20h9" }),
    el("path", { key: 2, d: "M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" })
  ),
  X: L(el("line", { key: 1, x1: 18, y1: 6, x2: 6, y2: 18 }), el("line", { key: 2, x1: 6, y1: 6, x2: 18, y2: 18 })),
  Check: L(el("polyline", { key: 1, points: "20 6 9 17 4 12" })),
  User: L(
    el("path", { key: 1, d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }),
    el("circle", { key: 2, cx: 12, cy: 7, r: 4 })
  ),
  ArrowDownAZ: L(
    el("path", { key: 1, d: "M3 8h6" }),
    el("path", { key: 2, d: "M3 12h4" }),
    el("path", { key: 3, d: "M3 16h2" }),
    el("path", { key: 4, d: "M17 3v18" }),
    el("path", { key: 5, d: "m21 17-4 4-4-4" })
  ),
  ChevronUp: L(el("polyline", { key: 1, points: "18 15 12 9 6 15" })),
  ChevronDown: L(el("polyline", { key: 1, points: "6 9 12 15 18 9" })),
  ChevronRight: L(el("polyline", { key: 1, points: "9 18 15 12 9 6" })),
  Search: L(el("circle", { key: 1, cx: 11, cy: 11, r: 8 }), el("line", { key: 2, x1: 21, y1: 21, x2: 16.65, y2: 16.65 })),
  History: L(
    el("path", { key: 1, d: "M3 3v5h5" }),
    el("path", { key: 2, d: "M3.05 13A9 9 0 1 0 6 5.3L3 8" }),
    el("path", { key: 3, d: "M12 7v5l4 2" })
  ),
  TrendingUp: L(
    el("polyline", { key: 1, points: "23 6 13.5 15.5 8.5 10.5 1 18" }),
    el("polyline", { key: 2, points: "17 6 23 6 23 12" })
  ),
  TrendingDown: L(
    el("polyline", { key: 1, points: "23 18 13.5 8.5 8.5 13.5 1 6" }),
    el("polyline", { key: 2, points: "17 18 23 18 23 12" })
  ),
  Save: L(
    el("path", { key: 1, d: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" }),
    el("polyline", { key: 2, points: "17 21 17 13 7 13 7 21" }),
    el("polyline", { key: 3, points: "7 3 7 8 15 8" })
  ),
  Camera: L(
    el("path", { key: 1, d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" }),
    el("circle", { key: 2, cx: 12, cy: 13, r: 4 })
  ),
  AlertTriangle: L(
    el("path", { key: 1, d: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }),
    el("line", { key: 2, x1: 12, y1: 9, x2: 12, y2: 13 }),
    el("line", { key: 3, x1: 12, y1: 17, x2: 12.01, y2: 17 })
  ),
  Layers: L(
    el("polygon", { key: 1, points: "12 2 2 7 12 12 22 7 12 2" }),
    el("polyline", { key: 2, points: "2 17 12 22 22 17" }),
    el("polyline", { key: 3, points: "2 12 12 17 22 12" })
  ),
};
