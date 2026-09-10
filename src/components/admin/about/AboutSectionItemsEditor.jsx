"use client";

import { useState } from "react";
import {
  FiArrowDown,
  FiArrowUp,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";

import { AboutSectionMediaField } from "@/components/admin/about/AboutSectionMediaField";
import { LocalizedRichTextEditor } from "@/components/admin/form/LocalizedRichTextEditor";
import { LocalizedTextField } from "@/components/admin/form/LocalizedTextField";
import { ABOUT_LIMITS, ABOUT_SECTION_TYPES } from "@/constants/about";

function AboutSectionItem({
  section,
  item,
  index,
  total,
  controller,
  disabled,
}) {
  const { t } = useTranslation("admin");

  const [expanded, setExpanded] = useState(false);

  function updateItem(update) {
    controller.updateSectionItem(section.id, item.id, update);
  }

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60">
      <header className="flex items-center gap-3 p-3">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
        >
          <span className="truncate text-xs font-extrabold text-slate-700 dark:text-slate-200">
            {item.title?.en ||
              item.title?.th ||
              `${t("about.content.items")} ${index + 1}`}
          </span>

          {expanded ? (
            <FiChevronUp
              aria-hidden="true"
              className="shrink-0 text-slate-400"
            />
          ) : (
            <FiChevronDown
              aria-hidden="true"
              className="shrink-0 text-slate-400"
            />
          )}
        </button>

        {!disabled ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                controller.moveSectionItem(section.id, item.id, -1)
              }
              disabled={index === 0}
              aria-label={t("about.actions.moveUp")}
              className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 dark:border-slate-700"
            >
              <FiArrowUp aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => controller.moveSectionItem(section.id, item.id, 1)}
              disabled={index === total - 1}
              aria-label={t("about.actions.moveDown")}
              className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 dark:border-slate-700"
            >
              <FiArrowDown aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => controller.removeSectionItem(section.id, item.id)}
              aria-label={t("about.actions.delete")}
              className="flex size-8 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400"
            >
              <FiTrash2 aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </header>

      {expanded ? (
        <div className="space-y-5 border-t border-slate-200 p-4 dark:border-slate-700">
          <LocalizedTextField
            label={t("about.content.title")}
            value={item.title}
            onChange={(title) =>
              updateItem({
                title,
              })
            }
            disabled={disabled}
            required
            maxLength={ABOUT_LIMITS.ITEM_TITLE_MAX_LENGTH}
          />

          {section.type === ABOUT_SECTION_TYPES.STATISTICS ? (
            <LocalizedTextField
              label={t("about.content.value")}
              value={item.value}
              onChange={(value) =>
                updateItem({
                  value,
                })
              }
              disabled={disabled}
              required
              maxLength={ABOUT_LIMITS.ITEM_VALUE_MAX_LENGTH}
            />
          ) : null}

          <LocalizedRichTextEditor
            id={`about-item-${item.id}-content`}
            value={item.content}
            onChange={(content) =>
              updateItem({
                content,
              })
            }
            label={t("about.content.body")}
            disabled={disabled}
            required={false}
            requiredLocales={[]}
            minHeight={180}
          />

          {section.type !== ABOUT_SECTION_TYPES.STATISTICS ? (
            <>
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-slate-600 dark:text-slate-300">
                  {t("about.content.icon")}
                </span>

                <input
                  type="text"
                  value={item.icon || ""}
                  onChange={(event) =>
                    updateItem({
                      icon: event.target.value,
                    })
                  }
                  disabled={disabled}
                  maxLength={ABOUT_LIMITS.ITEM_ICON_MAX_LENGTH}
                  placeholder="settings, world, building, users"
                  className={[
                    "h-11 w-full rounded-xl border border-slate-200",
                    "bg-white px-4 text-sm text-slate-950 outline-none",
                    "transition focus:border-[#0979c4]",
                    "focus:ring-4 focus:ring-[#0979c4]/10",
                    "dark:border-slate-700 dark:bg-slate-950",
                    "dark:text-white",
                  ].join(" ")}
                />
              </label>

              <AboutSectionMediaField
                mediaId={item.imageMediaId}
                media={item.image}
                imageAlt={item.imageAlt}
                imageRatio="1/1"
                onSelect={(asset) =>
                  controller.setSectionItemImage(section.id, item.id, asset)
                }
                onImageAltChange={(imageAlt) =>
                  updateItem({
                    imageAlt,
                  })
                }
                disabled={disabled}
              />
            </>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function AboutSectionItemsEditor({
  section,
  controller,
  disabled = false,
}) {
  const { t } = useTranslation("admin");

  const items = Array.isArray(section.items) ? section.items : [];

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h4 className="text-sm font-extrabold text-slate-950 dark:text-white">
            {t("about.content.items")}
          </h4>

          <p className="mt-1 text-xs text-slate-400">
            {items.length}/{ABOUT_LIMITS.ITEMS_MAX_COUNT}
          </p>
        </div>

        <button
          type="button"
          onClick={() => controller.addSectionItem(section.id)}
          disabled={disabled || items.length >= ABOUT_LIMITS.ITEMS_MAX_COUNT}
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

          {t("about.actions.addItem")}
        </button>
      </div>

      {items.length ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <AboutSectionItem
              key={item.id}
              section={section}
              item={item}
              index={index}
              total={items.length}
              controller={controller}
              disabled={disabled}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-400 dark:bg-slate-900/50">
          No items have been added to this Section.
        </p>
      )}
    </section>
  );
}
