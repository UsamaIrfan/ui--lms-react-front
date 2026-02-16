// AlignUI cn utility
import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

export const twMergeConfig = {
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "title-h1",
            "title-h2",
            "title-h3",
            "title-h4",
            "title-h5",
            "title-h6",
            "label-xl",
            "label-lg",
            "label-md",
            "label-sm",
            "label-xs",
            "paragraph-xl",
            "paragraph-lg",
            "paragraph-md",
            "paragraph-sm",
            "paragraph-xs",
            "subheading-md",
            "subheading-sm",
            "subheading-xs",
            "subheading-2xs",
            "doc-label",
            "doc-paragraph",
          ],
        },
      ],
    },
  },
};

const twMerge = extendTailwindMerge(twMergeConfig);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
