// Editorial photos (stock until Presence has its own; credits in CREDITS.md, ideal sizes in PENDING.md).
// Replace a file in public/images/<section>/ with your own photo of the same name and ratio, and update
// the width/height here.
export type Photo = { src: string; width: number; height: number };

export const photos = {
  problem: { src: "/images/problem/empty-reception-night.jpg", width: 1600, height: 2000 },
  people: { src: "/images/people/hands-headset-keyboard.jpg", width: 1410, height: 2000 },
  peopleDetail: { src: "/images/people/headset-laptop.jpg", width: 2000, height: 1333 },
  finaleArrival: { src: "/images/finale/guest-arrival-corridor.jpg", width: 2000, height: 1333 },
  finaleHub: { src: "/images/finale/hub-over-shoulder.jpg", width: 1333, height: 2000 },
  startSmall: { src: "/images/start-small/room-keys-wall.jpg", width: 1333, height: 2000 },
  about: { src: "/images/about/wooden-reception.jpg", width: 2000, height: 1500 },
  onboarding: { src: "/images/onboarding/brass-door-key.jpg", width: 1500, height: 2000 },
  faq: { src: "/images/faq/brass-service-bell.jpg", width: 2000, height: 1217 },
} satisfies Record<string, Photo>;
