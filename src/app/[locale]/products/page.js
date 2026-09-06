import { PublicProductsCatalog } from "@/components/public/products/PublicProductsCatalog";
import { CATEGORY_STATUSES } from "@/constants/categories";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/constants/locales";
import { getCategories } from "@/services/categories/category-query.service";
import { getPublicProducts } from "@/services/products/product-query.service";

const metadataByLocale = {
  en: {
    title: "Architectural Hardware & Security Products",
    description:
      "Explore HCS Thailand architectural hardware, door closers, lever handles, locks, fire doors and security products.",
  },

  th: {
    title: "อุปกรณ์ประตูและระบบรักษาความปลอดภัย",
    description:
      "เลือกชมอุปกรณ์ประตู โช้คอัพประตู มือจับ ล็อก ประตูกันไฟ และผลิตภัณฑ์รักษาความปลอดภัยจาก HCS Thailand",
  },
};

export async function generateMetadata({ params }) {
  const { locale: requestedLocale } = await params;

  const locale = isSupportedLocale(requestedLocale)
    ? requestedLocale
    : DEFAULT_LOCALE;

  const metadata = metadataByLocale[locale] || metadataByLocale[DEFAULT_LOCALE];

  return {
    title: metadata.title,

    description: metadata.description,

    alternates: {
      canonical: `/${locale}/products`,

      languages: {
        en: "/en/products",
        th: "/th/products",
        "x-default": "/en/products",
      },
    },

    openGraph: {
      type: "website",
      title: metadata.title,
      description: metadata.description,
      url: `/${locale}/products`,
      locale: locale === "th" ? "th_TH" : "en_US",
      alternateLocale: locale === "th" ? "en_US" : "th_TH",
    },
  };
}

async function loadProductsPageData() {
  try {
    const [productsResult, categoriesResult] = await Promise.all([
      getPublicProducts({
        limit: 100,
        cursor: undefined,
        categoryId: undefined,
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

    return {
      products: productsResult.items,
      categories: categoriesResult.items,
    };
  } catch (error) {
    console.error("Unable to load public products page:", error);

    return {
      products: [],
      categories: [],
    };
  }
}

export default async function PublicProductsPage({ params }) {
  const { locale } = await params;

  const { products, categories } = await loadProductsPageData();

  return (
    <PublicProductsCatalog
      locale={locale}
      products={products}
      categories={categories}
    />
  );
}
