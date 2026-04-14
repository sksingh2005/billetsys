import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-header-bg)] text-white hover:bg-[var(--color-primary-dark)] [a]:text-white [a]:hover:text-white",
        outline:
          "border-[var(--color-header-bg)] bg-[var(--color-header-bg)] text-white hover:bg-[var(--color-primary-dark)] hover:text-white aria-expanded:bg-[var(--color-primary-dark)] aria-expanded:text-white [a]:text-white [a]:hover:text-white",
        secondary:
          "bg-[var(--color-header-bg)] text-white hover:bg-[var(--color-primary-dark)] aria-expanded:bg-[var(--color-primary-dark)] aria-expanded:text-white [a]:text-white [a]:hover:text-white",
        ghost:
          "bg-[var(--color-header-bg)] text-white hover:bg-[var(--color-primary-dark)] hover:text-white aria-expanded:bg-[var(--color-primary-dark)] aria-expanded:text-white [a]:text-white [a]:hover:text-white",
        destructive:
          "bg-[var(--color-header-bg)] text-white hover:bg-[var(--color-primary-dark)] focus-visible:border-[var(--color-header-bg)] focus-visible:ring-[var(--color-header-bg)] [a]:text-white [a]:hover:text-white",
        link: "bg-[var(--color-header-bg)] text-white hover:bg-[var(--color-primary-dark)] no-underline [a]:text-white [a]:hover:text-white",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-xs": "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
