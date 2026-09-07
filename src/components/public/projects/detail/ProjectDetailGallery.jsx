"use client";

import { useState } from "react";
import Image from "next/image";
import { TbChevronLeft, TbChevronRight, TbPhotoOff } from "react-icons/tb";

import { getLocalizedValue } from "@/components/public/projects/project-catalog.utils";

export function ProjectDetailGallery({ project, locale, t }) {
  const projectName = getLocalizedValue(project.name, locale, project.slug);

  const images = [
    project.coverImage,
    ...(Array.isArray(project.galleryImages) ? project.galleryImages : []),
  ].filter(
    (image, index, currentImages) =>
      image?.publicUrl &&
      currentImages.findIndex(
        (currentImage) =>
          currentImage?.id === image.id ||
          currentImage?.publicUrl === image.publicUrl,
      ) === index,
  );

  const [activeIndex, setActiveIndex] = useState(0);

  const activeImage = images[activeIndex];

  function showPreviousImage() {
    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? images.length - 1 : currentIndex - 1,
    );
  }

  function showNextImage() {
    setActiveIndex((currentIndex) =>
      currentIndex === images.length - 1 ? 0 : currentIndex + 1,
    );
  }

  if (!activeImage) {
    return (
      <div className="flex min-h-[420px] items-center justify-center bg-[#eaf1f6] text-muted-foreground dark:bg-[#13202b]">
        <div className="flex flex-col items-center gap-3">
          <TbPhotoOff aria-hidden="true" className="size-10" />

          <span className="text-sm font-semibold">
            {t("projects.detail.noImage")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative min-h-[390px] overflow-hidden bg-[#eaf1f6] sm:min-h-[500px] lg:min-h-[610px]">
        <Image
          src={activeImage.publicUrl}
          alt={getLocalizedValue(activeImage.altText, locale, projectName)}
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#041b2d]/45 via-transparent to-transparent" />

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={showPreviousImage}
              aria-label={t("projects.detail.previousImage")}
              className="absolute left-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-[#041b2d]/50 text-white backdrop-blur-sm transition hover:bg-primary sm:left-7"
            >
              <TbChevronLeft aria-hidden="true" className="size-6" />
            </button>

            <button
              type="button"
              onClick={showNextImage}
              aria-label={t("projects.detail.nextImage")}
              className="absolute right-4 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-[#041b2d]/50 text-white backdrop-blur-sm transition hover:bg-primary sm:right-7"
            >
              <TbChevronRight aria-hidden="true" className="size-6" />
            </button>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div
          role="list"
          aria-label={t("projects.detail.galleryLabel")}
          className="mt-3 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((image, index) => (
            <button
              key={image.id || image.publicUrl}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={t("projects.detail.selectImage", {
                number: index + 1,
              })}
              aria-current={index === activeIndex ? "true" : undefined}
              className={`relative aspect-[16/10] w-28 shrink-0 overflow-hidden rounded border-2 transition sm:w-36 ${
                index === activeIndex
                  ? "border-primary"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={image.publicUrl}
                alt=""
                fill
                unoptimized
                sizes="144px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
