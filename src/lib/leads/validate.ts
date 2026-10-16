// Shared (client + server) validation for the demo request form. No dependencies.
// Returns error *codes*; the UI maps them to localised messages.

export const POSITIONS = ["owner", "general_manager", "operations_manager", "front_office_manager", "other"] as const;
export type Position = (typeof POSITIONS)[number];

export type LeadInput = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: Position;
  hotel_name: string;
  pms: string | null;
  description: string;
  language: "en" | "nl";
  consent: boolean;
};

export type LeadField = "first_name" | "last_name" | "email" | "phone" | "position" | "hotel_name" | "pms" | "description" | "consent";
export type ErrorCode = "required" | "tooLong" | "tooShort" | "email" | "phone" | "position" | "consent";
export type FieldErrors = Partial<Record<LeadField, ErrorCode>>;

export const LIMITS = { name: 80, email: 254, phoneMin: 6, phoneMax: 32, hotel: 120, pms: 80, descMin: 10, descMax: 2000 };

export const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE = /^[+0-9 ()\-.]+$/;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Validate one field (used on blur/change in the browser). */
export function validateField(field: LeadField, raw: unknown): ErrorCode | undefined {
  const v = field === "consent" ? raw : str(raw);
  switch (field) {
    case "first_name":
    case "last_name":
      if (!v) return "required";
      if ((v as string).length > LIMITS.name) return "tooLong";
      return;
    case "email":
      if (!v) return "required";
      if ((v as string).length > LIMITS.email || !EMAIL.test(v as string)) return "email";
      return;
    case "phone": {
      const s = v as string;
      if (!s) return "required";
      if (!PHONE.test(s) || s.replace(/\D/g, "").length < LIMITS.phoneMin || s.length > LIMITS.phoneMax) return "phone";
      return;
    }
    case "position":
      if (!v) return "required";
      if (!POSITIONS.includes(v as Position)) return "position";
      return;
    case "hotel_name":
      if (!v) return "required";
      if ((v as string).length > LIMITS.hotel) return "tooLong";
      return;
    case "pms":
      if ((v as string).length > LIMITS.pms) return "tooLong";
      return;
    case "description": {
      const s = v as string;
      if (!s) return "required";
      if (s.length < LIMITS.descMin) return "tooShort";
      if (s.length > LIMITS.descMax) return "tooLong";
      return;
    }
    case "consent":
      return v === true || v === "on" || v === "true" ? undefined : "consent";
  }
}

export const FIELDS: LeadField[] = ["first_name", "last_name", "email", "phone", "position", "hotel_name", "pms", "description", "consent"];

/** Validate the whole form. On success returns normalised data. */
export function validateLead(input: Record<string, unknown>, language: "en" | "nl"):
  | { ok: true; data: LeadInput }
  | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  for (const f of FIELDS) {
    const e = validateField(f, input[f]);
    if (e) errors[f] = e;
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  const pms = str(input.pms);
  return {
    ok: true,
    data: {
      first_name: str(input.first_name),
      last_name: str(input.last_name),
      email: str(input.email).toLowerCase(),
      phone: str(input.phone),
      position: str(input.position) as Position,
      hotel_name: str(input.hotel_name),
      pms: pms || null,
      description: str(input.description),
      language,
      consent: true,
    },
  };
}
