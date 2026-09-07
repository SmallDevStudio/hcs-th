import Image from "next/image";
import { TbCircleCheckFilled } from "react-icons/tb";

const CAPABILITY_KEYS = [
  "consultation",
  "productRange",
  "integration",
  "coordination",
  "afterSales",
];

export function AboutCapabilitiesSection({ content }) {
  return (
    <section
      id="capabilities"
      className="scroll-mt-28 bg-white py-12 sm:py-14 lg:py-16 dark:bg-background"
    >
      <div className="container-hcs">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="relative min-h-[300px] overflow-hidden rounded-md bg-[#edf3f7] shadow-sm sm:min-h-[360px] lg:min-h-[390px]">
            <Image
              src="/images/about/about-capabilities.jpg"
              alt={content.imageAlt}
              fill
              quality={88}
              sizes="(max-width: 1023px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>

          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-primary">
              {content.eyebrow}
            </p>

            <h2 className="mt-2 text-3xl font-extrabold uppercase leading-[1.02] tracking-[-0.03em] text-[#071b30] dark:text-white sm:text-4xl">
              <span className="block">{content.titleLineOne}</span>
              <span className="block">{content.titleLineTwo}</span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-[#52677a] dark:text-muted-foreground sm:text-[15px]">
              {content.description}
            </p>

            <ul className="mt-6 space-y-3">
              {CAPABILITY_KEYS.map((key) => {
                const label = content.points[key];

                if (!label) {
                  return null;
                }

                return (
                  <li
                    key={key}
                    className="flex items-start gap-3 text-sm font-medium leading-6 text-[#334b61] dark:text-foreground"
                  >
                    <TbCircleCheckFilled
                      aria-hidden="true"
                      className="mt-0.5 size-5 shrink-0 text-primary"
                    />

                    <span>{label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
