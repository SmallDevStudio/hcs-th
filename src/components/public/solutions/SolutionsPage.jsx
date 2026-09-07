"use client";

import { useTranslation } from "react-i18next";

import { BuildingSolutionsSection } from "@/components/public/solutions/BuildingSolutionsSection";
import { RequirementSolutionsSection } from "@/components/public/solutions/RequirementSolutionsSection";
import { SolutionsFeaturedProjectSection } from "@/components/public/solutions/SolutionsFeaturedProjectSection";
import { SolutionsHero } from "@/components/public/solutions/SolutionsHero";
import { SolutionsProcessSection } from "@/components/public/solutions/SolutionsProcessSection";
import { SolutionsStandardsSection } from "@/components/public/solutions/SolutionsStandardsSection";

const REQUIREMENT_KEYS = [
  "fireSafety",
  "accessSecurity",
  "acoustic",
  "accessibility",
  "durability",
  "design",
];

const PROCESS_KEYS = ["consultation", "specification", "selection", "support"];

export function SolutionsPage({ locale = "en", solutions = [] }) {
  const { t } = useTranslation("public");

  const currentLocale = locale === "th" ? "th" : "en";

  const requirementItems = Object.fromEntries(
    REQUIREMENT_KEYS.map((key) => [
      key,
      {
        title: t(`solutions.requirements.items.${key}.title`),

        description: t(`solutions.requirements.items.${key}.description`),
      },
    ]),
  );

  const processSteps = Object.fromEntries(
    PROCESS_KEYS.map((key) => [
      key,
      {
        number: t(`solutions.process.steps.${key}.number`),

        title: t(`solutions.process.steps.${key}.title`),

        description: t(`solutions.process.steps.${key}.description`),
      },
    ]),
  );

  return (
    <>
      <SolutionsHero
        locale={currentLocale}
        content={{
          breadcrumbHome: t("solutions.hero.breadcrumbHome"),

          breadcrumbSolutions: t("solutions.hero.breadcrumbSolutions"),

          eyebrow: t("solutions.hero.eyebrow"),

          titleLineOne: t("solutions.hero.titleLineOne"),

          titleLineTwo: t("solutions.hero.titleLineTwo"),

          description: t("solutions.hero.description"),
        }}
      />

      <section className="bg-white py-10 text-center sm:py-12">
        <div className="container-hcs">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-primary">
            {t("solutions.expertise.eyebrow")}
          </p>

          <h2 className="mt-1 text-2xl font-extrabold uppercase tracking-[-0.025em] text-foreground sm:text-3xl">
            {t("solutions.expertise.title")}
          </h2>

          <p className="mx-auto mt-3 max-w-4xl text-sm leading-7 text-slate-600">
            {t("solutions.expertise.description")}
          </p>
        </div>
      </section>

      <BuildingSolutionsSection
        locale={currentLocale}
        solutions={solutions}
        content={{
          eyebrow: t("solutions.buildingTypes.eyebrow"),

          title: t("solutions.buildingTypes.title"),

          action: t("solutions.buildingTypes.action"),

          emptyTitle: t("solutions.buildingTypes.emptyTitle"),

          emptyDescription: t("solutions.buildingTypes.emptyDescription"),
        }}
      />

      <RequirementSolutionsSection
        locale={currentLocale}
        content={{
          eyebrow: t("solutions.requirements.eyebrow"),

          title: t("solutions.requirements.title"),

          action: t("solutions.requirements.action"),

          items: requirementItems,
        }}
      />

      <SolutionsProcessSection
        content={{
          eyebrow: t("solutions.process.eyebrow"),

          title: t("solutions.process.title"),

          steps: processSteps,
        }}
      />

      <SolutionsStandardsSection
        locale={currentLocale}
        content={{
          eyebrow: t("solutions.standards.eyebrow"),

          title: t("solutions.standards.title"),

          description: t("solutions.standards.description"),

          action: t("solutions.standards.action"),
        }}
      />

      <SolutionsFeaturedProjectSection
        locale={currentLocale}
        content={{
          eyebrow: t("solutions.project.eyebrow"),

          title: t("solutions.project.title"),

          featured: t("solutions.project.featured"),

          projectTitle: t("solutions.project.projectTitle"),

          description: t("solutions.project.description"),

          action: t("solutions.project.action"),
        }}
      />
    </>
  );
}
