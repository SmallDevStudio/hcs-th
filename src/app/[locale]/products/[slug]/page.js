import { notFound } from "next/navigation";

import { ProductDetailContent } from "@/components/public/products/detail/ProductDetailContent";
import { ProductStructuredData } from "@/components/public/products/detail/ProductStructuredData";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/constants/locales";
import {
  getPublicProductBySlug,
  getPublicRelatedProducts,
} from "@/services/products/product-query.service";

function getLocalizedValue(value, locale, fallback = "") {
  return value?.[locale] || value?.en || value?.th || fallback;
}

function createProductMetadata(product, locale) {
  const productName = getLocalizedValue(
    product.name,
    locale,
    product.model || product.slug,
  );

  const title =
    getLocalizedValue(product.seo?.title, locale) ||
    `${product.model || productName} | HCS Thailand`;

  const description =
    getLocalizedValue(product.seo?.description, locale) ||
    getLocalizedValue(product.shortDescription, locale) ||
    getLocalizedValue(product.description, locale).slice(0, 160);

  const keywords = Array.isArray(product.seo?.keywords?.[locale])
    ? product.seo.keywords[locale]
    : product.seo?.keywords?.en || [];

  const canonicalPath = `/${locale}/products/${product.slug}`;

  const image = product.primaryImage?.publicUrl || null;

  return {
    title,

    description,

    keywords,

    alternates: {
      canonical: canonicalPath,

      languages: {
        en: `/en/products/${product.slug}`,

        th: `/th/products/${product.slug}`,

        "x-default": `/en/products/${product.slug}`,
      },
    },

    openGraph: {
      type: "website",

      title,

      description,

      url: canonicalPath,

      siteName: "HCS Thailand",

      locale: locale === "th" ? "th_TH" : "en_US",

      alternateLocale: locale === "th" ? "en_US" : "th_TH",

      ...(image
        ? {
            images: [
              {
                url: image,

                alt: getLocalizedValue(
                  product.primaryImage?.altText,
                  locale,
                  productName,
                ),
              },
            ],
          }
        : {}),
    },

    twitter: {
      card: image ? "summary_large_image" : "summary",

      title,

      description,

      ...(image
        ? {
            images: [image],
          }
        : {}),
    },

    robots: {
      index: true,

      follow: true,

      googleBot: {
        index: true,

        follow: true,

        "max-image-preview": "large",

        "max-snippet": -1,

        "max-video-preview": -1,
      },
    },
  };
}

export async function generateMetadata({ params }) {
  const { locale: requestedLocale, slug } = await params;

  const locale = isSupportedLocale(requestedLocale)
    ? requestedLocale
    : DEFAULT_LOCALE;

  const product = await getPublicProductBySlug(slug);

  if (!product) {
    return {
      title: locale === "th" ? "ไม่พบผลิตภัณฑ์" : "Product Not Found",

      robots: {
        index: false,

        follow: false,
      },
    };
  }

  return createProductMetadata(product, locale);
}

async function loadProductDetail(slug) {
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    return {
      product: null,

      relatedProducts: [],
    };
  }

  let relatedProducts = [];

  if (product.categoryId) {
    try {
      relatedProducts = await getPublicRelatedProducts({
        productId: product.id,

        categoryId: product.categoryId,

        limit: 4,
      });
    } catch (error) {
      console.error("Unable to load related products:", error);
    }
  }

  return {
    product,

    relatedProducts,
  };
}

export default async function PublicProductDetailPage({ params }) {
  const { locale, slug } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const { product, relatedProducts } = await loadProductDetail(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <ProductStructuredData product={product} locale={locale} />

      <ProductDetailContent
        product={product}
        relatedProducts={relatedProducts}
        locale={locale}
      />
    </>
  );
}
