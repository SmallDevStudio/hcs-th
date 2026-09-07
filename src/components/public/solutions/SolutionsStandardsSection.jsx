import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

const STANDARDS = [
  {
    code: "EN 1154",
    label: "Door Closers",
  },
  {
    code: "EN 1634",
    label: "Fire Resistance",
  },
  {
    code: "EN 1906",
    label: "Lever Handles",
  },
  {
    code: "BS",
    label: "British Standards",
  },
  {
    code: "CE",
    label: "European Conformity",
  },
];

export function SolutionsStandardsSection({ locale, content }) {
  return (
    <section className="relative isolate overflow-hidden bg-[#0879c6] py-10 text-white sm:py-12">
      <Image
        src="/images/home/standards/door-closer-blueprint.jpg"
        alt=""
        fill
        aria-hidden="true"
        quality={82}
        sizes="100vw"
        className="absolute inset-0 -z-20 object-cover opacity-50"
      />

      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0768aa]/95 via-[#0878c2]/90 to-[#0988d8]/65" />

      <div className="container-hcs">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-white/85">
              {content.eyebrow}
            </p>

            <h2 className="mt-1 text-2xl font-extrabold uppercase leading-tight tracking-[-0.025em] text-white sm:text-3xl">
              {content.title}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
              {content.description}
            </p>
          </div>

          <Link
            href={`/${locale}/standards`}
            className="inline-flex h-11 w-fit items-center justify-center gap-3 rounded-sm border border-white/80 px-6 text-[11px] font-extrabold uppercase tracking-wide text-white transition hover:bg-white hover:!text-primary"
          >
            {content.action}

            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
          {STANDARDS.map((standard, index) => (
            <div
              key={standard.code}
              className={[
                "px-4",
                index > 0 ? "border-l border-white/40" : "",
              ].join(" ")}
            >
              <p className="text-lg font-extrabold text-white">
                {standard.code}
              </p>

              <p className="mt-1 text-xs text-white/75">{standard.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
