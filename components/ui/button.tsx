import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-forest disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      primary: "bg-primary-green text-white hover:bg-primary-hover shadow-sm",
      secondary: "bg-bg-secondary text-text-primary border border-border-warm hover:bg-border-warm",
      ghost: "hover:bg-bg-secondary text-text-primary",
      destructive: "bg-coral text-white hover:opacity-90",
    }
    
    const sizes = {
      default: "h-11 px-4 py-2 min-h-[44px]",
      sm: "h-9 rounded-md px-3",
      lg: "h-14 rounded-lg px-8 text-base",
      icon: "h-11 w-11",
    }
    
    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
