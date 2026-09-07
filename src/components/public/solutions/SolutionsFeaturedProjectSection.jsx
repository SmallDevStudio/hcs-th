import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

const TAGS = ["Door Closers", "Access Control", "Lever Handles", "Hinges"];

export function SolutionsFeaturedProjectSection({ locale, content }) {
  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="container-hcs">
        <header>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-primary">
            {content.eyebrow}
          </p>

          <h2 className="mt-1 text-2xl font-extrabold uppercase leading-tight tracking-[-0.025em] text-foreground sm:text-3xl">
            {content.title}
          </h2>
        </header>

        <article className="mt-6 grid overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm lg:grid-cols-[1.25fr_0.95fr]">
          <div className="relative min-h-[300px] lg:min-h-[360px]">
            <Image
              src="/images/home/solutions/solution-commercial.jpg"
              alt={content.projectTitle}
              fill
              quality={88}
              sizes="(max-width: 1023px) 100vw, 60vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-primary">
              {content.featured}
            </p>

            <h3 className="mt-2 text-2xl font-extrabold uppercase leading-tight tracking-[-0.025em] text-[#071d33]">
              {content.projectTitle}
            </h3>

            <p className="mt-4 text-sm leading-7 text-slate-600">
              {content.description}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-sky-50 px-3 py-1.5 text-[10px] font-bold text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>

            <Link
              href={`/${locale}/projects`}
              className="mt-6 inline-flex h-11 w-fit items-center justify-center gap-3 rounded-sm border border-primary px-5 text-[11px] font-extrabold uppercase tracking-wide text-primary transition hover:bg-primary hover:!text-white"
            >
              {content.action}

              <FiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
