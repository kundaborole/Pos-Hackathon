import * as React from "react"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="flex items-center space-x-3 cursor-pointer min-h-[44px]">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            className={cn(
              "peer h-6 w-6 appearance-none rounded-md border border-border-warm bg-bg-surface checked:bg-primary-green checked:border-primary-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-forest disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
              className
            )}
            ref={ref}
            {...props}
          />
          <Check className="pointer-events-none absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" strokeWidth={3} />
        </div>
        {label && <span className="text-sm font-medium text-text-primary leading-none">{label}</span>}
      </label>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
