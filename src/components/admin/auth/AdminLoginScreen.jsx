"use client";

import Image from "next/image";
import { useTranslation } from "react-i18next";
import { FiCheckCircle, FiDatabase, FiLock, FiSettings } from "react-icons/fi";

import { AdminLoginForm } from "@/components/admin/auth/AdminLoginForm";
import { AdminLoginLanguageSwitcher } from "@/components/admin/auth/AdminLoginLanguageSwitcher";

const FEATURES = [
  {
    key: "data",
    icon: FiDatabase,
  },
  {
    key: "central",
    icon: FiSettings,
  },
  {
    key: "seo",
    icon: FiCheckCircle,
  },
];

export function AdminLoginScreen({ locale }) {
  const { t } = useTranslation("admin");

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 dark:bg-[#06111e] sm:px-6 lg:flex lg:items-center lg:justify-center lg:py-10">
      <div className="mx-auto grid min-h-[680px] w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-900/10 dark:bg-slate-950 dark:shadow-black/30 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[#061a2d] p-12 text-white lg:flex lg:flex-col">
          <Image
            src="/images/home/standards/door-closer-blueprint.jpg"
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 55vw, 0px"
            className="object-cover opacity-15"
          />

          <div className="absolute inset-0 bg-gradient-to-br from-[#041322] via-[#075b95]/90 to-[#0979c4]/80" />

          <div className="relative z-10">
            <Image
              src="/images/brand/hcs-logo-white.png"
              alt="HCS Thailand"
              width={180}
              height={85}
              priority
              className="h-auto w-[150px]"
            />
          </div>

          <div className="relative z-10 my-auto max-w-lg py-14">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-sky-200">
              {t("login.panelEyebrow")}
            </p>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
              {t("login.panelTitle")}

              <span className="block text-sky-300">
                {t("login.panelTitleHighlight")}
              </span>
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-200">
              {t("login.panelDescription")}
            </p>

            <div className="mt-10 space-y-5">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div key={feature.key} className="flex items-start gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10">
                      <Icon
                        className="text-xl text-sky-200"
                        aria-hidden="true"
                      />
                    </span>

                    <div>
                      <h2 className="text-sm font-bold">
                        {t(`login.features.${feature.key}.title`)}
                      </h2>

                      <p className="mt-1 text-xs leading-5 text-slate-300">
                        {t(`login.features.${feature.key}.description`)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="relative z-10 text-xs text-slate-400">
            © {new Date().getFullYear()} HCS (Thailand) Co., Ltd.
          </p>
        </section>

        <section className="flex items-center px-6 py-10 sm:px-12 lg:px-16">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-9 flex items-center justify-between">
              <div className="lg:hidden">
                <Image
                  src="/images/brand/hcs-logo-primary.png"
                  alt="HCS Thailand"
                  width={150}
                  height={72}
                  priority
                  className="h-auto w-[125px] dark:hidden"
                />

                <Image
                  src="/images/brand/hcs-logo-white.png"
                  alt="HCS Thailand"
                  width={150}
                  height={72}
                  priority
                  className="hidden h-auto w-[125px] dark:block"
                />
              </div>

              <div className="ml-auto">
                <AdminLoginLanguageSwitcher locale={locale} />
              </div>
            </div>

            <div className="flex size-12 items-center justify-center rounded-xl bg-[#0979c4]/10 text-[#0979c4] dark:bg-[#0979c4]/20 dark:text-sky-300">
              <FiLock className="text-xl" aria-hidden="true" />
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[#0979c4] dark:text-sky-400">
              {t("login.eyebrow")}
            </p>

            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              {t("login.title")}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {t("login.description")}
            </p>

            <AdminLoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
