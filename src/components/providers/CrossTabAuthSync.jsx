"use client";

import { useCrossTabAuthSync } from "@/hooks/useAuth";

/**
 * Invisible component that listens for logout events from other browser tabs.
 * Place this once at the root of your app (inside providers).
 */
export default function CrossTabAuthSync() {
  useCrossTabAuthSync();
  return null;
}
