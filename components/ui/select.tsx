import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "flex h-11 w-full appearance-none rounded-md border border-border-warm bg-bg-surface px-3 py-2 text-sm text-text-primary shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-green disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]",
            error && "border-coral focus-visible:ring-coral",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-3 h-5 w-5 text-text-secondary opacity-50" />
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
