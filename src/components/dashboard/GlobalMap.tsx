import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useDashboardData } from "@/contexts/DashboardDataContext";

const COORDS: Record<string, [number, number]> = {
  "Jorf Lasfar": [33.1, -8.63],
  Safi: [32.3, -9.24],
  Casablanca: [33.59, -7.62],
  "Laâyoune": [27.15, -13.2],
  "Bayóvar": [-5.8, -81.07],
  "Mumbai (Inde)": [19.08, 72.88],
  Mumbai: [19.08, 72.88],
  "Paradip (Inde)": [20.26, 86.61],
  Paradip: [20.26, 86.61],
  "Santos (Brésil)": [-23.96, -46.33],
  Santos: [-23.96, -46.33],
  "Lagos (Nigeria)": [6.45, 3.4],
  Lagos: [6.45, 3.4],
  "Tampa (USA)": [27.95, -82.46],
  Tampa: [27.95, -82.46],
  "Anvers (Belgique)": [51.26, 4.4],
  Anvers: [51.26, 4.4],
  "Mombasa (Kenya)": [-4.04, 39.67],
  Mombasa: [-4.04, 39.67],
  Inde: [20.59, 78.96],
  "Brésil": [-14.24, -51.93],
  Nigeria: [9.08, 8.68],
  "Éthiopie": [9.15, 40.49],
  France: [46.23, 2.21],
  "États-Unis": [37.09, -95.71],
  Qatar: [25.35, 51.18],
  "Émirats Arabes Unis": [23.42, 53.85],
  "Arabie Saoudite": [23.89, 45.08],
  Russie: [61.52, 105.32],
  Canada: [56.13, -106.35],
  "Suisse / Russie": [46.82, 8.23],
  "Trinité-et-Tobago": [10.69, -61.22],
  Espagne: [40.46, -3.75],
  Kenya: [-0.02, 37.91],
  Maroc: [31.79, -7.09],
};

const routeColors = [
  "hsl(var(--primary))",
  "hsl(190 100% 45%)",
  "hsl(0 72% 60%)",
  "hsl(45 95% 52%)",
  "hsl(262 70% 68%)",
  "hsl(150 60% 48%)",
  "hsl(330 80% 65%)",
];

function curvedPoints(start: [number, number], end: [number, number], steps = 30): [number, number][] {
  const points: [number, number][] = [];
  const midLat = (start[0] + end[0]) / 2;
  const midLng = (start[1] + end[1]) / 2;
  const dist = Math.sqrt((end[0] - start[0]) ** 2 + (end[1] - start[1]) ** 2);
  const offset = dist * 0.15;
  const angle = Math.atan2(end[0] - start[0], end[1] - start[1]) + Math.PI / 2;
  const controlLat = midLat + offset * Math.cos(angle);
  const controlLng = midLng - offset * Math.sin(angle);

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const lat = (1 - t) ** 2 * start[0] + 2 * (1 - t) * t * controlLat + t ** 2 * end[0];
    const lng = (1 - t) ** 2 * start[1] + 2 * (1 - t) * t * controlLng + t ** 2 * end[1];
    points.push([lat, lng]);
  }

  return points;
}

type LayerFilter = "ports" | "routes" | "clients" | "suppliers";

function getStatusColors(status: string) {
  if (status === "Opérationnel") {
    return { fill: "hsl(150 60% 48% / 0.18)", text: "hsl(150 60% 48%)" };
  }
  if (status === "Maintenance") {
    return { fill: "hsl(45 95% 52% / 0.18)", text: "hsl(45 95% 52%)" };
  }
  return { fill: "hsl(0 72% 60% / 0.18)", text: "hsl(0 72% 60%)" };
}

export default function GlobalMap() {
  const { config } = useDashboardData();
  const { tradeRoutes = [] } = config.flows;
  const { ports = [], clients = [], suppliers = [] } = config.referentiel;
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);
  const [activeLayers, setActiveLayers] = useState<Set<LayerFilter>>(
    new Set(["ports", "routes", "clients", "suppliers"]),
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      minZoom: 2,
      maxZoom: 8,
      worldCopyJump: true,
    }).setView([20, 10], 2.5);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com">CARTO</a>',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      layersRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    layersRef.current?.remove();
    const group = L.layerGroup().addTo(map);
    layersRef.current = group;

    if (activeLayers.has("routes")) {
      tradeRoutes.forEach((route, index) => {
        const start = COORDS[route.origin];
        const end = COORDS[route.destination];
        if (!start || !end) return;

        const line = L.polyline(curvedPoints(start, end), {
          color: routeColors[index % routeColors.length],
          weight: 2.5,
          opacity: 0.75,
          dashArray: "8 4",
        }).addTo(group);

        line.bindTooltip(
          `<div style="font-size:12px"><strong>${route.origin} → ${route.destination}</strong><br/>${route.product} — ${route.volume}<br/>Transit: ${route.transitDays} jours</div>`,
          { sticky: true, className: "map-tooltip" },
        );
      });
    }

    if (activeLayers.has("ports")) {
      ports.forEach((port) => {
        const coords = COORDS[port.name];
        if (!coords) return;
        const status = getStatusColors(port.status);

        const marker = L.circleMarker(coords, {
          radius: 8,
          color: "hsl(var(--primary))",
          weight: 2,
          fillColor: "hsl(var(--primary))",
          fillOpacity: 0.9,
        }).addTo(group);

        marker.bindPopup(`
          <div style="font-size:12px;line-height:1.45;color:hsl(0 0% 95%)">
            <div style="font-weight:700;font-size:14px">${port.name}</div>
            <div style="color:hsl(0 0% 65%)">${port.location}</div>
            <div>Capacité: <strong>${port.capacityMt} Mt/an</strong></div>
            <div>Utilisation: <strong>${port.currentUtilization}</strong></div>
            <div>Produits: ${port.products}</div>
            <div style="display:inline-block;margin-top:6px;padding:2px 6px;border-radius:999px;background:${status.fill};color:${status.text};font-size:10px;font-weight:600">${port.status}</div>
          </div>
        `);
      });
    }

    if (activeLayers.has("clients")) {
      clients.forEach((client, index) => {
        const coords = COORDS[client.country];
        if (!coords) return;

        const offset: [number, number] = [coords[0] + (index % 3) * 1.5, coords[1] + (index % 2) * 2];
        const marker = L.circleMarker(offset, {
          radius: 7,
          color: "hsl(150 60% 48%)",
          weight: 2,
          fillColor: "hsl(150 60% 48%)",
          fillOpacity: 0.75,
        }).addTo(group);

        marker.bindPopup(`
          <div style="font-size:12px;line-height:1.45;color:hsl(0 0% 95%)">
            <div style="font-weight:700;font-size:14px">${client.name}</div>
            <div>${client.country} — ${client.zone}</div>
            <div>Produits: ${client.products}</div>
            <div>Volume: <strong>${client.annualVolume}</strong></div>
            <div>Contrat: ${client.contractType}</div>
          </div>
        `);
      });
    }

    if (activeLayers.has("suppliers")) {
      suppliers.forEach((supplier, index) => {
        const coords = COORDS[supplier.country];
        if (!coords) return;

        const offset: [number, number] = [coords[0] - (index % 3) * 1.2, coords[1] - (index % 2) * 1.8];
        const marker = L.circleMarker(offset, {
          radius: 7,
          color: "hsl(45 95% 52%)",
          weight: 2,
          fillColor: "hsl(45 95% 52%)",
          fillOpacity: 0.75,
        }).addTo(group);

        marker.bindPopup(`
          <div style="font-size:12px;line-height:1.45;color:hsl(0 0% 95%)">
            <div style="font-weight:700;font-size:14px">${supplier.name}</div>
            <div>${supplier.country} — ${supplier.zone}</div>
            <div>Produits: ${supplier.products}</div>
            <div>Contrat: ${supplier.contractType}</div>
            <div>Rating: <strong>${supplier.rating}</strong></div>
          </div>
        `);
      });
    }
  }, [activeLayers, clients, ports, suppliers, tradeRoutes]);

  const toggleLayer = (layer: LayerFilter) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  };

  const layerItems: { key: LayerFilter; label: string; color: string }[] = [
    { key: "ports", label: "Ports OCP", color: "hsl(var(--primary))" },
    { key: "routes", label: "Routes maritimes", color: "hsl(190 100% 45%)" },
    { key: "clients", label: "Clients", color: "hsl(150 60% 48%)" },
    { key: "suppliers", label: "Fournisseurs", color: "hsl(45 95% 52%)" },
  ];

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl">
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5 rounded-lg border border-border bg-card/90 p-2.5 shadow-lg backdrop-blur-md">
        <span className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Couches</span>
        {layerItems.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => toggleLayer(key)}
            className={`flex items-center gap-2 rounded px-2 py-1.5 text-xs transition-all ${
              activeLayers.has(key) ? "bg-secondary text-foreground" : "text-muted-foreground opacity-50"
            }`}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: activeLayers.has(key) ? color : "hsl(var(--muted-foreground))" }} />
            {label}
          </button>
        ))}
      </div>

      <div className="absolute bottom-3 left-3 z-[1000] rounded-lg border border-border bg-card/90 p-3 shadow-lg backdrop-blur-md">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="font-mono text-lg font-bold text-primary">{ports.length}</div>
            <div className="text-[10px] uppercase text-muted-foreground">Ports</div>
          </div>
          <div>
            <div className="font-mono text-lg font-bold" style={{ color: "hsl(150 60% 48%)" }}>{clients.length}</div>
            <div className="text-[10px] uppercase text-muted-foreground">Clients</div>
          </div>
          <div>
            <div className="font-mono text-lg font-bold" style={{ color: "hsl(45 95% 52%)" }}>{suppliers.length}</div>
            <div className="text-[10px] uppercase text-muted-foreground">Fournisseurs</div>
          </div>
        </div>
      </div>

      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
}
