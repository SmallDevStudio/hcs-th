import {
  TbCertificate,
  TbDoor,
  TbFlame,
  TbGripHorizontal,
  TbRosetteDiscountCheck,
} from "react-icons/tb";

const STANDARD_ITEMS = [
  {
    key: "ce",
    Icon: TbRosetteDiscountCheck,
  },
  {
    key: "en1154",
    Icon: TbDoor,
  },
  {
    key: "en1634",
    Icon: TbFlame,
  },
  {
    key: "en1906",
    Icon: TbGripHorizontal,
  },
  {
    key: "bs",
    Icon: TbCertificate,
  },
];

export function FeaturedStandardsSection({ content }) {
  return (
    <section className="relative isolate overflow-hidden bg-[#0879c6] py-8 text-white sm:py-10">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-gradient-to-r from-[#0566aa] via-[#0879c6] to-[#0791dc]"
      />

      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 -z-10 w-1/2 opacity-15 [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:52px_52px]"
      />

      <div className="container-hcs">
        <div className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-y-0">
          {STANDARD_ITEMS.map(({ key, Icon }, index) => {
            const item = content[key];

            return (
              <article
                key={key}
                className={[
                  "relative flex flex-col items-center px-5 text-center",
                  index > 0 ? "lg:border-l lg:border-white/35" : "",
                ].join(" ")}
              >
                <Icon
                  aria-hidden="true"
                  strokeWidth={1.6}
                  className="size-12 text-white"
                />

                <p className="mt-3 text-xl font-extrabold leading-none text-white">
                  {item.code}
                </p>

                <h3 className="mt-2 text-[12px] font-bold leading-4 text-white">
                  {item.title}
                </h3>

                <p className="mt-2 max-w-[210px] text-[11px] leading-[17px] text-white/78">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
