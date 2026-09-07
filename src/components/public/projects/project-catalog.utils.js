export const PROJECTS_PER_PAGE = 9;

export function getLocalizedValue(value, locale, fallback = "") {
  if (typeof value === "string") {
    return value || fallback;
  }

  return value?.[locale] || value?.en || value?.th || fallback;
}

export function normalizeSearchValue(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase();
}

export function projectMatchesSearch(project, search, locale) {
  const normalizedSearch = normalizeSearchValue(search);

  if (!normalizedSearch) {
    return true;
  }

  const searchableValues = [
    getLocalizedValue(project.name, locale),
    project.name?.en,
    project.name?.th,
    getLocalizedValue(project.location, locale),
    project.location?.en,
    project.location?.th,
    getLocalizedValue(project.client, locale),
    project.client?.en,
    project.client?.th,
    getLocalizedValue(project.shortDescription, locale),
    project.buildingType,
    project.slug,
    project.year,
  ];

  return searchableValues.some((value) =>
    normalizeSearchValue(value).includes(normalizedSearch),
  );
}

export function sortProjects(projects) {
  return [...projects].sort((firstProject, secondProject) => {
    if (firstProject.featured !== secondProject.featured) {
      return firstProject.featured ? -1 : 1;
    }

    return (
      Number(firstProject.sortOrder || 0) - Number(secondProject.sortOrder || 0)
    );
  });
}
