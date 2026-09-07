import { PublicFooter } from "@/components/public/layout/PublicFooter";
import { PublicHeader } from "@/components/public/layout/PublicHeader";

export function PublicSiteShell({ locale, settings, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-md bg-primary px-4 py-3 font-semibold text-primary-foreground transition focus:translate-y-0"
      >
        Skip to content
      </a>

      <PublicHeader locale={locale} settings={settings} />

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <PublicFooter locale={locale} settings={settings} />
    </div>
  );
}
