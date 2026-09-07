export function StandardsCommitmentSection({ content }) {
  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="container-hcs">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.65fr)] lg:items-start lg:gap-12">
          <header>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-primary">
              {content.eyebrow}
            </p>

            <h2 className="mt-1 max-w-lg text-2xl font-extrabold uppercase leading-[1.08] tracking-[-0.025em] text-[#071d33] sm:text-[28px]">
              {content.title}
            </h2>
          </header>

          <div className="grid gap-5 border-t border-border pt-6 sm:grid-cols-2 sm:gap-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <p className="text-sm leading-6 text-slate-600">
              {content.descriptionOne}
            </p>

            <p className="text-sm leading-6 text-slate-600">
              {content.descriptionTwo}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
