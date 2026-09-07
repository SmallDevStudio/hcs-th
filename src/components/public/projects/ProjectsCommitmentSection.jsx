import Image from "next/image";
import { TbFileDescription, TbShieldCheck, TbUsersGroup } from "react-icons/tb";

const commitments = [
  {
    key: "specification",
    icon: TbFileDescription,
  },
  {
    key: "standards",
    icon: TbShieldCheck,
  },
  {
    key: "coordination",
    icon: TbUsersGroup,
  },
];

export function ProjectsCommitmentSection({ t }) {
  return (
    <section className="bg-white py-12 dark:bg-surface sm:py-14 lg:py-16">
      <div className="container-hcs">
        <div className="grid overflow-hidden rounded-lg border border-[#d2e0ea] bg-white shadow-[0_12px_34px_rgba(7,42,68,0.08)] dark:border-border dark:bg-background lg:grid-cols-2">
          <div className="relative min-h-[320px] overflow-hidden lg:min-h-[410px]">
            <Image
              src="/images/projects/projects-commitment.jpg"
              alt={t("projects.commitment.imageAlt")}
              fill
              sizes="(max-width: 1023px) 100vw, 50vw"
              className="object-cover"
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#062a48]/20 to-transparent" />
          </div>

          <div className="flex flex-col justify-center px-6 py-9 sm:px-9 lg:px-12 lg:py-12">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
              {t("projects.commitment.eyebrow")}
            </p>

            <h2 className="mt-2 max-w-[500px] text-3xl font-extrabold uppercase leading-[1.06] tracking-[-0.035em] text-[#071b30] dark:text-white sm:text-4xl">
              {t("projects.commitment.title")}
            </h2>

            <p className="mt-5 max-w-[570px] text-sm leading-7 text-muted-foreground sm:text-base">
              {t("projects.commitment.description")}
            </p>

            <div className="mt-8 grid gap-6 border-t border-[#d8e4ed] pt-7 dark:border-border sm:grid-cols-3">
              {commitments.map((commitment, index) => {
                const Icon = commitment.icon;

                return (
                  <div
                    key={commitment.key}
                    className={
                      index > 0
                        ? "sm:border-l sm:border-[#d8e4ed] sm:pl-5 dark:sm:border-border"
                        : ""
                    }
                  >
                    <Icon
                      aria-hidden="true"
                      strokeWidth={1.8}
                      className="size-8 text-primary"
                    />

                    <h3 className="mt-3 text-sm font-extrabold leading-5 text-[#071b30] dark:text-white">
                      {t(`projects.commitment.items.${commitment.key}.title`)}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {t(
                        `projects.commitment.items.${commitment.key}.description`,
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
