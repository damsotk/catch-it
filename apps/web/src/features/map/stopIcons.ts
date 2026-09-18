import type { Map as MapLibreMap } from "maplibre-gl";
import type { TransitMode } from "@catch-it/core";

// Glyphs live on a 24x24 grid and are drawn as one filled path (even-odd, so
// windows and lights become see-through holes onto the stop colour) plus an
// optional stroked path for poles, rails and the metro "M".
type Glyph = { fill?: string; stroke?: string };

const rect = (x: number, y: number, w: number, h: number, r = 0) =>
  `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}` +
  `a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}` +
  `v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`;

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;

const GLYPHS: Record<TransitMode, Glyph> = {
  metro: {
    stroke: "M5.5 19V5.5l6.5 8 6.5-8V19",
  },
  train: {
    fill:
      rect(5, 2.5, 14, 16, 4) +
      rect(7.5, 5, 9, 5.5, 1.2) +
      circle(9, 14.5, 1.3) +
      circle(15, 14.5, 1.3),
    stroke: "M8.5 19 6.5 22M15.5 19l2 3",
  },
  tram: {
    fill:
      rect(6, 6, 12, 13.5, 3) +
      rect(8, 8.5, 8, 5, 1) +
      circle(9.5, 16.3, 1.1) +
      circle(14.5, 16.3, 1.1),
    stroke: "M12 6V3.2M8.5 3.2h7M6.5 22h11",
  },
  trolleybus: {
    fill:
      rect(5, 8, 14, 11, 2.5) +
      rect(7, 10, 10, 4, 1) +
      circle(8.5, 16.3, 1.1) +
      circle(15.5, 16.3, 1.1) +
      rect(6.5, 19.2, 3, 2.5, 0.8) +
      rect(14.5, 19.2, 3, 2.5, 0.8),
    stroke: "M10 8 8 2.5M14 8l-2-5.5",
  },
  bus: {
    fill:
      rect(5, 3, 14, 16, 2.5) +
      rect(7, 5.5, 10, 6, 1) +
      circle(8.5, 15, 1.2) +
      circle(15.5, 15, 1.2) +
      rect(6.5, 19.2, 3, 2.5, 0.8) +
      rect(14.5, 19.2, 3, 2.5, 0.8),
  },
  ferry: {
    fill:
      "M3 14h18l-2.5 5h-13z" +
      rect(7, 9, 10, 5, 1) +
      circle(10, 11.5, 0.9) +
      circle(14, 11.5, 0.9),
    stroke: "M12 9V5M3 22c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0 3 1 4.5 0",
  },
  funicular: {
    fill: "M5 20v-4.5l14-7V20z" + "M8 18v-1.4l3-1.5V18z" + "M13 18v-3.9l3-1.5V18z",
    stroke: "M2.5 15.5 21.5 5",
  },
  other: {
    fill: circle(12, 12, 4),
  },
};

const GLYPH_DARK = "#0b0d12";
const GLYPH_LIGHT = "#ffffff";

// Icons are rendered at 3x so they stay sharp on high-density screens.
const PIXEL_RATIO = 3;
const GLYPH_SIZE = 24;

// The arrow image is centred on the stop; its base sits ARROW_BASE px from the
// centre, so scaling the image moves the arrow along the circle's edge.
export const ARROW_IMAGE_SIZE = 48;
export const ARROW_BASE = 12;

function glyphSvg(glyph: Glyph, color: string) {
  const fill = glyph.fill
    ? `<path d="${glyph.fill}" fill="${color}" fill-rule="evenodd"/>`
    : "";
  const stroke = glyph.stroke
    ? `<path d="${glyph.stroke}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`
    : "";
  const px = GLYPH_SIZE * PIXEL_RATIO;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 24 24">${fill}${stroke}</svg>`;
}

function arrowSvg(color: string) {
  const px = ARROW_IMAGE_SIZE * PIXEL_RATIO;
  const c = ARROW_IMAGE_SIZE / 2;
  const base = c - ARROW_BASE;
  const d = `M${c} ${base - 7}L${c + 6} ${base}H${c - 6}z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${ARROW_IMAGE_SIZE} ${ARROW_IMAGE_SIZE}"><path d="${d}" fill="${color}" stroke="${GLYPH_DARK}" stroke-width="1.5" stroke-linejoin="round" paint-order="stroke"/></svg>`;
}

// Relative luminance decides whether a dark or a white glyph reads better.
function prefersDarkGlyph(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.3;
}

export const glyphImageId = (mode: TransitMode, background: string) =>
  `stop-glyph-${mode}-${prefersDarkGlyph(background) ? "dark" : "light"}`;

export const arrowImageId = (color: string) => `stop-arrow-${color}`;

async function addSvgImage(map: MapLibreMap, id: string, svg: string) {
  if (map.hasImage(id)) return;

  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await image.decode();

  if (!map.hasImage(id)) map.addImage(id, image, { pixelRatio: PIXEL_RATIO });
}

export async function registerStopIcons(map: MapLibreMap, colors: string[]) {
  const jobs: Promise<void>[] = [];

  for (const mode of Object.keys(GLYPHS) as TransitMode[]) {
    const glyph = GLYPHS[mode];
    jobs.push(
      addSvgImage(map, `stop-glyph-${mode}-dark`, glyphSvg(glyph, GLYPH_DARK)),
      addSvgImage(map, `stop-glyph-${mode}-light`, glyphSvg(glyph, GLYPH_LIGHT)),
    );
  }

  for (const color of colors) {
    jobs.push(addSvgImage(map, arrowImageId(color), arrowSvg(color)));
  }

  await Promise.all(jobs);
}
