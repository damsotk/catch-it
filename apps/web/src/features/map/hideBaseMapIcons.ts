import type { Map as MapLibreMap } from "maplibre-gl";

const PLACE_SOURCE_LAYERS = new Set([
  "city_label",
  "town_label",
  "place_label",
]);

export function hideBaseMapIcons(map: MapLibreMap) {
  for (const layer of map.getStyle().layers) {
    if (layer.type !== "symbol" || !layer.layout?.["icon-image"]) continue;
    // Only basemap layers read from vector tiles; our GeoJSON layers may
    // already be on the map when this runs and must stay visible.
    if (!layer["source-layer"]) continue;

    if (PLACE_SOURCE_LAYERS.has(layer["source-layer"] ?? "")) {
      map.setLayoutProperty(layer.id, "icon-image", undefined);
    } else {
      map.setLayoutProperty(layer.id, "visibility", "none");
    }
  }
}
