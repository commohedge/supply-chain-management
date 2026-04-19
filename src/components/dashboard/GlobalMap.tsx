import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { FeatureCollection } from "geojson";
import { ChevronRight, Layers, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useDashboardData, type MapLogisticsDisplay } from "@/contexts/DashboardDataContext";
import type { LogisticsStatusRow } from "@/types/logistics";
import { cn } from "@/lib/utils";
import {
  featureIsoA2FromNaturalEarth,
  isoCodesFromCountryLabels,
} from "@/data/countryIsoMapping";
import { coordsNearDestination } from "@/lib/logisticsDestinationCoords";
import { useI18n } from "@/contexts/I18nContext";
import { displayReferenceValue } from "@/i18n/referenceLocale";

const COORDS: Record<string, [number, number]> = {
  // ── Phosphates ports / countries ───────────────────────────
  "Jorf Lasfar": [33.1, -8.63],
  Safi: [32.3, -9.24],
  Casablanca: [33.59, -7.62],
  "Laâyoune": [27.15, -13.2],
  "Bayóvar": [-5.8, -81.07],
  "Mumbai (Inde)": [19.08, 72.88],
  "Mumbai (India)": [19.08, 72.88],
  Mumbai: [19.08, 72.88],
  "Paradip (Inde)": [20.26, 86.61],
  "Paradip (India)": [20.26, 86.61],
  Paradip: [20.26, 86.61],
  "Santos (Brésil)": [-23.96, -46.33],
  "Santos (Brazil)": [-23.96, -46.33],
  Santos: [-23.96, -46.33],
  "Lagos (Nigeria)": [6.45, 3.4],
  Lagos: [6.45, 3.4],
  "Tampa (USA)": [27.95, -82.46],
  Tampa: [27.95, -82.46],
  "Anvers (Belgique)": [51.26, 4.4],
  "Antwerp (Belgium)": [51.26, 4.4],
  Anvers: [51.26, 4.4],
  Antwerp: [51.26, 4.4],
  "Mombasa (Kenya)": [-4.04, 39.67],
  Mombasa: [-4.04, 39.67],

  // ── Copper ports ───────────────────────────────────────────
  Antofagasta: [-23.65, -70.4],
  "Antofagasta (CL)": [-23.65, -70.4],
  Callao: [-12.05, -77.15],
  "Callao (PE)": [-12.05, -77.15],
  "Callao (Peru)": [-12.05, -77.15],
  Mejillones: [-23.1, -70.45],
  "Shanghai (Yangshan)": [30.62, 122.07],
  Shanghai: [31.23, 121.47],
  "Shanghai (CN)": [31.23, 121.47],
  Yangshan: [30.62, 122.07],
  "Yangshan (China)": [30.62, 122.07],
  Yantai: [37.46, 121.45],
  "Yantai (China)": [37.46, 121.45],
  Qingdao: [36.07, 120.38],
  "Qingdao (China)": [36.07, 120.38],
  Rotterdam: [51.92, 4.48],
  "Rotterdam (NL)": [51.92, 4.48],
  "Rotterdam (Netherlands)": [51.92, 4.48],
  "New Orleans (USA)": [29.95, -90.07],
  "New Orleans": [29.95, -90.07],
  Yokohama: [35.44, 139.65],
  "Yokohama (Japan)": [35.44, 139.65],
  Incheon: [37.45, 126.7],
  "Incheon (S. Korea)": [37.45, 126.7],

  // ── LNG terminals ──────────────────────────────────────────
  "Ras Laffan": [25.92, 51.56],
  "Ras Laffan (QA)": [25.92, 51.56],
  "Ras Laffan (Qatar)": [25.92, 51.56],
  "Sabine Pass": [29.74, -93.87],
  "Sabine Pass (USA)": [29.74, -93.87],
  Gladstone: [-23.84, 151.26],
  "Gladstone (AU)": [-23.84, 151.26],
  "Gladstone (Aus)": [-23.84, 151.26],
  "Gladstone (QCLNG/APLNG)": [-23.84, 151.26],
  Yamal: [71.27, 71.95],
  "Yamal (RU)": [71.27, 71.95],
  "Yamal (Russia)": [71.27, 71.95],
  "Bonny Island": [4.43, 7.18],
  Zeebrugge: [51.34, 3.21],
  "Zeebrugge (Belgium)": [51.34, 3.21],
  "Tokyo Bay": [35.45, 139.85],
  "Tokyo Bay (Japan)": [35.45, 139.85],
  Dahej: [21.7, 72.55],
  "Dahej (India)": [21.7, 72.55],

  // ── Grain export terminals ─────────────────────────────────
  "Santos (BR)": [-23.96, -46.33],
  "Paranaguá": [-25.52, -48.51],
  "Paranaguá (BR)": [-25.52, -48.51],
  Paranagua: [-25.52, -48.51],
  Rosario: [-32.94, -60.65],
  "Rosario (AR)": [-32.94, -60.65],
  Constanta: [44.17, 28.65],
  "Constanta (RO)": [44.17, 28.65],
  Hamburg: [53.55, 9.99],
  "Hamburg (DE)": [53.55, 9.99],
  Alexandria: [31.2, 29.92],
  "Alexandria (EG)": [31.2, 29.92],
  Veracruz: [19.18, -96.13],
  "Veracruz (MX)": [19.18, -96.13],

  // ── Country centroids ──────────────────────────────────────
  Inde: [20.59, 78.96],
  India: [20.59, 78.96],
  "Brésil": [-14.24, -51.93],
  Brazil: [-14.24, -51.93],
  Nigeria: [9.08, 8.68],
  "Éthiopie": [9.15, 40.49],
  Ethiopia: [9.15, 40.49],
  France: [46.23, 2.21],
  "États-Unis": [37.09, -95.71],
  "United States": [37.09, -95.71],
  USA: [37.09, -95.71],
  Qatar: [25.35, 51.18],
  "Émirats Arabes Unis": [23.42, 53.85],
  "United Arab Emirates": [23.42, 53.85],
  "Arabie Saoudite": [23.89, 45.08],
  "Saudi Arabia": [23.89, 45.08],
  Russie: [61.52, 105.32],
  Russia: [61.52, 105.32],
  Canada: [56.13, -106.35],
  "Suisse / Russie": [46.82, 8.23],
  "Switzerland / Russia": [46.82, 8.23],
  Switzerland: [46.82, 8.23],
  "Trinité-et-Tobago": [10.69, -61.22],
  "Trinidad and Tobago": [10.69, -61.22],
  Espagne: [40.46, -3.75],
  Spain: [40.46, -3.75],
  Kenya: [-0.02, 37.91],
  Maroc: [31.79, -7.09],
  Morocco: [31.79, -7.09],
  China: [35.86, 104.2],
  Chine: [35.86, 104.2],
  Japan: [36.2, 138.25],
  Japon: [36.2, 138.25],
  "South Korea": [35.91, 127.77],
  Korea: [35.91, 127.77],
  "Corée": [35.91, 127.77],
  Germany: [51.17, 10.45],
  Allemagne: [51.17, 10.45],
  Netherlands: [52.13, 5.29],
  "Pays-Bas": [52.13, 5.29],
  Belgium: [50.5, 4.47],
  Belgique: [50.5, 4.47],
  Italy: [41.87, 12.57],
  Italie: [41.87, 12.57],
  "United Kingdom": [55.38, -3.44],
  UK: [55.38, -3.44],
  "Royaume-Uni": [55.38, -3.44],
  "UK / Netherlands": [53.5, 1.0],
  Poland: [51.92, 19.15],
  Pologne: [51.92, 19.15],
  Romania: [45.94, 24.97],
  Roumanie: [45.94, 24.97],
  Australia: [-25.27, 133.78],
  Australie: [-25.27, 133.78],
  Chile: [-35.68, -71.54],
  Chili: [-35.68, -71.54],
  Peru: [-9.19, -75.02],
  "Pérou": [-9.19, -75.02],
  Argentina: [-38.42, -63.62],
  Argentine: [-38.42, -63.62],
  Mexico: [23.63, -102.55],
  Mexique: [23.63, -102.55],
  Egypt: [26.82, 30.8],
  Égypte: [26.82, 30.8],
  Egypte: [26.82, 30.8],
  Algeria: [28.03, 1.66],
  Algérie: [28.03, 1.66],
  Indonesia: [-0.79, 113.92],
  Indonésie: [-0.79, 113.92],
  Vietnam: [14.06, 108.28],
  Philippines: [12.88, 121.77],
  Thailand: [15.87, 100.99],
  Thaïlande: [15.87, 100.99],
  Singapore: [1.35, 103.82],
  Singapour: [1.35, 103.82],
  "EU-27": [50.85, 9.0],
  Pakistan: [30.38, 69.35],
  Bangladesh: [23.69, 90.36],
  Turkey: [38.96, 35.24],
  Turquie: [38.96, 35.24],
};

/** Icône unique : cercle vert + navire (silhouette type cargo, traits nets) */
const FLOATING_HUB_DIV_ICON = L.divIcon({
  className: "floating-hub-marker",
  html: `<div class="floating-hub-marker-inner" aria-hidden="true">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="floating-hub-ship-svg">
      <path d="M2 21c.6.5 1.2 1 2 1h2c.7 0 1.3-.3 1.7-.8L12 18l4.2 3.2c.4.5 1 .8 1.7.8h2c.8 0 1.4-.5 2-1"/>
      <path d="M4 16l2-10h12l2 10"/>
      <path d="M8 6V4h8v2"/>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

/** Taille marqueur navire logistique (px) — plus petit que les floating hubs */
const LOGISTICS_VESSEL_PX = 26;
const LOGISTICS_VESSEL_SVG = 13;
/** Incrémenter si la forme SVG change (invalide le cache des divIcon). */
const LOGISTICS_VESSEL_ICON_REV = 2;

const logisticsVesselIconCache = new Map<string, L.DivIcon>();

function hueFromString(s: string): number {
  let x = 0;
  for (let i = 0; i < s.length; i += 1) x = (x + s.charCodeAt(i) * (i + 1)) % 360;
  return x;
}

/** Dégradé distinct par produit (lisible sur fond carte sombre). */
function logisticProductGradient(product: string): { light: string; dark: string } {
  const p = product.trim();
  if (/\bDAP\b/i.test(p)) {
    return { light: "hsl(200 78% 48%)", dark: "hsl(218 72% 34%)" };
  }
  if (/\bMAP\b/i.test(p)) {
    return { light: "hsl(32 92% 54%)", dark: "hsl(24 85% 38%)" };
  }
  if (/\bTSP\b/i.test(p)) {
    return { light: "hsl(285 58% 56%)", dark: "hsl(275 62% 38%)" };
  }
  if (/\bNPK\b/i.test(p)) {
    return { light: "hsl(152 55% 44%)", dark: "hsl(160 58% 30%)" };
  }
  if (/acide|phosphorique/i.test(p)) {
    return { light: "hsl(335 70% 54%)", dark: "hsl(322 62% 38%)" };
  }
  if (/\bNPS\b/i.test(p)) {
    return { light: "hsl(48 95% 52%)", dark: "hsl(38 90% 38%)" };
  }
  const h = hueFromString(p || "—");
  return { light: `hsl(${h} 68% 50%)`, dark: `hsl(${h} 62% 34%)` };
}

/**
 * Navire marchand (vue de profil) : ligne de flottaison, coque, ponts superposés, cheminée —
 * silhouette différente des floating hubs (autre style de bateau).
 */
function buildLogisticsVesselDivIcon(product: string): L.DivIcon {
  const { light, dark } = logisticProductGradient(product);
  const s = LOGISTICS_VESSEL_PX;
  const half = s / 2;
  const w = LOGISTICS_VESSEL_SVG;
  return L.divIcon({
    className: "logistics-vessel-marker",
    html: `<div style="width:${s}px;height:${s}px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:linear-gradient(155deg,${light},${dark});border:1.5px solid rgba(255,255,255,0.9);box-shadow:0 1px 8px hsl(0 0% 0% / 0.5);" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="rgba(255,255,255,0.96)" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 18.5h20"/>
        <path d="M4.5 18.5L6.5 12h11l2 6.5"/>
        <path d="M7 12l1.2-4.5h7.6L17 12"/>
        <path d="M10.5 7.5V5.5h3v2"/>
        <path d="M6 15.5h12"/>
      </svg>
    </div>`,
    iconSize: [s, s],
    iconAnchor: [half, half],
    popupAnchor: [0, -half],
  });
}

function iconForLogisticsProduct(product: string): L.DivIcon {
  const key = `${LOGISTICS_VESSEL_ICON_REV}:${product.trim() || "_"}`;
  let icon = logisticsVesselIconCache.get(key);
  if (!icon) {
    icon = buildLogisticsVesselDivIcon(key);
    logisticsVesselIconCache.set(key, icon);
  }
  return icon;
}

type LayerFilter = "ports" | "clients" | "suppliers" | "floatingHubs";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getStatusColors(status: string) {
  if (status === "Operational" || status === "Opérationnel") {
    return { fill: "hsl(150 60% 48% / 0.18)", text: "hsl(150 60% 48%)" };
  }
  if (status === "Maintenance") {
    return { fill: "hsl(45 95% 52% / 0.18)", text: "hsl(45 95% 52%)" };
  }
  return { fill: "hsl(0 72% 60% / 0.18)", text: "hsl(0 72% 60%)" };
}

export interface GlobalMapProps {
  /** Lignes logistique (Data / tableau sous la carte) — positions Lat/Long */
  logisticsRows?: LogisticsStatusRow[];
}

export default function GlobalMap({ logisticsRows = [] }: GlobalMapProps) {
  const { t, locale } = useI18n();
  const { config, updateSection } = useDashboardData();
  const floatingHubs = useMemo(
    () => config.logisticsMappings.floatingHubs ?? [],
    [config.logisticsMappings.floatingHubs],
  );
  const { ports = [], clients = [], suppliers = [] } = config.referentiel;
  const mapLogistics = config.mapLogisticsDisplay;

  const productOptionsForMap = useMemo(() => {
    const codes = config.logisticsMappings.productCodes ?? [];
    const fromRows = logisticsRows.map((r) => r.product).filter(Boolean);
    return [...new Set([...codes, ...fromRows])].sort((a, b) => a.localeCompare(b, locale === "fr" ? "fr" : "en"));
  }, [config.logisticsMappings.productCodes, logisticsRows, locale]);

  const setMapLogistics = useCallback(
    (patch: Partial<MapLogisticsDisplay>) => {
      updateSection("mapLogisticsDisplay", { ...mapLogistics, ...patch });
    },
    [mapLogistics, updateSection],
  );

  const toggleVesselProduct = useCallback(
    (p: string) => {
      const cur = mapLogistics.vesselProductFilter;
      if (cur.length === 0) {
        setMapLogistics({ vesselProductFilter: [p] });
        return;
      }
      if (cur.includes(p)) {
        const next = cur.filter((x) => x !== p);
        setMapLogistics({ vesselProductFilter: next });
      } else {
        setMapLogistics({ vesselProductFilter: [...cur, p] });
      }
    },
    [mapLogistics.vesselProductFilter, setMapLogistics],
  );

  const visibleLogisticsVesselCount = useMemo(() => {
    if (!mapLogistics.showLogisticsVessels) return 0;
    const filter = mapLogistics.vesselProductFilter;
    return logisticsRows.filter((r) => {
      if (filter.length > 0 && !filter.includes(r.product)) return false;
      return Boolean(String(r.destination ?? "").trim());
    }).length;
  }, [logisticsRows, mapLogistics.showLogisticsVessels, mapLogistics.vesselProductFilter]);

  const mapShellRef = useRef<HTMLDivElement | null>(null);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  /** Panneau latéral droit (couches + navires) — peut être masqué pour libérer la carte */
  const [controlsPanelOpen, setControlsPanelOpen] = useState(true);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);
  const [activeLayers, setActiveLayers] = useState<Set<LayerFilter>>(
    new Set(["ports", "clients", "suppliers", "floatingHubs"]),
  );
  const [worldGeo, setWorldGeo] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/geo/ne_110m_admin_0_countries.geojson")
      .then((r) => r.json())
      .then((data: FeatureCollection) => {
        if (!cancelled && data?.type === "FeatureCollection" && Array.isArray(data.features)) {
          setWorldGeo(data);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const syncFs = () => {
      const shell = mapShellRef.current;
      setIsMapFullscreen(!!(shell && document.fullscreenElement === shell));
      requestAnimationFrame(() => {
        mapRef.current?.invalidateSize({ animate: false });
        setTimeout(() => mapRef.current?.invalidateSize({ animate: false }), 150);
      });
    };
    document.addEventListener("fullscreenchange", syncFs);
    return () => document.removeEventListener("fullscreenchange", syncFs);
  }, []);

  const invalidateMapSize = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    requestAnimationFrame(() => {
      map.invalidateSize({ animate: false });
      setTimeout(() => map.invalidateSize({ animate: false }), 200);
    });
  }, []);

  useEffect(() => {
    invalidateMapSize();
  }, [isMapFullscreen, invalidateMapSize]);

  const toggleMapFullscreen = useCallback(() => {
    const el = mapShellRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      void el.requestFullscreen?.();
    } else if (document.fullscreenElement === el) {
      void document.exitFullscreen?.();
    } else {
      void document.exitFullscreen?.().then(() => el.requestFullscreen?.());
    }
  }, []);

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

    const showClientCountries = activeLayers.has("clients");
    const showSupplierCountries = activeLayers.has("suppliers");
    if (worldGeo && (showClientCountries || showSupplierCountries)) {
      const clientIsos = isoCodesFromCountryLabels(clients.map((c) => c.country));
      const supplierIsos = isoCodesFromCountryLabels(suppliers.map((s) => s.country));
      const filtered: FeatureCollection = {
        type: "FeatureCollection",
        features: worldGeo.features.filter((f) => {
          const iso = featureIsoA2FromNaturalEarth(f);
          if (!iso) return false;
          if (showClientCountries && clientIsos.has(iso)) return true;
          if (showSupplierCountries && supplierIsos.has(iso)) return true;
          return false;
        }),
      };
      L.geoJSON(filtered, {
        interactive: false,
        style: (feature) => {
          const iso = feature ? featureIsoA2FromNaturalEarth(feature) : null;
          if (!iso) {
            return { fillOpacity: 0, weight: 0 };
          }
          const isClient = clientIsos.has(iso);
          const isSupplier = supplierIsos.has(iso);
          let fill: string;
          if (isClient && isSupplier) {
            fill = "hsl(72 58% 44% / 0.44)";
          } else if (isClient) {
            fill = "hsl(150 60% 42% / 0.4)";
          } else {
            fill = "hsl(45 95% 48% / 0.4)";
          }
          return {
            fillColor: fill,
            fillOpacity: 1,
            color: "hsl(0 0% 100% / 0.28)",
            weight: 0.65,
          };
        },
      }).addTo(group);
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
            <div style="font-weight:700;font-size:14px">${escapeHtml(port.name)}</div>
            <div style="color:hsl(0 0% 65%)">${escapeHtml(port.location)}</div>
            <div>${escapeHtml(t("map.popup.capacity"))} <strong>${port.capacityMt} ${escapeHtml(t("map.popup.perYear"))}</strong></div>
            <div>${escapeHtml(t("map.popup.utilization"))} <strong>${escapeHtml(port.currentUtilization)}</strong></div>
            <div>${escapeHtml(t("map.popup.products"))} ${escapeHtml(port.products)}</div>
            <div style="display:inline-block;margin-top:6px;padding:2px 6px;border-radius:999px;background:${status.fill};color:${status.text};font-size:10px;font-weight:600">${escapeHtml(port.status)}</div>
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
            <div style="font-weight:700;font-size:14px">${escapeHtml(client.name)}</div>
            <div>${escapeHtml(client.country)} — ${escapeHtml(client.zone)}</div>
            <div>${escapeHtml(t("map.popup.products"))} ${escapeHtml(client.products)}</div>
            <div>${escapeHtml(t("map.popup.volume"))} <strong>${escapeHtml(client.annualVolume)}</strong></div>
            <div>${escapeHtml(t("map.popup.contract"))} ${escapeHtml(client.contractType)}</div>
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
            <div style="font-weight:700;font-size:14px">${escapeHtml(supplier.name)}</div>
            <div>${escapeHtml(supplier.country)} — ${escapeHtml(supplier.zone)}</div>
            <div>${escapeHtml(t("map.popup.products"))} ${escapeHtml(supplier.products)}</div>
            <div>${escapeHtml(t("map.popup.contract"))} ${escapeHtml(supplier.contractType)}</div>
            <div>${escapeHtml(t("map.popup.rating"))} <strong>${escapeHtml(supplier.rating)}</strong></div>
          </div>
        `);
      });
    }

    if (activeLayers.has("floatingHubs")) {
      floatingHubs.forEach((hub) => {
        const marker = L.marker([hub.lat, hub.lng], { icon: FLOATING_HUB_DIV_ICON }).addTo(group);
        marker.bindPopup(`
          <div style="font-size:12px;line-height:1.45;color:hsl(0 0% 95%)">
            <div style="font-weight:700;font-size:14px">${escapeHtml(hub.name)}</div>
            <div style="color:hsl(0 0% 65%)">${escapeHtml(t("map.floatingHubSubtitle"))}</div>
            <div style="margin-top:6px;font-family:ui-monospace,monospace;font-size:11px">${hub.lat.toFixed(2)}°, ${hub.lng.toFixed(2)}°</div>
          </div>
        `);
        marker.bindTooltip(hub.name, { direction: "top", offset: [0, -18], className: "map-tooltip" });
      });
    }

    if (mapLogistics.showLogisticsVessels) {
      const filter = mapLogistics.vesselProductFilter;
      logisticsRows.forEach((row, rowIndex) => {
        if (filter.length > 0 && !filter.includes(row.product)) return;
        const dest = String(row.destination ?? "").trim();
        if (!dest) return;
        /** Toujours dériver la position depuis la destination (mer) — pas row.lat/lng du stockage (souvent terre). */
        const atSea = coordsNearDestination(dest, rowIndex);
        const marker = L.marker([atSea.lat, atSea.lng], { icon: iconForLogisticsProduct(row.product) }).addTo(group);
        const name = escapeHtml(row.vesselName.trim() || "—");
        const vid = escapeHtml(row.vesselId);
        const destLabel = displayReferenceValue(String(row.destination ?? ""), "country", locale);
        const productLabel = displayReferenceValue(String(row.product ?? ""), "freeText", locale);
        marker.bindPopup(`
          <div style="font-size:12px;line-height:1.45;color:hsl(0 0% 95%)">
            <div style="font-weight:700;font-size:14px">${vid} — ${name}</div>
            <div>${escapeHtml(productLabel)} → ${escapeHtml(destLabel)}</div>
            <div style="color:hsl(0 0% 65%)">${escapeHtml(row.vesselStatus)}</div>
            <div style="margin-top:6px;font-size:10px;color:hsl(0 0% 55%)">${escapeHtml(t("map.popupMaritime"))}</div>
            <div style="margin-top:4px;font-family:ui-monospace,monospace;font-size:11px">${atSea.lat.toFixed(4)}°, ${atSea.lng.toFixed(4)}°</div>
          </div>
        `);
        marker.bindTooltip(`${vid} · ${escapeHtml(productLabel)}`, {
          direction: "top",
          offset: [0, -16],
          className: "map-tooltip",
        });
      });
    }
  }, [
    activeLayers,
    clients,
    floatingHubs,
    logisticsRows,
    mapLogistics.showLogisticsVessels,
    mapLogistics.vesselProductFilter,
    ports,
    suppliers,
    worldGeo,
    t,
    locale,
  ]);

  const toggleLayer = (layer: LayerFilter) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  };

  const layerItems: { key: LayerFilter; labelKey: string; color: string }[] = [
    { key: "ports", labelKey: "map.layer.ports", color: "hsl(var(--primary))" },
    { key: "clients", labelKey: "map.layer.clients", color: "hsl(150 60% 48%)" },
    { key: "suppliers", labelKey: "map.layer.suppliers", color: "hsl(45 95% 52%)" },
    { key: "floatingHubs", labelKey: "map.layer.floatingHubs", color: "hsl(145 65% 38%)" },
  ];

  return (
    <div
      ref={mapShellRef}
      className={cn("relative h-full w-full min-h-0 overflow-hidden rounded-xl bg-background", isMapFullscreen && "rounded-none")}
    >
      <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1.5">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-8 gap-1.5 border border-border/80 bg-card/95 px-2.5 text-xs shadow-lg backdrop-blur-md"
          onClick={toggleMapFullscreen}
          title={isMapFullscreen ? t("map.fullscreenTitleExit") : t("map.fullscreenTitleEnter")}
        >
          {isMapFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          {isMapFullscreen ? t("map.exitFullscreen") : t("map.fullscreen")}
        </Button>
      </div>

      {controlsPanelOpen ? (
        <div className="absolute top-3 right-3 z-[1000] flex max-h-[min(100vh-6rem,520px)] w-[min(100vw-1.5rem,18rem)] flex-col gap-1.5 overflow-y-auto rounded-lg border border-border bg-card/90 p-2.5 shadow-lg backdrop-blur-md">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{t("map.layersTitle")}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => setControlsPanelOpen(false)}
              title={t("map.layersHidePanel")}
              aria-label={t("map.layersHidePanel")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {layerItems.map(({ key, labelKey, color }) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleLayer(key)}
              className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-all ${
                activeLayers.has(key) ? "bg-secondary text-foreground" : "text-muted-foreground opacity-50"
              }`}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: activeLayers.has(key) ? color : "hsl(var(--muted-foreground))" }}
              />
              {t(labelKey)}
            </button>
          ))}
          <p className="mt-1 max-w-[14rem] text-[10px] leading-snug text-muted-foreground">{t("map.layersHelp")}</p>

          <hr className="my-2 border-border/60" />
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {t("map.logisticsSection")}
          </span>
          <div className="flex items-center gap-2 rounded-md px-1 py-0.5 hover:bg-muted/40">
            <Checkbox
              id="map-layer-logistics-vessels"
              checked={mapLogistics.showLogisticsVessels}
              onCheckedChange={(v) => setMapLogistics({ showLogisticsVessels: v === true })}
              className="border-muted-foreground/60 data-[state=checked]:border-primary"
            />
            <Label htmlFor="map-layer-logistics-vessels" className="flex flex-1 cursor-pointer items-center gap-2 text-xs font-normal leading-snug">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  background: mapLogistics.showLogisticsVessels ? "hsl(200 90% 52%)" : "hsl(var(--muted-foreground))",
                }}
              />
              {t("map.showVessels")}
            </Label>
          </div>
          {mapLogistics.showLogisticsVessels && (
            <div className="mt-2 space-y-1.5">
              <span className="text-[10px] text-muted-foreground">{t("map.productShipped")}</span>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setMapLogistics({ vesselProductFilter: [] })}
                  className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                    mapLogistics.vesselProductFilter.length === 0
                      ? "bg-primary/20 text-foreground"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  {t("map.productAll")}
                </button>
                {productOptionsForMap.map((p) => {
                  const all = mapLogistics.vesselProductFilter.length === 0;
                  const on = all || mapLogistics.vesselProductFilter.includes(p);
                  const dot = logisticProductGradient(p).light;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => toggleVesselProduct(p)}
                      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                        on ? "bg-secondary text-foreground" : "bg-muted/30 text-muted-foreground opacity-70 hover:opacity-100"
                      }`}
                    >
                      <span className="h-2 w-2 shrink-0 rounded-full border border-white/30" style={{ background: dot }} title={p} />
                      {p}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] leading-snug text-muted-foreground">
                {t("map.markerCount", { count: visibleLogisticsVesselCount })}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="absolute top-3 right-3 z-[1000]">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-9 gap-2 border border-border/80 bg-card/95 px-3 text-xs shadow-lg backdrop-blur-md"
            onClick={() => setControlsPanelOpen(true)}
            title={t("map.layersShowTitle")}
          >
            <Layers className="h-4 w-4 shrink-0" />
            {t("map.layersShowButton")}
          </Button>
        </div>
      )}

      <div className="absolute bottom-3 left-3 z-[1000] rounded-lg border border-border bg-card/90 p-3 shadow-lg backdrop-blur-md">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-center sm:grid-cols-4">
          <div>
            <div className="font-mono text-lg font-bold text-primary">{ports.length}</div>
            <div className="text-[10px] uppercase text-muted-foreground">{t("map.statsPorts")}</div>
          </div>
          <div>
            <div className="font-mono text-lg font-bold" style={{ color: "hsl(150 60% 48%)" }}>{clients.length}</div>
            <div className="text-[10px] uppercase text-muted-foreground">{t("map.statsClients")}</div>
          </div>
          <div>
            <div className="font-mono text-lg font-bold" style={{ color: "hsl(45 95% 52%)" }}>{suppliers.length}</div>
            <div className="text-[10px] uppercase text-muted-foreground">{t("map.statsSuppliers")}</div>
          </div>
          <div>
            <div className="font-mono text-lg font-bold" style={{ color: "hsl(145 65% 38%)" }}>{floatingHubs.length}</div>
            <div className="text-[10px] uppercase text-muted-foreground">{t("map.statsFloating")}</div>
          </div>
        </div>
      </div>

      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
}
