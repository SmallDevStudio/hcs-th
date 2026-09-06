export const PRODUCTS_PER_PAGE = 9;

export function getLocalizedValue(value, locale, fallback = "") {
  return value?.[locale] || value?.en || value?.th || fallback;
}

export function normalizeSearchValue(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase();
}

export function createCountMap(values) {
  const countMap = new Map();

  values.forEach((value) => {
    if (!value) {
      return;
    }

    countMap.set(value, Number(countMap.get(value) || 0) + 1);
  });

  return countMap;
}

export function toggleArrayValue(currentValues, value) {
  return currentValues.includes(value)
    ? currentValues.filter((currentValue) => currentValue !== value)
    : [...currentValues, value];
}

export function productMatchesSearch(product, search, locale) {
  const normalizedSearch = normalizeSearchValue(search);

  if (!normalizedSearch) {
    return true;
  }

  const searchableValues = [
    getLocalizedValue(product.name, locale),
    product.name?.en,
    product.name?.th,
    product.model,
    product.sku,
    product.slug,
    getLocalizedValue(product.productType, locale),
    product.productType?.en,
    product.productType?.th,
    product.productTypeSlug,
    getLocalizedValue(product.series, locale),

    ...(Array.isArray(product.standards)
      ? product.standards.flatMap((standard) => [
          standard.name,
          standard.classification,
          standard.conformityReference,
        ])
      : []),
  ];

  return searchableValues.some((value) =>
    normalizeSearchValue(value).includes(normalizedSearch),
  );
}

export function sortProducts(products, sortBy, locale) {
  return [...products].sort((firstProduct, secondProduct) => {
    const firstName = getLocalizedValue(
      firstProduct.name,
      locale,
      firstProduct.model,
    );

    const secondName = getLocalizedValue(
      secondProduct.name,
      locale,
      secondProduct.model,
    );

    if (sortBy === "nameAscending") {
      return firstName.localeCompare(secondName, locale);
    }

    if (sortBy === "nameDescending") {
      return secondName.localeCompare(firstName, locale);
    }

    if (sortBy === "modelAscending") {
      return String(firstProduct.model || "").localeCompare(
        String(secondProduct.model || ""),
      );
    }

    if (firstProduct.featured !== secondProduct.featured) {
      return firstProduct.featured ? -1 : 1;
    }

    return firstProduct.sortOrder - secondProduct.sortOrder;
  });
}
