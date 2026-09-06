import { getLocalizedValue } from "@/components/public/products/product-catalog.utils";

function normalizeSiteUrl(value) {
  return String(value || "http://localhost:3000").replace(/\/+$/, "");
}

function createAbsoluteUrl(value, siteUrl) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value, `${siteUrl}/`).toString();
  } catch {
    return null;
  }
}

function createSafeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function removeEmptyValues(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => {
      if (item === null || item === undefined || item === "") {
        return false;
      }

      if (Array.isArray(item) && item.length === 0) {
        return false;
      }

      return true;
    }),
  );
}

export function ProductStructuredData({ product, locale }) {
  const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

  const productUrl = `${siteUrl}/${locale}/products/${product.slug}`;

  const productsUrl = `${siteUrl}/${locale}/products`;

  const homeUrl = `${siteUrl}/${locale}`;

  const productName = getLocalizedValue(
    product.name,
    locale,
    product.model || product.slug,
  );

  const description =
    getLocalizedValue(product.shortDescription, locale) ||
    getLocalizedValue(product.description, locale);

  const categoryName = getLocalizedValue(
    product.category?.name,
    locale,
    product.category?.slug || "",
  );

  const productType = getLocalizedValue(product.productType, locale);

  const series = getLocalizedValue(product.series, locale);

  const images = [
    product.primaryImage,
    ...(Array.isArray(product.gallery) ? product.gallery : []),
  ]
    .map((image) => createAbsoluteUrl(image?.publicUrl, siteUrl))
    .filter(Boolean)
    .filter((url, index, values) => values.indexOf(url) === index);

  const additionalProperties = [];

  if (productType) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: locale === "th" ? "ประเภทผลิตภัณฑ์" : "Product Type",
      value: productType,
    });
  }

  if (series) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: locale === "th" ? "ซีรีส์" : "Series",
      value: series,
    });
  }

  if (product.fireRated) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: locale === "th" ? "การทนไฟ" : "Fire Rated",
      value: locale === "th" ? "รองรับ" : "Yes",
    });
  }

  (product.specifications || []).forEach((specification) => {
    const name = getLocalizedValue(specification.label, locale);

    const value = getLocalizedValue(specification.value, locale);

    if (name && value) {
      additionalProperties.push({
        "@type": "PropertyValue",
        name,
        value,
      });
    }
  });

  (product.standards || []).forEach((standard) => {
    if (!standard.name) {
      return;
    }

    additionalProperties.push({
      "@type": "PropertyValue",
      name: locale === "th" ? "มาตรฐาน" : "Standard",
      value: [
        standard.name,
        standard.classification,
        standard.conformityReference,
      ]
        .filter(Boolean)
        .join(" — "),
    });
  });

  const productSchema = removeEmptyValues({
    "@type": "Product",

    "@id": `${productUrl}#product`,

    url: productUrl,

    name: productName,

    description,

    image: images,

    sku: product.sku || undefined,

    mpn: product.model || undefined,

    model: product.model || undefined,

    category: categoryName || undefined,

    brand: {
      "@type": "Brand",
      name: "HCS",
    },

    manufacturer: {
      "@type": "Organization",
      name: "HCS Thailand",
      url: siteUrl,
    },

    additionalProperty: additionalProperties,

    inLanguage: locale === "th" ? "th-TH" : "en-US",
  });

  const breadcrumbSchema = {
    "@type": "BreadcrumbList",

    "@id": `${productUrl}#breadcrumb`,

    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "th" ? "หน้าหลัก" : "Home",
        item: homeUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: locale === "th" ? "ผลิตภัณฑ์" : "Products",
        item: productsUrl,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: productName,
        item: productUrl,
      },
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",

    "@graph": [productSchema, breadcrumbSchema],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: createSafeJson(structuredData),
      }}
    />
  );
}
