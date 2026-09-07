"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { TbArrowRight, TbDownload, TbSearch } from "react-icons/tb";

function getLocalizedValue(value, locale, fallback = "") {
  return value?.[locale] || value?.en || value?.th || fallback;
}

function formatFileSize(size, fallback) {
  const numericSize = Number(size || 0);

  if (!numericSize) {
    return fallback;
  }

  if (numericSize < 1024) {
    return `${numericSize} B`;
  }

  if (numericSize < 1024 * 1024) {
    return `${(numericSize / 1024).toFixed(1)} KB`;
  }

  return `${(numericSize / (1024 * 1024)).toFixed(1)} MB`;
}

function buildCategoryOptions(standards, locale) {
  const categories = new Map();

  for (const standard of standards) {
    const relatedCategories = Array.isArray(standard.relatedCategories)
      ? standard.relatedCategories
      : [];

    for (const category of relatedCategories) {
      if (!category?.id) {
        continue;
      }

      categories.set(category.id, {
        id: category.id,
        name: getLocalizedValue(category.name, locale, category.slug),
      });
    }
  }

  return [...categories.values()].sort((firstItem, secondItem) =>
    firstItem.name.localeCompare(secondItem.name),
  );
}

function documentMatchesSearch(standard, locale, searchValue) {
  const normalizedSearch = searchValue.trim().toLocaleLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  const searchableValues = [
    standard.code,
    standard.slug,
    getLocalizedValue(standard.name, locale),
    getLocalizedValue(standard.shortDescription, locale),
    standard.document?.originalName,
    getLocalizedValue(standard.document?.title, locale),
    ...(standard.relatedCategories || []).map((category) =>
      getLocalizedValue(category.name, locale),
    ),
  ];

  return searchableValues.some((value) =>
    String(value || "")
      .toLocaleLowerCase()
      .includes(normalizedSearch),
  );
}

function StandardDocumentCard({ standard, locale, content }) {
  const document = standard.document;

  const title =
    getLocalizedValue(document?.title, locale) ||
    getLocalizedValue(standard.name, locale, standard.code);

  const categoryName = getLocalizedValue(
    standard.relatedCategories?.[0]?.name,
    locale,
  );

  const documentType =
    content.documentTypes[standard.documentType] || standard.documentType;

  const language =
    content.languages[standard.documentLanguage] || standard.documentLanguage;

  const hasDownload = Boolean(document?.publicUrl);

  const fileSize = formatFileSize(document?.size, content.fileSizeUnknown);

  return (
    <article className="flex min-h-[82px] items-center gap-3 rounded-md border border-[#d7e4ed] bg-white p-3 shadow-sm transition hover:border-primary/35 hover:shadow-md">
      <div className="relative size-11 shrink-0">
        <Image
          src="/images/icons/pdf.png"
          alt=""
          fill
          sizes="44px"
          className="object-contain"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-1 text-[12px] font-extrabold text-[#071d33]">
          {title}
        </h3>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] leading-4 text-slate-500">
          {categoryName ? <span>{categoryName}</span> : null}

          {categoryName ? (
            <span aria-hidden="true" className="text-slate-300">
              |
            </span>
          ) : null}

          <span>{language}</span>

          <span aria-hidden="true" className="text-slate-300">
            |
          </span>

          <span>{documentType}</span>

          <span aria-hidden="true" className="text-slate-300">
            |
          </span>

          <span>{fileSize}</span>
        </div>
      </div>

      {hasDownload ? (
        <a
          href={document.publicUrl}
          target="_blank"
          rel="noreferrer"
          download
          className="group inline-flex shrink-0 items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wide text-primary"
        >
          <span className="hidden sm:inline">{content.download}</span>

          <TbDownload
            aria-hidden="true"
            className="size-[17px] transition-transform group-hover:translate-y-0.5"
          />
        </a>
      ) : (
        <span className="hidden shrink-0 text-[9px] font-bold uppercase text-slate-400 sm:inline">
          {content.unavailable}
        </span>
      )}
    </article>
  );
}

export function StandardsDocumentsSection({ locale, standards = [], content }) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [standardCode, setStandardCode] = useState("");

  const publishedStandards = useMemo(
    () =>
      (Array.isArray(standards) ? standards : []).filter(
        (standard) =>
          standard && standard.status === "published" && !standard.isDeleted,
      ),
    [standards],
  );

  const categories = useMemo(
    () => buildCategoryOptions(publishedStandards, locale),
    [publishedStandards, locale],
  );

  const standardOptions = useMemo(
    () =>
      [...publishedStandards]
        .filter((standard) => standard.code)
        .sort(
          (firstStandard, secondStandard) =>
            Number(firstStandard.sortOrder || 0) -
            Number(secondStandard.sortOrder || 0),
        ),
    [publishedStandards],
  );

  const filteredStandards = useMemo(
    () =>
      publishedStandards.filter((standard) => {
        if (categoryId && !standard.relatedCategoryIds?.includes(categoryId)) {
          return false;
        }

        if (standardCode && standard.code !== standardCode) {
          return false;
        }

        return documentMatchesSearch(standard, locale, search);
      }),
    [publishedStandards, categoryId, standardCode, locale, search],
  );

  const hasAnyDocument = publishedStandards.some(
    (standard) => standard.document?.publicUrl,
  );

  const hasFilteredResults = filteredStandards.length > 0;

  return (
    <section className="bg-[#eef7fc] py-10 sm:py-12">
      <div className="container-hcs">
        <div className="grid gap-6 xl:grid-cols-[minmax(300px,0.75fr)_minmax(0,1.65fr)] xl:items-end">
          <header>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-primary">
              {content.eyebrow}
            </p>

            <h2 className="mt-1 text-2xl font-extrabold uppercase leading-tight tracking-[-0.025em] text-[#071d33] sm:text-[28px]">
              {content.title}
            </h2>
          </header>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1.4fr)_minmax(170px,0.9fr)_minmax(170px,0.9fr)]">
            <label className="relative block">
              <span className="sr-only">{content.searchPlaceholder}</span>

              <TbSearch
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
                placeholder={content.searchPlaceholder}
                className="h-11 w-full rounded-md border border-[#cfdee8] bg-white pl-10 pr-3 text-xs text-[#071d33] outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>

            <label>
              <span className="sr-only">{content.filters.category}</span>

              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.currentTarget.value)}
                className="h-11 w-full rounded-md border border-[#cfdee8] bg-white px-3 text-xs text-[#071d33] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">{content.filters.allCategories}</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">{content.filters.standard}</span>

              <select
                value={standardCode}
                onChange={(event) => setStandardCode(event.currentTarget.value)}
                className="h-11 w-full rounded-md border border-[#cfdee8] bg-white px-3 text-xs text-[#071d33] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              >
                <option value="">{content.filters.allStandards}</option>

                {standardOptions.map((standard) => (
                  <option key={standard.id} value={standard.code}>
                    {standard.code}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {!hasAnyDocument ? (
          <div className="mt-6 rounded-md border border-dashed border-[#cbdce7] bg-white px-6 py-12 text-center">
            <h3 className="text-lg font-extrabold text-[#071d33]">
              {content.noDocumentsTitle}
            </h3>

            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {content.noDocumentsDescription}
            </p>
          </div>
        ) : hasFilteredResults ? (
          <div className="mt-6 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {filteredStandards.map((standard) => (
              <StandardDocumentCard
                key={standard.id}
                standard={standard}
                locale={locale}
                content={content}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-md border border-dashed border-[#cbdce7] bg-white px-6 py-12 text-center">
            <h3 className="text-lg font-extrabold text-[#071d33]">
              {content.noResultsTitle}
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              {content.noResultsDescription}
            </p>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <Link
            href={`/${locale}/downloads`}
            className="group inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wide text-primary"
          >
            <span>{content.viewAll}</span>

            <TbArrowRight
              aria-hidden="true"
              className="size-[18px] transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
