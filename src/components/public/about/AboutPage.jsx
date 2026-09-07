"use client";

import { useTranslation } from "react-i18next";

import { AboutCapabilitiesSection } from "@/components/public/about/AboutCapabilitiesSection";
import { AboutCommitmentSection } from "@/components/public/about/AboutCommitmentSection";
import { AboutHero } from "@/components/public/about/AboutHero";
import { AboutStatsSection } from "@/components/public/about/AboutStatsSection";
import { AboutStorySection } from "@/components/public/about/AboutStorySection";
import { AboutValuesSection } from "@/components/public/about/AboutValuesSection";

const VALUE_KEYS = [
  "totalSolutions",
  "internationalStandards",
  "technicalExpertise",
  "trustedPartnership",
];

const CAPABILITY_KEYS = [
  "consultation",
  "productRange",
  "integration",
  "coordination",
  "afterSales",
];

const STAT_KEYS = ["experience", "projects", "partners", "markets"];

export function AboutPage({ locale = "en" }) {
  const { t } = useTranslation("public");

  const currentLocale = locale === "th" ? "th" : "en";

  const storyParagraphs = t("about.story.paragraphs", {
    returnObjects: true,
  });

  const valueItems = Object.fromEntries(
    VALUE_KEYS.map((key) => [
      key,
      {
        title: t(`about.values.items.${key}.title`),
        description: t(`about.values.items.${key}.description`),
      },
    ]),
  );

  const capabilityPoints = Object.fromEntries(
    CAPABILITY_KEYS.map((key) => [key, t(`about.capabilities.points.${key}`)]),
  );

  const statistics = Object.fromEntries(
    STAT_KEYS.map((key) => [
      key,
      {
        value: t(`about.statistics.${key}.value`),
        label: t(`about.statistics.${key}.label`),
        description: t(`about.statistics.${key}.description`),
      },
    ]),
  );

  return (
    <>
      <AboutHero
        locale={currentLocale}
        content={{
          breadcrumbHome: t("about.hero.breadcrumbHome"),
          breadcrumbAbout: t("about.hero.breadcrumbAbout"),
          breadcrumbLabel: t("about.hero.breadcrumbLabel"),
          eyebrow: t("about.hero.eyebrow"),
          titleLineOne: t("about.hero.titleLineOne"),
          titleLineTwo: t("about.hero.titleLineTwo"),
          description: t("about.hero.description"),
          imageAlt: t("about.hero.imageAlt"),
        }}
      />

      <AboutStorySection
        content={{
          eyebrow: t("about.story.eyebrow"),
          titleLineOne: t("about.story.titleLineOne"),
          titleLineTwo: t("about.story.titleLineTwo"),
          paragraphs: Array.isArray(storyParagraphs) ? storyParagraphs : [],
          action: t("about.story.action"),
          imageAlt: t("about.story.imageAlt"),
          experienceValue: t("about.story.experienceValue"),
          experienceLabel: t("about.story.experienceLabel"),
        }}
      />

      <AboutValuesSection
        content={{
          eyebrow: t("about.values.eyebrow"),
          title: t("about.values.title"),
          items: valueItems,
        }}
      />

      <AboutCapabilitiesSection
        content={{
          eyebrow: t("about.capabilities.eyebrow"),
          titleLineOne: t("about.capabilities.titleLineOne"),
          titleLineTwo: t("about.capabilities.titleLineTwo"),
          description: t("about.capabilities.description"),
          imageAlt: t("about.capabilities.imageAlt"),
          points: capabilityPoints,
        }}
      />

      <AboutStatsSection content={statistics} />

      <AboutCommitmentSection
        locale={currentLocale}
        content={{
          eyebrow: t("about.commitment.eyebrow"),
          titleLineOne: t("about.commitment.titleLineOne"),
          titleLineTwo: t("about.commitment.titleLineTwo"),
          description: t("about.commitment.description"),
          action: t("about.commitment.action"),
          imageAlt: t("about.commitment.imageAlt"),
        }}
      />
    </>
  );
}
