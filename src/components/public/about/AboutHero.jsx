import Image from "next/image";
import Link from "next/link";

export function AboutHero({ locale, content }) {
  return (
    <section className="relative isolate min-h-[350px] overflow-hidden bg-[#052b4a] text-white sm:min-h-[390px] lg:min-h-[430px]">
      <Image
        src="/images/about/about-hero.jpg"
        alt={content.imageAlt}
        fill
        priority
        quality={90}
        sizes="100vw"
        className="absolute inset-0 -z-20 object-cover object-center"
      />

      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,34,59,0.98)_0%,rgba(3,45,75,0.9)_34%,rgba(3,45,75,0.34)_62%,rgba(3,45,75,0.06)_100%)]" />

      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 -z-10 w-[58%] opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:58px_58px]"
      />

      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 -z-10 h-[46%] w-[46%] opacity-[0.12] [background-image:radial-gradient(circle_at_center,rgba(125,211,252,0.5),transparent_64%)]"
      />

      <div className="container-hcs flex min-h-[350px] items-center py-12 sm:min-h-[390px] sm:py-14 lg:min-h-[430px]">
        <div className="max-w-[610px]">
          <nav
            aria-label={content.breadcrumbLabel}
            className="flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-[0.13em] text-white/75"
          >
            <Link
              href={`/${locale}`}
              className="transition-colors hover:text-white"
            >
              {content.breadcrumbHome}
            </Link>

            <span aria-hidden="true" className="text-white/45">
              /
            </span>

            <span className="text-white">{content.breadcrumbAbout}</span>
          </nav>

          <p className="mt-7 text-[11px] font-extrabold uppercase tracking-[0.14em] text-sky-300 sm:mt-8">
            {content.eyebrow}
          </p>

          <h1 className="mt-3 text-4xl font-extrabold uppercase leading-[0.98] tracking-[-0.035em] sm:text-5xl lg:text-[56px]">
            <span className="block">{content.titleLineOne}</span>
            <span className="block">{content.titleLineTwo}</span>
          </h1>

          <p className="mt-5 max-w-[520px] text-sm leading-7 text-white/85 sm:text-base">
            {content.description}
          </p>
        </div>
      </div>
    </section>
  );
}
