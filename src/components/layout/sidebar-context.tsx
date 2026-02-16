"use client";

import { useState, useCallback, createContext, useContext } from "react";

type SidebarContextType = {
  isOpen: boolean;
  isCollapsed: boolean;
  toggle: () => void;
  close: () => void;
  setCollapsed: (collapsed: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  isCollapsed: false,
  toggle: () => {},
  close: () => {},
  setCollapsed: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);
  const handleSetCollapsed = useCallback(
    (collapsed: boolean) => setIsCollapsed(collapsed),
    []
  );

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        isCollapsed,
        toggle,
        close,
        setCollapsed: handleSetCollapsed,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
