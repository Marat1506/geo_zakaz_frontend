import * as React from "react"
import { cn } from "@/lib/utils/cn"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
    
    const variantStyles = {
      default: "bg-gray-900 text-white shadow hover:bg-gray-900/90",
      destructive: "bg-red-600 text-white shadow-sm hover:bg-red-600/90",
      outline: "border border-gray-300 bg-white shadow-sm hover:bg-gray-100 hover:text-gray-900",
      secondary: "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-100/80",
      ghost: "hover:bg-gray-100 hover:text-gray-900",
      link: "text-gray-900 underline-offset-4 hover:underline",
    }
    
    const sizeStyles = {
      default: "h-11 px-4 py-2 min-h-[44px] min-w-[44px]",
      sm: "h-9 rounded-md px-3 min-h-[44px] min-w-[44px]",
      lg: "h-12 rounded-md px-8 min-h-[44px] min-w-[44px]",
      icon: "h-11 w-11 min-h-[44px] min-w-[44px]",
    }

    const classes = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      className
    )

    if (asChild && React.isValidElement(children)) {
      const childElement = children as React.ReactElement<{ className?: string }>;
      return React.cloneElement(childElement, {
        className: cn(childElement.props.className, classes),
      })
    }

    return (
      <button
        className={classes}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
