import type { TransitMode } from "@catch-it/core";

export type TransitGlyph = { fill?: string; stroke?: string };

const rect = (x: number, y: number, w: number, h: number, r = 0) =>
  `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}` +
  `a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}` +
  `v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`;

const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;

export const TRANSIT_GLYPHS: Record<TransitMode, TransitGlyph> = {
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
    fill:
      "M5 20v-4.5l14-7V20z" + "M8 18v-1.4l3-1.5V18z" + "M13 18v-3.9l3-1.5V18z",
    stroke: "M2.5 15.5 21.5 5",
  },
  other: {
    fill: circle(12, 12, 4),
  },
};
