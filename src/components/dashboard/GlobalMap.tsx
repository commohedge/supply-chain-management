import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useDashboardData } from "@/contexts/DashboardDataContext";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// ── Coordinates database ──
const COORDS: Record<string, [number, number]> = {
  // OCP Ports
  "Jorf Lasfar": [33.1, -8.63],
  "Safi": [32.3, -9.24],
  "Casablanca": [33.59, -7.62],
  "Laâyoune": [27.15, -13.2],
  "Bayóvar": [-5.8, -81.07],
  // Destinations
  "Mumbai (Inde)": [19.08, 72.88],
  "Mumbai": [19.08, 72.88],
  "Paradip (Inde)": [20.26, 86.61],
  "Paradip": [20.26, 86.61],
  "Santos (Brésil)": [-23.96, -46.33],
  "Santos": [-23.96, -46.33],
  "Lagos (Nigeria)": [6.45, 3.4],
  "Lagos": [6.45, 3.4],
  "Tampa (USA)": [27.95, -82.46],
  "Tampa": [27.95, -82.46],
  "Anvers (Belgique)": [51.26, 4.4],
  "Anvers": [51.26, 4.4],
  "Mombasa (Kenya)": [-4.04, 39.67],
  "Mombasa": [-4.04, 39.67],
  // Countries (for clients/suppliers)
  "Inde": [20.59, 78.96],
  "Brésil": [-14.24, -51.93],
  "Nigeria": [9.08, 8.68],
  "Éthiopie": [9.15, 40.49],
  "France": [46.23, 2.21],
  "États-Unis": [37.09, -95.71],
  "Qatar": [25.35, 51.18],
  "Émirats Arabes Unis": [23.42, 53.85],
  "Arabie Saoudite": [23.89, 45.08],
  "Russie": [61.52, 105.32],
  "Canada": [56.13, -106.35],
  "Suisse / Russie": [46.82, 8.23],
  "Trinité-et-Tobago": [10.69, -61.22],
  "Espagne": [40.46, -3.75],
  "Kenya": [-0.02, 37.91],
  "Maroc": [31.79, -7.09],
};

const portIcon = (color: string) =>
  L.divIcon({
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 8px ${color}88;"></div>`,
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });

// Curved line for maritime routes (simple arc)
function curvedPoints(start: [number, number], end: [number, number], steps = 30): [number, number][] {
  const points: [number, number][] = [];
  const midLat = (start[0] + end[0]) / 2;
  const midLng = (start[1] + end[1]) / 2;
  const dist = Math.sqrt((end[0] - start[0]) ** 2 + (end[1] - start[1]) ** 2);
  const offset = dist * 0.15;
  const angle = Math.atan2(end[0] - start[0], end[1] - start[1]) + Math.PI / 2;
  const controlLat = midLat + offset * Math.cos(angle);
  const controlLng = midLng - offset * Math.sin(angle);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = (1 - t) ** 2 * start[0] + 2 * (1 - t) * t * controlLat + t ** 2 * end[0];
    const lng = (1 - t) ** 2 * start[1] + 2 * (1 - t) * t * controlLng + t ** 2 * end[1];
    points.push([lat, lng]);
  }
  return points;
}

type LayerFilter = "ports" | "routes" | "clients" | "suppliers";

export default function GlobalMap() {
  const { config } = useDashboardData();
  const { tradeRoutes = [] } = config.flows;
  const { ports = [], clients = [], suppliers = [] } = config.referentiel;
  const [activeLayers, setActiveLayers] = useState<Set<LayerFilter>>(
    new Set(["ports", "routes", "clients", "suppliers"])
  );

  const toggleLayer = (layer: LayerFilter) => {
    setActiveLayers(prev => {
      const next = new Set(prev);
      next.has(layer) ? next.delete(layer) : next.add(layer);
      return next;
    });
  };

  const routeColors = ["#C8FF00", "#00D4FF", "#FF6B6B", "#FFB800", "#A78BFA", "#34D399", "#F472B6"];

  return (
    <div className="relative w-full h-full">
      {/* Layer controls */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5 bg-card/90 backdrop-blur-md border border-border rounded-lg p-2.5 shadow-lg">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">Couches</span>
        {([
          { key: "ports" as LayerFilter, label: "Ports OCP", color: "#C8FF00" },
          { key: "routes" as LayerFilter, label: "Routes maritimes", color: "#00D4FF" },
          { key: "clients" as LayerFilter, label: "Clients", color: "#34D399" },
          { key: "suppliers" as LayerFilter, label: "Fournisseurs", color: "#FFB800" },
        ]).map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => toggleLayer(key)}
            className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded transition-all ${
              activeLayers.has(key) ? "bg-secondary text-foreground" : "text-muted-foreground opacity-50"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: activeLayers.has(key) ? color : "#555" }} />
            {label}
          </button>
        ))}
      </div>

      {/* Stats overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-card/90 backdrop-blur-md border border-border rounded-lg p-3 shadow-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-primary font-mono">{ports.length}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Ports</div>
          </div>
          <div>
            <div className="text-lg font-bold text-[#34D399] font-mono">{clients.length}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Clients</div>
          </div>
          <div>
            <div className="text-lg font-bold text-[#FFB800] font-mono">{suppliers.length}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Fournisseurs</div>
          </div>
        </div>
      </div>

      <MapContainer
        center={[20, 10]}
        zoom={2.5}
        minZoom={2}
        maxZoom={8}
        style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
        className="z-0"
        scrollWheelZoom
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Maritime routes */}
        {activeLayers.has("routes") && tradeRoutes.map((route, i) => {
          const start = COORDS[route.origin];
          const end = COORDS[route.destination];
          if (!start || !end) return null;
          const color = routeColors[i % routeColors.length];
          const points = curvedPoints(start, end);
          return (
            <Polyline
              key={`route-${i}`}
              positions={points}
              pathOptions={{ color, weight: 2.5, opacity: 0.7, dashArray: "8 4" }}
            >
              <Tooltip sticky className="map-tooltip">
                <div className="text-xs">
                  <strong>{route.origin} → {route.destination}</strong><br />
                  {route.product} — {route.volume}<br />
                  Transit: {route.transitDays} jours
                </div>
              </Tooltip>
            </Polyline>
          );
        })}

        {/* OCP Ports */}
        {activeLayers.has("ports") && ports.map((port, i) => {
          const coords = COORDS[port.name];
          if (!coords) return null;
          return (
            <Marker key={`port-${i}`} position={coords} icon={portIcon("#C8FF00")}>
              <Popup className="map-popup">
                <div className="text-xs space-y-1">
                  <div className="font-bold text-sm">{port.name}</div>
                  <div className="text-muted-foreground">{port.location}</div>
                  <div>Capacité: <strong>{port.capacityMt} Mt/an</strong></div>
                  <div>Utilisation: <strong>{port.currentUtilization}</strong></div>
                  <div>Produits: {port.products}</div>
                  <div className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium"
                    style={{
                      background: port.status === "Opérationnel" ? "#34D39933" : port.status === "Maintenance" ? "#FFB80033" : "#FF6B6B33",
                      color: port.status === "Opérationnel" ? "#34D399" : port.status === "Maintenance" ? "#FFB800" : "#FF6B6B",
                    }}
                  >
                    {port.status}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Clients */}
        {activeLayers.has("clients") && clients.map((client, i) => {
          const coords = COORDS[client.country];
          if (!coords) return null;
          // Slight offset to avoid overlap
          const offset: [number, number] = [coords[0] + (i % 3) * 1.5, coords[1] + (i % 2) * 2];
          return (
            <CircleMarker
              key={`client-${i}`}
              center={offset}
              radius={7}
              pathOptions={{ color: "#34D399", fillColor: "#34D399", fillOpacity: 0.7, weight: 2 }}
            >
              <Popup className="map-popup">
                <div className="text-xs space-y-1">
                  <div className="font-bold text-sm">{client.name}</div>
                  <div>{client.country} — {client.zone}</div>
                  <div>Produits: {client.products}</div>
                  <div>Volume: <strong>{client.annualVolume}</strong></div>
                  <div>Contrat: {client.contractType}</div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Suppliers */}
        {activeLayers.has("suppliers") && suppliers.map((supplier, i) => {
          const coords = COORDS[supplier.country];
          if (!coords) return null;
          const offset: [number, number] = [coords[0] - (i % 3) * 1.2, coords[1] - (i % 2) * 1.8];
          return (
            <CircleMarker
              key={`supplier-${i}`}
              center={offset}
              radius={7}
              pathOptions={{ color: "#FFB800", fillColor: "#FFB800", fillOpacity: 0.7, weight: 2 }}
            >
              <Popup className="map-popup">
                <div className="text-xs space-y-1">
                  <div className="font-bold text-sm">{supplier.name}</div>
                  <div>{supplier.country} — {supplier.zone}</div>
                  <div>Produits: {supplier.products}</div>
                  <div>Contrat: {supplier.contractType}</div>
                  <div>Rating: <strong>{supplier.rating}</strong></div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
