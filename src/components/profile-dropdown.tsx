import {
  UserCog,
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
  //SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from '@/components/ui/button'
import { useAuth } from "@/contexts/AuthContext";

export function ProfileDropdown() {

  const { user,logout } = useAuth();
  const { isMobile } = useSidebar()

  if (!user) {
    return null; // Ou un composant de chargement, ou une redirection vers la page de connexion
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='rounded-full h-8 w-8 px-2 '>
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
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg z-9999"
            side={isMobile ? "bottom" : "bottom"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
               <Avatar className="h-8 w-8 rounded-full">
               {
                    user.avatar ? 
                   
                    (
                      <AvatarImage src={user.avatar || ""} alt={user.name} />
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
              <DropdownMenuItem>
                 <UserCog />
                Account
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={logout} className="cursor-pointer ">
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
