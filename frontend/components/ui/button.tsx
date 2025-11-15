import * as React from "react"
import { cn } from "@/lib/utils"

export type ButtonVariant = "default" | "outline" | "link" | "ghost"
export type ButtonSize = "default" | "sm" | "lg" | "icon"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const baseStyles =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none"

const variantStyles: Record<ButtonVariant, string> = {
  default: "bg-primary text-primary-foreground hover:opacity-90",
  outline:
    "border border-input bg-white text-foreground hover:bg-accent hover:text-accent-foreground",
  link: "bg-transparent text-primary underline-offset-4 hover:underline px-0 h-auto",
  ghost: "bg-transparent hover:bg-foreground/5 text-foreground",
}

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export default Button
