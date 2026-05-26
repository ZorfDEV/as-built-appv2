"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: React.ReactNode
  error?: string
  labelclassName?: string
}

export const FloatingInput = React.forwardRef<
  HTMLInputElement,
  FloatingInputProps
>(({ className,labelclassName, label, icon, error, type, id, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)

  const isPassword = type === "password"

  return (
    <div className="w-full space-y-1">
      <div className="relative">
        {icon && (
          <div className="absolute right-3 top-3 text-muted-foreground">
            {icon}
          </div>
        )}

        <Input
          ref={ref}
          id={id}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          placeholder=" "
          className={cn(
            "peer h-12",
            icon && "pl-4",
            isPassword && "pr-10",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...props}
        />

        <Label
          htmlFor={id}
          className={cn(
            "absolute left-3  px-1 text-muted-foreground duration-300 transform-translate-y-4 scale-75 origin-left peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100",
            "top-3 text-sm",
            "peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm",
            "peer-focus:-top-2 peer-focus:text-xs peer-focus:text-primary",
            "peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs",
            error && "text-destructive",
             labelclassName
          )}
        >
          {label}
        </Label>

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-muted-foreground"
          >
            {showPassword ? <EyeOff size={18} className="text-white/70" /> : <Eye size={18} className="text-white/70" />}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
})

FloatingInput.displayName = "FloatingInput"