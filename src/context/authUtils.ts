export function extractJwtToken(value: unknown): string {
  const pending: unknown[] = [value];
  const visited = new Set<object>();

  while (pending.length > 0) {
    const current = pending.pop();
    if (typeof current === "string" && /^[\w-]+\.[\w-]+\.[\w-]+$/.test(current)) {
      return current;
    }
    if (typeof current !== "object" || current === null) continue;
    if (visited.has(current)) continue;
    visited.add(current);
    pending.push(...Object.values(current));
  }

  throw new Error("The API response did not include a JWT token.");
}
