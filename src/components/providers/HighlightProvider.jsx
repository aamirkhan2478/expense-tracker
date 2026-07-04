"use client";

import { HighlightProvider } from "@/hooks/useHighlight";

export default function HighlightProviderWrapper({ children }) {
  return <HighlightProvider>{children}</HighlightProvider>;
}
