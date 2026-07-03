import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export interface DrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  position?: 'left' | 'right';
}

const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  ({ className, isOpen, onClose, title, position = 'right', children, ...props }, ref) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex bg-black/50 animate-in fade-in duration-200">
        <div
          ref={ref}
          className={cn(
            "fixed top-0 bottom-0 z-50 w-full max-w-sm bg-bg-surface p-6 shadow-xl border-border-warm flex flex-col transition-transform duration-300",
            position === 'right' ? "right-0 border-l animate-in slide-in-from-right" : "left-0 border-r animate-in slide-in-from-left",
            className
          )}
          role="dialog"
          aria-modal="true"
          {...props}
        >
          <div className="flex items-center justify-between mb-6">
            {title && <h2 className="text-lg font-semibold text-text-primary">{title}</h2>}
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-forest ml-auto"
            >
              <X className="h-5 w-5 text-text-secondary" />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    )
  }
)
Drawer.displayName = "Drawer"

export { Drawer }
