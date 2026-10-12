/** Auth cookie flags. Only server code reads the session (no browser Supabase client), so HttpOnly. */
export const AUTH_COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
} as const;
