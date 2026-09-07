import Image from "next/image";

const PROJECTS_HERO_IMAGE = "/images/projects/project-luxury-hotel-bangkok.jpg";

export function ProjectsHero({ t }) {
  return (
    <section className="relative isolate min-h-[330px] overflow-hidden bg-[#062a48] sm:min-h-[390px] lg:min-h-[430px]">
      <Image
        src={PROJECTS_HERO_IMAGE}
        alt={t("projects.hero.imageAlt")}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,33,57,0.97)_0%,rgba(3,43,73,0.88)_32%,rgba(3,43,73,0.38)_60%,rgba(3,43,73,0.06)_100%)]" />

      <div className="absolute inset-y-0 left-0 w-[58%] opacity-25 [background-image:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:52px_52px]" />

      <div className="container-hcs relative z-10 flex min-h-[330px] items-center py-12 sm:min-h-[390px] lg:min-h-[430px]">
        <div className="max-w-[650px] text-white">
          <nav
            aria-label={t("projects.detail.breadcrumbLabel")}
            className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/85"
          >
            <span>{t("projects.breadcrumbHome")}</span>

            <span aria-hidden="true" className="mx-3 text-white/50">
              /
            </span>

            <span>{t("projects.breadcrumbProjects")}</span>
          </nav>

          <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.14em] text-sky-300">
            {t("projects.eyebrow")}
          </p>

          <h1 className="mt-3 max-w-[620px] text-4xl font-extrabold uppercase leading-[1.03] tracking-[-0.035em] sm:text-5xl lg:text-[3.45rem]">
            {t("projects.title")}
          </h1>

          <p className="mt-5 max-w-[570px] text-sm leading-7 text-white/85 sm:text-base">
            {t("projects.description")}
          </p>
        </div>
      </div>
    </section>
  );
}
