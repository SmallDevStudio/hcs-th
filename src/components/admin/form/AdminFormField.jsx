"use client";

import { useId } from "react";
import { useController } from "react-hook-form";

function FieldError({ id, message }) {
  if (!message) {
    return null;
  }

  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400"
    >
      {message}
    </p>
  );
}

export function AdminFormField({
  control,
  name,
  label,
  hint = "",
  placeholder = "",
  type = "text",
  multiline = false,
  rows = 4,
  required = false,
  disabled = false,
  className = "",
  inputClassName = "",
  ...inputProps
}) {
  const generatedId = useId();
  const inputId = `field-${generatedId.replaceAll(":", "")}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const {
    field,
    fieldState: { error },
  } = useController({
    control,
    name,
  });

  const describedBy = [error?.message ? errorId : "", hint ? hintId : ""]
    .filter(Boolean)
    .join(" ");

  const sharedClassName = [
    "w-full rounded-xl border bg-white px-4 text-sm text-slate-950 outline-none transition",
    "placeholder:text-slate-400",
    "focus:border-[#0979c4] focus:ring-4 focus:ring-[#0979c4]/10",
    "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
    "dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500",
    "dark:disabled:bg-slate-800 dark:disabled:text-slate-500",
    error
      ? "border-red-400 dark:border-red-700"
      : "border-slate-200 dark:border-slate-700",
    multiline ? "min-h-28 resize-y py-3" : "h-11",
    inputClassName,
  ].join(" ");

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200"
      >
        {label}

        {required ? (
          <span className="ml-1 text-red-500" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      {multiline ? (
        <textarea
          {...field}
          {...inputProps}
          id={inputId}
          rows={rows}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          value={field.value ?? ""}
          className={sharedClassName}
        />
      ) : (
        <input
          {...field}
          {...inputProps}
          id={inputId}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          value={field.value ?? ""}
          className={sharedClassName}
        />
      )}

      <FieldError id={errorId} message={error?.message} />

      {hint ? (
        <p
          id={hintId}
          className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
