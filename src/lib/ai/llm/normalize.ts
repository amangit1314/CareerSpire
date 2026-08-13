export function normalizeEnum<T extends Record<string, string>>(val: unknown, enumObj: T): T[keyof T] | undefined {
  if (typeof val !== 'string') return undefined;
  const upper = val.toUpperCase().trim();

  // Handle common aliases
  const aliasMap: Record<string, string> = { JS: 'JAVASCRIPT', TS: 'TYPESCRIPT', PY: 'PYTHON' };
  const aliasKey = aliasMap[upper];
  if (aliasKey && aliasKey in enumObj) return enumObj[aliasKey as keyof T];

  // Direct match
  const match = Object.values(enumObj).find(e => e.toUpperCase() === upper);
  return match as T[keyof T];
}
