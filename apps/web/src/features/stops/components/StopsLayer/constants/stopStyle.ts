import type { ExpressionSpecification } from "maplibre-gl";
import { MODE_RANK } from "@/features/stops/constants/transitModes";

export type ZoomStops = [zoom: number, value: number][];

export type StopGroup = {
  id: string;
  filter: ExpressionSpecification;
  minzoom: number;
  maxzoom: number;
};

export const SOURCE_ID = "stops";

export const ENTRANCE_ZOOM = 16;
export const ENTRANCE_SCALE = 1.3;

export const MAJOR_RANK = MODE_RANK.train;
export const LABEL_FONT = ["Roboto Medium", "Noto Sans Medium"];

export const ARROW_MIN_ZOOM = 14;
export const ARROW_GAP = 2.5;
export const GLYPH_MIN_ZOOM = 15;
export const GLYPH_FILL = 1.45;

export const CORE_RADIUS: ZoomStops = [
  [10, 1.3],
  [13, 3.2],
  [15, 5.5],
  [17, 10],
];

export const GLOW_RADIUS: ZoomStops = [
  [10, 3],
  [13, 8],
  [16, 15],
  [17, 18],
];

const ofKind = (kind: string): ExpressionSpecification => [
  "==",
  ["get", "kind"],
  kind,
];

export const STOP_GROUPS: StopGroup[] = [
  { id: "stops", filter: ofKind("stop"), minzoom: 0, maxzoom: 24 },
  {
    id: "stations",
    filter: ofKind("station"),
    minzoom: 0,
    maxzoom: ENTRANCE_ZOOM,
  },
  {
    id: "entrances",
    filter: ofKind("entrance"),
    minzoom: ENTRANCE_ZOOM,
    maxzoom: 24,
  },
];

export const STOP_DOT_LAYER_IDS = STOP_GROUPS.map(
  (group) => `${group.id}-core`,
);
