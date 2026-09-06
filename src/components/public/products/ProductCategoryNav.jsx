"use client";

import { TbGridDots } from "react-icons/tb";

import CategoryIcon from "@/components/common/CategoryIcon";
import { getLocalizedValue } from "@/components/public/products/product-catalog.utils";

function CategoryButton({ selected, icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "grid h-[94px] w-[142px] shrink-0 grid-rows-[32px_40px] place-items-center gap-1 rounded-lg border px-3 py-3 text-center transition duration-200",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
        selected
          ? "border-primary bg-primary !text-white shadow-[0_8px_22px_rgba(9,121,196,0.22)]"
          : "border-[#ccdce7] bg-white text-[#12324d] hover:-translate-y-0.5 hover:border-primary hover:text-primary dark:border-border dark:bg-surface dark:text-white",
      ].join(" ")}
    >
      <span className="flex h-8 items-center justify-center">{icon}</span>

      <span className="line-clamp-2 flex h-10 items-center justify-center text-[11px] font-bold leading-[1.15rem]">
        {label}
      </span>
    </button>
  );
}

export function ProductCategoryNav({
  locale,
  categories,
  selectedCategorySlugs,
  allProductsLabel,
  onSelectAll,
  onToggleCategory,
}) {
  return (
    <section className="border-b border-border bg-background">
      <div className="container-hcs">
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-4 left-0 top-4 z-10 w-5 bg-gradient-to-r from-background to-transparent"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-4 right-0 top-4 z-10 w-5 bg-gradient-to-l from-background to-transparent"
          />

          <div className="overflow-x-auto px-1 py-4 [scrollbar-color:rgba(9,121,196,0.35)_transparent] [scrollbar-width:thin]">
            <div className="flex min-w-max gap-3 px-1 pb-1">
              <CategoryButton
                selected={!selectedCategorySlugs.length}
                label={allProductsLabel}
                onClick={onSelectAll}
                icon={<TbGridDots aria-hidden="true" className="size-7" />}
              />

              {categories.map((category) => (
                <CategoryButton
                  key={category.id}
                  selected={selectedCategorySlugs.includes(category.slug)}
                  label={getLocalizedValue(
                    category.name,
                    locale,
                    category.slug,
                  )}
                  onClick={() => onToggleCategory(category.slug)}
                  icon={
                    <CategoryIcon icon={category.icon} className="size-7" />
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
