import { AboutHcsSection } from "@/components/public/home/AboutHcsSection";
import { FeaturedProductsSection } from "@/components/public/home/FeaturedProductsSection";
import { HeroSection } from "@/components/public/home/HeroSection";
import { ProductCategoriesSection } from "@/components/public/home/ProductCategoriesSection";
import { ProjectReferencesSection } from "@/components/public/home/ProjectReferencesSection";
import SolutionsSection from "@/components/public/home/SolutionsSection";
import { StandardsSection } from "@/components/public/home/StandardsSection";
import { getPublicHomeCategories } from "@/services/categories/category-query.service";
import { getPublicHomeProducts } from "@/services/products/product-query.service";
import { getPublicHomeSolutions } from "@/services/solutions/solution-query.service";

async function loadHomePageData() {
  const [categoriesResult, productsResult, solutionsResult] =
    await Promise.allSettled([
      getPublicHomeCategories(),
      getPublicHomeProducts(),
      getPublicHomeSolutions(),
    ]);

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

  return {
    categories:
      categoriesResult.status === "fulfilled" ? categoriesResult.value : [],

    products: productsResult.status === "fulfilled" ? productsResult.value : [],

    solutions:
      solutionsResult.status === "fulfilled" ? solutionsResult.value : [],
  };
}

export default async function PublicHomePage({ params }) {
  const { locale } = await params;

  const { categories, products, solutions } = await loadHomePageData();

  return (
    <>
      <HeroSection locale={locale} />

      <ProductCategoriesSection locale={locale} categories={categories} />

      <AboutHcsSection locale={locale} />

      <FeaturedProductsSection locale={locale} products={products} />

      <SolutionsSection locale={locale} items={solutions} />

      <StandardsSection locale={locale} />

      <ProjectReferencesSection locale={locale} />
    </>
  );
}
