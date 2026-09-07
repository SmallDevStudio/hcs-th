"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { MediaAssetPicker } from "@/components/admin/media/MediaAssetPicker";
import { MEDIA_FOLDERS } from "@/constants/media";
import { getMediaAssets } from "@/services/http/media.api";

const DEFAULT_PAGINATION = {
  limit: 24,
  count: 0,
  hasMore: false,
  nextCursor: null,
};

function mergeUniqueAssets(currentAssets, incomingAssets) {
  const assetsById = new Map();

  for (const asset of [...currentAssets, ...incomingAssets]) {
    if (asset?.id) {
      assetsById.set(asset.id, asset);
    }
  }

  return [...assetsById.values()];
}

function createPickerLabels({ t, type, multiple }) {
  const documentPicker = type === "document";

  return {
    eyebrow: t(
      documentPicker
        ? "products.mediaPicker.documentEyebrow"
        : "products.mediaPicker.imageEyebrow",
    ),

    title: t(
      documentPicker
        ? "products.mediaPicker.documentTitle"
        : "products.mediaPicker.imageTitle",
    ),

    description: t(
      documentPicker
        ? "products.mediaPicker.documentDescription"
        : "products.mediaPicker.imageDescription",
    ),

    libraryTab: t("media.title"),

    uploadTab: t("media.actions.upload"),

    search: t("products.mediaPicker.search"),

    searchPlaceholder: t(
      documentPicker
        ? "products.mediaPicker.documentSearchPlaceholder"
        : "products.mediaPicker.imageSearchPlaceholder",
    ),

    selected: t("products.mediaPicker.selected"),

    loading: t("products.mediaPicker.loading"),

    empty: t(
      documentPicker
        ? "products.mediaPicker.emptyDocuments"
        : "products.mediaPicker.emptyImages",
    ),

    loadMore: t("products.mediaPicker.loadMore"),

    cancel: t("products.mediaPicker.cancel"),

    close: t("products.actions.close"),

    confirm: t(
      documentPicker
        ? "products.mediaPicker.useDocuments"
        : multiple
          ? "products.mediaPicker.useImages"
          : "products.mediaPicker.useImage",
    ),

    singleSelectionHint: t("products.mediaPicker.singleSelectionHint"),

    selectionHint: t("products.mediaPicker.multipleSelectionHint"),
  };
}

export function ProductMediaPickerController({
  type = "image",

  folder = MEDIA_FOLDERS.PRODUCTS,

  selectedIds = [],

  selectedAssets = [],

  excludedIds = [],

  multiple = false,

  maximumSelection = 1,

  onConfirm,
  onClose,
}) {
  const { t, i18n } = useTranslation("admin");

  const [assets, setAssets] = useState(() =>
    Array.isArray(selectedAssets)
      ? selectedAssets.filter((asset) => asset?.id)
      : [],
  );

  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);

  const [loading, setLoading] = useState(true);

  const [appliedSearch, setAppliedSearch] = useState("");

  useEffect(() => {
    const abortController = new AbortController();

    async function loadInitialAssets() {
      try {
        const result = await getMediaAssets({
          limit: 24,
          type,
          folder,
          usage: "all",
          signal: abortController.signal,
        });

        setAssets((currentAssets) =>
          mergeUniqueAssets(currentAssets, result.items),
        );

        setPagination(result.pagination);
      } catch (error) {
        if (
          error?.originalError?.code === "ERR_CANCELED" ||
          error?.code === "ERR_CANCELED"
        ) {
          return;
        }

        toast.error(error?.message || t("products.messages.mediaLoadFailed"));
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadInitialAssets();

    return () => {
      abortController.abort();
    };
  }, [folder, t, type]);

  async function requestAssets({ search = "", cursor, append = false } = {}) {
    setLoading(true);

    try {
      const result = await getMediaAssets({
        limit: 24,
        cursor,
        type,
        folder: folder,
        search: search || undefined,
        usage: "all",
      });

      setAssets((currentAssets) => {
        if (append) {
          return mergeUniqueAssets(currentAssets, result.items);
        }

        const retainedAssets = currentAssets.filter((asset) =>
          selectedIds.includes(asset.id),
        );

        return mergeUniqueAssets(retainedAssets, result.items);
      });

      setPagination(result.pagination);
    } catch (error) {
      toast.error(error?.message || t("products.messages.mediaLoadFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(search) {
    const normalizedSearch = search.trim();

    setAppliedSearch(normalizedSearch);

    await requestAssets({
      search: normalizedSearch,
    });
  }

  async function handleLoadMore() {
    if (loading || !pagination.nextCursor) {
      return;
    }

    await requestAssets({
      search: appliedSearch,
      cursor: pagination.nextCursor,
      append: true,
    });
  }

  function handleUploaded(uploadedAssets) {
    setAssets((currentAssets) =>
      mergeUniqueAssets(uploadedAssets, currentAssets),
    );

    toast.success(t("media.messages.uploadComplete"));
  }

  return (
    <MediaAssetPicker
      assets={assets}
      pagination={pagination}
      selectedIds={selectedIds}
      excludedIds={excludedIds}
      multiple={multiple}
      maximumSelection={maximumSelection}
      loading={loading}
      locale={i18n.resolvedLanguage || "en"}
      labels={createPickerLabels({
        t,
        type,
        multiple,
      })}
      upload={{
        mediaType: type,
        defaultFolder: folder,
        lockFolder: true,
      }}
      onSearch={handleSearch}
      onLoadMore={handleLoadMore}
      onUploaded={handleUploaded}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
