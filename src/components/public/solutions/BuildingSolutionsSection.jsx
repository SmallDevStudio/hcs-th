import { SolutionBuildingCard } from "@/components/public/solutions/SolutionBuildingCard";
import { TbBuilding } from "react-icons/tb";

export function BuildingSolutionsSection({ solutions, locale, content }) {
  const visibleSolutions = Array.isArray(solutions)
    ? [...solutions].sort(
        (firstSolution, secondSolution) =>
          firstSolution.sortOrder - secondSolution.sortOrder,
      )
    : [];

  return (
    <section className="bg-[#f2f8fc] py-14 sm:py-16">
      <div className="container-hcs">
        <header className="mb-6">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-primary">
            {content.eyebrow}
          </p>

          <h2 className="mt-1 text-2xl font-extrabold uppercase leading-tight tracking-[-0.025em] text-foreground sm:text-3xl">
            {content.title}
          </h2>
        </header>

        {visibleSolutions.length ? (
          <div className="grid gap-5 md:grid-cols-2">
            {visibleSolutions.map((solution, index) => (
              <SolutionBuildingCard
                key={solution.id}
                solution={solution}
                locale={locale}
                actionLabel={content.action}
                eager={index < 2}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-sky-50 text-primary">
              <TbBuilding aria-hidden="true" className="size-7" />
            </span>

            <h3 className="mt-4 text-lg font-extrabold text-foreground">
              {content.emptyTitle}
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              {content.emptyDescription}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
