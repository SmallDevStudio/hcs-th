"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TbSearch, TbX } from "react-icons/tb";

import { ProjectCard } from "@/components/public/projects/ProjectCard";
import { ProjectsHero } from "@/components/public/projects/ProjectsHero";
import {
  PROJECTS_PER_PAGE,
  projectMatchesSearch,
  sortProjects,
} from "@/components/public/projects/project-catalog.utils";

import { ProjectsStatsSection } from "@/components/public/projects/ProjectsStatsSection";
import { ProjectsCommitmentSection } from "@/components/public/projects/ProjectsCommitmentSection";

export function PublicProjectsCatalog({ locale = "en", projects = [] }) {
  const { t } = useTranslation("public");
  const currentLocale = locale === "th" ? "th" : "en";
  const [search, setSearch] = useState("");
  const [buildingType, setBuildingType] = useState("all");
  const [page, setPage] = useState(1);

  const sortedProjects = useMemo(
    () => sortProjects(Array.isArray(projects) ? projects : []),
    [projects],
  );

  const buildingTypes = useMemo(
    () =>
      [
        ...new Set(sortedProjects.map((project) => project.buildingType)),
      ].filter(Boolean),
    [sortedProjects],
  );

  const filteredProjects = useMemo(
    () =>
      sortedProjects.filter(
        (project) =>
          (buildingType === "all" || project.buildingType === buildingType) &&
          projectMatchesSearch(project, search, currentLocale),
      ),
    [buildingType, currentLocale, search, sortedProjects],
  );

  const pageCount = Math.max(
    1,
    Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE),
  );
  const activePage = Math.min(page, pageCount);
  const visibleProjects = filteredProjects.slice(
    (activePage - 1) * PROJECTS_PER_PAGE,
    activePage * PROJECTS_PER_PAGE,
  );
  const heroProject =
    sortedProjects.find(
      (project) => project.featured && project.coverImage?.publicUrl,
    ) || sortedProjects.find((project) => project.coverImage?.publicUrl);

  function updateBuildingType(value) {
    setBuildingType(value);
    setPage(1);
  }

  function updateSearch(event) {
    setSearch(event.currentTarget.value);
    setPage(1);
  }

  function resetFilters() {
    setSearch("");
    setBuildingType("all");
    setPage(1);
  }

  return (
    <>
      <ProjectsHero project={heroProject} locale={currentLocale} t={t} />
      <ProjectsStatsSection t={t} />
      <section className="border-b border-[#d8e4ed] bg-white py-5 dark:border-border dark:bg-background">
        <div className="container-hcs">
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => updateBuildingType("all")}
              aria-pressed={buildingType === "all"}
              className={`min-h-12 shrink-0 rounded border px-5 text-xs font-extrabold uppercase tracking-[0.04em] transition ${
                buildingType === "all"
                  ? "border-primary bg-primary text-white shadow-sm"
                  : "border-[#cbdbe7] bg-white text-[#18334d] hover:border-primary hover:text-primary dark:border-border dark:bg-surface dark:text-foreground"
              }`}
            >
              {t("projects.filters.all")}
            </button>

            {buildingTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => updateBuildingType(type)}
                aria-pressed={buildingType === type}
                className={`min-h-12 shrink-0 rounded border px-5 text-xs font-extrabold uppercase tracking-[0.04em] transition ${
                  buildingType === type
                    ? "border-primary bg-primary text-white shadow-sm"
                    : "border-[#cbdbe7] bg-white text-[#18334d] hover:border-primary hover:text-primary dark:border-border dark:bg-surface dark:text-foreground"
                }`}
              >
                {t(`projects.buildingTypes.${type}`, { defaultValue: type })}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f3f8fb] py-12 sm:py-14 lg:py-16 dark:bg-background">
        <div className="container-hcs">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
                {t("projects.catalog.eyebrow")}
              </p>
              <h2 className="mt-2 text-3xl font-extrabold uppercase leading-tight tracking-[-0.03em] text-[#071b30] dark:text-white sm:text-4xl">
                {t("projects.catalog.title")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("projects.results.count", {
                  count: filteredProjects.length,
                })}
              </p>
            </div>

            <label className="relative block w-full lg:w-[390px]">
              <span className="sr-only">
                {t("projects.filters.searchLabel")}
              </span>
              <TbSearch
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="search"
                value={search}
                onChange={updateSearch}
                placeholder={t("projects.filters.searchPlaceholder")}
                className="h-12 w-full rounded border border-[#cbdbe7] bg-white pl-12 pr-11 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-border dark:bg-surface"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  aria-label={t("projects.filters.clearSearch")}
                  className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <TbX aria-hidden="true" className="size-5" />
                </button>
              ) : null}
            </label>
          </div>

          {visibleProjects.length ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleProjects.map((project, index) => (
                <ProjectCard
                  key={project.id || project.slug}
                  project={project}
                  locale={currentLocale}
                  t={t}
                  priority={activePage === 1 && index < 3}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-lg border border-dashed border-[#bfd0dd] bg-white px-6 py-16 text-center dark:border-border dark:bg-surface">
              <h3 className="text-xl font-extrabold text-foreground">
                {t("projects.empty.title")}
              </h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                {t("projects.empty.description")}
              </p>
              {(search || buildingType !== "all") && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 rounded border border-primary px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-primary transition hover:bg-primary hover:text-white"
                >
                  {t("projects.filters.reset")}
                </button>
              )}
            </div>
          )}

          {pageCount > 1 ? (
            <nav
              aria-label={t("projects.pagination.label")}
              className="mt-9 flex flex-wrap justify-center gap-2"
            >
              {Array.from({ length: pageCount }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    aria-current={
                      activePage === pageNumber ? "page" : undefined
                    }
                    className={`flex size-10 items-center justify-center rounded border text-sm font-bold transition ${
                      activePage === pageNumber
                        ? "border-primary bg-primary text-white"
                        : "border-[#cbdbe7] bg-white text-foreground hover:border-primary hover:text-primary dark:border-border dark:bg-surface"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ),
              )}
            </nav>
          ) : null}
        </div>
      </section>
      <ProjectsCommitmentSection t={t} />
    </>
  );
}
