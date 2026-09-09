"use client";

import { useEffect, useState } from "react";

import { getContactMessages } from "@/services/http/contact-messages.api";

export const MESSAGE_BADGE_REFRESH_EVENT = "hcs:contact-messages-updated";

export function refreshAdminMessageBadge() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(MESSAGE_BADGE_REFRESH_EVENT));
}

export function AdminMessageBadge() {
  const [unreadCount, setUnreadCount] = useState(null);

  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadUnreadCount() {
      try {
        const result = await getContactMessages({
          limit: 100,
          status: "new",

          signal: abortController.signal,
        });

        if (abortController.signal.aborted) {
          return;
        }

        setUnreadCount(result.items.length);

        setHasMore(Boolean(result.pagination?.hasMore));
      } catch (error) {
        if (
          abortController.signal.aborted ||
          error?.code === "ERR_CANCELED" ||
          error?.originalError?.code === "ERR_CANCELED"
        ) {
          return;
        }

        console.error("Unable to load unread contact message count:", error);
      }
    }

    function handleRefresh() {
      void loadUnreadCount();
    }

    void loadUnreadCount();

    const refreshInterval = window.setInterval(loadUnreadCount, 60_000);

    window.addEventListener(MESSAGE_BADGE_REFRESH_EVENT, handleRefresh);

    return () => {
      abortController.abort();

      window.clearInterval(refreshInterval);

      window.removeEventListener(MESSAGE_BADGE_REFRESH_EVENT, handleRefresh);
    };
  }, []);

  if (unreadCount === null || unreadCount <= 0) {
    return null;
  }

  return (
    <span
      aria-label={`${unreadCount} unread messages`}
      className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-extrabold leading-4 !text-white shadow-sm"
    >
      {hasMore ? `${unreadCount}+` : unreadCount}
    </span>
  );
}
