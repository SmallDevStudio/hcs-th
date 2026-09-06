import { FiCheck, FiDownload, FiFileText, FiShield } from "react-icons/fi";

import { getLocalizedValue } from "@/components/public/products/product-catalog.utils";

function SectionHeading({ children }) {
  return (
    <h2 className="text-xl font-extrabold tracking-[-0.02em] text-[#071b30] sm:text-2xl dark:text-white">
      {children}
    </h2>
  );
}

function EmptyValue({ children }) {
  return (
    <p className="mt-4 text-sm leading-7 text-muted-foreground">{children}</p>
  );
}

export function ProductDescriptionSection({ product, locale, t }) {
  const description = getLocalizedValue(product.description, locale);

  const features = Array.isArray(product.features?.[locale])
    ? product.features[locale]
    : product.features?.en || [];

  const variations = Array.isArray(product.variations?.[locale])
    ? product.variations[locale]
    : product.variations?.en || [];

  if (!description && features.length === 0 && variations.length === 0) {
    return null;
  }

  return (
    <section className="border-b border-[#d7e2ea] py-9 dark:border-border">
      <SectionHeading>{t("products.detail.overview")}</SectionHeading>

      {description ? (
        <div className="mt-5 whitespace-pre-line text-[15px] leading-8 text-[#42566a] dark:text-slate-300">
          {description}
        </div>
      ) : null}

      {features.length > 0 ? (
        <div className="mt-8">
          <h3 className="text-sm font-extrabold uppercase tracking-[0.08em] text-[#071b30] dark:text-white">
            {t("products.detail.features")}
          </h3>

          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {features.map((feature, index) => (
              <li
                key={`${feature}-${index}`}
                className="flex items-start gap-3 text-sm leading-6 text-[#42566a] dark:text-slate-300"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FiCheck aria-hidden="true" className="size-3.5" />
                </span>

                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {variations.length > 0 ? (
        <div className="mt-8">
          <h3 className="text-sm font-extrabold uppercase tracking-[0.08em] text-[#071b30] dark:text-white">
            {t("products.detail.variations")}
          </h3>

          <div className="mt-4 flex flex-wrap gap-2">
            {variations.map((variation, index) => (
              <span
                key={`${variation}-${index}`}
                className="rounded-md border border-[#cfdce6] bg-white px-3 py-2 text-sm font-semibold text-[#31485e] dark:border-border dark:bg-surface dark:text-slate-300"
              >
                {variation}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function ProductSpecificationsSection({ product, locale, t }) {
  const specifications = Array.isArray(product.specifications)
    ? product.specifications
    : [];

  if (specifications.length === 0) {
    return null;
  }

  return (
    <section className="border-b border-[#d7e2ea] py-9 dark:border-border">
      <SectionHeading>{t("products.detail.specifications")}</SectionHeading>

      <dl className="mt-6 overflow-hidden rounded-lg border border-[#d4e0e9] dark:border-border">
        {specifications.map((specification, index) => (
          <div
            key={specification.id || index}
            className={`grid gap-2 px-5 py-4 sm:grid-cols-[minmax(180px,0.8fr)_1.7fr] sm:gap-8 ${
              index % 2 === 0
                ? "bg-[#f3f7fa] dark:bg-slate-900/45"
                : "bg-white dark:bg-surface"
            }`}
          >
            <dt className="text-sm font-bold text-[#17334b] dark:text-slate-200">
              {getLocalizedValue(specification.label, locale)}
            </dt>

            <dd className="text-sm leading-6 text-[#52677a] dark:text-slate-300">
              {getLocalizedValue(specification.value, locale)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ProductFinishesSection({ product, locale, t }) {
  const finishes = Array.isArray(product.finishes) ? product.finishes : [];

  if (finishes.length === 0) {
    return null;
  }

  return (
    <section className="border-b border-[#d7e2ea] py-9 dark:border-border">
      <SectionHeading>{t("products.detail.finishes")}</SectionHeading>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {finishes.map((finish, index) => (
          <div
            key={finish.id || `${finish.code}-${index}`}
            className="flex items-center gap-4 rounded-lg border border-[#d4e0e9] bg-white px-4 py-4 dark:border-border dark:bg-surface"
          >
            <span className="flex min-w-14 items-center justify-center rounded-md bg-[#eaf4fb] px-2 py-2 text-xs font-extrabold text-primary dark:bg-sky-950/60 dark:text-sky-300">
              {finish.code}
            </span>

            <span className="text-sm font-semibold text-[#31485e] dark:text-slate-200">
              {getLocalizedValue(finish.name, locale, finish.code)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProductStandardsSection({ product, t }) {
  const standards = Array.isArray(product.standards) ? product.standards : [];

  if (standards.length === 0 && !product.fireRated) {
    return null;
  }

  return (
    <section className="border-b border-[#d7e2ea] py-9 dark:border-border">
      <SectionHeading>{t("products.detail.standards")}</SectionHeading>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {standards.map((standard, index) => (
          <article
            key={standard.id || `${standard.name}-${index}`}
            className="flex gap-4 rounded-lg border border-[#d4e0e9] bg-white p-5 dark:border-border dark:bg-surface"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FiShield aria-hidden="true" className="size-5" />
            </span>

            <div>
              <h3 className="font-extrabold text-[#071b30] dark:text-white">
                {standard.name}
              </h3>

              {standard.classification ? (
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {standard.classification}
                </p>
              ) : null}

              {standard.conformityReference ? (
                <p className="mt-1 text-xs font-semibold text-primary">
                  {standard.conformityReference}
                </p>
              ) : null}
            </div>
          </article>
        ))}

        {product.fireRated ? (
          <article className="flex gap-4 rounded-lg border border-red-200 bg-red-50 p-5 dark:border-red-950 dark:bg-red-950/20">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
              <FiShield aria-hidden="true" className="size-5" />
            </span>

            <div>
              <h3 className="font-extrabold text-[#071b30] dark:text-white">
                {t("products.detail.fireRated")}
              </h3>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {t("products.detail.fireRatedDescription")}
              </p>
            </div>
          </article>
        ) : null}
      </div>
    </section>
  );
}

export function ProductDocumentsSection({ product, locale, t }) {
  const documents = Array.isArray(product.documents) ? product.documents : [];

  if (documents.length === 0) {
    return null;
  }

  return (
    <section className="py-9">
      <SectionHeading>{t("products.detail.documents")}</SectionHeading>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {documents.map((document, index) => {
          const documentName = getLocalizedValue(
            document.title,
            locale,
            document.originalName ||
              t("products.detail.documentFallback", {
                number: index + 1,
              }),
          );

          return (
            <a
              key={document.id || document.publicUrl}
              href={document.publicUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-4 rounded-lg border border-[#d4e0e9] bg-white p-4 transition hover:border-primary hover:shadow-md dark:border-border dark:bg-surface"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#eaf4fb] text-primary dark:bg-sky-950/60 dark:text-sky-300">
                <FiFileText aria-hidden="true" className="size-5" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-sm font-bold text-[#17334b] dark:text-white">
                  {documentName}
                </span>

                {document.extension ? (
                  <span className="mt-1 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                    {document.extension}
                  </span>
                ) : null}
              </span>

              <FiDownload
                aria-hidden="true"
                className="size-5 shrink-0 text-primary transition group-hover:translate-y-0.5"
              />
            </a>
          );
        })}
      </div>

      {documents.length === 0 ? (
        <EmptyValue>{t("products.detail.noDocuments")}</EmptyValue>
      ) : null}
    </section>
  );
}
