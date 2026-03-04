import type { ReactNode } from "react";
import { MarketingHeader } from "./marketing-header";
import { MarketingFooter } from "./marketing-footer";

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-white-0">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
