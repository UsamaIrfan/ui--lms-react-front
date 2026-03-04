"use client";

import { useState, useCallback } from "react";
import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <header
      data-testid="marketing-header"
      className="sticky top-0 z-50 border-b border-stroke-soft-200 bg-bg-white-0/80 backdrop-blur-lg"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="text-title-h5 font-bold text-text-strong-950"
          aria-label="EduFlow home"
        >
          EduFlow
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-lg px-3 py-2 text-label-sm text-text-sub-600",
                "transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="outline" size="sm" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/sign-up">Start Free Trial</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className={cn(
            "inline-flex size-11 items-center justify-center rounded-lg md:hidden",
            "text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950",
            "focus-visible:outline-none focus-visible:shadow-button-important-focus"
          )}
          onClick={toggleMenu}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <svg
            className="size-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <nav
        id="mobile-menu"
        className={cn(
          "overflow-hidden border-t border-stroke-soft-200 md:hidden",
          "transition-[max-height] duration-300 ease-in-out",
          mobileMenuOpen ? "max-h-96" : "max-h-0 border-t-0"
        )}
        aria-label="Mobile"
      >
        <div className="space-y-1 px-4 pb-4 pt-2">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "block min-h-11 rounded-lg px-3 py-2.5 text-label-sm text-text-sub-600",
                "transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
              )}
              onClick={closeMenu}
            >
              {label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-3">
            <Button variant="outline" asChild>
              <Link href="/sign-in" onClick={closeMenu}>
                Sign In
              </Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up" onClick={closeMenu}>
                Start Free Trial
              </Link>
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
}
