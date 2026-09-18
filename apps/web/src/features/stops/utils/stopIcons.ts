import type { Map as MapLibreMap } from "maplibre-gl";
import type { TransitMode } from "@catch-it/core";
import { TRANSIT_GLYPHS, type TransitGlyph } from "@/components/ui/icons";

const GLYPH_DARK = "#0b0d12";
const GLYPH_LIGHT = "#ffffff";

const PIXEL_RATIO = 3;
export const GLYPH_SIZE = 24;
export const ARROW_IMAGE_SIZE = 48;
export const ARROW_BASE = 12;

function glyphSvg(glyph: TransitGlyph, color: string) {
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

  for (const mode of Object.keys(TRANSIT_GLYPHS) as TransitMode[]) {
    const glyph = TRANSIT_GLYPHS[mode];
    jobs.push(
      addSvgImage(map, `stop-glyph-${mode}-dark`, glyphSvg(glyph, GLYPH_DARK)),
      addSvgImage(
        map,
        `stop-glyph-${mode}-light`,
        glyphSvg(glyph, GLYPH_LIGHT),
      ),
    );
  }

  for (const color of colors) {
    jobs.push(addSvgImage(map, arrowImageId(color), arrowSvg(color)));
  }

  await Promise.all(jobs);
}
