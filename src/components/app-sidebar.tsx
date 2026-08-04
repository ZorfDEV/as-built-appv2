"use client"
import * as React from "react"
import {
  Network,
  Map,
  TriangleAlert,
  Settings2,
  Users,
  Layers,
  Activity,
  Router,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { sidebarData } from "@/datatypes/sidebar-data"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { LogoMenu } from "./logo-menu"
import { useAuth } from "@/contexts/AuthContext"  

const allNavItems = [
  {
    title: "Carte",
    url: "/dashboard/map",
    icon: Map,
    isActive: true,
    adminOnly: false,  
  },
  {
    title: "Points-as-built",
    url: "/dashboard/points",
    icon: Network,
    adminOnly: false,
  },
  {
    title: "Incidents",
    url: "/dashboard/incidents",
    icon: TriangleAlert,
    adminOnly: false,
  },
  {
    title: "Sections",
    url: "/dashboard/sections",
    icon: Layers,
    adminOnly: false,
  },
  {
    title: "Utilisateurs",
    url: "/dashboard/users",
    icon: Users,
    adminOnly: true,  
  },
  {
    title: "Statut liens",
    url: "/dashboard/reports",
    icon: Activity,
    adminOnly: false,
  },
  {
    title: "Equipements",
    url: "/dashboard/devices",
    icon: Router,
    adminOnly: false,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings2,
    adminOnly: true,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()  // ✅ récupère l'utilisateur connecté

  // ✅ Filtre les items selon le rôle
  const navItems = allNavItems.filter(item => 
    !item.adminOnly || user?.role === 'admin'
  )

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <LogoMenu teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} title={""} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}