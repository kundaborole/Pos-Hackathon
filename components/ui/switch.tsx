import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="flex items-center space-x-3 cursor-pointer min-h-[44px]">
        <div className="relative inline-flex items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            ref={ref}
            {...props}
          />
          <div className={cn(
            "h-6 w-11 rounded-full bg-border-warm after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:border after:border-gray-300 after:transition-all peer-checked:bg-primary-green peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-forest disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}></div>
        </div>
        {label && <span className="text-sm font-medium text-text-primary leading-none">{label}</span>}
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
