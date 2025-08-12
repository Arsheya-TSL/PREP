"use client"

import { useEffect, useState } from "react"
import { PanelLeft, PanelLeftClose } from "lucide-react"
import { Button } from "../ui/button"
import { useLayoutState } from "../../hooks/useLayoutState"
import { useDashboardStore } from "../../components/pages/DashboardPage"
import { PageType } from "../../lib/types"
import AppSidebar from "./AppSidebar"
import AppHeader from "./AppHeader"

type SidebarMode = 'expanded' | 'collapsed' | 'hidden'

interface AppLayoutProps {
  children: React.ReactNode
  activeTab: PageType
  setActiveTab: (tab: PageType) => void
}

export default function AppLayout({ children, activeTab, setActiveTab }: AppLayoutProps) {
  const { mode, setMode, cycle } = useLayoutState()
  const { editMode, setEditMode } = useDashboardStore()
  const [isMobile, setIsMobile] = useState(false)

  // Update CSS variable when mode changes
  useEffect(() => {
    const width = mode === 'expanded' ? '248px' : mode === 'collapsed' ? '72px' : '72px'
    document.documentElement.style.setProperty('--sb', width)
  }, [mode])

  // Handle mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle escape key for mobile overlay
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mode === 'hidden' && isMobile) {
        setMode('expanded')
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [mode, isMobile, setMode])

  return (
    <div className="min-h-screen bg-neutral-50">
                           {/* Sidebar */}
        <aside 
          id="app-sidebar"
          className={`
            fixed left-0 top-0 z-40 h-full bg-white border-r border-neutral-200 transition-all duration-300 ease-out
            ${mode === 'expanded' ? 'w-[248px]' : mode === 'collapsed' ? 'w-[72px]' : 'w-[72px]'}
            ${mode === 'collapsed' ? 'rounded-r-2xl' : ''}
          `}
        >
         <AppSidebar 
           activeTab={activeTab} 
           setActiveTab={setActiveTab} 
           mode={mode}
         />
       </aside>

       {/* Mobile overlay backdrop */}
       {mode === 'hidden' && isMobile && (
         <div 
           className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
           onClick={() => setMode('expanded')}
         />
       )}

                       {/* Main content area */}
         <div 
           className={`
             transition-all duration-300 ease-out
             ${mode === 'expanded' ? 'pl-[248px]' : mode === 'collapsed' ? 'pl-[72px]' : 'pl-[72px]'}
           `}
         >
          {/* Header */}
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-6">
                {/* Sidebar Toggle Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={cycle}
                  aria-controls="app-sidebar"
                  aria-expanded={mode !== 'hidden'}
                  aria-pressed={mode !== 'hidden'}
                  className="h-11 w-11 rounded-xl hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                >
                  {mode === 'hidden' ? (
                    <PanelLeft className="h-5 w-5" />
                  ) : (
                    <PanelLeftClose className="h-5 w-5" />
                  )}
                </Button>

                {/* Project Filter */}
                <div className="w-48">
                <select className="w-full h-11 px-3 text-sm bg-white border border-neutral-200 rounded-lg focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-none">
                  <option>All Projects</option>
                  <option>Active Projects</option>
                  <option>Completed Projects</option>
                </select>
              </div>

              {/* Search */}
              {!isMobile && (
                <div className="relative w-72">
                  <input
                    type="text"
                    placeholder="Search projects, suppliers..."
                    className="w-full h-11 pl-10 pr-4 text-sm bg-white border border-neutral-200 rounded-lg focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-none"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">🔍</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Date Range */}
              <div className="w-48">
                <select className="w-full h-11 px-3 text-sm bg-white border border-neutral-200 rounded-lg focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-none">
                  <option>Monthly view</option>
                  <option>Quarterly view</option>
                  <option>Yearly view</option>
                  <option>Custom view</option>
                </select>
              </div>

                             {/* Customize Button */}
               <Button 
                 variant="ghost" 
                 onClick={() => setEditMode(!editMode)}
                 className="h-11 px-4 rounded-xl hover:bg-neutral-100"
               >
                 {editMode ? "Done" : "Customize"}
               </Button>
               {editMode && (
                 <Button 
                   variant="ghost" 
                   onClick={() => setEditMode(false)}
                   className="h-11 px-4 rounded-xl hover:bg-neutral-100 text-red-600 hover:text-red-700"
                 >
                   Exit Edit Mode
                 </Button>
               )}

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-xl hover:bg-neutral-100">
                <span className="text-lg">🔔</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
              </Button>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                JD
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="max-w-screen-2xl mx-auto px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  )
} 