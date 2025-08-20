"use client"

import React, { useMemo } from "react"
import { Plus } from "lucide-react"
import { useDashboardStore } from "../pages/DashboardPage"
import { PrimaryButton, WidgetConfig } from "../ui/shared-components"

interface EditSidePanelProps {
  pageName: string
  pageWidgets: WidgetConfig[]
  showWidgetChooser?: boolean
  setShowWidgetChooser?: (show: boolean) => void
  setShowTypeToCreate?: (show: boolean) => void
  updateWidget?: (id: string, updates: Partial<WidgetConfig>) => void
  moveWidget?: (id: string, direction: -1 | 1) => void
}

export default function EditSidePanel({
  pageName,
  pageWidgets,
  showWidgetChooser = false,
  setShowWidgetChooser = () => {},
  setShowTypeToCreate = () => {},
  updateWidget = () => {},
  moveWidget = () => {}
}: EditSidePanelProps) {
  const { editMode, searchQuery, setSearchQuery } = useDashboardStore()

  const filteredWidgets = useMemo(() => {
    if (!searchQuery) return pageWidgets
    const query = searchQuery.toLowerCase()
    return pageWidgets.filter(
      (w) =>
        w.title.toLowerCase().includes(query) ||
        w.area.toLowerCase().includes(query) ||
        w.id.toLowerCase().includes(query)
    )
  }, [pageWidgets, searchQuery])

  const enabledCount = pageWidgets.filter((w) => w.enabled).length
  const totalCount = pageWidgets.length

  const toggleAll = (enabled: boolean) => {
    // Update all widgets to the specified enabled state
    pageWidgets.forEach(widget => {
      updateWidget(widget.id, { enabled })
    })
  }

  // Use the passed functions directly (they have default fallbacks)
  if (!editMode) return null

  return (
    <div className="fixed right-0 top-0 h-full w-[420px] bg-background/80 backdrop-blur-md shadow-xl border-l border-border z-40 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{pageName} Widgets</h2>
            <p className="text-sm text-muted-foreground mt-1">Toggle, size, and reorder.</p>
          </div>
          <div className="flex items-center gap-2">
            <PrimaryButton
              onClick={() => {
                console.log('🔘 Create Widget button clicked!')
                setShowWidgetChooser(true)
                console.log('✅ setShowWidgetChooser(true) called')
              }}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Widget
            </PrimaryButton>
            <PrimaryButton
              onClick={() => {
                useDashboardStore.getState().setEditMode(false)
              }}
              className="px-4 py-2 text-sm"
            >
              Save & Close
            </PrimaryButton>
          </div>
        </div>
      </div>

      {/* Search and Bulk Actions */}
      <div className="p-6 border-b border-border bg-card/50">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search widgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-card border border-border rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none shadow-sm hover:shadow-md transition-shadow"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{enabledCount} of {totalCount} enabled</span>
            <button
              onClick={() => toggleAll(true)}
              className="px-3 py-1 text-xs bg-card border border-border rounded hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md transition-shadow"
            >
              Enable All
            </button>
            <button
              onClick={() => toggleAll(false)}
              className="px-3 py-1 text-xs bg-card border border-border rounded hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md transition-shadow"
            >
              Disable All
            </button>
          </div>
        </div>
      </div>

      {/* Widget List */}
      <div className="p-6 overflow-y-auto h-[calc(100vh-200px)]">
        <div className="grid grid-cols-1 gap-4">
          {filteredWidgets.map((widget) => (
            <div
              key={widget.id}
              className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm hover:shadow-md"
            >
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={widget.enabled}
                  onChange={(e) => updateWidget(widget.id, { enabled: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary focus:ring-2"
                />
                <div>
                  <div className="text-sm font-medium text-foreground">{widget.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                      {widget.area}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Size:</span>
                  <select
                    value={widget.size.toUpperCase()}
                    onChange={(e) => updateWidget(widget.id, { size: e.target.value.toLowerCase() as any })}
                    className="w-20 px-2 py-1 text-xs bg-card border border-border rounded focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none"
                  >
                    <option value="SM">SM</option>
                    <option value="MD">MD</option>
                    <option value="LG">LG</option>
                    <option value="XL">XL</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveWidget(widget.id, -1)}
                    className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveWidget(widget.id, 1)}
                    className="p-1 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
         </div>
   )
 }