/**
 * After-Hours Sketchbook content model.
 * Replace values in this file when the birthday name, message, artworks, photo, or music are ready.
 */

export type Artwork = {
  id: number;
  src: string;
  alt: string;
  label: string;
};

export const birthdayContent = {
  name: "[HER_NAME]",
  personalMessage: "[PERSONAL_MESSAGE]",
  personalPhoto: "/images/personal-photo.jpg",
  musicSrc: "",
  artwork: Array.from({ length: 29 }, (_, index): Artwork => {
    const number = index + 1;
    const serial = String(number).padStart(2, "0");
    return {
      id: number,
      src: `/images/artwork-${serial}.jpg`,
      alt: `Birthday artwork ${serial}`,
      label: `ARTWORK ${serial}`,
    };
  }),
} as const;

export const siteAssets = {
  hero: "",
  gallery: "",
  finale: "",
} as const;

export const funnyGalleryNotes = [
  "Okay, you actually has talent.",
  "Still scrolling?",
  "Yes, there are 29.",
  "Don't ask me how long this took because i am also dont know.",
  "Okay, next one.",
] as const;
