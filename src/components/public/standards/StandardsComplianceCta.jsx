import Image from "next/image";
import Link from "next/link";
import { TbArrowRight } from "react-icons/tb";

export function StandardsComplianceCta({ locale = "en", content }) {
  const currentLocale = locale === "th" ? "th" : "en";

  if (!content) {
    return null;
  }

  return (
    <section className="bg-white py-8 sm:py-10">
      <div className="container-hcs">
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:gap-10">
          <div className="relative min-h-[170px] overflow-hidden rounded-sm bg-[#edf3f7] sm:min-h-[200px] lg:min-h-[180px]">
            <Image
              src="/images/standards/standards-compliance-support.jpg"
              alt={content.imageAlt}
              fill
              sizes="(max-width: 1023px) 100vw, 56vw"
              className="object-cover"
            />
          </div>

          <div className="py-1">
            {content.eyebrow ? (
              <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-primary">
                {content.eyebrow}
              </p>
            ) : null}

            <h2 className="mt-1 max-w-xl text-2xl font-extrabold uppercase leading-[1.05] tracking-[-0.025em] text-foreground sm:text-[28px]">
              {content.title}
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              {content.description}
            </p>

            <Link
              href={`/${currentLocale}/contact`}
              className="group mt-5 inline-flex min-h-11 items-center justify-center gap-3 rounded border border-primary px-5 text-xs font-extrabold uppercase tracking-wide text-primary transition-colors hover:bg-primary hover:text-white"
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
