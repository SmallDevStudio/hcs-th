"use client";

import { useController } from "react-hook-form";

export function AdminCheckboxField({
  control,
  name,
  label,
  description = "",
  disabled = false,
  className = "",
}) {
  const controller = useController({
    control,
    name,
    defaultValue: false,
  });

  const fieldName = controller.field.name;
  const fieldValue = controller.field.value;
  const handleBlur = controller.field.onBlur;
  const handleChange = controller.field.onChange;
  const errorMessage = controller.fieldState.error?.message;

  const checked = Boolean(fieldValue);

  return (
    <div className={className}>
      <label
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
          name={fieldName}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onBlur={handleBlur}
          onChange={(event) => {
            handleChange(event.currentTarget.checked);
          }}
          className={[
            "mt-0.5 size-5 shrink-0 cursor-pointer rounded-md",
            "border border-slate-300 bg-white accent-[#0979c4]",
            "focus:outline-none focus:ring-4 focus:ring-[#0979c4]/20",
            "disabled:cursor-not-allowed",
            "dark:border-slate-600 dark:bg-slate-900",
          ].join(" ")}
        />

        <span className="min-w-0">
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
