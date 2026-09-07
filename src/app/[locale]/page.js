import { AboutHcsSection } from "@/components/public/home/AboutHcsSection";
import { FeaturedProductsSection } from "@/components/public/home/FeaturedProductsSection";
import { HeroSection } from "@/components/public/home/HeroSection";
import { ProductCategoriesSection } from "@/components/public/home/ProductCategoriesSection";
import { ProjectReferencesSection } from "@/components/public/home/ProjectReferencesSection";
import SolutionsSection from "@/components/public/home/SolutionsSection";
import { StandardsSection } from "@/components/public/home/StandardsSection";

import { getPublicHomeCategories } from "@/services/categories/category-query.service";
import { getPublicHomeHeroes } from "@/services/home/home-hero-query.service";
import { getPublicHomeProducts } from "@/services/products/product-query.service";
import { getPublicHomeProjects } from "@/services/projects/project-query.service";
import { getPublicHomeSolutions } from "@/services/solutions/solution-query.service";
import { getPublicHomeStandards } from "@/services/standards/standard-query.service";

function normalizeResult(result) {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.items)) {
    return result.items;
  }

  if (Array.isArray(result?.data)) {
    return result.data;
  }

  return [];
}

async function loadHomePageData() {
  const [
    heroesResult,
    categoriesResult,
    productsResult,
    solutionsResult,
    standardsResult,
    projectsResult,
  ] = await Promise.allSettled([
    getPublicHomeHeroes(),

    getPublicHomeCategories(),

    getPublicHomeProducts(),

    getPublicHomeSolutions(),

    getPublicHomeStandards(),

    getPublicHomeProjects(),
  ]);

  if (heroesResult.status === "rejected") {
    console.error("Unable to load public Home Heroes:", heroesResult.reason);
  }

  if (categoriesResult.status === "rejected") {
    console.error(
      "Unable to load public home categories:",
      categoriesResult.reason,
    );
  }

  if (productsResult.status === "rejected") {
    console.error(
      "Unable to load public home products:",
      productsResult.reason,
    );
  }

  if (solutionsResult.status === "rejected") {
    console.error(
      "Unable to load public home solutions:",
      solutionsResult.reason,
    );
  }

  if (standardsResult.status === "rejected") {
    console.error(
      "Unable to load public home standards:",
      standardsResult.reason,
    );
  }

  if (projectsResult.status === "rejected") {
    console.error(
      "Unable to load public home projects:",
      projectsResult.reason,
    );
  }

  return {
    heroes:
      heroesResult.status === "fulfilled"
        ? normalizeResult(heroesResult.value)
        : [],

    categories:
      categoriesResult.status === "fulfilled"
        ? normalizeResult(categoriesResult.value)
        : [],

    products:
      productsResult.status === "fulfilled"
        ? normalizeResult(productsResult.value)
        : [],

    solutions:
      solutionsResult.status === "fulfilled"
        ? normalizeResult(solutionsResult.value)
        : [],

    standards:
      standardsResult.status === "fulfilled"
        ? normalizeResult(standardsResult.value)
        : [],

    projects:
      projectsResult.status === "fulfilled"
        ? normalizeResult(projectsResult.value)
        : [],
  };
}

export default async function PublicHomePage({ params }) {
  const { locale } = await params;

  const { heroes, categories, products, solutions, standards, projects } =
    await loadHomePageData();

  return (
    <>
      <HeroSection locale={locale} slides={heroes} />

      <ProductCategoriesSection locale={locale} categories={categories} />

      <AboutHcsSection locale={locale} />

      <FeaturedProductsSection locale={locale} products={products} />

      <SolutionsSection locale={locale} items={solutions} />

      <StandardsSection locale={locale} standards={standards} />

      <ProjectReferencesSection locale={locale} projects={projects} />
    </>
  );
}
