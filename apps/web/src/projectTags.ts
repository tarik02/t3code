function projectTagKey(label: string): string {
  return label.trim().toLocaleLowerCase();
}

export function normalizeProjectTags(tags: ReadonlyArray<string>): string[] {
  const tagsByKey = new Map<string, string>();
  for (const tag of tags) {
    const label = tag.trim();
    if (label.length === 0) continue;
    const key = projectTagKey(label);
    if (!tagsByKey.has(key)) {
      tagsByKey.set(key, label);
    }
  }
  return [...tagsByKey.values()].toSorted((left, right) => left.localeCompare(right));
}

export function toggleProjectTag(tags: ReadonlyArray<string>, tag: string): string[] {
  const key = projectTagKey(tag);
  const attached = tags.some((candidate) => projectTagKey(candidate) === key);
  return normalizeProjectTags(
    attached ? tags.filter((candidate) => projectTagKey(candidate) !== key) : [...tags, tag],
  );
}

export function projectMatchesTagFilters(
  projectTags: ReadonlyArray<string>,
  selectedTags: ReadonlyArray<string>,
): boolean {
  if (selectedTags.length === 0) return true;
  const projectTagKeys = new Set(projectTags.map(projectTagKey));
  return selectedTags.some((tag) => projectTagKeys.has(projectTagKey(tag)));
}
