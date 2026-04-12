/**
 * Point d’entrée unique — mapping navires bulk carriers + ressources statiques.
 * (Freight Simulator, Data Hub, futures vues opérationnelles.)
 */

export {
  BULK_CARRIER_CLASS_SEGMENTS,
  classifyDwt,
  primaryClassForDwt,
  type BulkCarrierClassSegment,
  type VesselDimensionRange,
} from "./vesselSegments";

export {
  BULK_VESSELS_FLEET_SAMPLE,
  BULK_VESSELS_SOURCE,
  findFleetVesselByName,
  type BulkVesselFleetRecord,
} from "./bulkVesselsFleet";

/** Infographie classes DWT / LOA / tirant d’eau (fichier dans `public/`). */
export const BULK_CARRIER_CLASSES_IMAGE = "/bulk-carrier-classes-infographic.png";

/** Fichier Excel source (50 navires) — téléchargeable depuis l’app. */
export const BULK_VESSELS_XLSX = "/bulk_vessels_50.xlsx";
