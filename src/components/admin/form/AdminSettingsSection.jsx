export function AdminSettingsSection({
  title,
  description = "",
  children,
  className = "",
}) {
  return (
    <section
      className={[
        "rounded-2xl border border-slate-200 bg-white shadow-sm",
        "dark:border-slate-800 dark:bg-[#071522]",
        className,
      ].join(" ")}
    >
      <header className="border-b border-slate-200 px-5 py-5 dark:border-slate-800 sm:px-6">
        <h2 className="text-base font-extrabold text-slate-950 dark:text-white">
          {title}
        </h2>

        {description ? (
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        ) : null}
      </header>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}
