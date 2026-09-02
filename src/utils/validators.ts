/** Matches exactly xxx-xxx-xxxx -- three digits, dash, three digits,
 * dash, four digits. Shared between Checkout and Profile so the format
 * requirement lives in exactly one place. */
export const PHONE_PATTERN = /^\d{3}-\d{3}-\d{4}$/;

export const isValidPhone = (phone: string): boolean =>
  PHONE_PATTERN.test(phone);

/**
 * Light validation for a product's image URL field -- checks that it's
 * a well-formed http/https URL. Doesn't verify the URL actually points
 * to a real, loadable image (that would require attempting to fetch
 * it), just catches obviously malformed input like plain text or a
 * missing protocol.
 */
export const isValidImageUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};
