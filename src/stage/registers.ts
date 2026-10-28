import assets from "../data/assets.json";
import type { Transmission } from "../data/transmissions";
import type { SceneRequest } from "./state";

export type RegId = "natural" | "red" | "turmeric" | "blue";
export type Register = { duo: number; c: [string, string, string]; wash: string };

/** A register is the channel's "station": a three-tone colour map applied to the plate. Natural leaves the engraving as drawn. */
export const REGISTERS: Record<RegId, Register> = {
  natural: { duo: 0, c: ["#11100d", "#8a8a82", "#f5efe0"], wash: "#f5efe0" },
  red: { duo: 1, c: ["#11100d", "#c82924", "#f5efe0"], wash: "#c82924" },
  turmeric: { duo: 1, c: ["#11100d", "#f0b21c", "#fff2cf"], wash: "#f0b21c" },
  blue: { duo: 1, c: ["#0b0d2e", "#2438c9", "#e6eaff"], wash: "#2438c9" },
};
const BY_ID: Record<string, RegId> = { "002": "red", "005": "turmeric", "014": "blue", "019": "red", "020": "blue", "021": "turmeric" };
export const registerFor = (t?: Pick<Transmission, "id">): RegId => (t && BY_ID[t.id]) || "natural";

export const HOME_PLATE = "/art/the-broadcast-world.webp";
/** Horizontal focus (0..1) used when the viewport is portrait and the plate is cropped to a narrow slice. */
export const PLATE_FOCUS: Record<string, number> = { [HOME_PLATE]: 0.72 };

const plates = (assets.assets as { id: string; file: string; kind: string }[]).filter((a) => a.kind === "channel-plate");
export const plateFor = (id: string) => plates.find((p) => p.id.startsWith(`${id}-`))?.file ?? HOME_PLATE;
export const thumbFor = (id: string) => plateFor(id).replace("/plates/", "/plates/thumb/");
export const GUIDE_PLATE = "/plates/guide-wall.webp";

/** Everything the screen needs to show a channel: its still, its loop (if it has one) and its colour. Bright website loops sit dimmer under type. */
export const sceneFor = (t: Transmission, dim = t.media ? 0.38 : 0): SceneRequest => ({ plate: plateFor(t.id), video: t.media?.video, lite: t.media?.lite, reg: registerFor(t), dim });

export const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
