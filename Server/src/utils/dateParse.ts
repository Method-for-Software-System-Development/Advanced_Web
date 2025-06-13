/**
 * Try to interpret the user's input as a local-time Date.
 * Accepts: YYYY-MM-DD, YYYY/MM/DD, MM/DD, DD/MM, MM/DD/YYYY, DD/MM/YYYY.
 * Returns `null` if nothing matches.
 */
export function parseUserDate(input: string): Date | null {
  const str = input.trim();
  let m: RegExpMatchArray | null;

  // 1) Full ISO-like  YYYY-MM-DD  or  YYYY/MM/DD
  m = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (m) {
    const [, y, mo, d] = m.map(Number);
    const dt = new Date(y, mo - 1, d);
    return isNaN(dt.getTime()) ? null : dt;
  }

  // 2) Short:  MM/DD[/YYYY?]  or  DD/MM[/YYYY?]
  m = str.match(/^(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{4}))?$/);
  if (m) {
    const [, a, b, yStr] = m;
    const year = yStr ? +yStr : new Date().getFullYear();

    // First assume a = month, b = day
    let dt = new Date(year, +a - 1, +b);
    if (!isNaN(dt.getTime())) return dt;

    // Fallback: swap day / month
    dt = new Date(year, +b - 1, +a);
    return isNaN(dt.getTime()) ? null : dt;
  }

  return null; // Nothing matched
}