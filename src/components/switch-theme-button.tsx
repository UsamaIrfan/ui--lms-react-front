"use client";

import { useTheme } from "next-themes";
import { RiMoonLine, RiSunLine } from "@remixicon/react";
import { Button } from "@/components/ui/button";

const ThemeSwitchButton = () => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <RiSunLine className="h-[1.4rem] w-[1.4rem]" />
      ) : (
        <RiMoonLine className="h-[1.4rem] w-[1.4rem]" />
      )}
    </Button>
  );
};

export default ThemeSwitchButton;
