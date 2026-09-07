import Link from "next/link";
import {
  TbArrowRight,
  TbDoor,
  TbFlame,
  TbGripHorizontal,
  TbKey,
  TbLayoutNavbar,
  TbWindow,
} from "react-icons/tb";

const CATEGORY_ICONS = {
  "door-closers": TbDoor,
  "lever-handles": TbGripHorizontal,
  "locks-cylinders": TbKey,
  hinges: TbLayoutNavbar,
  "panic-exit-hardware": TbGripHorizontal,
  "door-window-seals": TbWindow,
  "fire-doors": TbFlame,
};

const CATEGORY_ORDER = [
  "door-closers",
  "lever-handles",
  "locks-cylinders",
  "hinges",
  "panic-exit-hardware",
  "fire-doors",
];

function getLocalizedValue(value, locale, fallback = "") {
  return value?.[locale] || value?.en || value?.th || fallback;
}

function getCategoryIcon(slug) {
  return CATEGORY_ICONS[slug] || TbDoor;
}

function buildCategoryItems(standards, locale) {
  const categoryMap = new Map();

  for (const standard of standards) {
    const relatedCategories = Array.isArray(standard.relatedCategories)
      ? standard.relatedCategories
      : [];

    for (const category of relatedCategories) {
      if (!category?.id || !category?.slug) {
        continue;
      }

      const currentItem = categoryMap.get(category.id) || {
        id: category.id,
        slug: category.slug,
        name: getLocalizedValue(category.name, locale, category.slug),
        standards: [],
      };

      if (standard.code && !currentItem.standards.includes(standard.code)) {
        currentItem.standards.push(standard.code);
      }

      categoryMap.set(category.id, currentItem);
    }
  }

  return [...categoryMap.values()].sort((firstItem, secondItem) => {
    const firstIndex = CATEGORY_ORDER.indexOf(firstItem.slug);
    const secondIndex = CATEGORY_ORDER.indexOf(secondItem.slug);

    if (firstIndex === -1 && secondIndex === -1) {
      return firstItem.name.localeCompare(secondItem.name);
    }

    if (firstIndex === -1) {
      return 1;
    }

    if (secondIndex === -1) {
      return -1;
    }

    return firstIndex - secondIndex;
  });
}

export function StandardsCategorySection({ locale, standards, content }) {
  const categories = buildCategoryItems(standards, locale);

  if (!categories.length) {
    return null;
  }

  return (
    <section className="bg-[#eef7fc] py-10 sm:py-12">
      <div className="container-hcs">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-primary">
              {content.eyebrow}
            </p>

            <h2 className="mt-1 text-2xl font-extrabold uppercase leading-tight tracking-[-0.025em] text-[#071d33] sm:text-[28px]">
              {content.title}
            </h2>
          </div>

          <Link
            href={`/${locale}/products`}
            className="group inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wide text-primary"
          >
            <span>{content.viewAllProducts}</span>

            <TbArrowRight
              aria-hidden="true"
              className="size-[18px] transition-transform group-hover:translate-x-1"
            />
          </Link>
        </header>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.slug);

            const visibleStandards = category.standards.slice(0, 3);

            const remainingCount =
              category.standards.length - visibleStandards.length;

            return (
              <article
                key={category.id}
                className="group rounded-md border border-[#d6e4ed] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex size-14 shrink-0 items-center justify-center text-primary">
                    <Icon
                      aria-hidden="true"
                      strokeWidth={1.6}
                      className="size-12"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-extrabold leading-5 text-[#071d33]">
                      {category.name}
                    </h3>

                    <div className="mt-2 flex min-h-6 flex-wrap gap-1.5">
                      {visibleStandards.map((standardCode) => (
                        <span
                          key={standardCode}
                          className="rounded bg-[#e1f1fb] px-2 py-1 text-[10px] font-bold leading-none text-[#075e9c]"
                        >
                          {standardCode}
                        </span>
                      ))}

                      {remainingCount > 0 ? (
                        <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold leading-none text-slate-500">
                          {content.moreStandards.replace(
                            "{{count}}",
                            String(remainingCount),
                          )}
                        </span>
                      ) : null}
                    </div>

                    <Link
                      href={`/${locale}/products?category=${encodeURIComponent(
                        category.slug,
                      )}`}
                      className="mt-4 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wide text-primary"
                    >
                      <span>{content.viewProducts}</span>

                      <TbArrowRight
                        aria-hidden="true"
                        className="size-[18px] transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        ) : (
        <div className="mt-6 rounded-md border border-dashed border-[#cbdce7] bg-white px-6 py-12 text-center">
          <h3 className="text-lg font-extrabold text-[#071d33]">
            {content.emptyTitle}
          </h3>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            {content.emptyDescription}
          </p>
        </div>
      </div>
    </section>
  );
}
