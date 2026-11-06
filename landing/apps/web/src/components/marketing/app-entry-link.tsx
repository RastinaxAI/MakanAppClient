"use client";

import {
  createContext,
  useContext,
  type ComponentProps,
  type ReactNode,
} from "react";

const AppUrl = createContext("https://app.makanapp.org");

export function AppEntryProvider({
  url,
  children,
}: {
  url?: string;
  children: ReactNode;
}) {
  return (
    <AppUrl.Provider value={url || "https://app.makanapp.org"}>
      {children}
    </AppUrl.Provider>
  );
}

export function AppEntryLink(props: Omit<ComponentProps<"a">, "href">) {
  return <a {...props} href={useContext(AppUrl)} />;
}
