/**
 * Normalizes values for comparison (handles floats, whitespace, deep equality)
 */
export function isEqual(actual: unknown, expected: unknown): boolean {
  if (actual === expected) return true;

  // Handle floats with epsilon
  if (typeof actual === 'number' && typeof expected === 'number') {
    return Math.abs(actual - expected) < 1e-6;
  }

  // If one is string and other is number, try converting
  if (typeof actual === 'string' && typeof expected === 'number') {
    return Math.abs(parseFloat(actual) - expected) < 1e-6;
  }
  if (typeof actual === 'number' && typeof expected === 'string') {
    return Math.abs(actual - parseFloat(expected)) < 1e-6;
  }

  // Handle strings with whitespace normalization
  if (typeof actual === 'string' && typeof expected === 'string') {
    return actual.trim() === expected.trim();
  }

  // Handle Booleans from strings
  if (typeof actual === 'string' && typeof expected === 'boolean') {
    return actual.toLowerCase().trim() === expected.toString();
  }

  // Deep equality for objects/arrays via JSON
  try {
    const normalize = (val: unknown): string => {
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
          try { return JSON.stringify(JSON.parse(trimmed)); } catch { return trimmed; }
        }
        return trimmed;
      }
      return JSON.stringify(val);
    };

    const normActual = normalize(actual);
    const normExpected = normalize(expected);

    if (normActual === normExpected) return true;
  } catch {
    return false;
  }

  return false;
}
