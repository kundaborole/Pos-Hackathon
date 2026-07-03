import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon: Icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border-warm bg-bg-surface p-8 text-center",
          className
        )}
        {...props}
      >
        {Icon && (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-bg-secondary mb-4">
            <Icon className="h-6 w-6 text-text-secondary" />
          </div>
        )}
        <h3 className="mt-2 text-lg font-semibold text-text-primary">{title}</h3>
        {description && <p className="mt-1 text-sm text-text-secondary max-w-sm mx-auto">{description}</p>}
        {action && <div className="mt-6">{action}</div>}
      </div>
    )
  }
)
EmptyState.displayName = "EmptyState"

export { EmptyState }
