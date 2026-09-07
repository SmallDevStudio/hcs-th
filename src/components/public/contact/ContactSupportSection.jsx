import Link from "next/link";
import {
  TbArrowRight,
  TbBox,
  TbFileDescription,
  TbSettings,
  TbUsersGroup,
} from "react-icons/tb";

const SUPPORT_ITEMS = [
  {
    key: "product",
    Icon: TbBox,
  },
  {
    key: "project",
    Icon: TbFileDescription,
  },
  {
    key: "technical",
    Icon: TbSettings,
  },
  {
    key: "partnership",
    Icon: TbUsersGroup,
  },
];

export function ContactSupportSection({ content }) {
  return (
    <section className="border-y border-[#dce8f0] bg-[#f3f8fb] py-12 sm:py-14 lg:py-16 dark:border-border dark:bg-background">
      <div className="container-hcs">
        <div className="grid gap-7 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-center">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-primary">
              {content.eyebrow}
            </p>

            <h2 className="mt-2 text-3xl font-extrabold uppercase leading-[1.02] tracking-[-0.03em] text-[#071b30] dark:text-white">
              {content.title}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {SUPPORT_ITEMS.map(({ key, Icon }) => {
              const item = content.items[key];

              if (!item) {
                return null;
              }

              return (
                <Link
                  key={key}
                  href="#contact-form"
                  className="group flex min-h-[150px] flex-col rounded-md border border-[#d3e1eb] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-md dark:border-border dark:bg-surface"
                >
                  <div className="flex items-start gap-4">
                    <Icon
                      aria-hidden="true"
                      strokeWidth={1.7}
                      className="size-10 shrink-0 text-primary"
                    />

                    <div>
                      <h3 className="text-sm font-extrabold leading-5 text-[#102a43] dark:text-white">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <TbArrowRight
                    aria-hidden="true"
                    className="ml-auto mt-auto size-5 text-primary transition-transform group-hover:translate-x-1"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
