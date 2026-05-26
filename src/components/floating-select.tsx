import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { useState } from "react";

interface FloatingSelectProps {
  options: { value: string; label: string }[]
  label: string
  name: string
  id: string
  required?: boolean
  icon?: React.ReactNode
  defaultValue?: string
  onValueChange?: (value: string) => void
}

export function FloatingSelect({
  options,
  label,
  name,
  id,
  icon,
  defaultValue,
  onValueChange,
  ...props
}: FloatingSelectProps) {
  const [selected, setSelected] = useState<string>(defaultValue ?? "")

  const handleChange = (value: string) => {
    setSelected(value)
    onValueChange?.(value)
  }

  return (
    <div className="w-full space-y-1">
      <div className="relative">

        {/* ✅ Input caché qui expose la valeur au FormData */}
        <input type="hidden" name={name} value={selected} />

        {icon && (
          <div className="absolute right-3 top-3 text-muted-foreground">
            {icon}
          </div>
        )}

        <Select
          {...props}
          defaultValue={defaultValue}
          onValueChange={handleChange}   // ✅ met à jour le state → input caché
        >
          <SelectTrigger
            id={id}
            className={cn("w-full peer h-12", icon && "pr-10")}
          >
            <SelectValue placeholder=" " />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Label
          htmlFor={id}
          className={cn(
            "absolute left-3 bg-background px-1 text-muted-foreground duration-300 transform-translate-y-4 scale-75 origin-left peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100",
           "top-3 text-sm",
            "peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm",
            "peer-focus:-top-2 peer-focus:text-xs peer-focus:text-primary",
            "peer-not-placeholder-shown:-top-2 peer-not-placeholder-shown:text-xs",
          )}
        >
          {label}
        </Label>
      </div>
    </div>
  )
}