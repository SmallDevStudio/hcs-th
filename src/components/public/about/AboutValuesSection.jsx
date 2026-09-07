import {
  TbArrowRight,
  TbBuildingSkyscraper,
  TbSettings,
  TbUsersGroup,
  TbWorld,
} from "react-icons/tb";

const VALUE_ITEMS = [
  {
    key: "totalSolutions",
    Icon: TbSettings,
  },
  {
    key: "internationalStandards",
    Icon: TbWorld,
  },
  {
    key: "technicalExpertise",
    Icon: TbBuildingSkyscraper,
  },
  {
    key: "trustedPartnership",
    Icon: TbUsersGroup,
  },
];

export function AboutValuesSection({ content }) {
  return (
    <section
      id="values"
      className="scroll-mt-28 border-y border-[#deebf2] bg-[#f3f8fb] py-12 sm:py-14 lg:py-16 dark:border-border dark:bg-background"
    >
      <div className="container-hcs">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-primary">
          {content.eyebrow}
        </p>

        <h2 className="mt-2 text-3xl font-extrabold uppercase leading-none tracking-[-0.03em] text-[#071b30] dark:text-white sm:text-4xl">
          {content.title}
        </h2>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_ITEMS.map(({ key, Icon }) => {
            const item = content.items[key];

            if (!item) {
              return null;
            }

            return (
              <article
                key={key}
                className="group flex min-h-[220px] flex-col rounded-md border border-[#d3e1eb] bg-white px-5 py-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-md dark:border-border dark:bg-surface"
              >
                <Icon
                  aria-hidden="true"
                  strokeWidth={1.65}
                  className="size-12 text-primary"
                />

                <h3 className="mt-5 text-base font-extrabold leading-tight text-[#071b30] dark:text-white">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#52677a] dark:text-muted-foreground">
                  {item.description}
                </p>

                <TbArrowRight
                  aria-hidden="true"
                  strokeWidth={1.8}
                  className="mt-auto size-5 pt-3 box-content text-primary transition-transform group-hover:translate-x-1"
                />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
