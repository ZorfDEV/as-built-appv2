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
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
//import { NavProjects } from "@/components/nav-projects"
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

const data = {
 
  navMain: [
    {
      title: "Carte",
      url: "/dashboard/map",
      icon: Map,
      isActive: true,
    },
    {
      title: "Points-as-built",
      url: "/dashboard/points",
      icon: Network,
    },
    {
      title: "Incidents",
      url: "/dashboard/incidents",
      icon: TriangleAlert,
    },
    {
      title: "Sections",
      url: "/dashboard/sections",
      icon: Layers,

    },
    {
      title: "Utilisateurs",
      url: "/dashboard/users",
      icon: Users,
    },
    {
      title: "Statut liens",
      url: "/dashboard/reports",
      icon: Activity,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
    },
  ],
 
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
       <LogoMenu teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} title={""} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser  />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
