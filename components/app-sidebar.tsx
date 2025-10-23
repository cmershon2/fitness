"use client"

import Link from "next/link"
import {
   ClipboardList,
   Dumbbell,
   LayoutDashboard,
   Scale,
   Play,
   Utensils
} from "lucide-react"
import {
   Sidebar,
   SidebarContent,
   SidebarFooter,
   SidebarHeader,
   SidebarMenu,
   SidebarMenuItem,
   SidebarMenuButton,
   SidebarRail,
} from "@/components/ui/sidebar"
import SignOutForm from "./sign-out-form"
import Logo from "./logo"
import { usePathname } from "next/navigation"

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
   const pathname = usePathname();

   return (
      <Sidebar collapsible="offcanvas" {...props}>
         <SidebarHeader className="flex items-center">
            <Logo />
         </SidebarHeader>
         <SidebarContent>
            <SidebarMenu className="px-2 py-4">
               {/* Dashboard */}
               <SidebarMenuItem>
                  <SidebarMenuButton
                     isActive={pathname === "/dashboard"}
                     size="lg"
                  >
                     <Link
                        href="/dashboard"
                        className={`${pathname === "/dashboard" ? "text-foreground" : "text-primary"} flex items-center gap-3`}
                     >
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                           <LayoutDashboard className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">Dashboard</span>
                     </Link>
                  </SidebarMenuButton>
               </SidebarMenuItem>

               {/* Weight */}
               <SidebarMenuItem>
                  <SidebarMenuButton
                     isActive={pathname.startsWith("/dashboard/weight")}
                     size="lg"
                  >
                     <Link
                        href="/dashboard/weight"
                        className={`${pathname.startsWith("/dashboard/weight") ? "text-foreground" : "text-primary"} flex items-center gap-3`}
                     >
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                           <Scale className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">Weight</span>
                     </Link>
                  </SidebarMenuButton>
               </SidebarMenuItem>

               {/* Exercises */}
               <SidebarMenuItem>
                  <SidebarMenuButton
                     isActive={pathname.startsWith("/dashboard/exercises")}
                     size="lg"
                  >
                     <Link
                        href="/dashboard/exercises"
                        className={`${pathname.startsWith("/dashboard/exercises") ? "text-foreground" : "text-primary"} flex items-center gap-3`}
                     >
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                           <Dumbbell className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">Exercises</span>
                     </Link>
                  </SidebarMenuButton>
               </SidebarMenuItem>

               {/* Templates */}
               <SidebarMenuItem>
                  <SidebarMenuButton
                     isActive={pathname.startsWith("/dashboard/templates")}
                     size="lg"
                  >
                     <Link
                        href="/dashboard/templates"
                        className={`${pathname.startsWith("/dashboard/templates") ? "text-foreground" : "text-primary"} flex items-center gap-3`}
                     >
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                           <ClipboardList className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">Templates</span>
                     </Link>
                  </SidebarMenuButton>
               </SidebarMenuItem>

               {/* Workouts - NEW for Sprint 3 */}
               <SidebarMenuItem>
                  <SidebarMenuButton
                     isActive={pathname.startsWith("/dashboard/workouts")}
                     size="lg"
                  >
                     <Link
                        href="/dashboard/workouts"
                        className={`${pathname.startsWith("/dashboard/workouts") ? "text-foreground" : "text-primary"} flex items-center gap-3`}
                     >
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                           <Play className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">Workouts</span>
                     </Link>
                  </SidebarMenuButton>
               </SidebarMenuItem>

               {/* Foods - NEW for Sprint 3 */}
               <SidebarMenuItem>
                  <SidebarMenuButton
                     isActive={pathname.startsWith("/dashboard/foods")}
                     size="lg"
                  >
                     <Link
                        href="/dashboard/foods"
                        className={`${pathname.startsWith("/dashboard/foods") ? "text-foreground" : "text-primary"} flex items-center gap-3`}
                     >
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                           <Utensils className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">Foods</span>
                     </Link>
                  </SidebarMenuButton>
               </SidebarMenuItem>
            </SidebarMenu>
         </SidebarContent>
         <SidebarFooter>
            <SignOutForm />
         </SidebarFooter>
         <SidebarRail />
      </Sidebar>
   )
}