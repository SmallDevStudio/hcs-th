"use client";

import { useTranslation } from "react-i18next";

import { FeaturedStandardsSection } from "@/components/public/standards/FeaturedStandardsSection";
import { StandardsCategorySection } from "@/components/public/standards/StandardsCategorySection";
import { StandardsCommitmentSection } from "@/components/public/standards/StandardsCommitmentSection";
import { StandardsComplianceCta } from "@/components/public/standards/StandardsComplianceCta";
import { StandardsDocumentsSection } from "@/components/public/standards/StandardsDocumentsSection";
import { StandardsFireSafetySection } from "@/components/public/standards/StandardsFireSafetySection";
import { StandardsHero } from "@/components/public/standards/StandardsHero";
import { StandardsProcessSection } from "@/components/public/standards/StandardsProcessSection";

const FEATURED_STANDARD_KEYS = ["ce", "en1154", "en1634", "en1906", "bs"];

const FIRE_SAFETY_POINT_KEYS = [
  "fireResistance",
  "smokeControl",
  "escapeHardware",
  "documentation",
];

const PROCESS_STEP_KEYS = [
  "development",
  "testing",
  "certification",
  "compliance",
];

const DOCUMENT_TYPE_KEYS = [
  "certificate",
  "test-report",
  "declaration-of-performance",
  "product-compliance",
  "quality-certificate",
  "technical-document",
  "other",
];

const LANGUAGE_KEYS = ["en", "th", "bilingual", "other"];

export function StandardsPage({ locale = "en", standards = [] }) {
  const { t } = useTranslation("public");

  const currentLocale = locale === "th" ? "th" : "en";

  const featuredStandards = Object.fromEntries(
    FEATURED_STANDARD_KEYS.map((key) => [
      key,
      {
        code: t(`standards.featured.${key}.code`),
        title: t(`standards.featured.${key}.title`),
        description: t(`standards.featured.${key}.description`),
      },
    ]),
  );

  const fireSafetyPoints = Object.fromEntries(
    FIRE_SAFETY_POINT_KEYS.map((key) => [
      key,
      t(`standards.fireSafety.points.${key}`),
    ]),
  );

  const processSteps = Object.fromEntries(
    PROCESS_STEP_KEYS.map((key) => [
      key,
      {
        number: t(`standards.process.steps.${key}.number`),
        title: t(`standards.process.steps.${key}.title`),
        description: t(`standards.process.steps.${key}.description`),
      },
    ]),
  );

  const documentTypes = Object.fromEntries(
    DOCUMENT_TYPE_KEYS.map((key) => [key, t(`standards.documentTypes.${key}`)]),
  );

  const languages = Object.fromEntries(
    LANGUAGE_KEYS.map((key) => [key, t(`standards.languages.${key}`)]),
  );

  return (
    <>
      <StandardsHero
        locale={currentLocale}
        content={{
          breadcrumbHome: t("standards.hero.breadcrumbHome"),

          breadcrumbStandards: t("standards.hero.breadcrumbStandards"),

          eyebrow: t("standards.hero.eyebrow"),

          titleLineOne: t("standards.hero.titleLineOne"),

          titleLineTwo: t("standards.hero.titleLineTwo"),

          description: t("standards.hero.description"),

          imageAlt: t("standards.hero.imageAlt"),
        }}
      />

      <StandardsCommitmentSection
        content={{
          eyebrow: t("standards.commitment.eyebrow"),

          title: t("standards.commitment.title"),

          descriptionOne: t("standards.commitment.descriptionOne"),

          descriptionTwo: t("standards.commitment.descriptionTwo"),
        }}
      />

      <FeaturedStandardsSection content={featuredStandards} />

      <StandardsCategorySection
        locale={currentLocale}
        standards={standards}
        content={{
          eyebrow: t("standards.categories.eyebrow"),

          title: t("standards.categories.title"),

          viewAllProducts: t("standards.categories.viewAllProducts"),

          viewProducts: t("standards.categories.viewProducts"),

          emptyTitle: t("standards.categories.emptyTitle"),

          emptyDescription: t("standards.categories.emptyDescription"),

          moreStandards: t("standards.categories.moreStandards"),
        }}
      />

      <StandardsFireSafetySection
        locale={currentLocale}
        content={{
          eyebrow: t("standards.fireSafety.eyebrow"),

          title: t("standards.fireSafety.title"),

          description: t("standards.fireSafety.description"),

          points: fireSafetyPoints,

          action: t("standards.fireSafety.action"),

          imageAlt: t("standards.fireSafety.imageAlt"),
        }}
      />

      <StandardsProcessSection
        content={{
          eyebrow: t("standards.process.eyebrow"),

          title: t("standards.process.title"),

          steps: processSteps,

          imageAlt: t("standards.process.imageAlt"),
        }}
      />

      <StandardsDocumentsSection
        locale={currentLocale}
        standards={standards}
        content={{
          eyebrow: t("standards.documents.eyebrow"),

          title: t("standards.documents.title"),

          searchPlaceholder: t("standards.documents.searchPlaceholder"),

          filters: {
            category: t("standards.documents.filters.category"),

            allCategories: t("standards.documents.filters.allCategories"),

            standard: t("standards.documents.filters.standard"),

            allStandards: t("standards.documents.filters.allStandards"),
          },

          search: t("standards.documents.search"),

          download: t("standards.documents.download"),

          unavailable: t("standards.documents.unavailable"),

          viewAll: t("standards.documents.viewAll"),

          fileTypePdf: t("standards.documents.fileTypePdf"),

          fileSizeUnknown: t("standards.documents.fileSizeUnknown"),

          noDocumentsTitle: t("standards.documents.noDocumentsTitle"),

          noDocumentsDescription: t(
            "standards.documents.noDocumentsDescription",
          ),

          noResultsTitle: t("standards.documents.noResultsTitle"),

          noResultsDescription: t("standards.documents.noResultsDescription"),

          documentTypes,

          languages,
        }}
      />

      <StandardsComplianceCta
        locale={currentLocale}
        content={{
          eyebrow: t("standards.complianceHelp.eyebrow"),

          title: t("standards.complianceHelp.title"),

          description: t("standards.complianceHelp.description"),

          action: t("standards.complianceHelp.action"),

          imageAlt: t("standards.complianceHelp.imageAlt"),
        }}
      />
    </>
  );
}
