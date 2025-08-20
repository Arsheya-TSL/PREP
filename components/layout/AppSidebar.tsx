"use client"
import { Building2, LayoutDashboard, Users, FileText, DollarSign, MessageSquare, Settings, Globe, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { PageType } from "../../lib/types"

type SidebarMode = 'expanded' | 'collapsed' | 'hidden'

interface AppSidebarProps {
  activeTab: PageType
  setActiveTab: (tab: PageType) => void
  mode: SidebarMode
}

export default function AppSidebar({ activeTab, setActiveTab, mode }: AppSidebarProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "projects", label: "Projects", icon: Building2 },
    { id: "supply-chain", label: "Supply Chain", icon: Users },
    { id: "itt-manager", label: "ITT Manager", icon: FileText },
    { id: "cost-system", label: "Cost System", icon: DollarSign },
    { id: "teams", label: "Teams", icon: MessageSquare },
    { id: "world-map", label: "World Map", icon: Globe, disabled: true },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  const isCollapsed = mode === 'collapsed'
  const isHidden = mode === 'hidden'

  // When hidden, show only a minimal icon bar
  if (isHidden) {
    return (
      <div className="h-full flex flex-col bg-card border-r border-border">
        {/* Minimal header with just icon */}
        <div className="border-b border-border px-3 py-6 bg-card">
          <div className="flex justify-center">
            <img
              src="/images/TSL_ICON.png"
              alt="TSL Logo"
              className="h-14 w-auto"
            />
          </div>
        </div>

        {/* Navigation icons only */}
        <div className="flex-1 py-4">
          <div className="px-3">
            <nav className="space-y-2">
                          {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => !item.disabled && setActiveTab(item.id as PageType)}
                className={`
                  w-full flex justify-center px-3 py-3 rounded-xl transition-all duration-200
                  ${item.disabled 
                    ? 'text-muted-foreground/50 opacity-50 cursor-not-allowed' 
                    : activeTab === item.id 
                      ? 'bg-accent text-foreground' 
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }
                `}
                title={item.label}
                disabled={item.disabled}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
              </button>
            ))}
            </nav>
          </div>
        </div>

        {/* Bottom-left theme toggle in hidden mode */}
        <div className="mt-auto px-3 pb-4">
          <button
            onClick={() => setTheme((resolvedTheme === 'dark' || theme === 'dark') ? 'light' : 'dark')}
            className="w-full flex justify-center px-3 py-3 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground"
            title="Toggle theme"
          >
            {(resolvedTheme === 'dark' || theme === 'dark') ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="border-b border-border px-6 py-6 bg-card">
        <div className="flex items-center gap-3">
          <img
            src="/images/TSL_ICON.png"
            alt="TSL Logo"
            className="h-12 w-auto"
          />
          {!isCollapsed && (
            <div>
              <span className="font-bold text-xl text-foreground">PREP</span>
              <p className="text-xs text-muted-foreground">Construction Management</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4">
        <div className="px-3">
          {!isCollapsed && (
            <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase mb-4 px-3">
              MAIN NAVIGATION
            </div>
          )}
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => !item.disabled && setActiveTab(item.id as PageType)}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                  ${item.disabled 
                    ? 'text-muted-foreground/50 opacity-50 cursor-not-allowed' 
                    : activeTab === item.id 
                      ? 'bg-accent text-foreground font-medium' 
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.label : undefined}
                disabled={item.disabled}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium text-sm text-foreground">{item.label}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="mt-auto px-3 pb-4">
        <button
          onClick={() => setTheme((resolvedTheme === 'dark' || theme === 'dark') ? 'light' : 'dark')}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors
            text-muted-foreground hover:bg-accent hover:text-foreground
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title={isCollapsed ? 'Toggle theme' : undefined}
        >
          {(resolvedTheme === 'dark' || theme === 'dark') ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          {!isCollapsed && (
            <span className="font-medium text-sm text-foreground">Toggle theme</span>
          )}
        </button>
      </div>
    </div>
  )
}