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
    <div className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-xl border-l border-neutral-200 z-40 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-800">{pageName} Widgets</h2>
            <p className="text-sm text-neutral-500 mt-1">Toggle, size, and reorder.</p>
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
      <div className="p-6 border-b border-neutral-200 bg-neutral-50">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search widgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-neutral-200 rounded-lg focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-none"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">🔍</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <span>{enabledCount} of {totalCount} enabled</span>
            <button
              onClick={() => toggleAll(true)}
              className="px-3 py-1 text-xs bg-white border border-neutral-200 rounded hover:bg-neutral-100"
            >
              Enable All
            </button>
            <button
              onClick={() => toggleAll(false)}
              className="px-3 py-1 text-xs bg-white border border-neutral-200 rounded hover:bg-neutral-100"
            >
              Disable All
            </button>
          </div>
        </div>
      </div>

      {/* Widget List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-3">
          {filteredWidgets.map((widget) => (
            <div
              key={widget.id}
              className={`
                p-4 border rounded-lg transition-all duration-200 hover:shadow-md
                ${widget.enabled ? 'bg-white border-neutral-200' : 'bg-neutral-50 border-neutral-100'}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      checked={widget.enabled}
                      onChange={(e) => updateWidget(widget.id, { enabled: e.target.checked })}
                      className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                    />
                    <h3 className="text-sm font-medium text-neutral-800 truncate">
                      {widget.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <span className="bg-neutral-100 px-2 py-1 rounded capitalize">
                      {widget.area}
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded capitalize">
                      {widget.size}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <button
                    onClick={() => moveWidget(widget.id, -1)}
                    className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded"
                    disabled={widget.order === 0}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveWidget(widget.id, 1)}
                    className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded"
                  >
                    ↓
                  </button>
                </div>
              </div>
              
              {/* Size Controls */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-neutral-500">Size:</span>
                {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => updateWidget(widget.id, { size })}
                    className={`
                      px-2 py-1 text-xs rounded transition-colors
                      ${widget.size === size
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }
                    `}
                  >
                    {size.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}