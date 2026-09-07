import Image from "next/image";
import Link from "next/link";
import { TbArrowRight, TbMapPin, TbPhotoOff } from "react-icons/tb";

import { getLocalizedValue } from "@/components/public/projects/project-catalog.utils";

export function ProjectCard({ project, locale, t, priority = false }) {
  const projectName = getLocalizedValue(project.name, locale, project.slug);
  const location = getLocalizedValue(project.location, locale);
  const description = getLocalizedValue(project.shortDescription, locale);
  const imageAlt = getLocalizedValue(
    project.coverImage?.altText,
    locale,
    projectName,
  );
  const buildingTypeLabel = t(
    `projects.buildingTypes.${project.buildingType}`,
    { defaultValue: project.buildingType || "" },
  );

  return (
    <article className="group overflow-hidden rounded-lg border border-[#cbdbe7] bg-white shadow-[0_3px_12px_rgba(7,42,68,0.05)] transition duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-[0_18px_38px_rgba(7,42,68,0.13)] dark:border-border dark:bg-surface">
      <Link
        href={`/${locale}/projects/${project.slug}`}
        aria-label={projectName}
        className="flex h-full flex-col"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-[#eaf1f6] dark:bg-[#13202b]">
          {project.coverImage?.publicUrl ? (
            <Image
              src={project.coverImage.publicUrl}
              alt={imageAlt}
              fill
              priority={priority}
              unoptimized
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
              className="object-cover transition duration-700 ease-out group-hover:scale-[1.045]"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <TbPhotoOff aria-hidden="true" className="size-8" />
              <span className="text-xs font-semibold">
                {t("projects.card.noImage")}
              </span>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#041b2d]/90 via-[#041b2d]/30 to-transparent" />

          {project.featured ? (
            <span className="absolute left-4 top-4 rounded bg-primary px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em] !text-white shadow-sm">
              {t("projects.card.featured")}
            </span>
          ) : null}

          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-sky-300">
              {buildingTypeLabel}
            </p>
            <h2 className="mt-1.5 line-clamp-2 text-xl font-extrabold leading-tight tracking-[-0.02em]">
              {projectName}
            </h2>
          </div>
        </div>

        <div className="flex min-h-[150px] flex-1 flex-col px-5 pb-5 pt-4">
          {location ? (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <TbMapPin
                aria-hidden="true"
                className="size-4 shrink-0 text-primary"
              />
              <span className="line-clamp-1">{location}</span>
              {project.year ? <span>· {project.year}</span> : null}
            </p>
          ) : project.year ? (
            <p className="text-xs font-semibold text-muted-foreground">
              {project.year}
            </p>
          ) : null}

          {description ? (
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}

          <div className="mt-auto flex items-center gap-3 pt-4 text-xs font-extrabold uppercase tracking-[0.04em] text-primary">
            <span>{t("projects.card.viewProject")}</span>
            <TbArrowRight
              aria-hidden="true"
              className="size-[18px] transition-transform group-hover:translate-x-1"
            />
          </div>
        </div>
      </Link>
    </article>
  );
}
