import { Bell, Search, Building2, PanelLeft, MoreHorizontal } from "lucide-react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { projects } from "../../lib/constants"
import { SidebarTrigger } from "../ui/sidebar"
import { useDashboardStore } from "../../components/pages/DashboardPage"
import { useState } from "react"
import ThemeToggle from "../ui/theme-toggle"

interface AppHeaderProps {
  screenSize: 'mobile' | 'tablet' | 'desktop'
}

export default function AppHeader({ screenSize }: AppHeaderProps) {
  const { range, setRange, editMode, setEditMode } = useDashboardStore()
  const [projectFilter, setProjectFilter] = useState("All Projects")
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [showRangeDropdown, setShowRangeDropdown] = useState(false)
  
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-md px-6 py-4 shadow-sm shrink-0 relative z-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <SidebarTrigger className="h-11 w-11 rounded-xl hover:bg-accent transition-colors">
            <PanelLeft className="h-5 w-5" />
          </SidebarTrigger>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-3">{projectFilter}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>Projects</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setProjectFilter('All Projects')}>All Projects</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setProjectFilter('Active Projects')}>Active Projects</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setProjectFilter('Completed Projects')}>Completed Projects</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          {screenSize !== 'mobile' && (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search projects, suppliers..." 
                className="pl-12 w-72 h-11 border-border bg-card shadow-sm hover:shadow-md transition-shadow focus:shadow-lg" 
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-3">{range} view</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Range</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setRange('Monthly')}>Monthly view</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRange('Quarterly')}>Quarterly view</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRange('Yearly')}>Yearly view</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRange('Custom')}>Custom view</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            variant="ghost" 
            onClick={() => setEditMode(!editMode)}
            className="h-11 px-4 rounded-xl hover:bg-accent"
          >
            {editMode ? "Done" : "Customize"}
          </Button>
          <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-xl hover:bg-accent">
            <Bell className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
          </Button>
          <Avatar className="w-10 h-10 ring-2 ring-primary/10 hover:ring-primary/20 transition-all">
            <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-primary-foreground font-semibold">JD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}