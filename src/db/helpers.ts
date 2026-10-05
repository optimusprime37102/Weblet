/** Strip trailing slash for stable uniqueness checks. */
export function toUrlKey(url: string): string {
  return url.trim().replace(/\/+$/, '').toLowerCase();
}

export function boolToInt(value: boolean): number {
  return value ? 1 : 0;
}

export function intToBool(value: number | null | undefined): boolean {
  return value === 1;
}
