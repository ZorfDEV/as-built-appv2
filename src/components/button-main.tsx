//import React from 'react'
import { Button } from "@/components/ui/button"

interface ButtonMainProps {
  label: string
  actioname?: "main" | "destructive"
  disabled?: boolean
  children?: React.ReactNode
  type?: "button" | "submit" | "reset"
  onClick?: () => void
  className?: string
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"
}

function ButtonMain({ label, actioname = "destructive", disabled, children, type = "button", onClick, className, size }: ButtonMainProps) {
  const variant = actioname === "main" ? "main" : "destructive"

  return (
    <Button variant={variant} size={size} label={label} type={type} disabled={disabled} onClick={onClick} className={className}>
      {/* You can also include an icon here */}
      <span className="relative text-base">{label}</span>
      {children}
    </Button>
  )
}

export default ButtonMain