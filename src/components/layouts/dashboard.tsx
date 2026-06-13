import { AppSidebar } from "@/components/app-sidebar"
import { Outlet } from 'react-router-dom';
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {  Header } from "./header"
//import { ThemeProvider } from "next-themes"
import { ThemeProvider } from '@/contexts/theme-provider';

export default function DashboardLayout() {
  return (
    <ThemeProvider>
      <SidebarProvider>
      <AppSidebar className="z-9999" />
      <SidebarInset >
        <Header fixed />
        <div className="flex-1 min-h-screen z-0 bg-background"> 
       <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
    </ThemeProvider>
  )
}
