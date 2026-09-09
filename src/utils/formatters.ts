/**
 * Cleanly formats a phone number with a single +91 prefix.
 * Strips duplicate country codes (+91, 91) if already present.
 */
export function formatPhone(phone?: string | null): string {
  if (!phone) return '';
  const cleaned = phone.trim().replace(/^\+91\s*/, '').replace(/^91(?=\d{10})/, '').trim();
  return cleaned ? `+91 ${cleaned}` : phone;
}
