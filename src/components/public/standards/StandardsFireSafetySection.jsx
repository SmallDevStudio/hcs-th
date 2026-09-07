import Image from "next/image";
import Link from "next/link";
import { TbArrowRight, TbCheckbox } from "react-icons/tb";

const POINT_KEYS = [
  "fireResistance",
  "smokeControl",
  "escapeHardware",
  "documentation",
];

export function StandardsFireSafetySection({ locale, content }) {
  return (
    <section className="overflow-hidden bg-white">
      <div className="grid min-h-[400px] lg:grid-cols-2">
        <div className="relative min-h-[320px] bg-slate-200 lg:min-h-full">
          <Image
            src="/images/standards/standards-fire-safety.jpg"
            alt={content.imageAlt}
            fill
            quality={90}
            sizes="(max-width: 1023px) 100vw, 50vw"
            className="object-cover object-center"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#061d31]/25 to-transparent"
          />
        </div>

        <div className="flex items-center px-6 py-10 sm:px-10 lg:px-14 xl:px-20">
          <div className="max-w-2xl">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-primary">
              {content.eyebrow}
            </p>

            <h2 className="mt-1 text-2xl font-extrabold uppercase leading-tight tracking-[-0.025em] text-[#071d33] sm:text-[30px]">
              {content.title}
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-600">
              {content.description}
            </p>

            <ul className="mt-5 space-y-2">
              {POINT_KEYS.map((key) => (
                <li
                  key={key}
                  className="flex items-start gap-2.5 text-sm text-slate-700"
                >
                  <TbCheckbox
                    aria-hidden="true"
                    className="mt-0.5 size-[18px] shrink-0 text-primary"
                  />

                  <span>{content.points[key]}</span>
                </li>
              ))}
            </ul>

            <Link
              href={`/${locale}/solutions?requirement=fire-safety`}
              className="group mt-7 inline-flex h-11 items-center justify-center gap-3 rounded-sm border border-primary px-6 text-[11px] font-extrabold uppercase tracking-wide text-primary transition hover:bg-primary hover:!text-white"
            >
              <span>{content.action}</span>

              <TbArrowRight
                aria-hidden="true"
                className="size-[18px] transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
