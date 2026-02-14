/**
 * Parse a reset time (ISO 8601 string or unix timestamp) and return
 * a human-readable countdown string.
 */
export function formatETA(resetAt) {
  if (resetAt == null) return "??:??";

  let resetDate;
  if (typeof resetAt === "number") {
    resetDate = new Date(resetAt * 1000);
  } else if (typeof resetAt === "string") {
    const normalized = resetAt.endsWith("Z")
      ? resetAt.slice(0, -1) + "+00:00"
      : resetAt;
    resetDate = new Date(normalized);
  } else {
    return "??:??";
  }

  if (isNaN(resetDate.getTime())) return "??:??";

  const diffMs = resetDate.getTime() - Date.now();
  if (diffMs <= 0) return "now";

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

/**
 * Return a CSS class based on usage percentage thresholds.
 */
export function getColorClass(pct) {
  if (pct >= 80) return "high";
  if (pct >= 50) return "mid";
  return "low";
}
