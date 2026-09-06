import Image from "next/image";
import Link from "next/link";
import { LuConciergeBell } from "react-icons/lu";
import {
  TbArrowRight,
  TbBriefcase,
  TbPlane,
  TbSquareRoundedPlus,
} from "react-icons/tb";

const contentByLocale = {
  en: {
    eyebrow: "Project References",
    title: "Built on Trust. Delivered with Pride.",
    viewAll: "View All Projects",
    viewProject: "View project",
    imageAlt: "{{project}} project reference",
  },

  th: {
    eyebrow: "โครงการอ้างอิง",
    title: "สร้างจากความไว้วางใจ ส่งมอบด้วยความภาคภูมิใจ",
    viewAll: "ดูโครงการทั้งหมด",
    viewProject: "ดูโครงการ",
    imageAlt: "โครงการอ้างอิง {{project}}",
  },
};

const projectIcons = {
  hospitality: LuConciergeBell,
  healthcare: TbSquareRoundedPlus,
  commercial: TbBriefcase,
  airport: TbPlane,
};

const DEFAULT_PROJECTS = [
  {
    id: "luxury-hotel-bangkok",
    slug: "luxury-hotel-bangkok",
    type: "hospitality",
    title: {
      en: "Luxury Hotel, Bangkok",
      th: "โรงแรมหรู กรุงเทพฯ",
    },
    image: "/images/home/projects/project-luxury-hotel-bangkok.jpg",
    imageAlt: {
      en: "Luxury hotel entrance in Bangkok",
      th: "ทางเข้าโรงแรมหรูในกรุงเทพฯ",
    },
    order: 1,
    isPublished: true,
  },
  {
    id: "private-hospital-chiang-mai",
    slug: "private-hospital-chiang-mai",
    type: "healthcare",
    title: {
      en: "Private Hospital, Chiang Mai",
      th: "โรงพยาบาลเอกชน เชียงใหม่",
    },
    image: "/images/home/projects/project-private-hospital-chiang-mai.jpg",
    imageAlt: {
      en: "Modern private hospital in Chiang Mai",
      th: "โรงพยาบาลเอกชนสมัยใหม่ในเชียงใหม่",
    },
    order: 2,
    isPublished: true,
  },
  {
    id: "office-tower-singapore",
    slug: "office-tower-singapore",
    type: "commercial",
    title: {
      en: "Office Tower, Singapore",
      th: "อาคารสำนักงาน สิงคโปร์",
    },
    image: "/images/home/projects/project-office-tower-singapore.jpg",
    imageAlt: {
      en: "Modern office tower entrance in Singapore",
      th: "ทางเข้าอาคารสำนักงานสมัยใหม่ในสิงคโปร์",
    },
    order: 3,
    isPublished: true,
  },
  {
    id: "airport-terminal-phuket",
    slug: "airport-terminal-phuket",
    type: "airport",
    title: {
      en: "Airport Terminal, Phuket",
      th: "อาคารผู้โดยสารสนามบิน ภูเก็ต",
    },
    image: "/images/home/projects/project-airport-terminal-phuket.jpg",
    imageAlt: {
      en: "Modern airport terminal in Phuket",
      th: "อาคารผู้โดยสารสนามบินสมัยใหม่ในภูเก็ต",
    },
    order: 4,
    isPublished: true,
  },
];

function ProjectCard({ project, locale, content }) {
  const Icon = projectIcons[project.type] || TbBriefcase;

  const title = project.title?.[locale] || project.title?.en || "";

  const imageAlt =
    project.imageAlt?.[locale] ||
    project.imageAlt?.en ||
    content.imageAlt.replace("{{project}}", title);

  return (
    <article className="group relative aspect-[16/9] overflow-hidden rounded-md bg-[#071b2d] shadow-sm">
      <Image
        src={project.image}
        alt={imageAlt}
        fill
        quality={86}
        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
        className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.035]"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#061522]/95 via-[#061522]/18 to-transparent" />

      <div className="absolute inset-0 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/10" />

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

          <h3 className="truncate text-sm font-bold leading-5 text-white">
            {title}
          </h3>
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

export function ProjectReferencesSection({
  locale = "en",
  items = DEFAULT_PROJECTS,
}) {
  const currentLocale = locale === "th" ? "th" : "en";
  const content = contentByLocale[currentLocale];

  const visibleProjects = [...items]
    .filter((project) => project.isPublished !== false)
    .sort((firstProject, secondProject) => {
      return (firstProject.order ?? 0) - (secondProject.order ?? 0);
    });

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
          {visibleProjects.map((project) => (
            <ProjectCard
              key={project.id || project.slug}
              project={project}
              locale={currentLocale}
              content={content}
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
