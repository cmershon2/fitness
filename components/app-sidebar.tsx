"use client"

import Link from "next/link"
import {
   ClipboardList,
   Dumbbell,
   LayoutDashboard,
   Scale,
   Utensils,
   Droplets,
   Carrot,
   FileText,
   Settings,
   LogOut,
   User
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
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Logo from "./logo"
import { usePathname, useRouter } from "next/navigation"
import { useUser, useSetUser } from "@/context/UserContext"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
   const pathname = usePathname()
   const router = useRouter()
   const user = useUser()
   const setUser = useSetUser()

   const handleLogout = async () => {
      await authClient.signOut({
         fetchOptions: {
            onRequest: () => {
               toast.loading('Logging out...')
            },
            onSuccess: () => {
               toast.dismiss()
               setUser(null)
               router.push('/')
               toast.success('Logged out successfully')
            },
            onError: (ctx) => {
               toast.dismiss()
               toast.error(ctx.error.message)
            },
         },
      })
   }

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

               {/* Workouts */}
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
                           <ClipboardList className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">Workouts</span>
                     </Link>
                  </SidebarMenuButton>
               </SidebarMenuItem>

               {/* Foods */}
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
                           <Carrot className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">Foods</span>
                     </Link>
                  </SidebarMenuButton>
               </SidebarMenuItem>

               {/* Diet */}
               <SidebarMenuItem>
                  <SidebarMenuButton
                     isActive={pathname.startsWith("/dashboard/diet")}
                     size="lg"
                  >
                     <Link
                        href="/dashboard/diet"
                        className={`${pathname.startsWith("/dashboard/diet") ? "text-foreground" : "text-primary"} flex items-center gap-3`}
                     >
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                           <Utensils className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">Diet</span>
                     </Link>
                  </SidebarMenuButton>
               </SidebarMenuItem>

               {/* Water */}
               <SidebarMenuItem>
                  <SidebarMenuButton
                     isActive={pathname.startsWith("/dashboard/water")}
                     size="lg"
                  >
                     <Link
                        href="/dashboard/water"
                        className={`${pathname.startsWith("/dashboard/water") ? "text-foreground" : "text-primary"} flex items-center gap-3`}
                     >
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                           <Droplets className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">Water</span>
                     </Link>
                  </SidebarMenuButton>
               </SidebarMenuItem>

               {/* Reports */}
               <SidebarMenuItem>
                  <SidebarMenuButton
                     isActive={pathname.startsWith("/dashboard/reports")}
                     size="lg"
                  >
                     <Link
                        href="/dashboard/reports"
                        className={`${pathname.startsWith("/dashboard/reports") ? "text-foreground" : "text-primary"} flex items-center gap-3`}
                     >
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                           <FileText className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">Reports</span>
                     </Link>
                  </SidebarMenuButton>
               </SidebarMenuItem>
            </SidebarMenu>
         </SidebarContent>

         {/* User Dropdown Footer */}
         <SidebarFooter>
            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-sidebar-accent transition-colors">
                     <Avatar className="h-8 w-8">
                        <AvatarImage
                           src={user?.image || ''}
                           alt={user?.name || 'User'}
                           referrerPolicy="no-referrer"
                        />
                        <AvatarFallback className="text-sm font-semibold">
                           {user?.name?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                        </AvatarFallback>
                     </Avatar>
                     <div className="flex flex-col items-start flex-1 min-w-0">
                        <span className="text-sm font-medium truncate w-full">
                           {user?.name || 'User'}
                        </span>
                        <span className="text-xs text-muted-foreground truncate w-full">
                           {user?.email || ''}
                        </span>
                     </div>
                  </button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                     <Link
                        href="/dashboard/settings"
                        className="flex items-center cursor-pointer"
                     >
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                     </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                     onClick={handleLogout}
                     className="cursor-pointer"
                     variant="destructive"
                  >
                     <LogOut className="mr-2 h-4 w-4" />
                     <span>Sign Out</span>
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         </SidebarFooter>
         <SidebarRail />
      </Sidebar>
   )
}