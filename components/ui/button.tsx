import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#1d1d1f] text-white rounded-full hover:bg-[#424245] active:scale-[0.97] shadow-sm",
        blue:
          "bg-[#0071e3] text-white rounded-full hover:bg-[#0077ed] active:scale-[0.97] shadow-sm",
        secondary:
          "bg-[#f5f5f7] text-[#1d1d1f] rounded-full hover:bg-[#e8e8ed] active:scale-[0.97]",
        outline:
          "border border-[#d2d2d7] bg-white text-[#1d1d1f] rounded-full hover:bg-[#f5f5f7] active:scale-[0.97]",
        ghost:
          "text-[#0071e3] hover:bg-[#f5f5f7] rounded-xl",
        link:
          "text-[#0071e3] underline-offset-4 hover:underline p-0 h-auto",
        destructive:
          "bg-[#ff3b30] text-white rounded-full hover:opacity-90 active:scale-[0.97] shadow-sm",
      },
      size: {
        sm: "h-8 px-4 text-xs",
        default: "h-10 px-6",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
