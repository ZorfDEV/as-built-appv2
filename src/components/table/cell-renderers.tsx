import { Badge } from "@/components/ui/badge"
    
import { CircleCheck, Loader, Scissors,UserCheck,UserKey,CircleOff,User } from "lucide-react"

// -- Status --
const STATUS_CONFIG = {
  active:   { icon: <Scissors className="text-red-500" />, label: "Actif" },
  inactive: { icon: <CircleOff className=" text-gray-500"/>, label: "Inactif" },
  archived: { icon: <CircleCheck className=" text-green-500"/>, label: "Archivé" },
  pending:  { icon: <Loader className="text-yellow-500" />,              label: "En attente" },
  actived:  { icon: <UserCheck className=" text-green-500"/>, label: "Activé" },
} as const

const badgeColor = {
  active:   "bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-destructive border-destructive/10",
  archived: "bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200",
  inactive: "bg-neutral-300/40 border-neutral-300 text-neutral-800 dark:bg-neutral-700/40 dark:border-neutral-700 dark:text-neutral-200",
  pending:  "bg-yellow-100/30 text-yellow-900 dark:text-yellow-200 border-yellow-200",
  actived:  "bg-green-100/30 text-green-900 dark:text-green-200 border-green-200",
}

type StatusKey = keyof typeof STATUS_CONFIG

//--Role--
const ROLE_CONFIG = {
  admin: { icon: <UserKey size={20} className="text-muted-foreground" />, label: "Administrateur" },
  user:  { icon: <User size={20} className="text-muted-foreground" />,     label: "Utilisateur" },
} as const  

export function renderStatus(value: unknown): React.ReactNode {
  if (!value || typeof value !== "string") return "—"
  const config = STATUS_CONFIG[value as StatusKey]
  return (
    <Badge variant="outline"  className={`capitalize  ${badgeColor[value as StatusKey]}`}>
      {config?.icon ?? null}
      <span>{config?.label ?? value}</span>
    </Badge>
  )
}

// -- Date --
export function renderDate(value: unknown): React.ReactNode {
  if (!value) return "—"
  const date = value instanceof Date ? value : new Date(value as string)
  if (isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

//avatar
export function renderAvatar(value: unknown): React.ReactNode {
  if (!value) return "—"
  return <img src={String(value)} alt="Avatar" className="w-8 h-8 rounded-full" />
}


// -- Relation (ex: section_id.name, user_id.name) --
export function renderRelation(field: string) {
  return (value: unknown): React.ReactNode => {
    if (!value || typeof value !== "object") return "—"
    const obj = value as Record<string, unknown>
    return <span>{String(obj[field] ?? "—")}</span>
  }
}

// -- Role badge --
export function renderRole(value: unknown): React.ReactNode {
  if (!value) return "—"
  const config = ROLE_CONFIG[value as keyof typeof ROLE_CONFIG]
  return (
    <Badge variant="outline" className="capitalize border-none">
      {config?.icon ?? null}
      <span>{config?.label ?? String(value)}</span>
    </Badge>
  )
}

// -- Texte simple avec fallback --
export function renderText(value: unknown): React.ReactNode {
  if (value == null || value === "") return "—"
  return <span>{String(value)}</span>
}