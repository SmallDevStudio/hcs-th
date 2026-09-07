import {
  TbBuildingSkyscraper,
  TbCalendarStats,
  TbUsersGroup,
  TbWorld,
} from "react-icons/tb";

const projectStats = [
  {
    key: "projects",
    value: "1,000+",
    icon: TbBuildingSkyscraper,
  },
  {
    key: "partners",
    value: "100+",
    icon: TbUsersGroup,
  },
  {
    key: "years",
    value: "25+",
    icon: TbCalendarStats,
  },
  {
    key: "markets",
    value: "4",
    icon: TbWorld,
  },
];

export function ProjectsStatsSection({ t }) {
  return (
    <section className="border-b border-[#d8e4ed] bg-white py-8 dark:border-border dark:bg-surface lg:py-10">
      <div className="container-hcs">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_2.85fr] lg:items-center">
          <div className="lg:border-r lg:border-[#cbdbe7] lg:pr-10 dark:lg:border-border">
            <h2 className="max-w-[280px] text-2xl font-extrabold uppercase leading-[1.08] tracking-[-0.025em] text-[#071b30] dark:text-white">
              {t("projects.stats.title")}
            </h2>

            <p className="mt-3 max-w-[390px] text-sm leading-6 text-muted-foreground">
              {t("projects.stats.description")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-y-8 sm:grid-cols-4">
            {projectStats.map((stat, index) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.key}
                  className={`flex min-h-[92px] flex-col items-center justify-center px-4 text-center ${
                    index > 0
                      ? "sm:border-l sm:border-[#cbdbe7] dark:sm:border-border"
                      : ""
                  }`}
                >
                  <Icon
                    aria-hidden="true"
                    strokeWidth={1.8}
                    className="size-8 text-primary"
                  />

                  <strong className="mt-2 text-3xl font-extrabold leading-none tracking-[-0.04em] text-primary">
                    {stat.value}
                  </strong>

                  <span className="mt-2 text-[11px] font-extrabold uppercase tracking-[0.05em] text-[#071b30] dark:text-white">
                    {t(`projects.stats.items.${stat.key}`)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
