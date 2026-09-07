import { FiMail, FiMapPin, FiPhone } from "react-icons/fi";

export function PublicTopBar({ contact }) {
  return (
    <div className="hidden bg-[#07111b] text-white lg:block">
      <div className="container-hcs flex h-9 items-center justify-between text-xs">
        <div className="flex min-w-0 items-center gap-6">
          {contact.phone ? (
            <a
              href={contact.phoneHref}
              className="inline-flex shrink-0 items-center gap-2 text-white/80 transition hover:text-white"
            >
              <FiPhone aria-hidden="true" />

              <span>{contact.phone}</span>
            </a>
          ) : null}

          {contact.email ? (
            <a
              href={contact.emailHref}
              className="inline-flex min-w-0 items-center gap-2 text-white/80 transition hover:text-white"
            >
              <FiMail aria-hidden="true" className="shrink-0" />

              <span className="truncate">{contact.email}</span>
            </a>
          ) : null}

          {contact.location ? (
            <span className="inline-flex min-w-0 items-center gap-2 text-white/70">
              <FiMapPin aria-hidden="true" className="shrink-0" />

              <span className="max-w-[310px] truncate">{contact.location}</span>
            </span>
          ) : null}
        </div>

        <span className="ml-5 shrink-0 font-medium tracking-wide text-white/70">
          HARDWARE &amp; SECURITY SOLUTIONS
        </span>
      </div>
    </div>
  );
}
