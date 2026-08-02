"use client";

import { usePreferences } from "@/contexts/PreferencesContext";

/**
 * Hook for consuming user application preferences (dateFormat, itemsPerPage).
 * Replaces direct use of useSettings for these two fields.
 */
export function useUserPreferences() {
  const { preferences, loaded, loading, fetchPreferences, updatePreferences } = usePreferences();

  return {
    dateFormat: preferences.dateFormat,
    itemsPerPage: preferences.itemsPerPage,
    preferences,
    loaded,
    loading,
    fetchPreferences,
    updatePreferences,
  };
}
