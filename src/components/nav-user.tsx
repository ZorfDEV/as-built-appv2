"use client"

import {
  UserCog,
  ChevronsUpDown,
  LogOut,

} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { useAuth } from "@/contexts/AuthContext";

export function NavUser() {
  const { isMobile } = useSidebar()
 const { user,logout } = useAuth();
 console.log("user:", user) 

 if (!user) {
    return null; // Ou un composant de chargement, ou une redirection vers la page de connexion
  }

  return (
    <SidebarMenu className="z-9999">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-axblue-2 data-[state=open]:text-sidebar-accent-foreground rounded-full cursor-pointer"
            >
              <Avatar className="h-8 w-8 rounded-full">
               {
                    user.avatar ? 
                   
                    (
                      <AvatarImage src={user.avatar || ""} alt={user.name} />
                    ) : (
                      <AvatarFallback className=" bg-axblue-2 text-white rounded-full dark:bg-muted">{user.name.charAt(0)}</AvatarFallback>
                    )
                    
                  }
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight text-white">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-white" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg z-9999"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal z-90">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {
                    user.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    ) : (
                      <AvatarFallback className=" bg-axblue-2 text-white rounded-full">{user.name.charAt(0)}</AvatarFallback>
                    )
                  }
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer">
               <UserCog />
                Compte
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={logout} className="cursor-pointer ">
              <LogOut />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

