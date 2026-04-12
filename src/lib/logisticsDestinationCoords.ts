/**
 * Positions WGS84 en mer, au large des destinations.
 * Dispersion 2D selon l’index de ligne pour éviter les empilements de navires,
 * tout en restant dans une fenêtre maritime plausible par bassin.
 */

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Décale le point de base dans une zone maritime : combinaison de sinus à fréquences
 * incommensurables → nuage de points espacés (pas alignés sur une ligne).
 * `spreadLat` / `spreadLng` = ampleur typique en degrés (~demi-largeur de la « tache »).
 */
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

/**
 * Point indicatif en mer, cohérent avec la destination ; plusieurs navires vers le même
 * pays se répartissent sur une zone au large (évite les marqueurs superposés).
 */
export function coordsNearDestination(destination: string, rowIndex: number): { lat: number; lng: number } {
  const n = norm(destination);

  /* Atlantique S — grande marge pour disperser plusieurs lignes */
  if (n.includes("bresil") || n.includes("brazil") || n.includes("santos")) {
    return offshoreSpread(-24.2, -41.8, rowIndex, 1.35, 1.7);
  }
  /* Mer d’Arabie — fenêtre plus serrée pour rester au large des côtes */
  if (n.includes("inde") || n.includes("india") || n.includes("paradip") || n.includes("mumbai")) {
    return offshoreSpread(17.5, 68.9, rowIndex, 0.58, 0.78);
  }
  /* Golfe du Mexique */
  if (n.includes("usa") || n.includes("etats-unis") || n.includes("united states") || n.includes("tampa")) {
    return offshoreSpread(26.8, -88.2, rowIndex, 0.88, 1.15);
  }
  if (n.includes("mexique") || n.includes("mexico")) {
    return offshoreSpread(21.2, -91.4, rowIndex, 0.72, 1.0);
  }
  if (n.includes("pakistan") || n.includes("karachi")) {
    return offshoreSpread(23.2, 65.5, rowIndex, 0.48, 0.58);
  }
  if (n.includes("australie") || n.includes("australia")) {
    return offshoreSpread(-31.8, 112.2, rowIndex, 0.95, 1.2);
  }
  if (
    n.includes("europe") ||
    n.includes("anvers") ||
    n.includes("antwerp") ||
    n.includes("belgique") ||
    n.includes("belgium") ||
    n.includes("rotterdam") ||
    n.includes("hambourg")
  ) {
    return offshoreSpread(48.2, -7.0, rowIndex, 0.78, 1.0);
  }
  if (n.includes("maroc") || n.includes("morocco") || n.includes("casablanca") || n.includes("jorf")) {
    return offshoreSpread(33.35, -10.35, rowIndex, 0.52, 0.68);
  }
  if (n.includes("kenya") || n.includes("mombasa")) {
    return offshoreSpread(-4.45, 41.55, rowIndex, 0.48, 0.62);
  }
  if (n.includes("nigeria") || n.includes("lagos")) {
    return offshoreSpread(3.9, 5.4, rowIndex, 0.58, 0.75);
  }
  if (n.includes("turquie") || n.includes("turkey")) {
    return offshoreSpread(38.0, 27.2, rowIndex, 0.48, 0.58);
  }
  if (n.includes("bangladesh")) {
    return offshoreSpread(20.5, 91.0, rowIndex, 0.58, 0.72);
  }

  /* Atlantique tropical — grande dispersion par défaut */
  return offshoreSpread(12.5, -40.5, rowIndex, 1.4, 1.75);
}
