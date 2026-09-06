import { getPublicProducts } from "@/services/products/product-query.service";

export const revalidate = 3600;

const SITE_URL = String(
  process.env.NEXT_PUBLIC_SITE_URL || "https://hcs-th.vercel.app",
).replace(/\/+$/, "");

const LOCALES = ["en", "th"];

function createLanguageAlternates(pathname) {
  return {
    languages: {
      en: `${SITE_URL}/en${pathname}`,
      th: `${SITE_URL}/th${pathname}`,
      "x-default": `${SITE_URL}/en${pathname}`,
    },
  };
}

function createLocalizedEntries({
  pathname,
  lastModified,
  changeFrequency,
  priority,
}) {
  return LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}${pathname}`,

    ...(lastModified
      ? {
          lastModified,
        }
      : {}),

    changeFrequency,

    priority,

    alternates: createLanguageAlternates(pathname),
  }));
}

function normalizeLastModified(value) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

async function loadAllPublishedProducts() {
  const products = [];

  let cursor;
  let hasMore = true;
  let page = 0;

  while (hasMore && page < 50) {
    const result = await getPublicProducts({
      limit: 100,

      cursor,

      categoryId: undefined,

      productTypeSlug: undefined,

      standard: undefined,

      featured: undefined,

      fireRated: undefined,

      search: undefined,
    });

    products.push(...result.items);

    hasMore = Boolean(result.pagination?.hasMore);

    cursor = result.pagination?.nextCursor || undefined;

    page += 1;

    if (hasMore && !cursor) {
      break;
    }
  }

  return products;
}

export default async function sitemap() {
  const entries = [
    ...createLocalizedEntries({
      pathname: "",
      changeFrequency: "weekly",
      priority: 1,
    }),

    ...createLocalizedEntries({
      pathname: "/products",
      changeFrequency: "weekly",
      priority: 0.9,
    }),
  ];

  try {
    const products = await loadAllPublishedProducts();

    const categoryMap = new Map();

    products.forEach((product) => {
      const categorySlug = product.category?.slug;

      if (!categorySlug) {
        return;
      }

      const currentLastModified = normalizeLastModified(
        categoryMap.get(categorySlug),
      );

      const productLastModified = normalizeLastModified(product.updatedAt);

      if (
        !currentLastModified ||
        (productLastModified && productLastModified > currentLastModified)
      ) {
        categoryMap.set(categorySlug, product.updatedAt || null);
      }
    });

    categoryMap.forEach((updatedAt, categorySlug) => {
      entries.push(
        ...createLocalizedEntries({
          pathname: `/products/category/${categorySlug}`,

          lastModified: normalizeLastModified(updatedAt),

          changeFrequency: "weekly",

          priority: 0.8,
        }),
      );
    });

    products.forEach((product) => {
      if (!product.slug) {
        return;
      }

      entries.push(
        ...createLocalizedEntries({
          pathname: `/products/${product.slug}`,

          lastModified: normalizeLastModified(product.updatedAt),

          changeFrequency: "monthly",

          priority: product.featured ? 0.9 : 0.8,
        }),
      );
    });
  } catch (error) {
    console.error("Unable to load products for sitemap:", error);
  }

  return entries;
}
