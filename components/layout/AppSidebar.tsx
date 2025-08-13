import { Building2, LayoutDashboard, Users, FileText, DollarSign, MessageSquare, Settings, Globe } from "lucide-react"
import { PageType } from "../../lib/types"

type SidebarMode = 'expanded' | 'collapsed' | 'hidden'

interface AppSidebarProps {
  activeTab: PageType
  setActiveTab: (tab: PageType) => void
  mode: SidebarMode
}

export default function AppSidebar({ activeTab, setActiveTab, mode }: AppSidebarProps) {
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
      <div className="h-full flex flex-col bg-white border-r border-neutral-200">
        {/* Minimal header with just icon */}
        <div className="border-b border-neutral-200 px-3 py-6 bg-white">
          <div className="flex justify-center">
            <img
              src="/_next/static/media/tsl%20icon.png"
              alt="TSL Logo"
              className="h-14 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="h-14 w-14 bg-blue-600 rounded-lg flex items-center justify-center hidden">
              <span className="text-white font-bold text-lg">TSL</span>
            </div>
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
                    ? 'text-neutral-300 opacity-50 cursor-not-allowed' 
                    : activeTab === item.id 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
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
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-neutral-200 px-6 py-6 bg-white">
        <div className="flex items-center gap-3">
          <img
            src="/_next/static/media/tsl%20icon.png"
            alt="TSL Logo"
            className="h-12 w-auto"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center hidden">
            <span className="text-white font-bold text-sm">TSL</span>
          </div>
          {!isCollapsed && (
            <div>
              <span className="font-bold text-xl text-neutral-800">PREP</span>
              <p className="text-xs text-neutral-600">Construction Management</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4">
        <div className="px-3">
          {!isCollapsed && (
            <div className="text-neutral-500 text-xs font-semibold tracking-wider uppercase mb-4 px-3">
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
                    ? 'text-neutral-300 opacity-50 cursor-not-allowed' 
                    : activeTab === item.id 
                      ? 'bg-blue-100 text-blue-700 font-medium' 
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.label : undefined}
                disabled={item.disabled}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}