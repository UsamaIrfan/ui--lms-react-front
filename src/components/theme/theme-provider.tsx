"use client";

import { PropsWithChildren } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

function ThemeProvider(props: PropsWithChildren) {
  return <TooltipProvider>{props.children}</TooltipProvider>;
}

export default ThemeProvider;
