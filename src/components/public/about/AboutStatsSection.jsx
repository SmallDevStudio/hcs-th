const STAT_KEYS = ["experience", "projects", "partners", "markets"];

export function AboutStatsSection({ content }) {
  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(110deg,#056daf_0%,#0787d4_55%,#087ac2_100%)] py-8 text-white sm:py-10">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 -z-10 w-[44%] opacity-[0.13] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <div
        aria-hidden="true"
        className="absolute -right-[4%] top-1/2 -z-10 h-[270px] w-[500px] -translate-y-1/2 rotate-[-8deg] rounded-[50%] border border-white/15"
      />

      <div className="container-hcs">
        <dl className="grid grid-cols-2 gap-y-9 sm:gap-y-10 lg:grid-cols-4 lg:gap-y-0">
          {STAT_KEYS.map((key, index) => {
            const statistic = content[key];

            if (!statistic) {
              return null;
            }

            return (
              <div
                key={key}
                className={`relative px-4 text-center sm:px-7 ${
                  index > 0 ? "lg:border-l lg:border-white/40" : ""
                }`}
              >
                <dt className="flex flex-col">
                  <strong className="text-4xl font-extrabold leading-none tracking-[-0.045em] sm:text-5xl">
                    {statistic.value}
                  </strong>

                  <span className="mt-3 text-sm font-extrabold leading-tight">
                    {statistic.label}
                  </span>
                </dt>

                <dd className="mx-auto mt-2 max-w-[200px] text-xs leading-5 text-white/82">
                  {statistic.description}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
