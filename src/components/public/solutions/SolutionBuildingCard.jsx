import Image from "next/image";
import Link from "next/link";
import {
  TbArrowRight,
  TbBriefcase,
  TbBuilding,
  TbBuildingHospital,
  TbBuildingSkyscraper,
  TbFlame,
  TbLock,
  TbSettings,
} from "react-icons/tb";
import { FaConciergeBell } from "react-icons/fa";

const ICONS = {
  hospitality: FaConciergeBell,
  healthcare: TbBuildingHospital,
  commercial: TbBriefcase,
  industrial: TbSettings,
  building: TbBuilding,
  security: TbLock,
  "fire-rated": TbFlame,
  "access-control": TbBuildingSkyscraper,
};

const FALLBACK_IMAGES = {
  hospitality: "/images/home/solutions/solution-hospitality.jpg",

  healthcare: "/images/home/solutions/solution-healthcare.jpg",

  commercial: "/images/home/solutions/solution-commercial.jpg",

  industrial: "/images/home/solutions/solution-industrial.jpg",
};

function getLocalizedValue(value, locale, fallback = "") {
  return value?.[locale] || value?.en || value?.th || fallback;
}

export function SolutionBuildingCard({
  solution,
  locale,
  actionLabel,
  eager = false,
}) {
  const Icon = ICONS[solution.icon] || TbBuilding;

  const name = getLocalizedValue(solution.name, locale, solution.slug);

  const description = getLocalizedValue(solution.shortDescription, locale);

  const imageUrl =
    solution.image?.publicUrl ||
    FALLBACK_IMAGES[solution.slug] ||
    FALLBACK_IMAGES.commercial;

  return (
    <article
      id={solution.slug}
      className="group relative min-h-[265px] overflow-hidden rounded-md bg-[#061b2c] shadow-sm"
    >
      <Image
        src={imageUrl}
        alt={getLocalizedValue(solution.image?.altText, locale, name) || name}
        fill
        unoptimized={Boolean(solution.image?.publicUrl)}
        loading={eager ? "eager" : "lazy"}
        sizes="(max-width: 767px) 100vw, 50vw"
        className="object-cover transition duration-500 group-hover:scale-[1.035]"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#031522]/95 via-[#031522]/32 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end gap-4 p-5 sm:p-6">
        <span className="flex size-12 shrink-0 items-center justify-center text-white">
          <Icon aria-hidden="true" className="size-11" />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-extrabold text-white">{name}</h3>

          <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/80">
            {description}
          </p>

          <Link
            href={`/${locale}/contact?solution=${encodeURIComponent(
              solution.slug,
            )}`}
            className="mt-3 inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.08em] text-sky-300 transition hover:text-white"
          >
            {actionLabel}

            <TbArrowRight
              aria-hidden="true"
              className="size-4 transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
