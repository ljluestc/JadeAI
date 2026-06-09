export type ListFieldName = 'items' | 'categories';

const SECTION_LIST_FIELDS: Record<string, ListFieldName | undefined> = {
  work_experience: 'items',
  education: 'items',
  projects: 'items',
  certifications: 'items',
  languages: 'items',
  github: 'items',
  custom: 'items',
  qr_codes: 'items',
  skills: 'categories',
};

export function getSectionListField(sectionType: string): ListFieldName | null {
  return SECTION_LIST_FIELDS[sectionType] ?? null;
}

export function parseValueAsJsonIfPossible(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function decodeNestedJsonStrings(value: unknown, maxDepth = 2): unknown {
  let current = value;
  for (let depth = 0; depth < maxDepth && typeof current === 'string'; depth++) {
    try {
      current = JSON.parse(current);
    } catch {
      break;
    }
  }
  return current;
}

export function coerceListFieldValue(value: unknown, listField: ListFieldName): unknown[] | null {
  const decoded = decodeNestedJsonStrings(value);

  if (Array.isArray(decoded)) {
    return decoded;
  }

  if (decoded && typeof decoded === 'object') {
    const nested = (decoded as Record<string, unknown>)[listField];
    if (Array.isArray(nested)) {
      return nested;
    }
  }

  return null;
}

export function ensureArrayItemsHaveId(items: unknown[]): unknown[] {
  return items.map((item) =>
    typeof item === 'object' && item !== null && !('id' in item)
      ? { ...(item as Record<string, unknown>), id: crypto.randomUUID() }
      : item
  );
}

export function normalizeSectionContentForLists(sectionType: string, content: unknown): Record<string, unknown> {
  const safeContent =
    content && typeof content === 'object'
      ? { ...(content as Record<string, unknown>) }
      : {};

  const listField = getSectionListField(sectionType);
  if (!listField) {
    return safeContent;
  }

  const coerced = coerceListFieldValue(safeContent[listField], listField);
  safeContent[listField] = ensureArrayItemsHaveId(coerced ?? []);
  return safeContent;
}
