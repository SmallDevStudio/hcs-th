"use client";

import { useId } from "react";
import { useController } from "react-hook-form";

export function AdminColorField({
  control,
  name,
  label,
  hint = "",
  disabled = false,
  className = "",
}) {
  const generatedId = useId();
  const inputId = `color-${generatedId.replaceAll(":", "")}`;

  const controller = useController({
    control,
    name,
  });

  const fieldName = controller.field.name;
  const fieldValue = controller.field.value ?? "";
  const handleBlur = controller.field.onBlur;
  const handleChange = controller.field.onChange;
  const errorMessage = controller.fieldState.error?.message;

  const colorValue =
    typeof fieldValue === "string" && /^#[0-9a-fA-F]{6}$/.test(fieldValue)
      ? fieldValue
      : "#000000";

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
      >
        {label}
      </label>

      <div
        className={[
          "flex h-11 items-center gap-3 rounded-xl border bg-white px-3 transition",
          "focus-within:border-[#0979c4] focus-within:ring-4 focus-within:ring-[#0979c4]/10",
          "dark:bg-slate-900",
          errorMessage
            ? "border-red-400 dark:border-red-700"
            : "border-slate-200 dark:border-slate-700",
        ].join(" ")}
      >
        <input
          id={`${inputId}-picker`}
          type="color"
          disabled={disabled}
          value={colorValue}
          onBlur={handleBlur}
          onChange={(event) => handleChange(event.target.value)}
          aria-label={label}
          className="size-7 cursor-pointer rounded-md border-0 bg-transparent p-0 disabled:cursor-not-allowed"
        />

        <input
          id={inputId}
          name={fieldName}
          type="text"
          disabled={disabled}
          value={fieldValue}
          onBlur={handleBlur}
          onChange={handleChange}
          maxLength={7}
          placeholder="#0979c4"
          aria-invalid={Boolean(errorMessage)}
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold uppercase text-slate-900 outline-none dark:text-white"
        />
      </div>

      {errorMessage ? (
        <p
          role="alert"
          className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400"
        >
          {errorMessage}
        </p>
      ) : null}

      {hint ? (
        <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
