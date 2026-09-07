import Image from "next/image";

const PROCESS_KEYS = ["development", "testing", "certification", "compliance"];

export function StandardsProcessSection({ content }) {
  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="container-hcs">
        <header>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-primary">
            {content.eyebrow}
          </p>

          <h2 className="mt-1 text-2xl font-extrabold uppercase leading-tight tracking-[-0.025em] text-[#071d33] sm:text-[28px]">
            {content.title}
          </h2>
        </header>

        <div className="mt-7 grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.9fr)] xl:items-stretch">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute left-[14px] right-[14px] top-[15px] hidden h-px bg-[#8ec9eb] md:block"
            />

            <div className="grid gap-7 sm:grid-cols-2 md:grid-cols-4 md:gap-5">
              {PROCESS_KEYS.map((key, index) => {
                const step = content.steps[key];

                return (
                  <article key={key} className="relative">
                    <div className="relative flex items-center gap-3">
                      <span className="relative z-10 flex size-[30px] shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-extrabold text-white ring-4 ring-white">
                        {step.number}
                      </span>

                      {index < PROCESS_KEYS.length - 1 ? (
                        <span
                          aria-hidden="true"
                          className="h-px flex-1 bg-[#8ec9eb] md:hidden"
                        />
                      ) : null}
                    </div>

                    <h3 className="mt-4 text-[12px] font-extrabold uppercase leading-4 text-[#071d33]">
                      {step.title}
                    </h3>

                    <p className="mt-1.5 text-[11px] leading-[17px] text-slate-600">
                      {step.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="grid min-h-[200px] grid-cols-3 overflow-hidden rounded-md">
            {[
              {
                src: "/images/standards/process-development.jpg",
                position: "object-center",
              },
              {
                src: "/images/standards/process-testing.jpg",
                position: "object-center",
              },
              {
                src: "/images/standards/process-certification.jpg",
                position: "object-center",
              },
            ].map((image) => (
              <div
                key={image.src}
                className="relative min-h-[200px] border-l border-white first:border-l-0"
              >
                <Image
                  src={image.src}
                  alt={content.imageAlt}
                  fill
                  quality={86}
                  sizes="(max-width: 1279px) 33vw, 180px"
                  className={`object-cover ${image.position}`}
                />

                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#061d31]/20 to-transparent"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
