import Link from "next/link";
import {
  FiArrowRight,
  FiLock,
  FiShield,
  FiTriangle,
  FiVolume2,
} from "react-icons/fi";
import { MdAccessible, MdLocalFireDepartment } from "react-icons/md";

const REQUIREMENTS = [
  {
    key: "fireSafety",
    icon: MdLocalFireDepartment,
  },
  {
    key: "accessSecurity",
    icon: FiLock,
  },
  {
    key: "acoustic",
    icon: FiVolume2,
  },
  {
    key: "accessibility",
    icon: MdAccessible,
  },
  {
    key: "durability",
    icon: FiShield,
  },
  {
    key: "design",
    icon: FiTriangle,
  },
];

export function RequirementSolutionsSection({ locale, content }) {
  return (
    <section className="bg-[#edf7fd] py-14 sm:py-16">
      <div className="container-hcs">
        <header>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-primary">
            {content.eyebrow}
          </p>

          <h2 className="mt-1 text-2xl font-extrabold uppercase leading-tight tracking-[-0.025em] text-foreground sm:text-3xl">
            {content.title}
          </h2>
        </header>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {REQUIREMENTS.map((requirement) => {
            const Icon = requirement.icon;

            const item = content.items[requirement.key];

            return (
              <article
                key={requirement.key}
                className="group flex min-h-[155px] gap-5 rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <span className="flex size-14 shrink-0 items-center justify-center text-primary">
                  <Icon aria-hidden="true" className="size-12" />
                </span>

                <div className="min-w-0">
                  <h3 className="text-base font-extrabold text-[#071d33]">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    {item.description}
                  </p>

                  <Link
                    href={`/${locale}/contact?requirement=${requirement.key}`}
                    className="mt-3 inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.06em] text-primary transition hover:text-[#065f9c]"
                  >
                    {content.action}

                    <FiArrowRight
                      aria-hidden="true"
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
