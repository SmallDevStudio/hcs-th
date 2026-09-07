import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import { TbClock, TbMail, TbMapPin, TbPhone } from "react-icons/tb";

const SOCIAL_ITEMS = [
  {
    key: "linkedin",
    Icon: FaLinkedinIn,
  },
  {
    key: "facebook",
    Icon: FaFacebookF,
  },
  {
    key: "youtube",
    Icon: FaYoutube,
  },
  {
    key: "instagram",
    Icon: FaInstagram,
  },
];

function createPhoneHref(phone = "") {
  const normalized = phone.replace(/[^\d+]/g, "");

  return normalized ? `tel:${normalized}` : undefined;
}

export function ContactInformation({ locale, settings, content }) {
  const contact = settings?.contact || {};
  const social = settings?.social || {};

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

  const contactRows = [
    {
      key: "phone",
      Icon: TbPhone,
      label: content.callUs,
      value: contact.phone,
      href: createPhoneHref(contact.phone),
    },

    ...(contact.secondaryPhone
      ? [
          {
            key: "secondaryPhone",
            Icon: TbPhone,
            label: content.secondaryPhone,
            value: contact.secondaryPhone,
            href: createPhoneHref(contact.secondaryPhone),
          },
        ]
      : []),

    {
      key: "email",
      Icon: TbMail,
      label: content.emailUs,
      value: contact.email,
      href: contact.email ? `mailto:${contact.email}` : undefined,
    },

    ...(contact.salesEmail
      ? [
          {
            key: "salesEmail",
            Icon: TbMail,
            label: content.salesEmail,
            value: contact.salesEmail,
            href: `mailto:${contact.salesEmail}`,
          },
        ]
      : []),

    {
      key: "address",
      Icon: TbMapPin,
      label: content.visitUs,
      value: address,
      href: contact.googleMapsUrl || undefined,
    },
  ].filter((item) => item.value);

  const availableSocialItems = SOCIAL_ITEMS.filter((item) => social[item.key]);

  return (
    <section>
      <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-primary">
        {content.eyebrow}
      </p>

      <h2 className="mt-2 text-3xl font-extrabold uppercase leading-[1.02] tracking-[-0.03em] text-[#071b30] dark:text-white">
        {content.title}
      </h2>

      <p className="mt-4 text-sm leading-7 text-[#52677a] dark:text-muted-foreground">
        {content.description}
      </p>

      <div className="mt-6 divide-y divide-[#d8e4ed] border-b border-[#d8e4ed] dark:divide-border dark:border-border">
        {contactRows.map(({ key, Icon, label, value, href }) => {
          const details = (
            <>
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                <Icon aria-hidden="true" className="size-5" />
              </span>

              <span className="min-w-0">
                <span className="block text-[10px] font-extrabold uppercase tracking-[0.08em] text-primary">
                  {label}
                </span>

                <span className="mt-1 block break-words text-base font-extrabold text-[#102a43] dark:text-white">
                  {value}
                </span>
              </span>
            </>
          );

          return href ? (
            <a
              key={key}
              href={href}
              target={key === "address" ? "_blank" : undefined}
              rel={key === "address" ? "noreferrer" : undefined}
              className="flex items-center gap-4 py-4 transition-opacity hover:opacity-75"
            >
              {details}
            </a>
          ) : (
            <div key={key} className="flex items-center gap-4 py-4">
              {details}
            </div>
          );
        })}
      </div>

      {(businessHours || availableSocialItems.length > 0) && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {businessHours ? (
            <div className="flex items-start gap-3">
              <TbClock
                aria-hidden="true"
                className="mt-0.5 size-7 shrink-0 text-primary"
              />

              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-primary">
                  {content.officeHours}
                </p>

                <p className="mt-1 text-sm leading-6 text-[#334b61] dark:text-foreground">
                  {businessHours}
                </p>
              </div>
            </div>
          ) : null}

          {availableSocialItems.length ? (
            <div
              className={
                businessHours
                  ? "sm:border-l sm:border-[#d8e4ed] sm:pl-6 dark:sm:border-border"
                  : ""
              }
            >
              <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-primary">
                {content.followUs}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {availableSocialItems.map(({ key, Icon }) => (
                  <a
                    key={key}
                    href={social[key]}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={content.socialLabels[key]}
                    className="flex size-10 items-center justify-center rounded-full border border-primary text-primary transition hover:bg-primary hover:text-white"
                  >
                    <Icon aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
