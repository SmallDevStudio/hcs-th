import { AboutHcsSection } from "@/components/public/home/AboutHcsSection";
import { FeaturedProductsSection } from "@/components/public/home/FeaturedProductsSection";
import { HeroSection } from "@/components/public/home/HeroSection";
import { ProductCategoriesSection } from "@/components/public/home/ProductCategoriesSection";
import { ProjectReferencesSection } from "@/components/public/home/ProjectReferencesSection";
import SolutionsSection from "@/components/public/home/SolutionsSection";
import { StandardsSection } from "@/components/public/home/StandardsSection";

export default async function PublicHomePage({ params }) {
  const { locale } = await params;

  return (
    <>
      <HeroSection locale={locale} />

      <ProductCategoriesSection locale={locale} />

      <AboutHcsSection locale={locale} />

      <FeaturedProductsSection locale={locale} />

      <SolutionsSection locale={locale} />

      <StandardsSection locale={locale} />

      <ProjectReferencesSection locale={locale} />
    </>
  );
}
