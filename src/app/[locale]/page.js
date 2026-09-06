import { AboutHcsSection } from "@/components/public/home/AboutHcsSection";
import { FeaturedProductsSection } from "@/components/public/home/FeaturedProductsSection";
import { HeroSection } from "@/components/public/home/HeroSection";
import { ProductCategoriesSection } from "@/components/public/home/ProductCategoriesSection";
import { ProjectReferencesSection } from "@/components/public/home/ProjectReferencesSection";
import SolutionsSection from "@/components/public/home/SolutionsSection";
import { StandardsSection } from "@/components/public/home/StandardsSection";
import { getPublicHomeCategories } from "@/services/categories/category-query.service";

async function loadHomeCategories() {
  try {
    return await getPublicHomeCategories();
  } catch (error) {
    console.error("Unable to load public home categories:", error);

    return [];
  }
}

export default async function PublicHomePage({ params }) {
  const { locale } = await params;
  const categories = await loadHomeCategories();

  return (
    <>
      <HeroSection locale={locale} />

      <ProductCategoriesSection locale={locale} categories={categories} />

      <AboutHcsSection locale={locale} />

      <FeaturedProductsSection locale={locale} />

      <SolutionsSection locale={locale} />

      <StandardsSection locale={locale} />

      <ProjectReferencesSection locale={locale} />
    </>
  );
}
