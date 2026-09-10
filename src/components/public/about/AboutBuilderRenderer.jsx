import Image from "next/image";
import Link from "next/link";
import {
  TbArrowRight,
  TbBuildingSkyscraper,
  TbCircleCheckFilled,
  TbSettings,
  TbUsersGroup,
  TbWorld,
} from "react-icons/tb";

import { RichTextContent } from "@/components/content/RichTextContent";

const ITEM_ICONS = {
  settings: TbSettings,
  world: TbWorld,
  building: TbBuildingSkyscraper,
  users: TbUsersGroup,
  experience: TbCircleCheckFilled,
};

function localized(value, locale) {
  return value?.[locale] || value?.en || value?.th || "";
}

function createLocalizedHref(href, locale) {
  const value = String(href || "").trim();

  if (
    !value ||
    value.startsWith("#") ||
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:")
  ) {
    return value;
  }

  if (value.startsWith("/en/") || value.startsWith("/th/")) {
    return value;
  }

  if (value.startsWith("/")) {
    return `/${locale}${value}`;
  }

  return value;
}

function AboutAction({ action, locale, dark = false }) {
  const label = localized(action.label, locale);

  const href = createLocalizedHref(action.href, locale);

  if (!label || !href) {
    return null;
  }

  const className = [
    "group inline-flex min-h-11 items-center justify-center gap-3",
    "rounded border px-5 text-xs font-extrabold uppercase",
    "tracking-[0.04em] transition-colors",
    dark
      ? [
          "border-white/70 text-white",
          "hover:bg-white hover:text-[#052b4a]",
        ].join(" ")
      : [
          "border-primary text-primary",
          "hover:bg-primary hover:text-white",
        ].join(" "),
  ].join(" ");

  const content = (
    <>
      <span>{label}</span>

      <TbArrowRight
        aria-hidden="true"
        className="size-[18px] transition-transform group-hover:translate-x-1"
      />
    </>
  );

  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return (
      <a
        href={href}
        target={action.openInNewTab ? "_blank" : undefined}
        rel={action.openInNewTab ? "noopener noreferrer" : undefined}
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      target={action.openInNewTab ? "_blank" : undefined}
      className={className}
    >
      {content}
    </Link>
  );
}

function SectionHeading({ section, locale, centered = false, dark = false }) {
  const eyebrow = localized(section.eyebrow, locale);

  const title = localized(section.title, locale);

  return (
    <div className={centered ? "text-center" : ""}>
      {eyebrow ? (
        <p
          className={[
            "text-[11px] font-extrabold uppercase tracking-[0.13em]",
            dark ? "text-sky-300" : "text-primary",
          ].join(" ")}
        >
          {eyebrow}
        </p>
      ) : null}

      {title ? (
        <h2
          className={[
            "mt-2 text-3xl font-extrabold uppercase",
            "leading-[1.02] tracking-[-0.03em]",
            "sm:text-4xl",
            dark ? "text-white" : "text-[#071b30] dark:text-white",
          ].join(" ")}
        >
          {title}
        </h2>
      ) : null}
    </div>
  );
}

function AboutHeroSection({ section, locale }) {
  const imageUrl = section.image?.publicUrl;

  return (
    <section className="relative isolate min-h-[350px] overflow-hidden bg-[#052b4a] text-white sm:min-h-[390px] lg:min-h-[430px]">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={localized(section.imageAlt, locale)}
          fill
          priority
          unoptimized
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-center"
        />
      ) : null}

      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(3,34,59,0.98)_0%,rgba(3,45,75,0.9)_34%,rgba(3,45,75,0.34)_62%,rgba(3,45,75,0.06)_100%)]" />

      <div className="container-hcs flex min-h-[350px] items-center py-12 sm:min-h-[390px] sm:py-14 lg:min-h-[430px]">
        <div className="max-w-[640px]">
          <SectionHeading section={section} locale={locale} dark />

          <RichTextContent
            document={section.content?.[locale]}
            className="mt-5 max-w-[540px] !text-white/85"
          />

          {section.actions?.length ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {section.actions.map((action) => (
                <AboutAction
                  key={action.id}
                  action={action}
                  locale={locale}
                  dark
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function AboutRichContentSection({ section, locale }) {
  const imageUrl = section.image?.publicUrl;

  const imageLeft = section.layout?.imagePosition === "left";

  const imageRight = section.layout?.imagePosition === "right";

  const hasImage = imageUrl && (imageLeft || imageRight);

  const backgroundClass =
    section.layout?.background === "muted"
      ? "bg-[#f3f8fb] dark:bg-surface"
      : section.layout?.background === "dark"
        ? "bg-[#052b4a] text-white"
        : "bg-white dark:bg-background";

  const dark = section.layout?.background === "dark";

  const content = (
    <div>
      <SectionHeading
        section={section}
        locale={locale}
        centered={section.layout?.contentAlignment === "center"}
        dark={dark}
      />

      <RichTextContent
        document={section.content?.[locale]}
        className={["mt-5", dark ? "!text-white/80" : ""].join(" ")}
      />

      {section.actions?.length ? (
        <div className="mt-6 flex flex-wrap gap-3">
          {section.actions.map((action) => (
            <AboutAction
              key={action.id}
              action={action}
              locale={locale}
              dark={dark}
            />
          ))}
        </div>
      ) : null}
    </div>
  );

  const image = hasImage ? (
    <div className="relative min-h-[300px] overflow-hidden rounded-md bg-[#edf3f7] shadow-sm sm:min-h-[360px] lg:min-h-[390px]">
      <Image
        src={imageUrl}
        alt={localized(section.imageAlt, locale)}
        fill
        unoptimized
        sizes="(max-width: 1023px) 100vw, 50vw"
        className="object-cover object-center"
      />
    </div>
  ) : null;

  return (
    <section
      id={section.id}
      className={["scroll-mt-28 py-12 sm:py-14 lg:py-16", backgroundClass].join(
        " ",
      )}
    >
      <div className="container-hcs">
        {hasImage ? (
          <div className="grid items-center gap-9 lg:grid-cols-2 lg:gap-14">
            {imageLeft ? image : content}

            {imageLeft ? content : image}
          </div>
        ) : (
          <div className="mx-auto max-w-4xl">{content}</div>
        )}
      </div>
    </section>
  );
}

function AboutFeatureGridSection({ section, locale }) {
  return (
    <section
      id={section.id}
      className="scroll-mt-28 border-y border-[#deebf2] bg-[#f3f8fb] py-12 sm:py-14 lg:py-16 dark:border-border dark:bg-background"
    >
      <div className="container-hcs">
        <SectionHeading
          section={section}
          locale={locale}
          centered={section.layout?.contentAlignment === "center"}
        />

        <RichTextContent
          document={section.content?.[locale]}
          className="mt-4 max-w-3xl"
        />

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {section.items?.map((item) => {
            const Icon = ITEM_ICONS[item.icon] || TbCircleCheckFilled;

            return (
              <article
                key={item.id}
                className="group flex min-h-[220px] flex-col rounded-md border border-[#d3e1eb] bg-white px-5 py-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-md dark:border-border dark:bg-surface"
              >
                <Icon
                  aria-hidden="true"
                  strokeWidth={1.65}
                  className="size-12 text-primary"
                />

                <h3 className="mt-5 text-base font-extrabold leading-tight text-[#071b30] dark:text-white">
                  {localized(item.title, locale)}
                </h3>

                <RichTextContent
                  document={item.content?.[locale]}
                  className="mt-3"
                />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AboutStatisticsSection({ section, locale }) {
  return (
    <section
      id={section.id}
      className="relative isolate overflow-hidden bg-[linear-gradient(110deg,#056daf_0%,#0787d4_55%,#087ac2_100%)] py-8 text-white sm:py-10"
    >
      <div className="container-hcs">
        <dl className="grid grid-cols-2 gap-y-9 sm:gap-y-10 lg:grid-cols-4 lg:gap-y-0">
          {section.items?.map((item, index) => (
            <div
              key={item.id}
              className={[
                "relative px-4 text-center sm:px-7",
                index > 0 ? "lg:border-l lg:border-white/40" : "",
              ].join(" ")}
            >
              <dt className="flex flex-col">
                <strong className="text-4xl font-extrabold leading-none tracking-[-0.045em] sm:text-5xl">
                  {localized(item.value, locale)}
                </strong>

                <span className="mt-3 text-sm font-extrabold leading-tight">
                  {localized(item.title, locale)}
                </span>
              </dt>

              <dd>
                <RichTextContent
                  document={item.content?.[locale]}
                  className="mx-auto mt-2 max-w-[220px] !text-xs !leading-5 !text-white/82"
                />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function renderSection(section, locale) {
  if (section.type === "hero") {
    return (
      <AboutHeroSection key={section.id} section={section} locale={locale} />
    );
  }

  if (section.type === "feature-grid") {
    return (
      <AboutFeatureGridSection
        key={section.id}
        section={section}
        locale={locale}
      />
    );
  }

  if (section.type === "statistics") {
    return (
      <AboutStatisticsSection
        key={section.id}
        section={section}
        locale={locale}
      />
    );
  }

  return (
    <AboutRichContentSection
      key={section.id}
      section={section}
      locale={locale}
    />
  );
}

export function AboutBuilderRenderer({ content, locale = "en" }) {
  const currentLocale = locale === "th" ? "th" : "en";

  const sections = Array.isArray(content?.sections)
    ? content.sections
        .filter((section) => section.enabled !== false)
        .sort(
          (firstSection, secondSection) =>
            Number(firstSection.sortOrder || 0) -
            Number(secondSection.sortOrder || 0),
        )
    : [];

  return (
    <main>
      {sections.map((section) => renderSection(section, currentLocale))}
    </main>
  );
}
