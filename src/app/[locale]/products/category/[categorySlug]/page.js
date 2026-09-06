import { notFound } from "next/navigation";

import { PublicProductsCatalog } from "@/components/public/products/PublicProductsCatalog";
import { CATEGORY_STATUSES } from "@/constants/categories";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/constants/locales";
import {
  getCategories,
  getPublicCategoryBySlug,
} from "@/services/categories/category-query.service";
import { getPublicProducts } from "@/services/products/product-query.service";

function getLocalizedValue(value, locale, fallback = "") {
  return value?.[locale] || value?.en || value?.th || fallback;
}

export async function generateMetadata({ params }) {
  const { locale: requestedLocale, categorySlug } = await params;

  const locale = isSupportedLocale(requestedLocale)
    ? requestedLocale
    : DEFAULT_LOCALE;

  const category = await getPublicCategoryBySlug(categorySlug);

  if (!category) {
    return {};
  }

  const categoryName = getLocalizedValue(category.name, locale, category.slug);

  const title =
    getLocalizedValue(category.seo?.title, locale) ||
    `${categoryName} | HCS Thailand`;

  const description =
    getLocalizedValue(category.seo?.description, locale) ||
    getLocalizedValue(category.description, locale, categoryName);

  const canonicalPath = `/${locale}/products/category/${category.slug}`;

  return {
    title,

    description,

    keywords:
      category.seo?.keywords?.[locale] || category.seo?.keywords?.en || [],

    alternates: {
      canonical: canonicalPath,

      languages: {
        en: `/en/products/category/${category.slug}`,
        th: `/th/products/category/${category.slug}`,
        "x-default": `/en/products/category/${category.slug}`,
      },
    },

    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalPath,
      locale: locale === "th" ? "th_TH" : "en_US",
      alternateLocale: locale === "th" ? "en_US" : "th_TH",
    },
  };
}

export default async function PublicProductCategoryPage({ params }) {
  const { locale, categorySlug } = await params;

  const category = await getPublicCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  let products = [];
  let categories = [];

  try {
    const [productsResult, categoriesResult] = await Promise.all([
      getPublicProducts({
        limit: 100,
        cursor: undefined,
        categoryId: category.id,
        productTypeSlug: undefined,
        standard: undefined,
        featured: undefined,
        fireRated: undefined,
        search: undefined,
      }),

      getCategories({
        limit: 100,
        cursor: undefined,
        status: CATEGORY_STATUSES.ACTIVE,
        featured: undefined,
        showOnHome: undefined,
        search: undefined,
      }),
    ]);

    products = productsResult.items;
    categories = categoriesResult.items;
  } catch (error) {
    console.error(`Unable to load category ${categorySlug}:`, error);
  }

  return (
    <PublicProductsCatalog
      locale={locale}
      products={products}
      categories={categories}
      initialCategorySlug={category.slug}
    />
  );
}
