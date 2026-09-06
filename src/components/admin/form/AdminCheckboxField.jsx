"use client";

import { useId } from "react";
import { useController } from "react-hook-form";
import { FiCheck } from "react-icons/fi";

export function AdminCheckboxField({
  control,
  name,
  label,
  description = "",
  disabled = false,
  className = "",
}) {
  const generatedId = useId();
  const inputId = `checkbox-${generatedId.replaceAll(":", "")}`;

  const controller = useController({
    control,
    name,
  });

  const fieldName = controller.field.name;
  const fieldValue = controller.field.value;
  const handleBlur = controller.field.onBlur;
  const handleChange = controller.field.onChange;
  const errorMessage = controller.fieldState.error?.message;

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className={[
          "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition",
          "hover:border-[#0979c4]/50 hover:bg-[#0979c4]/5",
          "dark:hover:border-sky-700 dark:hover:bg-sky-950/20",
          errorMessage
            ? "border-red-400 dark:border-red-700"
            : "border-slate-200 dark:border-slate-700",
          disabled ? "cursor-not-allowed opacity-60" : "",
        ].join(" ")}
      >
        <input
          id={inputId}
          name={fieldName}
          type="checkbox"
          checked={Boolean(fieldValue)}
          disabled={disabled}
          onBlur={handleBlur}
          onChange={(event) => handleChange(event.target.checked)}
          className="peer sr-only"
        />

        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-transparent transition peer-checked:border-[#0979c4] peer-checked:bg-[#0979c4] peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-[#0979c4]/20 dark:border-slate-600 dark:bg-slate-900">
          <FiCheck className="text-sm" aria-hidden="true" />
        </span>

        <span>
          <span className="block text-sm font-semibold text-slate-900 dark:text-white">
            {label}
          </span>

          {description ? (
            <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
              {description}
            </span>
          ) : null}
        </span>
      </label>

      {errorMessage ? (
        <p
          role="alert"
          className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400"
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
