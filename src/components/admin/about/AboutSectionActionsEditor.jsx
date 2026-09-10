"use client";

import { FiArrowDown, FiArrowUp, FiPlus, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";

import { LocalizedTextField } from "@/components/admin/form/LocalizedTextField";
import { ABOUT_BUTTON_STYLE_VALUES, ABOUT_LIMITS } from "@/constants/about";

export function AboutSectionActionsEditor({
  section,
  controller,
  disabled = false,
}) {
  const { t } = useTranslation("admin");

  const actions = Array.isArray(section.actions) ? section.actions : [];

  function updateAction(actionId, update) {
    controller.updateAction(section.id, actionId, update);
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">
            {t("about.content.actions")}
          </h4>

          <p className="mt-1 text-xs text-slate-400">
            {actions.length}/{ABOUT_LIMITS.ACTIONS_MAX_COUNT}
          </p>
        </div>

        <button
          type="button"
          onClick={() => controller.addAction(section.id)}
          disabled={
            disabled || actions.length >= ABOUT_LIMITS.ACTIONS_MAX_COUNT
          }
          className={[
            "inline-flex h-10 items-center justify-center gap-2",
            "rounded-xl border border-[#0979c4]/30 px-4",
            "text-sm font-bold text-[#0979c4] transition",
            "hover:bg-[#0979c4]/5",
            "disabled:cursor-not-allowed disabled:opacity-40",
            "dark:border-sky-700 dark:text-sky-300",
          ].join(" ")}
        >
          <FiPlus aria-hidden="true" />

          {t("about.actions.addAction")}
        </button>
      </div>

      {actions.length ? (
        <div className="space-y-4">
          {actions.map((action, index) => (
            <article
              key={action.id}
              className="space-y-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-900/60"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                  {t("about.content.actions")} {index + 1}
                </span>

                {!disabled ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        controller.moveAction(section.id, action.id, -1)
                      }
                      disabled={index === 0}
                      aria-label={t("about.actions.moveUp")}
                      className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 dark:border-slate-700"
                    >
                      <FiArrowUp aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        controller.moveAction(section.id, action.id, 1)
                      }
                      disabled={index === actions.length - 1}
                      aria-label={t("about.actions.moveDown")}
                      className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 dark:border-slate-700"
                    >
                      <FiArrowDown aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        controller.removeAction(section.id, action.id)
                      }
                      aria-label={t("about.actions.delete")}
                      className="flex size-8 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400"
                    >
                      <FiTrash2 aria-hidden="true" />
                    </button>
                  </div>
                ) : null}
              </div>

              <Fieldset disabled={disabled}>
                <LocalizedTextField
                  label={t("about.content.buttonLabel")}
                  value={action.label}
                  onChange={(label) =>
                    updateAction(action.id, {
                      label,
                    })
                  }
                  disabled={disabled}
                  required
                  maxLength={ABOUT_LIMITS.ACTION_LABEL_MAX_LENGTH}
                />

                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
                    {t("about.content.buttonUrl")}
                  </span>

                  <input
                    type="text"
                    value={action.href}
                    onChange={(event) =>
                      updateAction(action.id, {
                        href: event.target.value,
                      })
                    }
                    disabled={disabled}
                    maxLength={ABOUT_LIMITS.ACTION_HREF_MAX_LENGTH}
                    placeholder="/contact, #values or https://..."
                    className={[
                      "h-11 w-full rounded-xl border border-slate-200",
                      "bg-white px-4 text-sm text-slate-950 outline-none",
                      "transition focus:border-[#0979c4]",
                      "focus:ring-4 focus:ring-[#0979c4]/10",
                      "disabled:opacity-60",
                      "dark:border-slate-700 dark:bg-slate-950",
                      "dark:text-white",
                    ].join(" ")}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
                    Button style
                  </span>

                  <select
                    value={action.style}
                    onChange={(event) =>
                      updateAction(action.id, {
                        style: event.target.value,
                      })
                    }
                    disabled={disabled}
                    className={[
                      "h-11 w-full rounded-xl border border-slate-200",
                      "bg-white px-3 text-sm text-slate-950 outline-none",
                      "focus:border-[#0979c4]",
                      "dark:border-slate-700 dark:bg-slate-950",
                      "dark:text-white",
                    ].join(" ")}
                  >
                    {ABOUT_BUTTON_STYLE_VALUES.map((style) => (
                      <option key={style} value={style}>
                        {t(`about.buttonStyles.${style}`)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950">
                  <input
                    type="checkbox"
                    checked={action.openInNewTab === true}
                    onChange={(event) =>
                      updateAction(action.id, {
                        openInNewTab: event.target.checked,
                      })
                    }
                    disabled={disabled}
                    className="size-4 accent-[#0979c4]"
                  />

                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {t("about.content.openInNewTab")}
                  </span>
                </label>
              </Fieldset>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-400 dark:bg-slate-900/50">
          No buttons have been added to this Section.
        </p>
      )}
    </section>
  );
}

function Fieldset({ disabled, children }) {
  return (
    <fieldset disabled={disabled} className="space-y-4">
      {children}
    </fieldset>
  );
}
