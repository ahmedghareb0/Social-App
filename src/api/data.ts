export type ApiRecord = Record<string, unknown>;

export function isApiRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function getRecords(data: unknown): ApiRecord[] {
  const pending: unknown[] = [data];
  const visited = new Set<object>();
  let hasEmptyArray = false;

  while (pending.length > 0) {
    const current = pending.shift();
    if (!Array.isArray(current) && !isApiRecord(current)) continue;
    if (visited.has(current)) continue;
    visited.add(current);

    if (Array.isArray(current)) {
      if (current.length > 0 && current.every(isApiRecord)) return current;
      if (current.length === 0) {
        hasEmptyArray = true;
        continue;
      }
      pending.push(...current);
      continue;
    }

    pending.push(...Object.values(current));
  }

  if (hasEmptyArray) return [];
  throw new Error("The API response did not contain a list of records.");
}

export function getRecordId(
  record: ApiRecord,
  entity?: "post" | "comment" | "user",
): string | null {
  const entries = Object.entries(record).filter(
    ([, value]) => typeof value === "string" || typeof value === "number",
  );
  const normalizedIdKeys = entity
    ? [`${entity}id`, `_${entity}id`]
    : [];
  const exactIdKeys = ["id", "_id"];
  const entry =
    entries.find(([key]) => normalizedIdKeys.includes(key.toLowerCase())) ??
    entries.find(([key]) => exactIdKeys.includes(key.toLowerCase())) ??
    entries.find(([key]) => /id$/i.test(key));
  return entry ? String(entry[1]) : null;
}

export function getRecordOwnerId(record: ApiRecord): string | null {
  const owner = isApiRecord(record.user)
    ? record.user
    : getRelatedRecord(record, ["author", "owner", "creator"]);
  const nestedId = owner && getRecordId(owner, "user");
  if (nestedId) return nestedId;

  const ownerId = Object.entries(record).find(
    ([key, value]) =>
      /author|user|owner|creator/i.test(key) &&
      /id$/i.test(key) &&
      (typeof value === "string" || typeof value === "number"),
  );
  return ownerId ? String(ownerId[1]) : null;
}

export function getPostOwnerId(record: ApiRecord): string | null {
  if (typeof record.user === "string" || typeof record.user === "number") {
    return String(record.user);
  }
  if (!isApiRecord(record.user)) return null;
  return getUserId(record.user);
}

export function getUserId(record: ApiRecord | null): string | null {
  if (!record) return null;
  const userId = record._id ?? record.id;
  return typeof userId === "string" || typeof userId === "number"
    ? String(userId)
    : null;
}

export function isPostOwnedBy(record: ApiRecord, user: ApiRecord | null): boolean {
  const userId = getUserId(user);
  return Boolean(userId && getPostOwnerId(record) === userId);
}

export function getCommentCreatorId(record: ApiRecord): string | null {
  if (!isApiRecord(record.commentCreator)) return null;
  const creatorId = record.commentCreator._id;
  return typeof creatorId === "string" || typeof creatorId === "number"
    ? String(creatorId)
    : null;
}

export function isCommentOwnedBy(record: ApiRecord, user: ApiRecord | null): boolean {
  const userId = getUserId(user);
  return Boolean(userId && getCommentCreatorId(record) === userId);
}

export function isOwnedBy(record: ApiRecord, user: ApiRecord | null): boolean {
  const userId = user && getRecordId(user, "user");
  return Boolean(userId && getRecordOwnerId(record) === userId);
}

export function getRelatedRecord(record: ApiRecord, labels: string[]): ApiRecord | null {
  const labelSet = labels.map((label) => label.toLowerCase());
  for (const [key, value] of Object.entries(record)) {
    if (labelSet.some((label) => key.toLowerCase().includes(label)) && isApiRecord(value)) {
      return value;
    }
  }
  return null;
}

export function getDisplayImage(record: ApiRecord): string | null {
  for (const [key, value] of Object.entries(record)) {
    if (typeof value !== "string" || !/^https?:\/\//i.test(value)) continue;
    if (
      /image|photo|avatar|picture/i.test(key) ||
      /\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i.test(value)
    ) {
      return value;
    }
  }
  return null;
}

export function formatApiValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value) ?? String(value);
}

export function getTextValue(record: ApiRecord): string {
  const textEntry = Object.entries(record).find(
    ([key, value]) =>
      /^(body|content|text|caption)$/i.test(key) && typeof value === "string",
  );
  const value = textEntry?.[1];
  return typeof value === "string" ? value : "";
}
