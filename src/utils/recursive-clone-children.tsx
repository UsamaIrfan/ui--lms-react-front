// AlignUI recursiveCloneChildren utility
"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

/**
 * Recursively clones React children, matching by displayName and applying shared props.
 * Works with both regular components and Radix UI's Slot (asChild) pattern.
 *
 * @param children - React children to process
 * @param targetDisplayNames - Array of display names to match against
 * @param propsToPass - Props to pass to matched children
 * @param asChild - Whether to use Slot pattern
 * @returns Cloned children with applied props
 */
export function recursiveCloneChildren(
  children: React.ReactNode,
  targetDisplayNames: string[],
  propsToPass: Record<string, unknown>,
  asChild?: boolean
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) {
      return child;
    }

    const childElement = child as React.ReactElement<Record<string, unknown>>;

    // Check if this child matches one of the target display names
    const displayName =
      typeof childElement.type === "function" ||
      typeof childElement.type === "object"
        ? (childElement.type as { displayName?: string }).displayName
        : undefined;

    const isTarget = displayName && targetDisplayNames.includes(displayName);

    if (isTarget) {
      // Merge props
      return React.cloneElement(childElement, {
        ...propsToPass,
        ...childElement.props,
      });
    }

    // If asChild and it's a Slot, process its children
    if (asChild && childElement.type === Slot) {
      const slotChildren = (
        childElement.props as { children?: React.ReactNode }
      ).children;
      return React.cloneElement(childElement, {
        ...childElement.props,
        children: recursiveCloneChildren(
          slotChildren,
          targetDisplayNames,
          propsToPass,
          false
        ),
      });
    }

    // Recurse into children
    const nestedChildren = (
      childElement.props as { children?: React.ReactNode }
    ).children;
    if (nestedChildren) {
      return React.cloneElement(childElement, {
        ...childElement.props,
        children: recursiveCloneChildren(
          nestedChildren,
          targetDisplayNames,
          propsToPass,
          false
        ),
      });
    }

    return child;
  });
}
