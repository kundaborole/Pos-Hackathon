import * as React from "react"
import { cn } from "@/lib/utils"

export type StatusVariant = 'success' | 'preparing' | 'ready' | 'waiting' | 'unpaid' | 'error' | 'inactive'

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: StatusVariant;
  label?: string;
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ className, status, label, ...props }, ref) => {
    const variants: Record<StatusVariant, string> = {
      success: "bg-primary-green/10 text-primary-green border-primary-green/20",
      preparing: "bg-amber/10 text-amber border-amber/20",
      ready: "bg-ready-blue/10 text-ready-blue border-ready-blue/20",
      waiting: "bg-muted-gold/10 text-muted-gold border-muted-gold/20",
      unpaid: "bg-coral/10 text-coral border-coral/20",
      error: "bg-coral/10 text-coral border-coral/20",
      inactive: "bg-border-warm/30 text-text-secondary border-border-warm",
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
          variants[status],
          className
        )}
        {...props}
      >
        {label || status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    )
  }
)
StatusBadge.displayName = "StatusBadge"

export { StatusBadge }
