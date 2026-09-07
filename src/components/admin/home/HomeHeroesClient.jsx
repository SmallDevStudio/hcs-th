"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiArrowDown,
  FiArrowUp,
  FiClock,
  FiEdit3,
  FiFilter,
  FiImage,
  FiLoader,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiSearch,
  FiTrash2,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { toast } from "sonner";

import { HomeHeroFormModal } from "@/components/admin/home/HomeHeroFormModal";
import {
  HOME_SECTION_STATUSES,
  HOME_SECTION_STATUS_VALUES,
} from "@/constants/home";
import {
  deleteHomeHero,
  getHomeHeroes,
  reorderHomeHeroes,
} from "@/services/http/home-heroes.api";

const INITIAL_FILTERS = {
  status: "",
};

function isDarkModeActive() {
  return document.documentElement.classList.contains("dark");
}

function createDeleteConfirmation({
  darkMode,
  title,
  text,
  confirmText,
  cancelText,
}) {
  return {
    title,
    text,

    icon: "warning",

    showCancelButton: true,

    confirmButtonText: confirmText,

    cancelButtonText: cancelText,

    confirmButtonColor: "#dc2626",

    cancelButtonColor: "#64748b",

    reverseButtons: true,

    background: darkMode ? "#071522" : "#ffffff",

    color: darkMode ? "#f8fafc" : "#0f172a",
  };
}

function getLocalizedValue(value, language, fallback = "") {
  return value?.[language] || value?.en || value?.th || fallback;
}

function getStatusClassName(status) {
  if (status === HOME_SECTION_STATUSES.PUBLISHED) {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
  }

  return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
}

function getVisibilityState(hero) {
  if (hero.status !== HOME_SECTION_STATUSES.PUBLISHED) {
    return "draft";
  }

  const currentTimestamp = Date.now();

  const startsAt = hero.displaySchedule?.startsAt
    ? new Date(hero.displaySchedule.startsAt).getTime()
    : null;

  const endsAt = hero.displaySchedule?.endsAt
    ? new Date(hero.displaySchedule.endsAt).getTime()
    : null;

  if (startsAt && startsAt > currentTimestamp) {
    return "scheduled";
  }

  if (endsAt && endsAt <= currentTimestamp) {
    return "expired";
  }

  return "active";
}

function getVisibilityClassName(state) {
  if (state === "active") {
    return "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300";
  }

  if (state === "scheduled") {
    return "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300";
  }

  if (state === "expired") {
    return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  }

  return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
}

function formatDateTime(value, language) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(language === "th" ? "th-TH" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function HeroThumbnail({ hero, language, eager = false }) {
  const title = getLocalizedValue(hero.titleLineOne, language, hero.id);

  if (hero.desktopImage?.publicUrl) {
    return (
      <Image
        src={hero.desktopImage.publicUrl}
        alt={
          getLocalizedValue(hero.desktopImage.altText, language, title) || title
        }
        fill
        unoptimized
        loading={eager ? "eager" : "lazy"}
        sizes="144px"
        className="object-cover"
      />
    );
  }

  return (
    <FiImage
      aria-hidden="true"
      className="text-2xl text-slate-300 dark:text-slate-600"
    />
  );
}

export function HomeHeroesClient({
  initialItems,
  initialPagination,
  canCreate,
  canUpdate,
  canDelete,
  canPublish,
}) {
  const { t, i18n } = useTranslation("admin");

  const language = i18n.resolvedLanguage || i18n.language || "en";

  const [items, setItems] = useState(
    Array.isArray(initialItems) ? initialItems : [],
  );

  const [pagination, setPagination] = useState(initialPagination);

  const [draftFilters, setDraftFilters] = useState(INITIAL_FILTERS);

  const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);

  const [loading, setLoading] = useState(false);

  const [processingId, setProcessingId] = useState(null);

  const [formState, setFormState] = useState(null);

  const [orderDirty, setOrderDirty] = useState(false);

  const [savingOrder, setSavingOrder] = useState(false);

  async function loadItems(filters = appliedFilters) {
    setLoading(true);

    try {
      const result = await getHomeHeroes({
        limit: 100,

        status: filters.status || undefined,
      });

      setItems(result.items);

      setPagination(result.pagination);

      setOrderDirty(false);
    } catch (error) {
      toast.error(error?.message || t("home.heroes.messages.loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyFilters(event) {
    event.preventDefault();

    const nextFilters = {
      ...draftFilters,
    };

    setAppliedFilters(nextFilters);

    await loadItems(nextFilters);
  }

  async function handleResetFilters() {
    setDraftFilters(INITIAL_FILTERS);

    setAppliedFilters(INITIAL_FILTERS);

    await loadItems(INITIAL_FILTERS);
  }

  function handleCreate() {
    setFormState({
      mode: "create",

      hero: null,
    });
  }

  function handleEdit(hero) {
    setFormState({
      mode: "edit",

      hero,
    });
  }

  function handleSaved(savedHero) {
    setItems((currentItems) => {
      const exists = currentItems.some((item) => item.id === savedHero.id);

      const nextItems = exists
        ? currentItems.map((item) =>
            item.id === savedHero.id ? savedHero : item,
          )
        : [...currentItems, savedHero];

      return nextItems.sort(
        (firstHero, secondHero) =>
          Number(firstHero.sortOrder || 0) - Number(secondHero.sortOrder || 0),
      );
    });

    setFormState(null);
  }

  async function handleDelete(hero) {
    const title = getLocalizedValue(
      hero.titleLineOne,
      language,
      t("home.heroes.fallbackTitle"),
    );

    const confirmed = await Swal.fire(
      createDeleteConfirmation({
        darkMode: isDarkModeActive(),

        title: t("home.heroes.delete.title"),

        text: t("home.heroes.delete.description", {
          title,
        }),

        confirmText: t("home.heroes.delete.confirm"),

        cancelText: t("home.heroes.actions.cancel"),
      }),
    );

    if (!confirmed.isConfirmed) {
      return;
    }

    setProcessingId(hero.id);

    try {
      await deleteHomeHero(hero.id);

      setItems((currentItems) =>
        currentItems.filter((item) => item.id !== hero.id),
      );

      toast.success(t("home.heroes.messages.deleteSuccess"));
    } catch (error) {
      toast.error(error?.message || t("home.heroes.messages.deleteFailed"));
    } finally {
      setProcessingId(null);
    }
  }

  function moveHero(heroId, direction) {
    setItems((currentItems) => {
      const sortedItems = [...currentItems].sort(
        (firstHero, secondHero) =>
          Number(firstHero.sortOrder || 0) - Number(secondHero.sortOrder || 0),
      );

      const currentIndex = sortedItems.findIndex((hero) => hero.id === heroId);

      const nextIndex = currentIndex + direction;

      if (
        currentIndex < 0 ||
        nextIndex < 0 ||
        nextIndex >= sortedItems.length
      ) {
        return currentItems;
      }

      const nextItems = [...sortedItems];

      [nextItems[currentIndex], nextItems[nextIndex]] = [
        nextItems[nextIndex],
        nextItems[currentIndex],
      ];

      setOrderDirty(true);

      return nextItems.map((hero, index) => ({
        ...hero,

        sortOrder: (index + 1) * 10,
      }));
    });
  }

  async function handleSaveOrder() {
    if (!orderDirty || !items.length) {
      return;
    }

    setSavingOrder(true);

    try {
      await reorderHomeHeroes({
        items: items.map((hero) => ({
          heroId: hero.id,

          sortOrder: hero.sortOrder,
        })),
      });

      setOrderDirty(false);

      toast.success(t("home.heroes.messages.reorderSuccess"));
    } catch (error) {
      toast.error(error?.message || t("home.heroes.messages.reorderFailed"));
    } finally {
      setSavingOrder(false);
    }
  }

  const filtersActive = Boolean(appliedFilters.status);

  return (
    <>
      <div className="space-y-5">
        <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0979c4] dark:text-sky-400">
              {t("home.heroes.eyebrow")}
            </p>

            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              {t("home.heroes.title")}
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              {t("home.heroes.description")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {canUpdate && orderDirty ? (
              <button
                type="button"
                onClick={handleSaveOrder}
                disabled={savingOrder}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
              >
                {savingOrder ? (
                  <FiLoader aria-hidden="true" className="animate-spin" />
                ) : (
                  <FiSave aria-hidden="true" />
                )}

                {t("home.heroes.actions.saveOrder")}
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => loadItems()}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <FiRefreshCw
                aria-hidden="true"
                className={loading ? "animate-spin" : ""}
              />

              {t("home.heroes.actions.refresh")}
            </button>

            {canCreate ? (
              <button
                type="button"
                onClick={handleCreate}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0979c4] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#076aa9]"
              >
                <FiPlus aria-hidden="true" />

                {t("home.heroes.actions.add")}
              </button>
            ) : null}
          </div>
        </header>

        <form
          onSubmit={handleApplyFilters}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-end">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                {t("home.heroes.filters.status")}
              </span>

              <select
                value={draftFilters.status}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,

                    status: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition focus:border-[#0979c4] focus:ring-4 focus:ring-[#0979c4]/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="">{t("home.heroes.filters.allStatuses")}</option>

                {HOME_SECTION_STATUS_VALUES.map((status) => (
                  <option key={status} value={status}>
                    {t(`home.heroes.statuses.${status}`)}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0979c4] px-5 text-sm font-bold text-white transition hover:bg-[#076aa9] disabled:opacity-50"
            >
              <FiFilter aria-hidden="true" />

              {t("home.heroes.actions.filter")}
            </button>

            <button
              type="button"
              onClick={handleResetFilters}
              disabled={loading || (!filtersActive && !draftFilters.status)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <FiSearch aria-hidden="true" />

              {t("home.heroes.actions.clearFilters")}
            </button>
          </div>
        </form>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          {loading ? (
            <div className="flex min-h-72 items-center justify-center">
              <FiLoader
                aria-hidden="true"
                className="text-3xl text-[#0979c4] animate-spin"
              />
            </div>
          ) : items.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-left dark:border-slate-800 dark:bg-slate-900/60">
                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      {t("home.heroes.table.hero")}
                    </th>

                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      {t("home.heroes.table.status")}
                    </th>

                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      {t("home.heroes.table.visibility")}
                    </th>

                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      {t("home.heroes.table.schedule")}
                    </th>

                    <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                      {t("home.heroes.table.order")}
                    </th>

                    <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                      {t("home.heroes.table.actions")}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((hero, index) => {
                    const title = getLocalizedValue(
                      hero.titleLineOne,
                      language,
                      t("home.heroes.fallbackTitle"),
                    );

                    const secondLine = getLocalizedValue(
                      hero.titleLineTwo,
                      language,
                    );

                    const visibility = getVisibilityState(hero);

                    const processing = processingId === hero.id;

                    return (
                      <tr
                        key={hero.id}
                        className="border-b border-slate-100 last:border-b-0 dark:border-slate-800"
                      >
                        <td className="px-4 py-4">
                          <div className="flex min-w-[300px] items-center gap-4">
                            <div className="relative flex aspect-[16/9] w-36 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900">
                              <HeroThumbnail
                                hero={hero}
                                language={language}
                                eager={index === 0}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-bold text-slate-950 dark:text-white">
                                {title}
                              </p>

                              {secondLine ? (
                                <p className="mt-1 truncate text-sm text-slate-600 dark:text-slate-300">
                                  {secondLine}
                                </p>
                              ) : null}

                              <p className="mt-1 truncate text-xs text-slate-400">
                                {getLocalizedValue(
                                  hero.eyebrow,
                                  language,
                                  hero.id,
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={[
                              "inline-flex rounded-full px-3 py-1 text-xs font-bold",
                              getStatusClassName(hero.status),
                            ].join(" ")}
                          >
                            {t(`home.heroes.statuses.${hero.status}`)}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={[
                              "inline-flex rounded-full px-3 py-1 text-xs font-bold",
                              getVisibilityClassName(visibility),
                            ].join(" ")}
                          >
                            {t(`home.heroes.visibility.${visibility}`)}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="min-w-[190px] space-y-1 text-xs text-slate-500 dark:text-slate-400">
                            <p className="flex items-center gap-2">
                              <FiClock aria-hidden="true" />

                              {formatDateTime(
                                hero.displaySchedule?.startsAt,
                                language,
                              )}
                            </p>

                            <p className="pl-6">
                              {formatDateTime(
                                hero.displaySchedule?.endsAt,
                                language,
                              )}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="min-w-8 text-center text-sm font-bold text-slate-700 dark:text-slate-200">
                              {hero.sortOrder}
                            </span>

                            {canUpdate ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => moveHero(hero.id, -1)}
                                  disabled={index === 0}
                                  aria-label={t("home.heroes.actions.moveUp")}
                                  className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[#0979c4] hover:text-[#0979c4] disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-700"
                                >
                                  <FiArrowUp aria-hidden="true" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => moveHero(hero.id, 1)}
                                  disabled={index === items.length - 1}
                                  aria-label={t("home.heroes.actions.moveDown")}
                                  className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[#0979c4] hover:text-[#0979c4] disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-700"
                                >
                                  <FiArrowDown aria-hidden="true" />
                                </button>
                              </>
                            ) : null}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            {canUpdate ? (
                              <button
                                type="button"
                                onClick={() => handleEdit(hero)}
                                disabled={processing}
                                aria-label={t("home.heroes.actions.edit")}
                                className="flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[#0979c4] hover:text-[#0979c4] disabled:opacity-40 dark:border-slate-700"
                              >
                                <FiEdit3 aria-hidden="true" />
                              </button>
                            ) : null}

                            {canDelete ? (
                              <button
                                type="button"
                                onClick={() => handleDelete(hero)}
                                disabled={processing}
                                aria-label={t("home.heroes.actions.delete")}
                                className="flex size-10 items-center justify-center rounded-xl border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-40 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                              >
                                {processing ? (
                                  <FiLoader
                                    aria-hidden="true"
                                    className="animate-spin"
                                  />
                                ) : (
                                  <FiTrash2 aria-hidden="true" />
                                )}
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
              <span className="flex size-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-500">
                <FiImage aria-hidden="true" className="text-2xl" />
              </span>

              <h2 className="mt-4 text-lg font-extrabold text-slate-950 dark:text-white">
                {t("home.heroes.empty.title")}
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                {filtersActive
                  ? t("home.heroes.empty.filteredDescription")
                  : t("home.heroes.empty.description")}
              </p>

              {canCreate && !filtersActive ? (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0979c4] px-5 text-sm font-bold text-white transition hover:bg-[#076aa9]"
                >
                  <FiPlus aria-hidden="true" />

                  {t("home.heroes.actions.add")}
                </button>
              ) : null}
            </div>
          )}

          <footer className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span>
              {t("home.heroes.summary", {
                count: pagination?.count ?? items.length,
              })}
            </span>

            {orderDirty ? (
              <span className="font-semibold text-amber-600 dark:text-amber-300">
                {t("home.heroes.orderUnsaved")}
              </span>
            ) : null}
          </footer>
        </section>
      </div>

      {formState ? (
        <HomeHeroFormModal
          key={formState.hero?.id || "create-home-hero"}
          hero={formState.hero}
          canPublish={canPublish}
          onClose={() => setFormState(null)}
          onSaved={handleSaved}
        />
      ) : null}
    </>
  );
}
