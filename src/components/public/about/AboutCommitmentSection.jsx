import Image from "next/image";
import Link from "next/link";
import { TbArrowRight } from "react-icons/tb";

export function AboutCommitmentSection({ locale, content }) {
  return (
    <section
      id="commitment"
      className="scroll-mt-28 bg-white py-12 sm:py-14 lg:py-16 dark:bg-background"
    >
      <div className="container-hcs">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="relative min-h-[270px] overflow-hidden rounded-md bg-[#edf3f7] shadow-sm sm:min-h-[320px] lg:min-h-[330px]">
            <Image
              src="/images/about/about-commitment.jpg"
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

            <Link
              href={`/${locale}/standards`}
              className="group mt-6 inline-flex min-h-11 items-center justify-center gap-3 rounded border border-primary px-5 text-xs font-extrabold uppercase tracking-[0.04em] text-primary transition-colors hover:bg-primary hover:text-white"
            >
              <span>{content.action}</span>

              <TbArrowRight
                aria-hidden="true"
                className="size-[18px] transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
