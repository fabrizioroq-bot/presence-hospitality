// Real-call video for the home page (hidden behind flags.realCallVideo until it exists).
// TODO(media): a 30–45 s unedited Holobox interaction (guest arrives → payment fails → call → resolved),
// with the guest's written permission, an EN and NL captions file, and a poster frame.
export const realCall: { src: string; poster: string; captions: { en: string; nl: string } } | null = null;

// Sales pitch (/dashboard/pitch, "How it works" and the close): a muted, looping clip of a real
// receptionist on a live call, shown inside the Holobox screen instead of the point-cloud figure.
// TODO(media): waiting for real call footage (see PENDING.md). Portrait 9:16, 6–12 s seamless loop,
// no sound needed, H.264 MP4 ≤ 4 MB in /public/media/ (cached for offline use), plus a poster frame.
export const holoboxLoop: { src: string; poster: string } | null = null;
