import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import * as NotificationService from "./NotificationService";

type EnabledMap = Record<string, boolean>;

interface NotificationPrefsContextValue {
  enabled: EnabledMap;
  toggle: (drawTypeId: string) => void;
  setEnabled: (drawTypeId: string, enabled: boolean) => void;
}

const NotificationPrefsContext = createContext<NotificationPrefsContextValue | null>(null);

export function NotificationPrefsProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState<EnabledMap>(
    () => NotificationService.getEnabledMap(),
  );

  useEffect(() => {
    return NotificationService.subscribe(setEnabledState);
  }, []);

  const setEnabled = useCallback((drawTypeId: string, value: boolean) => {
    NotificationService.setDrawTypeEnabled(drawTypeId, value).catch(() => {});
  }, []);

  const toggle = useCallback((drawTypeId: string) => {
    const next = !NotificationService.isEnabled(drawTypeId);
    NotificationService.setDrawTypeEnabled(drawTypeId, next).catch(() => {});
  }, []);

  const value = useMemo<NotificationPrefsContextValue>(
    () => ({ enabled, toggle, setEnabled }),
    [enabled, toggle, setEnabled],
  );

  return (
    <NotificationPrefsContext.Provider value={value}>
      {children}
    </NotificationPrefsContext.Provider>
  );
}

export function useNotificationPrefs(): NotificationPrefsContextValue {
  const ctx = useContext(NotificationPrefsContext);
  if (!ctx) {
    throw new Error("useNotificationPrefs must be used within NotificationPrefsProvider");
  }
  return ctx;
}
