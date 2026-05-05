"use client";

import { useEffect, useRef } from "react";

export function useUnsavedChangesGuard(enabled: boolean, message: string) {
  const enabledRef = useRef(enabled);
  const messageRef = useRef(message);
  const hasPushedStateRef = useRef(false);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  useEffect(() => {
    if (!enabled || hasPushedStateRef.current) {
      return;
    }

    window.history.pushState({ __unsaved_changes_guard__: true }, "", window.location.href);
    hasPushedStateRef.current = true;
  }, [enabled]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!enabledRef.current) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!enabledRef.current || event.defaultPrevented || event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href]");

      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank" || anchor.download) {
        return;
      }

      const href = anchor.getAttribute("href");

      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      const currentUrl = new URL(window.location.href);
      const nextUrl = new URL(anchor.href, window.location.href);

      if (currentUrl.href === nextUrl.href) {
        return;
      }

      const shouldLeave = window.confirm(messageRef.current);

      if (!shouldLeave) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (!enabledRef.current || !hasPushedStateRef.current) {
        return;
      }

      const shouldLeave = window.confirm(messageRef.current);

      if (shouldLeave) {
        window.removeEventListener("popstate", handlePopState);
        window.history.back();
        return;
      }

      window.history.forward();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
}
