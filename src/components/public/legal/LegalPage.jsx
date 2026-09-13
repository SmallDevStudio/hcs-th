import Link from "next/link";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiMail,
  FiShield,
} from "react-icons/fi";

import {
  LEGAL_PAGE_TYPES,
  getLegalContent,
} from "@/content/legal/legal-content";

function LegalSection({ section }) {
  return (
    <section
      id={section.id}
      className="scroll-mt-28 border-b border-border/70 py-8 last:border-b-0"
    >
      <h2 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
        {section.title}
      </h2>

      {section.paragraphs.length ? (
        <div className="mt-4 space-y-4">
          {section.paragraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="text-sm leading-7 text-muted-foreground sm:text-[15px]"
            >
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}

      {section.items.length ? (
        <ul className="mt-5 space-y-3">
          {section.items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 text-sm leading-6 text-muted-foreground sm:text-[15px]"
            >
              <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FiCheck aria-hidden="true" className="size-3" />
              </span>

              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

export function LegalPage({
  type,
  locale = "en",
  companyName = "HCS (Thailand) Co., Ltd.",
  email = "",
}) {
  const currentLocale = locale === "th" ? "th" : "en";

  const content = getLegalContent(type, currentLocale);

  if (!content) {
    return null;
  }

  const isPrivacy = type === LEGAL_PAGE_TYPES.PRIVACY;

  return (
    <div className="bg-background">
      <section className="relative overflow-hidden border-b border-border bg-[#041322] text-white">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 size-80 rounded-full bg-[#0979c4]/30 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="absolute -bottom-36 left-1/4 size-96 rounded-full bg-sky-400/10 blur-3xl"
        />

        <div className="container-hcs relative py-16 sm:py-20 lg:py-24">
          <Link
            href={`/${currentLocale}`}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-white/70 transition hover:text-white"
          >
            <FiArrowLeft aria-hidden="true" />

            {content.backAction}
          </Link>

          <div className="mt-10 max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-sky-200">
              <FiShield aria-hidden="true" />

              {content.eyebrow}
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
              {content.title}
            </h1>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/75 sm:text-base sm:leading-8">
              {content.description}
            </p>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.12em] text-sky-300">
              {content.effectiveDate}
            </p>
          </div>
        </div>
      </section>

      <section className="container-hcs py-10 sm:py-14 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-primary">
                {currentLocale === "th" ? "สารบัญ" : "On this page"}
              </p>

              <nav
                className="mt-4 space-y-1"
                aria-label={
                  currentLocale === "th" ? "สารบัญ" : "Table of contents"
                }
              >
                {content.sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block rounded-lg px-3 py-2 text-xs font-semibold leading-5 text-muted-foreground transition hover:bg-primary/5 hover:text-primary"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <article className="overflow-hidden rounded-2xl border border-border bg-card px-5 shadow-sm sm:px-8 lg:px-10">
            <div className="border-b border-border/70 py-8">
              {content.introduction.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-3 first:mt-0 text-sm leading-7 text-muted-foreground sm:text-[15px]"
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {content.sections.map((section) => (
              <LegalSection key={section.id} section={section} />
            ))}

            <div className="my-8 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
              <p className="text-lg font-extrabold text-foreground">
                {companyName}
              </p>

              {email ? (
                <a
                  href={`mailto:${email}`}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                >
                  <FiMail aria-hidden="true" />

                  {email}
                </a>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/${currentLocale}/contact`}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold !text-white transition hover:bg-primary/90"
                >
                  {content.contactAction}

                  <FiArrowRight aria-hidden="true" />
                </Link>

                {isPrivacy ? null : (
                  <Link
                    href={`/${currentLocale}/privacy`}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-background px-5 text-sm font-bold text-foreground transition hover:border-primary/40 hover:text-primary"
                  >
                    {currentLocale === "th"
                      ? "นโยบายความเป็นส่วนตัว"
                      : "Privacy Policy"}
                  </Link>
                )}
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
