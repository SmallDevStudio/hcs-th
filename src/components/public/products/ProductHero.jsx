import Image from "next/image";
import Link from "next/link";

export function ProductHero({ locale, t }) {
  return (
    <section className="relative min-h-[330px] overflow-hidden bg-[#01274b] sm:min-h-[350px]">
      <Image
        src="/images/products/products-hero.png"
        alt="products hero"
        fill
        priority
        quality={90}
        sizes="100vw"
        className="object-contain object-right"
        loading="eager"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[#052c4b]/35 via-transparent to-transparent" />

      <div className="container-hcs relative flex min-h-[330px] items-center sm:min-h-[350px]">
        <div className="relative z-10 max-w-[510px] py-12 sm:py-14">
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/70">
            <Link href={`/${locale}`} className="transition hover:text-white">
              {t("products.breadcrumbHome")}
            </Link>

            <span>/</span>

            <span className="text-white">
              {t("products.breadcrumbProducts")}
            </span>
          </nav>

          <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
            {t("products.eyebrow")}
          </p>

          <h1 className="mt-3 max-w-lg text-3xl font-extrabold uppercase leading-[1.08] tracking-[-0.035em] !text-white sm:text-4xl lg:text-[2.65rem]">
            {t("products.title")}
          </h1>

          <p className="mt-4 max-w-[500px] text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
            {t("products.description")}
          </p>
        </div>
      </div>
    </section>
  );
}
