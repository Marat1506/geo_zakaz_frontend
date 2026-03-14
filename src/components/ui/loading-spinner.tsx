import * as React from "react"
import { cn } from "@/lib/utils/cn"

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
}

export function LoadingSpinner({ className, size = "md", ...props }: LoadingSpinnerProps) {
  const sizeStyles = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
  }

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-solid border-gray-900 border-t-transparent",
          sizeStyles[size]
        )}
      />
      <span className="sr-only">Loading...</span>
    </div>
  )
}
