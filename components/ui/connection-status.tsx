import * as React from "react"
import { cn } from "@/lib/utils"
import { Wifi, WifiOff } from "lucide-react"

export interface ConnectionStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  isConnected: boolean;
}

const ConnectionStatus = React.forwardRef<HTMLDivElement, ConnectionStatusProps>(
  ({ className, isConnected, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center space-x-2 rounded-full px-3 py-1 text-xs font-medium transition-colors",
          isConnected ? "bg-primary-green/10 text-primary-green" : "bg-coral/10 text-coral",
          className
        )}
        {...props}
      >
        {isConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
        <span>{isConnected ? "Online" : "Offline"}</span>
      </div>
    )
  }
)
ConnectionStatus.displayName = "ConnectionStatus"

export { ConnectionStatus }
