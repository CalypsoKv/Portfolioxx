/**
 * Voices (testimonials) and recognition (awards). Both are empty on purpose: an entry may only be added with
 * a name, a permission note and a public source. The site hides empty sections from visitors; ?collect=1 shows the slots.
 */
export type Voice = { name: string; role: string; quote: string; permission: string; source: string };
export type Award = { name: string; issuer: string; year: number; url: string };
export const voices: Voice[] = [];
export const awards: Award[] = [];
