import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, description, actions, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6", className)}
        {...props}
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">{title}</h1>
          {description && <p className="text-sm text-text-secondary">{description}</p>}
        </div>
        {actions && <div className="mt-4 sm:mt-0 flex items-center space-x-3">{actions}</div>}
      </div>
    )
  }
)
PageHeader.displayName = "PageHeader"

export { PageHeader }
