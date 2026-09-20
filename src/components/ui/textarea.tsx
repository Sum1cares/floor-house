import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-28 w-full rounded-xl bg-elevated px-3 py-2.5 text-sm text-fg hairline placeholder:text-subtle",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
