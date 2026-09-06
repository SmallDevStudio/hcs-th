"use client";

import { TbArrowLeft, TbArrowRight } from "react-icons/tb";

export function ProductPagination({ t, currentPage, totalPages, onChange }) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label={t("products.breadcrumbProducts")}
      className="mt-7 flex flex-wrap items-center justify-center gap-2"
    >
      <button
        type="button"
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label={t("products.pagination.previous")}
        className="flex size-10 items-center justify-center rounded border border-[#cbdbe7] bg-white text-[#12324d] transition hover:border-primary hover:text-primary disabled:opacity-35 dark:border-border dark:bg-surface dark:text-white"
      >
        <TbArrowLeft aria-hidden="true" />
      </button>

      {Array.from(
        {
          length: totalPages,
        },
        (_, index) => index + 1,
      ).map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onChange(page)}
          aria-label={t("products.pagination.page", {
            page,
          })}
          aria-current={page === currentPage ? "page" : undefined}
          className={[
            "flex size-10 items-center justify-center rounded border text-sm font-bold transition",
            page === currentPage
              ? "border-primary bg-primary !text-white"
              : "border-[#cbdbe7] bg-white text-[#12324d] hover:border-primary hover:text-primary dark:border-border dark:bg-surface dark:text-white",
          ].join(" ")}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label={t("products.pagination.next")}
        className="flex size-10 items-center justify-center rounded border border-[#cbdbe7] bg-white text-[#12324d] transition hover:border-primary hover:text-primary disabled:opacity-35 dark:border-border dark:bg-surface dark:text-white"
      >
        <TbArrowRight aria-hidden="true" />
      </button>
    </nav>
  );
}
