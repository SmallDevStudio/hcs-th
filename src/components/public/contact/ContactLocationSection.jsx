import {
  TbArrowRight,
  TbClock,
  TbMail,
  TbMapPin,
  TbPhone,
} from "react-icons/tb";

function createPhoneHref(phone = "") {
  const normalized = phone.replace(/[^\d+]/g, "");

  return normalized ? `tel:${normalized}` : undefined;
}

export function ContactLocationSection({ locale, settings, content }) {
  const contact = settings?.contact || {};

  const address =
    contact.address?.[locale] ||
    contact.address?.en ||
    contact.address?.th ||
    "";

  const businessHours =
    contact.businessHours?.[locale] ||
    contact.businessHours?.en ||
    contact.businessHours?.th ||
    "";

  const details = [
    {
      key: "address",
      Icon: TbMapPin,
      value: address,
    },
    {
      key: "phone",
      Icon: TbPhone,
      value: contact.phone,
      href: createPhoneHref(contact.phone),
    },
    {
      key: "email",
      Icon: TbMail,
      value: contact.email,
      href: contact.email ? `mailto:${contact.email}` : undefined,
    },
    {
      key: "hours",
      Icon: TbClock,
      value: businessHours,
    },
  ].filter((item) => item.value);

  return (
    <section className="bg-white py-12 sm:py-14 lg:py-16 dark:bg-background">
      <div className="container-hcs">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-primary">
          {content.eyebrow}
        </p>

        <div className="mt-3 grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)] lg:items-stretch lg:gap-10">
          <div className="relative min-h-[300px] overflow-hidden rounded-md border border-[#d3e1eb] bg-[#eef4f7] dark:border-border dark:bg-surface sm:min-h-[360px]">
            {contact.googleMapsEmbedUrl ? (
              <iframe
                src={contact.googleMapsEmbedUrl}
                title={content.mapTitle}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 size-full border-0"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                <span className="flex size-16 items-center justify-center rounded-full bg-primary text-white shadow-md">
                  <TbMapPin aria-hidden="true" className="size-8" />
                </span>

                <p className="mt-5 max-w-md text-sm leading-6 text-muted-foreground">
                  {content.mapUnavailable}
                </p>

                {address ? (
                  <p className="mt-2 max-w-md text-sm font-bold text-foreground">
                    {address}
                  </p>
                ) : null}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-extrabold uppercase leading-tight tracking-[-0.025em] text-[#071b30] dark:text-white sm:text-3xl">
              {content.title}
            </h2>

            <div className="mt-6 space-y-4">
              {details.map(({ key, Icon, value, href }) => {
                const row = (
                  <>
                    <Icon
                      aria-hidden="true"
                      className="mt-0.5 size-5 shrink-0 text-primary"
                    />

                    <span className="text-sm leading-6 text-[#40566b] dark:text-muted-foreground">
                      {value}
                    </span>
                  </>
                );

                return href ? (
                  <a
                    key={key}
                    href={href}
                    className="flex items-start gap-3 transition hover:text-primary"
                  >
                    {row}
                  </a>
                ) : (
                  <div key={key} className="flex items-start gap-3">
                    {row}
                  </div>
                );
              })}
            </div>

            {contact.googleMapsUrl ? (
              <a
                href={contact.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="group mt-7 inline-flex min-h-11 w-fit items-center justify-center gap-3 rounded border border-primary px-5 text-xs font-extrabold uppercase tracking-[0.04em] text-primary transition hover:bg-primary hover:text-white"
              >
                <span>{content.getDirections}</span>

                <TbArrowRight
                  aria-hidden="true"
                  className="size-[18px] transition-transform group-hover:translate-x-1"
                />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
