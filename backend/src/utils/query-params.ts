/**
 * Type-safe query parameter helpers
 */

export function getStringParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function getStringParamOrDefault(value: string | string[] | undefined, defaultValue: string): string {
  if (Array.isArray(value)) {
    return value[0] || defaultValue;
  }
  return value || defaultValue;
}

export function getNumberParam(value: string | string[] | undefined, defaultValue: number): number {
  const str = getStringParam(value);
  if (!str) return defaultValue;
  const num = parseInt(str, 10);
  return isNaN(num) ? defaultValue : num;
}
