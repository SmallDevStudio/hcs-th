"use client";

import { useController, useFieldArray } from "react-hook-form";
import { FiPlus, FiTrash2 } from "react-icons/fi";

import { AdminFormField } from "@/components/admin/form/AdminFormField";
import { LocalizedFieldGroup } from "@/components/admin/form/LocalizedFieldGroup";

function createItemId(prefix) {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}`;
}

function EmptyState({ children }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 px-4 py-7 text-center text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">
      {children}
    </div>
  );
}

function AddButton({ onClick, disabled, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#0979c4]/30 px-4 text-sm font-bold text-[#0979c4] transition hover:bg-[#0979c4]/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sky-700 dark:text-sky-300"
    >
      <FiPlus aria-hidden="true" />

      {children}
    </button>
  );
}

function RemoveButton({ onClick, disabled, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-red-200 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
    >
      <FiTrash2 aria-hidden="true" />
    </button>
  );
}

function normalizeList(value) {
  return Array.isArray(value) ? value : [];
}

export function LocalizedStringListField({
  control,
  name,
  label,
  itemLabel,
  emptyText,
  addText,
  removeText,
  maximumItems = 30,
  maximumLength = 500,
  disabled = false,
}) {
  const englishController = useController({
    control,
    name: `${name}.en`,
  });

  const thaiController = useController({
    control,
    name: `${name}.th`,
  });

  const englishValues = normalizeList(englishController.field.value);

  const thaiValues = normalizeList(thaiController.field.value);

  const updateEnglish = englishController.field.onChange;

  const updateThai = thaiController.field.onChange;

  const itemCount = Math.max(englishValues.length, thaiValues.length);

  function updateItem(locale, index, value) {
    if (locale === "en") {
      const nextValues = [...englishValues];

      while (nextValues.length <= index) {
        nextValues.push("");
      }

      nextValues[index] = value;

      updateEnglish(nextValues);

      return;
    }

    const nextValues = [...thaiValues];

    while (nextValues.length <= index) {
      nextValues.push("");
    }

    nextValues[index] = value;

    updateThai(nextValues);
  }

  function addItem() {
    if (itemCount >= maximumItems) {
      return;
    }

    updateEnglish([...englishValues, ""]);

    updateThai([...thaiValues, ""]);
  }

  function removeItem(index) {
    updateEnglish(englishValues.filter((_, itemIndex) => itemIndex !== index));

    updateThai(thaiValues.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
            {label}
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            {itemCount} / {maximumItems}
          </p>
        </div>

        <AddButton
          onClick={addItem}
          disabled={disabled || itemCount >= maximumItems}
        >
          {addText}
        </AddButton>
      </div>

      <div className="mt-5 space-y-4">
        {itemCount ? (
          Array.from({
            length: itemCount,
          }).map((_, index) => (
            <article
              key={`${name}-${index}`}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-900/50"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {itemLabel} {index + 1}
                </p>

                <RemoveButton
                  onClick={() => removeItem(index)}
                  disabled={disabled}
                  label={removeText}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    EN
                  </span>

                  <textarea
                    value={englishValues[index] || ""}
                    onChange={(event) =>
                      updateItem("en", index, event.target.value)
                    }
                    disabled={disabled}
                    rows={3}
                    maxLength={maximumLength}
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition focus:border-[#0979c4] focus:ring-4 focus:ring-[#0979c4]/10 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:disabled:bg-slate-800"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    TH
                  </span>

                  <textarea
                    value={thaiValues[index] || ""}
                    onChange={(event) =>
                      updateItem("th", index, event.target.value)
                    }
                    disabled={disabled}
                    rows={3}
                    maxLength={maximumLength}
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-950 outline-none transition focus:border-[#0979c4] focus:ring-4 focus:ring-[#0979c4]/10 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:disabled:bg-slate-800"
                  />
                </label>
              </div>
            </article>
          ))
        ) : (
          <EmptyState>{emptyText}</EmptyState>
        )}
      </div>
    </section>
  );
}

export function ProductSpecificationsField({
  control,
  labels,
  disabled = false,
  maximumItems = 80,
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "specifications",
    keyName: "_formKey",
  });

  function addItem() {
    if (fields.length >= maximumItems) {
      return;
    }

    append({
      id: createItemId("specification"),

      label: {
        en: "",
        th: "",
      },

      value: {
        en: "",
        th: "",
      },

      sortOrder: (fields.length + 1) * 10,
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
            {labels.title}
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            {fields.length} / {maximumItems}
          </p>
        </div>

        <AddButton
          onClick={addItem}
          disabled={disabled || fields.length >= maximumItems}
        >
          {labels.add}
        </AddButton>
      </div>

      <div className="mt-5 space-y-4">
        {fields.length ? (
          fields.map((field, index) => (
            <article
              key={field._formKey}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-900/50"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {labels.item} {index + 1}
                </p>

                <RemoveButton
                  onClick={() => remove(index)}
                  disabled={disabled}
                  label={labels.remove}
                />
              </div>

              <div className="space-y-4">
                <LocalizedFieldGroup
                  control={control}
                  name={`specifications.${index}.label`}
                  label={labels.label}
                  required
                  maxLength={160}
                />

                <LocalizedFieldGroup
                  control={control}
                  name={`specifications.${index}.value`}
                  label={labels.value}
                  required
                  multiline
                  rows={3}
                  maxLength={1000}
                />

                <AdminFormField
                  control={control}
                  name={`specifications.${index}.sortOrder`}
                  type="number"
                  min={0}
                  max={999999}
                  label={labels.sortOrder}
                />
              </div>
            </article>
          ))
        ) : (
          <EmptyState>{labels.empty}</EmptyState>
        )}
      </div>
    </section>
  );
}

export function ProductFinishesField({
  control,
  labels,
  disabled = false,
  maximumItems = 40,
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "finishes",
    keyName: "_formKey",
  });

  function addItem() {
    if (fields.length >= maximumItems) {
      return;
    }

    append({
      id: createItemId("finish"),

      code: "",

      name: {
        en: "",
        th: "",
      },

      sortOrder: (fields.length + 1) * 10,
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
            {labels.title}
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            {fields.length} / {maximumItems}
          </p>
        </div>

        <AddButton
          onClick={addItem}
          disabled={disabled || fields.length >= maximumItems}
        >
          {labels.add}
        </AddButton>
      </div>

      <div className="mt-5 space-y-4">
        {fields.length ? (
          fields.map((field, index) => (
            <article
              key={field._formKey}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-900/50"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {labels.item} {index + 1}
                </p>

                <RemoveButton
                  onClick={() => remove(index)}
                  disabled={disabled}
                  label={labels.remove}
                />
              </div>

              <div className="space-y-4">
                <AdminFormField
                  control={control}
                  name={`finishes.${index}.code`}
                  label={labels.code}
                  placeholder="SSS"
                  required
                  maxLength={30}
                />

                <LocalizedFieldGroup
                  control={control}
                  name={`finishes.${index}.name`}
                  label={labels.name}
                  required
                  maxLength={120}
                />

                <AdminFormField
                  control={control}
                  name={`finishes.${index}.sortOrder`}
                  type="number"
                  min={0}
                  max={999999}
                  label={labels.sortOrder}
                />
              </div>
            </article>
          ))
        ) : (
          <EmptyState>{labels.empty}</EmptyState>
        )}
      </div>
    </section>
  );
}

export function ProductStandardsField({
  control,
  labels,
  disabled = false,
  maximumItems = 40,
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "standards",
    keyName: "_formKey",
  });

  function addItem() {
    if (fields.length >= maximumItems) {
      return;
    }

    append({
      id: createItemId("standard"),

      name: "",

      classification: "",

      conformityReference: "",

      sortOrder: (fields.length + 1) * 10,
    });
  }

  return (
    <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
            {labels.title}
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            {fields.length} / {maximumItems}
          </p>
        </div>

        <AddButton
          onClick={addItem}
          disabled={disabled || fields.length >= maximumItems}
        >
          {labels.add}
        </AddButton>
      </div>

      <div className="mt-5 space-y-4">
        {fields.length ? (
          fields.map((field, index) => (
            <article
              key={field._formKey}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-900/50"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {labels.item} {index + 1}
                </p>

                <RemoveButton
                  onClick={() => remove(index)}
                  disabled={disabled}
                  label={labels.remove}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <AdminFormField
                  control={control}
                  name={`standards.${index}.name`}
                  label={labels.name}
                  placeholder="EN 1154"
                  required
                  maxLength={100}
                />

                <AdminFormField
                  control={control}
                  name={`standards.${index}.classification`}
                  label={labels.classification}
                  placeholder="4 8 3/6 1 1 3"
                  maxLength={200}
                />

                <AdminFormField
                  control={control}
                  name={`standards.${index}.conformityReference`}
                  label={labels.conformityReference}
                  placeholder="1121-CPR-AD5001"
                  maxLength={160}
                />

                <AdminFormField
                  control={control}
                  name={`standards.${index}.sortOrder`}
                  type="number"
                  min={0}
                  max={999999}
                  label={labels.sortOrder}
                />
              </div>
            </article>
          ))
        ) : (
          <EmptyState>{labels.empty}</EmptyState>
        )}
      </div>
    </section>
  );
}
