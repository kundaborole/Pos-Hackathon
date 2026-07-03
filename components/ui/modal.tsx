import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ className, isOpen, onClose, title, children, ...props }, ref) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
        <div
          ref={ref}
          className={cn(
            "relative w-full max-w-lg rounded-xl bg-bg-surface p-6 shadow-lg border border-border-warm animate-in zoom-in-95 duration-200",
            className
          )}
          role="dialog"
          aria-modal="true"
          {...props}
        >
          <div className="flex items-center justify-between mb-5">
            {title && <h2 className="text-lg font-semibold text-text-primary">{title}</h2>}
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-forest ml-auto"
            >
              <X className="h-5 w-5 text-text-secondary" />
              <span className="sr-only">Close</span>
            </button>
          </div>
          <div>{children}</div>
        </div>
      </div>
    )
  }
)
Modal.displayName = "Modal"

export { Modal }
