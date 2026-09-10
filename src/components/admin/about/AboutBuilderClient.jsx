"use client";

import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
import { toast } from "sonner";

import { AboutBuilderToolbar } from "@/components/admin/about/AboutBuilderToolbar";
import { AboutSectionList } from "@/components/admin/about/AboutSectionList";
import { AboutSeoPanel } from "@/components/admin/about/AboutSeoPanel";
import { useAboutBuilder } from "@/components/admin/about/useAboutBuilder";
import { useAboutBuilderController } from "@/components/admin/about/useAboutBuilderController";

function isDarkModeActive() {
  return document.documentElement.classList.contains("dark");
}

function createConfirmation({
  title,
  text,
  confirmText,
  destructive = false,
  cancelText,
}) {
  const darkMode = isDarkModeActive();

  return {
    title,
    text,

    icon: "warning",

    showCancelButton: true,

    confirmButtonText: confirmText,

    cancelButtonText: cancelText,

    confirmButtonColor: destructive ? "#dc2626" : "#0979c4",

    cancelButtonColor: "#64748b",

    reverseButtons: true,

    background: darkMode ? "#071522" : "#ffffff",

    color: darkMode ? "#f8fafc" : "#0f172a",
  };
}

export function AboutBuilderClient({ initialPage, canUpdate, canPublish }) {
  const { t } = useTranslation("admin");

  const builder = useAboutBuilder({
    initialPage,

    autosave: canUpdate,

    onVersionConflict: () => {
      toast.error(t("about.messages.versionConflict"));
    },
  });

  const controller = useAboutBuilderController(builder);

  async function handleSave() {
    try {
      await builder.saveDraft();

      toast.success(t("about.messages.saveSuccess"));
    } catch (error) {
      if (!builder.versionConflict) {
        toast.error(error?.message || t("about.messages.saveFailed"));
      }
    }
  }

  async function handlePublish() {
    const confirmation = await Swal.fire(
      createConfirmation({
        title: t("about.confirmations.publish.title"),

        text: t("about.confirmations.publish.text"),

        confirmText: t("about.confirmations.publish.confirm"),

        cancelText: t("common.cancel"),
      }),
    );

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      await builder.publish();

      toast.success(t("about.messages.publishSuccess"));
    } catch (error) {
      toast.error(error?.message || t("about.messages.publishFailed"));
    }
  }

  async function handleUnpublish() {
    const confirmation = await Swal.fire(
      createConfirmation({
        title: t("about.confirmations.unpublish.title"),

        text: t("about.confirmations.unpublish.text"),

        confirmText: t("about.confirmations.unpublish.confirm"),

        cancelText: t("common.cancel"),

        destructive: true,
      }),
    );

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      await builder.unpublish();

      toast.success(t("about.messages.unpublishSuccess"));
    } catch (error) {
      toast.error(error?.message || t("about.messages.unpublishFailed"));
    }
  }

  async function handleReload() {
    if (builder.dirty) {
      const confirmation = await Swal.fire(
        createConfirmation({
          title: t("about.confirmations.reload.title"),

          text: t("about.confirmations.reload.text"),

          confirmText: t("about.confirmations.reload.confirm"),

          cancelText: t("common.cancel"),

          destructive: true,
        }),
      );

      if (!confirmation.isConfirmed) {
        return;
      }
    }

    try {
      await builder.reload();

      toast.success(t("about.messages.reloadSuccess"));
    } catch (error) {
      toast.error(error?.message || t("about.messages.reloadFailed"));
    }
  }

  function handlePreview() {
    window.open("/admin/about/preview", "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0979c4] dark:text-sky-400">
          {t("about.eyebrow")}
        </p>

        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
          {t("about.title")}
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
          {t("about.description")}
        </p>
      </header>

      <AboutBuilderToolbar
        page={builder.page}
        dirty={builder.dirty}
        saving={builder.saving}
        publishing={builder.publishing}
        unpublishing={builder.unpublishing}
        lastSavedAt={builder.lastSavedAt}
        canUpdate={canUpdate}
        canPublish={canPublish}
        onSave={handleSave}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onReload={handleReload}
        onPreview={handlePreview}
      />

      {builder.error ? (
        <div
          role="alert"
          className={[
            "flex flex-col justify-between gap-3 rounded-2xl",
            "border border-red-200 bg-red-50 px-4 py-3",
            "text-sm text-red-700",
            "dark:border-red-900 dark:bg-red-950/30",
            "dark:text-red-300 sm:flex-row sm:items-center",
          ].join(" ")}
        >
          <p>
            {builder.versionConflict
              ? t("about.messages.versionConflict")
              : builder.error.message || t("about.messages.saveFailed")}
          </p>

          {builder.versionConflict ? (
            <button
              type="button"
              onClick={handleReload}
              disabled={builder.busy}
              className="h-9 shrink-0 rounded-xl bg-red-600 px-4 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {t("about.actions.reload")}
            </button>
          ) : null}
        </div>
      ) : null}

      <AboutSeoPanel
        seo={builder.draft.seo}
        onChange={controller.updateSeo}
        onSelectImage={controller.setSeoImage}
        disabled={!canUpdate || builder.busy}
      />

      <AboutSectionList
        sections={builder.draft.sections}
        controller={controller}
        disabled={!canUpdate || builder.busy}
      />
    </div>
  );
}
