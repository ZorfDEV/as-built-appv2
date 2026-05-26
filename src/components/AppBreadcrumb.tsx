import { useLocation } from "react-router-dom"
import { useMemo } from "react"

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

import { routeConfig } from "@/lib/breadcrumb-routes"

export function AppBreadcrumb() {
  const location = useLocation()

  const items = useMemo(() => {
    const pathnames = location.pathname.split("/").filter(Boolean)

    return pathnames.map((segment, index) => {
      const path = "/" + pathnames.slice(0, index + 1).join("/")

      const route = routeConfig[segment]

      const label =
        route?.label ??
        segment
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")

      const icon = route?.icon

      return {
        path,
        label,
        icon,
      }
    })
  }, [location.pathname])

  if (location.pathname === "/") return null

  return (
    <Breadcrumb>
      <BreadcrumbList>

        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <span key={item.path} className="flex items-center gap-2">

              <BreadcrumbItem className="flex items-center gap-1 text-axblue-1  dark:text-white/90">

                {item.icon}

                {isLast ? (
                  <BreadcrumbPage className="text-axblue-2  dark:text-white">{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.path} className="text-axblue-1 hover:text-axblue-2  dark:text-white/70 hover:dark:text-white">
                    {item.label}
                  </BreadcrumbLink>
                )}

              </BreadcrumbItem>

              {!isLast && <BreadcrumbSeparator className="text-axblue-1  dark:text-white/90"/>}

            </span>
          )
        })}

      </BreadcrumbList>
    </Breadcrumb>
  )
}