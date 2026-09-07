import Image from "next/image";
import { TbArrowRight } from "react-icons/tb";

export function AboutStorySection({ content }) {
  const paragraphs = Array.isArray(content.paragraphs)
    ? content.paragraphs
    : [];

  return (
    <section
      id="history"
      className="scroll-mt-28 bg-white py-12 sm:py-14 lg:py-16 dark:bg-background"
    >
      <div className="container-hcs">
        <div className="grid items-center gap-9 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-14">
          <div className="order-2 lg:order-1">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-primary">
              {content.eyebrow}
            </p>

            <h2 className="mt-2 text-3xl font-extrabold uppercase leading-[1.02] tracking-[-0.03em] text-[#071b30] dark:text-white sm:text-4xl">
              <span className="block">{content.titleLineOne}</span>
              <span className="block">{content.titleLineTwo}</span>
            </h2>

            <div className="mt-5 space-y-4">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={`${index}-${paragraph.slice(0, 20)}`}
                  className="text-sm leading-7 text-[#40566b] dark:text-muted-foreground sm:text-[15px]"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <a
              href="#values"
              className="group mt-6 inline-flex min-h-11 items-center justify-center gap-3 rounded border border-primary px-5 text-xs font-extrabold uppercase tracking-[0.04em] text-primary transition-colors hover:bg-primary hover:text-white"
            >
              <span>{content.action}</span>

              <TbArrowRight
                aria-hidden="true"
                className="size-[18px] transition-transform group-hover:translate-x-1"
              />
            </a>
          </div>

          <div className="relative order-1 lg:order-2">
            <div className="relative min-h-[285px] overflow-hidden rounded-md bg-[#edf3f7] shadow-sm sm:min-h-[350px] lg:min-h-[390px]">
              <Image
                src="/images/about/about-story.jpg"
                alt={content.imageAlt}
                fill
                quality={88}
                sizes="(max-width: 1023px) 100vw, 58vw"
                className="object-cover object-center"
              />
            </div>

            <div className="absolute -right-1 -top-4 flex min-h-[112px] min-w-[118px] flex-col items-center justify-center rounded-sm bg-primary px-4 py-4 text-center text-white shadow-lg sm:right-5 sm:min-h-[126px] sm:min-w-[132px]">
              <strong className="text-4xl font-extrabold leading-none tracking-[-0.04em] sm:text-[42px]">
                {content.experienceValue}
              </strong>

              <span className="mt-2 max-w-[92px] text-[10px] font-extrabold uppercase leading-4 tracking-[0.04em]">
                {content.experienceLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
