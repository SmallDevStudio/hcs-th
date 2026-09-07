import Image from "next/image";

const PROCESS_KEYS = ["consultation", "specification", "selection", "support"];

export function SolutionsProcessSection({ content }) {
  return (
    <section id="process" className="bg-white py-12 sm:py-14">
      <div className="container-hcs">
        <header>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-primary">
            {content.eyebrow}
          </p>

          <h2 className="mt-1 text-2xl font-extrabold uppercase leading-none tracking-[-0.025em] text-[#071d33] sm:text-[28px]">
            {content.title}
          </h2>
        </header>

        <div className="relative mt-7">
          <div
            aria-hidden="true"
            className="absolute left-[7px] right-[7px] top-[9px] hidden h-px bg-[#9bcce9] lg:block"
          />

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {PROCESS_KEYS.map((key) => {
              const step = content.steps[key];

              return (
                <article key={key} className="relative">
                  <div className="relative flex min-h-6 items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="relative z-10 mt-[3px] flex size-[13px] shrink-0 items-center justify-center rounded-full bg-primary ring-[4px] ring-white"
                    >
                      <span className="size-[5px] rounded-full bg-white" />
                    </span>

                    <span className="text-[22px] font-extrabold leading-none text-primary">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-3 text-[12px] font-extrabold uppercase leading-4 text-[#071d33]">
                    {step.title}
                  </h3>

                  <p className="mt-1 max-w-[250px] text-[11px] leading-[17px] text-slate-600">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="relative mt-6 min-h-[210px] overflow-hidden rounded-md bg-slate-100 sm:min-h-[230px] lg:min-h-0 lg:aspect-[6/1]">
          <Image
            src="/images/solutions/solutions-process.png"
            alt=""
            fill
            priority={false}
            quality={90}
            sizes="(max-width: 1023px) 100vw, 1280px"
            className="object-cover object-center"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#041c31]/10"
          />

          <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 overflow-hidden rounded-sm bg-[#061d31]/90 text-right shadow-lg backdrop-blur-[2px] sm:block lg:right-6">
            {["Planning", "Specification", "A Safer Tomorrow"].map((label) => (
              <span
                key={label}
                className="block border-b border-white/15 px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.06em] text-white last:border-b-0"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
