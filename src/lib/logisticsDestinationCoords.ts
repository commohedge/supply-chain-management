/**
 * Positions WGS84 en mer, au large des destinations.
 * Dispersion 2D selon l’index de ligne pour éviter les empilements de navires,
 * tout en restant dans une fenêtre maritime plausible par bassin.
 *
 * Couvre les destinations utilisées par tous les commodity presets
 * (phosphates, copper, LNG, grains).
 */

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function offshoreSpread(
  baseLat: number,
  baseLng: number,
  rowIndex: number,
  spreadLat: number,
  spreadLng: number,
): { lat: number; lng: number } {
  const t = rowIndex * 2.5132741228718345;
  const u = rowIndex * 1.4142135623730951;
  const v = (rowIndex + 1) * 0.7937005259840998;

  const dLat =
    Math.sin(t) * spreadLat * 0.95 +
    Math.cos(u * 0.71) * spreadLat * 0.62 +
    Math.sin(v * 1.13) * spreadLat * 0.38;

  const dLng =
    Math.cos(t * 0.83) * spreadLng * 0.95 +
    Math.sin(u * 1.07) * spreadLng * 0.62 +
    Math.cos(v * 0.97) * spreadLng * 0.38;

  return {
    lat: Math.round((baseLat + dLat) * 1e5) / 1e5,
    lng: Math.round((baseLng + dLng) * 1e5) / 1e5,
  };
}

export function coordsNearDestination(destination: string, rowIndex: number): { lat: number; lng: number } {
  const n = norm(destination);

  // ── Asie de l'Est ──────────────────────────────────────────
  if (n.includes("china") || n.includes("chine") || n.includes("shanghai") || n.includes("yangshan") || n.includes("qingdao") || n.includes("yantai") || n.includes("ningbo")) {
    return offshoreSpread(31.0, 124.0, rowIndex, 1.6, 1.4); // Mer de Chine orientale
  }
  if (n.includes("japon") || n.includes("japan") || n.includes("tokyo") || n.includes("yokohama")) {
    return offshoreSpread(34.5, 140.5, rowIndex, 0.85, 1.1);
  }
  if (n.includes("south korea") || n.includes("coree du sud") || n.includes("coree") || n.includes("korea") || n.includes("incheon")) {
    return offshoreSpread(35.6, 125.8, rowIndex, 0.65, 0.85);
  }
  if (n.includes("taiwan")) {
    return offshoreSpread(24.0, 121.5, rowIndex, 0.55, 0.65);
  }

  // ── Asie du Sud / SE ───────────────────────────────────────
  if (n.includes("inde") || n.includes("india") || n.includes("paradip") || n.includes("mumbai") || n.includes("dahej")) {
    return offshoreSpread(17.5, 68.9, rowIndex, 0.58, 0.78);
  }
  if (n.includes("pakistan") || n.includes("karachi")) {
    return offshoreSpread(23.2, 65.5, rowIndex, 0.48, 0.58);
  }
  if (n.includes("bangladesh") || n.includes("chittagong")) {
    return offshoreSpread(20.5, 91.0, rowIndex, 0.58, 0.72);
  }
  if (n.includes("indonesie") || n.includes("indonesia") || n.includes("jakarta")) {
    return offshoreSpread(-6.2, 106.5, rowIndex, 0.85, 1.1);
  }
  if (n.includes("philippines") || n.includes("manila")) {
    return offshoreSpread(14.5, 120.5, rowIndex, 0.75, 0.85);
  }
  if (n.includes("vietnam") || n.includes("haiphong") || n.includes("ho chi minh")) {
    return offshoreSpread(12.5, 109.5, rowIndex, 0.85, 0.95);
  }
  if (n.includes("thailande") || n.includes("thailand")) {
    return offshoreSpread(11.5, 99.5, rowIndex, 0.7, 0.8);
  }
  if (n.includes("singapour") || n.includes("singapore") || n.includes("malaisie") || n.includes("malaysia")) {
    return offshoreSpread(2.5, 104.5, rowIndex, 0.7, 0.85);
  }

  // ── Europe ────────────────────────────────────────────────
  if (
    n.includes("eu-27") ||
    n.includes("europe") ||
    n.includes("anvers") ||
    n.includes("antwerp") ||
    n.includes("belgique") ||
    n.includes("belgium") ||
    n.includes("rotterdam") ||
    n.includes("netherlands") ||
    n.includes("pays-bas") ||
    n.includes("hambourg") ||
    n.includes("hamburg") ||
    n.includes("germany") ||
    n.includes("allemagne") ||
    n.includes("zeebrugge")
  ) {
    return offshoreSpread(51.5, 2.5, rowIndex, 1.1, 1.4); // Mer du Nord
  }
  if (n.includes("uk") || n.includes("royaume-uni") || n.includes("britain")) {
    return offshoreSpread(51.0, -2.5, rowIndex, 0.9, 1.2);
  }
  if (n.includes("france")) {
    return offshoreSpread(46.5, -4.5, rowIndex, 0.9, 1.2);
  }
  if (n.includes("italie") || n.includes("italy")) {
    return offshoreSpread(40.5, 14.5, rowIndex, 0.8, 1.0);
  }
  if (n.includes("espagne") || n.includes("spain") || n.includes("barcelone") || n.includes("barcelona")) {
    return offshoreSpread(38.5, -1.5, rowIndex, 0.85, 1.0);
  }
  if (n.includes("turquie") || n.includes("turkey") || n.includes("istanbul")) {
    return offshoreSpread(38.0, 27.2, rowIndex, 0.48, 0.58);
  }
  if (n.includes("constanta") || n.includes("romania") || n.includes("roumanie")) {
    return offshoreSpread(43.5, 30.0, rowIndex, 0.55, 0.7); // Mer Noire
  }
  if (n.includes("russia") || n.includes("russie") || n.includes("yamal")) {
    return offshoreSpread(70.5, 65.0, rowIndex, 0.9, 1.2); // Mer de Kara
  }

  // ── Moyen-Orient ──────────────────────────────────────────
  if (n.includes("qatar") || n.includes("ras laffan")) {
    return offshoreSpread(26.2, 51.8, rowIndex, 0.45, 0.5);
  }
  if (n.includes("emirat") || n.includes("emirates") || n.includes("uae")) {
    return offshoreSpread(25.5, 55.0, rowIndex, 0.45, 0.55);
  }
  if (n.includes("arabie") || n.includes("saudi")) {
    return offshoreSpread(27.0, 50.0, rowIndex, 0.5, 0.6);
  }

  // ── Afrique ───────────────────────────────────────────────
  if (n.includes("egypt") || n.includes("egypte") || n.includes("alexandria") || n.includes("alexandrie")) {
    return offshoreSpread(31.8, 30.0, rowIndex, 0.55, 0.7);
  }
  if (n.includes("algerie") || n.includes("algeria")) {
    return offshoreSpread(37.5, 3.0, rowIndex, 0.55, 0.7);
  }
  if (n.includes("nigeria") || n.includes("lagos") || n.includes("bonny")) {
    return offshoreSpread(3.9, 5.4, rowIndex, 0.58, 0.75);
  }
  if (n.includes("kenya") || n.includes("mombasa")) {
    return offshoreSpread(-4.45, 41.55, rowIndex, 0.48, 0.62);
  }
  if (n.includes("ethiopie") || n.includes("ethiopia") || n.includes("djibouti")) {
    return offshoreSpread(11.5, 44.0, rowIndex, 0.55, 0.7);
  }
  if (n.includes("maroc") || n.includes("morocco") || n.includes("casablanca") || n.includes("jorf")) {
    return offshoreSpread(33.35, -10.35, rowIndex, 0.52, 0.68);
  }

  // ── Amériques ─────────────────────────────────────────────
  if (n.includes("usa") || n.includes("etats-unis") || n.includes("united states") || n.includes("tampa") || n.includes("new orleans") || n.includes("nola")) {
    return offshoreSpread(26.8, -88.2, rowIndex, 0.88, 1.15);
  }
  if (n.includes("mexique") || n.includes("mexico") || n.includes("veracruz")) {
    return offshoreSpread(21.2, -91.4, rowIndex, 0.72, 1.0);
  }
  if (n.includes("bresil") || n.includes("brazil") || n.includes("santos") || n.includes("paranagua")) {
    return offshoreSpread(-24.2, -41.8, rowIndex, 1.35, 1.7);
  }
  if (n.includes("argentine") || n.includes("argentina") || n.includes("rosario") || n.includes("buenos")) {
    return offshoreSpread(-37.0, -55.0, rowIndex, 1.0, 1.2);
  }
  if (n.includes("chili") || n.includes("chile") || n.includes("antofagasta") || n.includes("mejillones")) {
    return offshoreSpread(-23.5, -71.5, rowIndex, 0.95, 0.85);
  }
  if (n.includes("perou") || n.includes("peru") || n.includes("callao") || n.includes("bayovar")) {
    return offshoreSpread(-12.0, -78.5, rowIndex, 0.85, 0.85);
  }
  if (n.includes("trinidad") || n.includes("trinite")) {
    return offshoreSpread(11.0, -62.5, rowIndex, 0.5, 0.6);
  }
  if (n.includes("canada") || n.includes("vancouver")) {
    return offshoreSpread(48.5, -127.0, rowIndex, 1.0, 1.4);
  }

  // ── Océanie ───────────────────────────────────────────────
  if (n.includes("australie") || n.includes("australia") || n.includes("gladstone")) {
    return offshoreSpread(-23.5, 152.5, rowIndex, 1.1, 1.3);
  }

  // Atlantique tropical par défaut — large dispersion
  return offshoreSpread(12.5, -40.5, rowIndex, 1.4, 1.75);
}
