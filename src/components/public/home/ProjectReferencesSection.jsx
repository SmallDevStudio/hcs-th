import Image from "next/image";
import Link from "next/link";
import { LuConciergeBell } from "react-icons/lu";
import {
  TbArrowRight,
  TbBriefcase,
  TbBuildingCommunity,
  TbBuildingFactory2,
  TbBuildingHospital,
  TbBuildingSkyscraper,
  TbBuildingStore,
  TbHome,
  TbPlane,
  TbSchool,
  TbWorld,
} from "react-icons/tb";

const contentByLocale = {
  en: {
    eyebrow: "Project References",

    title: "Built on Trust. Delivered with Pride.",

    viewAll: "View All Projects",
    viewProject: "View project",

    imageAlt: "{{project}} project reference",

    noImage: "No project image",
  },

  th: {
    eyebrow: "ผลงานโครงการอ้างอิง",

    title: "สร้างจากความไว้วางใจ ส่งมอบด้วยความภาคภูมิใจ",

    viewAll: "ดูโครงการทั้งหมด",
    viewProject: "ดูโครงการ",

    imageAlt: "โครงการอ้างอิง {{project}}",

    noImage: "ไม่มีรูปโครงการ",
  },
};

const projectIcons = {
  hospitality: LuConciergeBell,
  healthcare: TbBuildingHospital,
  commercial: TbBriefcase,
  industrial: TbBuildingFactory2,
  residential: TbHome,
  education: TbSchool,
  government: TbBuildingCommunity,
  retail: TbBuildingStore,
  transportation: TbPlane,
  airport: TbPlane,
  "mixed-use": TbBuildingSkyscraper,
  other: TbWorld,
};

function getLocalizedValue(value, locale, fallback = "") {
  if (typeof value === "string") {
    return value || fallback;
  }

  return value?.[locale] || value?.en || value?.th || fallback;
}

function getProjectImage(project) {
  if (project.coverImage?.publicUrl) {
    return project.coverImage;
  }

  if (project.primaryImage?.publicUrl) {
    return project.primaryImage;
  }

  if (project.image?.publicUrl) {
    return project.image;
  }

  if (typeof project.image === "string") {
    return {
      publicUrl: project.image,
      altText: project.imageAlt,
    };
  }

  return null;
}

function ProjectCard({ project, locale, content, priority = false }) {
  const buildingType = project.buildingType || project.type || "other";

  const Icon = projectIcons[buildingType] || TbBriefcase;

  const title = getLocalizedValue(
    project.name || project.title,
    locale,
    project.slug,
  );

  const location = getLocalizedValue(project.location, locale);

  const projectImage = getProjectImage(project);

  const imageAlt = getLocalizedValue(
    projectImage?.altText,
    locale,
    content.imageAlt.replace("{{project}}", title),
  );

  return (
    <article className="group relative aspect-[16/9] overflow-hidden rounded-md bg-[#071b2d] shadow-sm">
      {projectImage?.publicUrl ? (
        <Image
          src={projectImage.publicUrl}
          alt={imageAlt}
          fill
          priority={priority}
          unoptimized
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.045]"
        />
      ) : (
        <div className="flex h-full items-center justify-center px-6 text-center text-xs font-semibold text-white/60">
          {content.noImage}
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[#041522]/95 via-[#041522]/28 to-transparent" />

      <div className="absolute inset-0 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/10" />

      {project.featured ? (
        <span className="absolute left-4 top-4 rounded bg-primary px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.07em] !text-white shadow-sm">
          {locale === "th" ? "โครงการแนะนำ" : "Featured Project"}
        </span>
      ) : null}

      <Link
        href={`/${locale}/projects/${project.slug}`}
        aria-label={`${content.viewProject}: ${title}`}
        className="absolute inset-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        <span className="sr-only">
          {content.viewProject}: {title}
        </span>
      </Link>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-4 pb-4 sm:px-5 sm:pb-5">
        <div className="flex min-w-0 items-center gap-3 text-white">
          <Icon
            aria-hidden="true"
            strokeWidth={1.7}
            className="size-7 shrink-0"
          />

          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold leading-5 text-white">
              {title}
            </h3>

            {location ? (
              <p className="mt-0.5 truncate text-[10px] font-medium text-white/75">
                {location}
              </p>
            ) : null}
          </div>
        </div>

        <TbArrowRight
          aria-hidden="true"
          strokeWidth={1.8}
          className="size-5 shrink-0 text-white transition-transform duration-300 group-hover:translate-x-1"
        />
      </div>

      <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-500 group-hover:scale-x-100" />
    </article>
  );
}

export function ProjectReferencesSection({ locale = "en", projects = [] }) {
  const currentLocale = locale === "th" ? "th" : "en";

  const content = contentByLocale[currentLocale];

  const visibleProjects = (Array.isArray(projects) ? projects : [])
    .filter(
      (project) =>
        project &&
        project.status === "published" &&
        project.showOnHome === true,
    )
    .sort((firstProject, secondProject) => {
      if (firstProject.featured !== secondProject.featured) {
        return firstProject.featured ? -1 : 1;
      }

      return (
        Number(firstProject.sortOrder || 0) -
        Number(secondProject.sortOrder || 0)
      );
    })
    .slice(0, 4);

  if (!visibleProjects.length) {
    return null;
  }

  return (
    <section className="overflow-hidden bg-background py-10 sm:py-12 lg:py-14">
      <div className="container-hcs">
        <div className="mb-4 flex items-end justify-between gap-5">
          <div>
            <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-primary">
              {content.eyebrow}
            </p>

            <h2 className="text-2xl font-extrabold uppercase leading-tight tracking-[-0.025em] text-foreground sm:text-[28px]">
              {content.title}
            </h2>
          </div>

          <Link
            href={`/${currentLocale}/projects`}
            className="group hidden shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary sm:inline-flex"
          >
            <span>{content.viewAll}</span>

            <TbArrowRight
              aria-hidden="true"
              strokeWidth={1.8}
              className="size-[18px] transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {visibleProjects.map((project, index) => (
            <ProjectCard
              key={project.id || project.slug}
              project={project}
              locale={currentLocale}
              content={content}
              priority={index === 0}
            />
          ))}
        </div>

        <Link
          href={`/${currentLocale}/projects`}
          className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary sm:hidden"
        >
          <span>{content.viewAll}</span>

          <TbArrowRight
            aria-hidden="true"
            strokeWidth={1.8}
            className="size-[18px]"
          />
        </Link>
      </div>
    </section>
  );
}
