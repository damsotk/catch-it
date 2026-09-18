import type { ExpressionSpecification } from "maplibre-gl";
import { Layer } from "react-map-gl/maplibre";
import { LABEL_FONT, MAJOR_RANK, SOURCE_ID } from "../constants/stopStyle";
import { isMajor } from "../utils/stopExpressions";

const TEXT_HALO = { "text-halo-color": "#0b0d12", "text-halo-width": 1.5 };

const offsetBelow = (
  from: [zoom: number, ems: number],
  to: [zoom: number, ems: number],
): ExpressionSpecification => [
  "interpolate",
  ["linear"],
  ["zoom"],
  from[0],
  ["literal", [0, from[1]]],
  to[0],
  ["literal", [0, to[1]]],
];

export function StopLabelLayers({
  visibility,
}: {
  visibility: "visible" | "none";
}) {
  return (
    <>
      <Layer
        id="stops-labels-major"
        source={SOURCE_ID}
        type="symbol"
        minzoom={13}
        filter={["all", isMajor, ["!=", ["get", "kind"], "entrance"]]}
        layout={{
          visibility,
          "text-field": ["get", "name"],
          "text-font": LABEL_FONT,
          "text-size": 12,
          "text-anchor": "top",
          "text-offset": offsetBelow([13, 0.9], [17, 2]),
          "symbol-sort-key": ["-", ["get", "rank"]],
        }}
        paint={{ "text-color": "#f2f2f7", ...TEXT_HALO }}
      />
      <Layer
        id="stops-labels-minor"
        source={SOURCE_ID}
        type="symbol"
        minzoom={15.5}
        filter={["<", ["get", "rank"], MAJOR_RANK]}
        layout={{
          visibility,
          "text-field": ["get", "name"],
          "text-font": LABEL_FONT,
          "text-size": 11,
          "text-anchor": "top",
          "text-offset": offsetBelow([15.5, 0.8], [17, 1.4]),
          "symbol-sort-key": ["-", ["get", "rank"]],
        }}
        paint={{ "text-color": ["get", "color"], ...TEXT_HALO }}
      />
    </>
  );
}
