import { PRAGUE_CENTER, PRAGUE_DEFAULT_ZOOM } from "@catch-it/core";

export const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

export const MAP_STYLE_URL = `https://api.maptiler.com/maps/streets-v4-dark/style.json?key=${MAPTILER_KEY}`;

export const INITIAL_VIEW = {
  longitude: PRAGUE_CENTER.longitude,
  latitude: PRAGUE_CENTER.latitude,
  zoom: PRAGUE_DEFAULT_ZOOM,
};
