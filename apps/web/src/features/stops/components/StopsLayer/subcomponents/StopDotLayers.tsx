import { Layer } from "react-map-gl/maplibre";
import { ARROW_BASE, GLYPH_SIZE } from "@/features/stops/utils/stopIcons";
import {
  ARROW_GAP,
  ARROW_MIN_ZOOM,
  GLYPH_FILL,
  GLYPH_MIN_ZOOM,
  SOURCE_ID,
  type StopGroup,
} from "../constants/stopStyle";
import {
  byZoom,
  coreRadius,
  coreRadiusFrom,
  fadeIn,
  glowRadius,
  isMajor,
  scaled,
} from "../utils/stopExpressions";

type StopDotLayersProps = {
  group: StopGroup;
  visibility: "visible" | "none";
  iconsReady: boolean;
};

export function StopDotLayers({
  group,
  visibility,
  iconsReady,
}: StopDotLayersProps) {
  const { id, filter, minzoom, maxzoom } = group;
  const arrowZoom = Math.max(minzoom, ARROW_MIN_ZOOM);
  const glyphZoom = Math.max(minzoom, GLYPH_MIN_ZOOM);

  return (
    <>
      <Layer
        id={`${id}-glow`}
        source={SOURCE_ID}
        type="circle"
        minzoom={minzoom}
        maxzoom={maxzoom}
        filter={filter}
        layout={{ "circle-sort-key": ["get", "rank"], visibility }}
        paint={{
          "circle-color": ["get", "color"],
          "circle-radius": glowRadius,
          "circle-blur": 1,
          "circle-opacity": ["case", isMajor, 0.55, 0.3],
        }}
      />
      {iconsReady && arrowZoom < maxzoom && (
        <Layer
          id={`${id}-direction`}
          source={SOURCE_ID}
          type="symbol"
          minzoom={arrowZoom}
          maxzoom={maxzoom}
          filter={["all", filter, ["has", "bearing"]]}
          layout={{
            visibility,
            "icon-image": ["get", "arrow"],
            "icon-size": byZoom(coreRadiusFrom(arrowZoom), (base) => [
              "/",
              ["+", scaled(base), ARROW_GAP],
              ARROW_BASE,
            ]),
            "icon-rotate": ["get", "bearing"],
            "icon-rotation-alignment": "map",
            "icon-pitch-alignment": "map",
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
            "symbol-sort-key": ["get", "rank"],
          }}
          paint={{ "icon-opacity": fadeIn(arrowZoom) }}
        />
      )}
      <Layer
        id={`${id}-core`}
        source={SOURCE_ID}
        type="circle"
        minzoom={minzoom}
        maxzoom={maxzoom}
        filter={filter}
        layout={{ "circle-sort-key": ["get", "rank"], visibility }}
        paint={{
          "circle-color": ["get", "color"],
          "circle-radius": coreRadius,
          "circle-stroke-color": ["get", "ring"],
          "circle-stroke-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            ["case", isMajor, 1, 0.3],
            15,
            ["case", isMajor, 2.5, 1.2],
          ],
        }}
      />
      {iconsReady && glyphZoom < maxzoom && (
        <Layer
          id={`${id}-glyphs`}
          source={SOURCE_ID}
          type="symbol"
          minzoom={glyphZoom}
          maxzoom={maxzoom}
          filter={filter}
          layout={{
            visibility,
            "icon-image": ["get", "glyph"],
            "icon-size": byZoom(coreRadiusFrom(glyphZoom), (base) =>
              scaled((base * GLYPH_FILL) / GLYPH_SIZE),
            ),
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
            "symbol-sort-key": ["get", "rank"],
          }}
          paint={{ "icon-opacity": fadeIn(glyphZoom) }}
        />
      )}
    </>
  );
}
