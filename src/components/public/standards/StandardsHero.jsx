import Image from "next/image";
import Link from "next/link";

export function StandardsHero({ locale, content }) {
  return (
    <section className="relative isolate min-h-[370px] overflow-hidden bg-[#052b4a] text-white sm:min-h-[390px]">
      <Image
        src="/images/standards/standards-hero.jpg"
        alt={content.imageAlt}
        fill
        priority
        quality={90}
        sizes="100vw"
        className="absolute inset-0 -z-20 object-cover object-center"
      />

      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#032b4b]/98 via-[#05385b]/80 to-[#05385b]/15" />

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:64px_64px]"
      />

      <div className="container-hcs flex min-h-[370px] items-center py-14 sm:min-h-[390px]">
        <div className="max-w-2xl">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/75"
          >
            <Link href={`/${locale}`} className="transition hover:text-white">
              {content.breadcrumbHome}
            </Link>

            <span aria-hidden="true">/</span>

            <span className="text-white">{content.breadcrumbStandards}</span>
          </nav>

          <p className="mt-7 text-[11px] font-extrabold uppercase tracking-[0.14em] text-sky-300">
            {content.eyebrow}
          </p>

          <h1 className="mt-2 text-4xl font-extrabold uppercase leading-[0.98] tracking-[-0.035em] sm:text-5xl lg:text-[56px]">
            <span className="block">{content.titleLineOne}</span>

            <span className="block">{content.titleLineTwo}</span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-white/85 sm:text-base">
            {content.description}
          </p>
        </div>
      </div>
    </section>
  );
}
