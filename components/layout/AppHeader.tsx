import { Bell, Search, Building2, PanelLeft } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { projects } from "../../lib/constants"
import { SidebarTrigger } from "../ui/sidebar"
import { useDashboardStore } from "../../components/pages/DashboardPage"
import { useState } from "react"

interface AppHeaderProps {
  screenSize: 'mobile' | 'tablet' | 'desktop'
}

export default function AppHeader({ screenSize }: AppHeaderProps) {
  const { range, setRange, editMode, setEditMode } = useDashboardStore()
  const [projectFilter, setProjectFilter] = useState("All Projects")
  
  return (
    <header className="border-b border-border bg-white/80 backdrop-blur-md px-6 py-4 shadow-sm shrink-0 relative z-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <SidebarTrigger className="h-11 w-11 rounded-xl hover:bg-accent transition-colors">
            <PanelLeft className="h-5 w-5" />
          </SidebarTrigger>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-48 h-11 border-border bg-white shadow-sm hover:shadow-md transition-shadow">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Projects">All Projects</SelectItem>
              <SelectItem value="Active Projects">Active Projects</SelectItem>
              <SelectItem value="Completed Projects">Completed Projects</SelectItem>
            </SelectContent>
          </Select>
          {screenSize !== 'mobile' && (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search projects, suppliers..." 
                className="pl-12 w-72 h-11 border-border bg-white shadow-sm hover:shadow-md transition-shadow focus:shadow-lg" 
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Select value={`${range} view`} onValueChange={(v) => setRange((v.split(" ")[0] as any) || "Monthly")}>
            <SelectTrigger className="w-48 h-11 border-border bg-white shadow-sm hover:shadow-md transition-shadow">
              <SelectValue placeholder="Monthly view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Monthly view">Monthly view</SelectItem>
              <SelectItem value="Quarterly view">Quarterly view</SelectItem>
              <SelectItem value="Yearly view">Yearly view</SelectItem>
              <SelectItem value="Custom view">Custom view</SelectItem>
            </SelectContent>
          </Select>
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