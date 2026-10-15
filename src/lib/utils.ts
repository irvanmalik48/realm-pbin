import { cn } from "cn";

export { cn };

/**
 * Safely formats byte counts into human-readable strings (e.g. 1.2 KB, 450 B).
 */
export function formatBytes(bytes?: number | string | null): string {
  if (bytes === undefined || bytes === null) return "0 B";
  const num = typeof bytes === "string" ? Number(bytes) : bytes;
  if (Number.isNaN(num) || num <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(num) / Math.log(k));
  if (i < 0) return "0 B";
  const sizeIdx = Math.min(i, sizes.length - 1);
  return `${(num / k ** sizeIdx).toFixed(sizeIdx === 0 ? 0 : 1)} ${sizes[sizeIdx]}`;
}
