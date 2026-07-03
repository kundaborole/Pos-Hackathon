import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-border-warm bg-bg-surface px-3 py-2 text-sm text-text-primary shadow-sm placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-green disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-coral focus-visible:ring-coral",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
