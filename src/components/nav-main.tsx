import { type ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronRight } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { Badge } from "@/components/ui/badge"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type {
  NavCollapsible,
  NavItem,
  NavLink as NavLinkType,
  NavGroup as NavGroupProps,
} from "@/components/layouts/types"

///////////////////////////////////////////////////////////////

export function NavMain({ title, items }: NavGroupProps) {
  const { state, isMobile } = useSidebar()
  const location = useLocation()
  const href = location.pathname

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>

      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${item.url}`

          if (!item.items) {
            return (
              <SidebarMenuLink
                key={key}
                item={item}
                href={href}
              />
            )
          }

          if (state === "collapsed" && !isMobile) {
            return (
              <SidebarMenuCollapsedDropdown
                key={key}
                item={item}
                href={href}
              />
            )
          }

          return (
            <SidebarMenuCollapsible
              key={key}
              item={item}
              href={href}
            />
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

///////////////////////////////////////////////////////////////

function NavBadge({ children }: { children: ReactNode }) {
  return (
    <Badge className="rounded-full px-1.5 py-0 text-xs">
      {children}
    </Badge>
  )
}

///////////////////////////////////////////////////////////////

function SidebarMenuLink({
  item,
  href,
}: {
  item: NavLinkType
  href: string
}) {
  const { setOpenMobile } = useSidebar()
  const isActive = checkIsActive(href, item)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
      >
        <Link
          to={item.url}
          onClick={() => setOpenMobile(false)}
          className="flex items-center gap-2 w-full text-white hover:text-axgreen-1"
        >
          {item.icon && <item.icon className="h-4 w-4" />}
          <span>{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

///////////////////////////////////////////////////////////////

function SidebarMenuCollapsible({
  item,
  href,
}: {
  item: NavCollapsible
  href: string
}) {
  const { setOpenMobile } = useSidebar()
  const defaultOpen = checkIsActive(href, item, true)

  return (
    <Collapsible
      asChild
      defaultOpen={defaultOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={defaultOpen}
          >
            {item.icon && <item.icon className="h-4 w-4" />}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items.map((subItem) => {
              const subActive = checkIsActive(href, subItem)

              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={subActive}
                  >
                    <Link
                      to={subItem.url}
                      onClick={() => setOpenMobile(false)}
                      className="flex items-center gap-2 w-full"
                    >
                      {subItem.icon && (
                        <subItem.icon className="h-4 w-4" />
                      )}
                      <span>{subItem.title}</span>
                      {subItem.badge && (
                        <NavBadge>{subItem.badge}</NavBadge>
                      )}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

///////////////////////////////////////////////////////////////

function SidebarMenuCollapsedDropdown({
  item,
  href,
}: {
  item: NavCollapsible
  href: string
}) {
  const isActive = checkIsActive(href, item)

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isActive}
          >
            {item.icon && <item.icon className="h-4 w-4" />}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ms-auto" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={4}
        >
          <DropdownMenuLabel>
            {item.title}
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {item.items.map((sub) => {
            const subActive = checkIsActive(href, sub)

            return (
              <DropdownMenuItem
                key={`${sub.title}-${sub.url}`}
                asChild
              >
                <Link
                  to={sub.url}
                  className={`flex items-center gap-2 ${
                    subActive ? "bg-secondary" : ""
                  }`}
                >
                  {sub.icon && <sub.icon className="h-4 w-4" />}
                  <span className="max-w-52 text-wrap">
                    {sub.title}
                  </span>
                  {sub.badge && (
                    <span className="ms-auto text-xs">
                      {sub.badge}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

///////////////////////////////////////////////////////////////

function checkIsActive(
  href: string,
  item: NavItem,
  mainNav = false
) {
  // Exact match
  if (href === item.url) return true

  // Match section principale (/settings/profile → /settings)
  if (mainNav && typeof item.url === "string" && href.startsWith(item.url)) return true

  // Si enfant actif
  if (item.items?.some((i) => i.url === href)) return true

  return false
}