"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line, BarChart, Bar } from 'recharts'
import { create } from "zustand"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Plus } from "lucide-react"
import WidgetChooserModal from "../modals/WidgetChooserModal"
import { monthlyData } from "../../lib/constants"
import TypeToCreateWidgetModal from "../modals/TypeToCreateWidgetModal"
import EditProjectModal from "../modals/EditProjectModal"
import { PrimaryButton, GhostButton } from "../ui/shared-components"

// -----------------------------
// Types
// -----------------------------
export type WidgetSize = "sm" | "md" | "lg" | "xl"
export type WidgetArea = "projects" | "itt" | "financial" | "supply" | "insights" | "analytics"

export interface WidgetConfig {
  id: string
  title: string
  area: WidgetArea
  size: WidgetSize
  enabled: boolean
  order: number
  // AI Widget support
  definition?: any // Store the original WidgetDefinition for AI-generated widgets
}

// Helper functions for AI widget mapping
function mapSourceToArea(source: string): WidgetArea {
  const mapping: Record<string, WidgetArea> = {
    'projects': 'projects',
    'itts': 'itt',
    'suppliers': 'supply',
    'costs': 'financial',
    'issues': 'insights',
    'regionMetrics': 'analytics'
  }
  return mapping[source] || 'analytics'
}

function mapSizeToWidgetSize(size: string): WidgetSize {
  const mapping: Record<string, WidgetSize> = {
    'sm': 'sm',
    'md': 'md',
    'lg': 'lg',
    'xl': 'xl'
  }
  return mapping[size] || 'md'
}

export type GlobalRange = "Monthly" | "Quarterly" | "Yearly" | "Custom"

// -----------------------------
// Utility Functions
// -----------------------------
function formatNumberCompact(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return num.toString()
}

// -----------------------------
// Mock data + aggregations
// -----------------------------
const BASE = {
  totalProjects: 24,
  completed: 18,
  active: 6,
  kpis: { onTime: 83, completion: 65, risk: 79 },
  projects: [
    { id: 1, name: "Waterfront Office Complex", location: "London, UK", progress: 75 },
    { id: 2, name: "City Hospital Extension", location: "Manchester, UK", progress: 45 },
    { id: 3, name: "Metro Station Upgrade", location: "Berlin, Germany", progress: 92 },
  ],
  deadlines: [
    { title: "Final Inspection", project: "Metro Station Upgrade", tag: "High", remaining: "3d" },
    { title: "Electrical ITT Due", project: "Waterfront Office Complex", tag: "Medium", remaining: "7d" },
    { title: "Structural Review", project: "City Hospital Extension", tag: "Low", remaining: "12d" },
    { title: "HVAC Systems", project: "Tech Campus Phase 2", tag: "Medium", remaining: "15d" },
  ],
  suppliers: [
    { name: "SteelWorks Ltd", score: 95, reason: "Best price on steel; 96% on-time", region: "UK" },
    { name: "EuroConcrete", score: 91, reason: "Reliable lead times; low defects", region: "DE" },
    { name: "HVAC Pro", score: 88, reason: "Fast response; competitive pricing", region: "UK" },
  ],
  insights: [
    { title: "Budget Efficiency", value: "94%", trend: "+2.1%", color: "green" },
    { title: "Supplier Performance", value: "87%", trend: "+1.8%", color: "blue" },
    { title: "Risk Assessment", value: "Low", trend: "Stable", color: "amber" },
  ],
  satisfaction: [
    { month: "Jan", score: 82 },
    { month: "Feb", score: 85 },
    { month: "Mar", score: 88 },
    { month: "Apr", score: 91 },
    { month: "May", score: 89 },
    { month: "Jun", score: 93 },
  ],
}

function aggregate(range: GlobalRange, projects?: any[]) {
  const factor = range === "Monthly" ? 1 : range === "Quarterly" ? 1.15 : range === "Yearly" ? 1.35 : 1.05
  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)))
  return {
    totalProjects: Math.round(BASE.totalProjects * factor),
    completed: Math.round(BASE.completed * factor),
    active: Math.max(0, Math.round(BASE.totalProjects * factor) - Math.round(BASE.completed * factor)),
    kpis: {
      onTime: clamp(BASE.kpis.onTime - (factor - 1) * 8),
      completion: clamp(BASE.kpis.completion + (factor - 1) * 10),
      risk: clamp(BASE.kpis.risk - (factor - 1) * 5),
    },
    projects: projects || BASE.projects,
    deadlines: BASE.deadlines,
    suppliers: BASE.suppliers,
    insights: BASE.insights,
    satisfaction: BASE.satisfaction,
  }
}

// -----------------------------
// Default widget configurations
// -----------------------------
const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "total-projects", title: "Total Live Tenders", area: "projects", size: "xl", enabled: true, order: 1 },
  { id: "active-projects", title: "Active Projects", area: "projects", size: "lg", enabled: true, order: 2 },
  { id: "kpis", title: "Active Project KPIs", area: "analytics", size: "lg", enabled: true, order: 3 },
  { id: "budget-vs-spend", title: "Budget vs Spend", area: "financial", size: "xl", enabled: true, order: 4 },
  { id: "deadlines", title: "ITT Deadlines", area: "itt", size: "lg", enabled: true, order: 5 },
  { id: "supplier-rankings", title: "Supplier Rankings", area: "supply", size: "md", enabled: false, order: 6 },
  { id: "completion-rate", title: "Completion Rate", area: "analytics", size: "md", enabled: false, order: 7 },
  { id: "supplier-network", title: "Supplier Network", area: "supply", size: "lg", enabled: false, order: 8 },
  { id: "quick-insights", title: "Quick Insights", area: "insights", size: "md", enabled: false, order: 9 },
  { id: "pending-itts", title: "Pending ITTs", area: "itt", size: "md", enabled: false, order: 10 },
  { id: "satisfaction-trend", title: "Satisfaction Trend", area: "insights", size: "lg", enabled: false, order: 11 },
  { id: "performance-analytics", title: "Performance Analytics", area: "analytics", size: "xl", enabled: false, order: 12 },
]

// -----------------------------
// Store (Zustand) with localStorage persistence
// -----------------------------
interface DashboardState {
  range: GlobalRange
  setRange: (r: GlobalRange) => void
  editMode: boolean
  setEditMode: (v: boolean) => void
  widgets: WidgetConfig[]
  setWidgets: (updater: (prev: WidgetConfig[]) => WidgetConfig[]) => void
  saveWidgets: () => void
  resetToDefaults: () => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  hasUnsavedChanges: boolean
  setHasUnsavedChanges: (v: boolean) => void
  originalWidgets: WidgetConfig[]
  setOriginalWidgets: (widgets: WidgetConfig[]) => void
  // AI Widget support
  addAIWidget: (definition: any) => void
  removeAIWidget: (id: string) => void
  // Utility Widget support
  addUtilityWidget: (definition: any) => void
  // Project management
  projects: any[]
  setProjects: (projects: any[]) => void
  updateProject: (updatedProject: any) => void
}

const STORAGE_KEY = "prep.dashboard.v5"

export const useDashboardStore = create<DashboardState>((set, get) => ({
  range: "Monthly",
  setRange: (r) => {
    set({ range: r })
    persist()
  },
  editMode: false,
  setEditMode: (v) => set({ editMode: v }),
  widgets: DEFAULT_WIDGETS,
  setWidgets: (updater) => {
    const next = updater(get().widgets)
    set({ widgets: next, hasUnsavedChanges: true })
  },
  saveWidgets: () => {
    console.log('💾 Save widgets called, current widgets:', get().widgets)
    persist()
    set({ hasUnsavedChanges: false, originalWidgets: get().widgets })
    console.log('✅ Save widgets completed')
  },
  resetToDefaults: () => {
    set({ widgets: DEFAULT_WIDGETS, hasUnsavedChanges: true })
  },
  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),
  hasUnsavedChanges: false,
  setHasUnsavedChanges: (v) => set({ hasUnsavedChanges: v }),
  originalWidgets: DEFAULT_WIDGETS,
  setOriginalWidgets: (widgets) => set({ originalWidgets: widgets }),
  // AI Widget support
  addAIWidget: (definition) => {
    const newWidget: WidgetConfig = {
      id: `ai-widget-${Date.now()}`,
      title: definition.name,
      area: mapSourceToArea(definition.source),
      size: mapSizeToWidgetSize(definition.size),
      enabled: true,
      order: get().widgets.length + 1,
      definition: definition // Store the original definition for rendering
    }
    set((state) => ({
      widgets: [...state.widgets, newWidget],
      hasUnsavedChanges: true
    }))
  },
  removeAIWidget: (id) => {
    set((state) => ({
      widgets: state.widgets.filter(w => w.id !== id),
      hasUnsavedChanges: true
    }))
  },
  // Utility Widget support
  addUtilityWidget: (definition) => {
    const newWidget: WidgetConfig = {
      id: `utility-${Date.now()}`,
      title: definition.name,
      area: 'analytics', // Default area for utility widgets
      size: definition.size,
      enabled: true,
      order: get().widgets.length + 1,
      definition: definition // Store the original definition for rendering
    }
    set((state) => ({
      widgets: [...state.widgets, newWidget],
      hasUnsavedChanges: true
    }))
  },
  // Project management
  projects: BASE.projects,
  setProjects: (projects) => set({ projects }),
  updateProject: (updatedProject) => {
    set((state) => ({
      projects: state.projects.map(p => 
        p.id === updatedProject.id ? updatedProject : p
      )
    }))
  }
}))

function loadPersisted(): { range: GlobalRange; widgets: WidgetConfig[] } | null {
  try {
    // Check if localStorage is available (client-side only)
    if (typeof window === 'undefined' || !window.localStorage) {
      console.log('📂 localStorage not available (server-side)')
      return null
    }
    
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      console.log('📂 No persisted data found')
      return null
    }
    const data = JSON.parse(raw)
    console.log('📂 Loaded persisted data:', data)
    return data
  } catch (error) {
    console.error('❌ Failed to load persisted data:', error)
    return null
  }
}

function persist() {
  try {
    // Check if localStorage is available (client-side only)
    if (typeof window === 'undefined' || !window.localStorage) {
      console.log('💾 localStorage not available (server-side)')
      return
    }
    
    const { range, widgets } = useDashboardStore.getState()
    const data = { range, widgets }
    console.log('💾 Persisting data:', data)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('❌ Failed to persist:', error)
  }
}

// -----------------------------
// UI Primitives
// -----------------------------
function Dropdown({ value, options, onChange, ariaLabel, className = "" }: {
  value: string
  options: string[]
  onChange: (v: string) => void
  ariaLabel: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        aria-label={ariaLabel}
        onClick={() => setOpen((s) => !s)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
      >
        <span className="text-neutral-800 truncate">{value}</span>
        <span className="text-neutral-400 ml-2">▼</span>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl bg-white ring-1 ring-neutral-200 shadow-lg overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt)
                setOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 focus-visible:bg-neutral-100"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Toggle({ checked, onChange, ariaLabel }: {
  checked: boolean
  onChange: (checked: boolean) => void
  ariaLabel: string
}) {
  return (
    <button
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
        checked ? "bg-neutral-800" : "bg-neutral-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  )
}



// -----------------------------
// Size helpers
// -----------------------------
function colSpan(size: WidgetSize) {
  switch (size) {
    case "sm":
      return "col-span-12 md:col-span-6 lg:col-span-3"
    case "md":
      return "col-span-12 md:col-span-6"
    case "lg":
      return "col-span-12 lg:col-span-6"
    case "xl":
      return "col-span-12"
  }
}

function getSizeTooltip(size: WidgetSize) {
  switch (size) {
    case "sm":
      return "Compact: headline metric only"
    case "md":
      return "Standard: short list or 2-3 KPIs"
    case "lg":
      return "Rich: list + secondary stat or mini chart"
    case "xl":
      return "Full: complete chart/table view"
  }
}

// -----------------------------
// Edit Toolbar (sticky top bar)
// -----------------------------
function EditToolbar() {
  const { editMode, setEditMode, hasUnsavedChanges, saveWidgets, originalWidgets, setWidgets } = useDashboardStore()

  const handleSave = () => {
    saveWidgets()
  }

  const handleCancel = () => {
    console.log('🔧 Cancel clicked - reverting to original widgets')
    setWidgets(() => originalWidgets)
    setEditMode(false)
  }

  const handleExit = () => {
    console.log('🔧 Exit clicked - hasUnsavedChanges:', hasUnsavedChanges)
    if (hasUnsavedChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to exit?")) {
        setEditMode(false)
      }
    } else {
      setEditMode(false)
    }
  }

  if (!editMode) return null

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-neutral-200 px-6 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-neutral-800">Editing Dashboard</h2>
          {hasUnsavedChanges && (
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <GhostButton onClick={handleSave} disabled={!hasUnsavedChanges}>
            Save
          </GhostButton>
          <GhostButton onClick={handleCancel}>Cancel</GhostButton>
          <GhostButton onClick={handleExit}>Exit</GhostButton>
          <PrimaryButton onClick={() => { 
            console.log('🔧 Save & Close clicked')
            handleSave(); 
            setEditMode(false); 
          }}>
            Save & Close
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}

// -----------------------------
// Edit Side Panel
// -----------------------------
function EditSidePanel({ 
  showWidgetChooser, 
  setShowWidgetChooser, 
  setShowTypeToCreate 
}: {
  showWidgetChooser: boolean
  setShowWidgetChooser: (show: boolean) => void
  setShowTypeToCreate: (show: boolean) => void
}) {
  const { editMode, widgets, setWidgets, searchQuery, setSearchQuery, resetToDefaults, addAIWidget } = useDashboardStore()

  const filteredWidgets = useMemo(() => {
    if (!searchQuery) return widgets
    const query = searchQuery.toLowerCase()
    return widgets.filter(
      (w) =>
        w.title.toLowerCase().includes(query) ||
        w.area.toLowerCase().includes(query) ||
        w.id.toLowerCase().includes(query)
    )
  }, [widgets, searchQuery])

  const enabledCount = widgets.filter((w) => w.enabled).length
  const totalCount = widgets.length

  const toggleAll = (enabled: boolean) => {
    setWidgets((prev) =>
      prev.map((w) => ({ ...w, enabled }))
    )
  }

  const updateWidget = (id: string, updates: Partial<WidgetConfig>) => {
    setWidgets((prev) => {
      const updatedItems = prev.map((w) => {
        if (w.id === id) {
          // Apply updates directly; layout logic will reflow items by order at render time
          const updatedItem = { ...w, ...updates }
          return updatedItem
        }
        return w
      })
      
      return updatedItems
    })
  }

  const moveWidget = (id: string, direction: -1 | 1) => {
    setWidgets((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order)
      const idx = sorted.findIndex((w) => w.id === id)
      const swapIdx = idx + direction
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev
      const a = sorted[idx]
      const b = sorted[swapIdx]
      ;[a.order, b.order] = [b.order, a.order]
      return sorted
    })
  }

  if (!editMode) return null

  return (
    <div className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-xl border-l border-neutral-200 z-40 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-800">Dashboard Widgets</h2>
            <p className="text-sm text-neutral-500 mt-1">Toggle, size, and reorder.</p>
          </div>
          <div className="flex items-center gap-2">
            <PrimaryButton
              onClick={() => {
                console.log('🔘 Create Widget button clicked!')
                console.log('📊 Current showWidgetChooser state:', showWidgetChooser)
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
                useDashboardStore.getState().saveWidgets()
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
          <button
            onClick={resetToDefaults}
            className="text-sm text-neutral-600 hover:text-neutral-800 underline"
          >
            Reset to defaults
          </button>
        </div>
      </div>

      {/* Widget List */}
      <div className="p-6 overflow-y-auto h-[calc(100vh-200px)]">
        <div className="grid grid-cols-1 gap-4">
          {filteredWidgets.map((widget) => (
            <div
              key={widget.id}
              className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <Toggle
                  checked={widget.enabled}
                  onChange={(enabled) => updateWidget(widget.id, { enabled })}
                  ariaLabel={`toggle-${widget.id}`}
                />
                <div>
                  <div className="text-sm font-medium text-neutral-800">{widget.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-neutral-100 text-neutral-600 rounded-full px-2 py-0.5">
                      {widget.area}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">Size:</span>
                  <Dropdown
                    value={widget.size.toUpperCase()}
                    options={["SM", "MD", "LG", "XL"]}
                    onChange={(size) => updateWidget(widget.id, { size: size.toLowerCase() as WidgetSize })}
                    ariaLabel={`size-${widget.id}`}
                    className="w-20"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveWidget(widget.id, -1)}
                    className="p-1 text-neutral-400 hover:text-neutral-600"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveWidget(widget.id, 1)}
                    className="p-1 text-neutral-400 hover:text-neutral-600"
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

// -----------------------------
// iPhone-style Drag and Drop Components
// -----------------------------
export function SortableWidgetCard({ widget, children }: { widget: WidgetConfig; children: React.ReactNode }) {
  const { editMode, widgets } = useDashboardStore()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: widget.id,
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  })
  


  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (!editMode) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
        {children}
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative transition-all duration-200 ease-out ${isDragging ? "opacity-50 scale-95 z-50" : ""}`}
    >
      <div 
        className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 h-full relative"
        {...attributes}
        {...listeners}
      >
        {/* Drag Handle */}
        <div
          className="absolute top-3 left-3 w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-lg cursor-grab active:cursor-grabbing flex items-center justify-center text-blue-600 text-sm font-bold z-10 transition-all duration-150 hover:scale-110 shadow-sm border border-blue-200"
          title="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
        >
          ⋮⋮
        </div>
        {/* Order Indicator */}
        <div className="absolute top-3 right-3 w-5 h-5 bg-neutral-100 rounded-full flex items-center justify-center text-xs text-neutral-600 font-medium">
          {widgets.findIndex(w => w.id === widget.id) + 1}
        </div>
        {/* Content with proper spacing for edit mode */}
        <div className={editMode ? "pt-8" : ""}>
          {children}
        </div>
      </div>
    </div>
  )
}

// -----------------------------
// Widget Frame
// -----------------------------
export function WidgetFrame({ widget, children }: { widget: WidgetConfig; children: React.ReactNode }) {
  return (
    <SortableWidgetCard widget={widget}>
      {children}
    </SortableWidgetCard>
  )
}

// -----------------------------
// Individual Widgets (size-aware with compact formatting)
// -----------------------------
function TotalProjects({ size, data }: { size: WidgetSize; data: ReturnType<typeof aggregate> }) {
  const compact = size === "sm"
  const big = size === "xl" || size === "lg"
  const countClass = big ? "text-3xl md:text-4xl" : "text-2xl"
  
  // Calculate live tenders data (mock data for now)
  const totalTenders = 28
  const activeTenders = 15
  const completedTenders = 13
  const yearlyProgress = Math.round((totalTenders / 50) * 100) // Assuming target of 50 tenders/year
  
  // Mock country breakdown (top 3)
  const topCountries = [
    { country: 'UK', count: 12 },
    { country: 'Germany', count: 8 },
    { country: 'France', count: 5 }
  ]
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-600">Total Live Tenders</h3>
          {!compact && <p className="text-xs text-neutral-500">Active ITTs across all projects</p>}
        </div>
        <span className="text-2xl">📄</span>
      </div>
      <div className="mb-4">
        <div className={`${countClass} font-bold text-neutral-800`}>
          {compact ? formatNumberCompact(totalTenders) : totalTenders}
        </div>
        {!compact && <div className="flex items-center text-sm text-green-600 mt-1">↗ +{activeTenders} active this month</div>}
      </div>
      {!compact && (
        <div className="space-y-3">
          {/* Yearly Progress */}
          <div>
            <div className="flex justify-between text-xs text-neutral-500 mb-1">
              <span>Yearly Progress</span>
              <span>{yearlyProgress}%</span>
            </div>
            <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600" 
                style={{ width: `${Math.min(yearlyProgress, 100)}%` }} 
              />
            </div>
          </div>
          
          {/* Top Countries */}
          <div className="space-y-1">
            <div className="text-xs text-neutral-500 mb-2">Top Regions</div>
            {topCountries.map(({ country, count }) => (
              <div key={country} className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-800">{country}</span>
                <div className="flex items-center gap-2 flex-1 mx-2">
                  <div className="flex-1 h-1 bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" 
                      style={{ width: `${(count / totalTenders) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-neutral-500 w-4">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ActiveProjects({ size, data, onEditClick }: { size: WidgetSize; data: ReturnType<typeof aggregate>; onEditClick?: (project: any) => void }) {
  const items = size === "sm" ? data.projects.slice(0, 1) : size === "md" ? data.projects.slice(0, 2) : data.projects
  const compact = size === "sm"
  
  // Calculate timeline progress for projects
  const calculateTimelineProgress = (project: any) => {
    const startDate = new Date('2024-01-01') // Mock start date
    const endDate = new Date('2024-12-31') // Mock end date
    const currentDate = new Date()
    const totalDuration = endDate.getTime() - startDate.getTime()
    const elapsedTime = currentDate.getTime() - startDate.getTime()
    const timelineProgress = Math.min(100, Math.max(0, (elapsedTime / totalDuration) * 100))
    return Math.round(timelineProgress)
  }
  
  return (
    <div className={compact ? "pt-6" : ""}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-600">Active Projects</h3>
          {!compact && <p className="text-xs text-neutral-500">Timeline progress vs planned</p>}
        </div>
        <span className="text-2xl">📅</span>
      </div>
      <div className="space-y-3">
        {items.map((p) => {
          const timelineProgress = calculateTimelineProgress(p)
          const isOnTrack = p.progress >= timelineProgress - 10 // 10% tolerance
          return (
            <div key={p.name} className="p-3 hover:bg-neutral-50 rounded-lg border border-neutral-100 cursor-pointer group">
              <div className="flex items-center justify-between mb-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-neutral-800 truncate">{p.name}</div>
                  {!compact && <div className="text-xs text-neutral-500">{p.location}</div>}
                </div>
                <span
                  className={`ml-4 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    isOnTrack
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-amber-100 text-amber-700 border border-amber-200"
                  }`}
                >
                  {isOnTrack ? 'On Track' : 'Behind'}
                </span>
              </div>
              
              {!compact && (
                <div className="space-y-2">
                  {/* Project Progress */}
                  <div>
                    <div className="flex justify-between text-xs text-neutral-500 mb-1">
                      <span>Project Progress</span>
                      <span>{p.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500" 
                        style={{ width: `${p.progress}%` }} 
                      />
                    </div>
                  </div>
                  
                  {/* Timeline Progress */}
                  <div>
                    <div className="flex justify-between text-xs text-neutral-500 mb-1">
                      <span>Time Elapsed</span>
                      <span>{timelineProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOnTrack 
                            ? 'bg-gradient-to-r from-green-500 to-green-600' 
                            : 'bg-gradient-to-r from-amber-500 to-orange-500'
                        }`}
                        style={{ width: `${timelineProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {compact && (
                <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      isOnTrack
                        ? "bg-gradient-to-r from-green-500 to-green-600"
                        : "bg-gradient-to-r from-amber-500 to-orange-500"
                    }`} 
                    style={{ width: `${p.progress}%` }} 
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
      {!compact && (
        <div className="mt-4 pt-3 border-t border-neutral-100">
          <button 
            onClick={() => onEditClick?.(items[0])} // Open modal with first project for demo
            className="w-full px-3 py-2 text-xs text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-neutral-200 hover:border-blue-200 transition-all duration-200 font-medium"
          >
            📝 Edit Project Timelines
          </button>
        </div>
      )}
    </div>
  )
}

function KPIs({ size, data }: { size: WidgetSize; data: ReturnType<typeof aggregate> }) {
  const compact = size === "sm"
  const Item = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-neutral-600">{compact ? label.split(" ")[0] : label}</span>
        <span className="text-sm font-medium text-neutral-800">{value}{label !== "Risk Score" ? "%" : ""}</span>
      </div>
      <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
  
  return (
    <div className={compact ? "pt-6" : ""}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-600">Active Project KPIs</h3>
          {!compact && <p className="text-xs text-neutral-500">Key performance indicators</p>}
        </div>
        <span className="text-2xl">📊</span>
      </div>
      <div className="space-y-4">
        <Item label="On-Time" value={data.kpis.onTime} color="bg-green-500" />
        {!compact && <Item label="Completion" value={data.kpis.completion} color="bg-blue-500" />}
        <Item label="Risk Score" value={data.kpis.risk} color="bg-amber-500" />
      </div>
    </div>
  )
}

function BudgetVsSpend({ size }: { size: WidgetSize }) {
  const xl = size === "xl"
  const compact = size === "sm"
  const [viz, setViz] = useState<'area' | 'line' | 'bar'>('area')

  return (
    <div className={compact ? "pt-6" : ""}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-600">Budget vs Spend</h3>
          {!compact && <p className="text-xs text-neutral-500">Real-time financial tracking</p>}
        </div>
        <div className="flex items-center gap-2">
          {!compact && (
            <div className="flex items-center gap-1 text-xs">
              <button onClick={() => setViz('area')} className={`px-2 py-1 rounded border ${viz==='area'?'bg-neutral-900 text-white border-neutral-900':'border-neutral-200 hover:bg-neutral-100'}`}>Area</button>
              <button onClick={() => setViz('line')} className={`px-2 py-1 rounded border ${viz==='line'?'bg-neutral-900 text-white border-neutral-900':'border-neutral-200 hover:bg-neutral-100'}`}>Line</button>
              <button onClick={() => setViz('bar')} className={`px-2 py-1 rounded border ${viz==='bar'?'bg-neutral-900 text-white border-neutral-900':'border-neutral-200 hover:bg-neutral-100'}`}>Bar</button>
            </div>
          )}
          <span className="text-2xl">💰</span>
        </div>
      </div>

      {compact ? (
        <div className="text-center">
          <div className="text-2xl font-bold text-neutral-800">94%</div>
          <div className="text-xs text-green-600">↗ +2.1%</div>
        </div>
      ) : (
        <div className="h-32 md:h-40 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-center">
          <div className="w-full h-full px-4">
            <ResponsiveContainer width="100%" height="100%">
              {viz === 'area' ? (
                <AreaChart data={monthlyData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="budgetG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="spentG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, fontSize:12 }} />
                  <Area type="monotone" dataKey="budget" stroke="#3b82f6" fill="url(#budgetG)" strokeWidth={2} />
                  <Area type="monotone" dataKey="spent" stroke="#10b981" fill="url(#spentG)" strokeWidth={2} />
                </AreaChart>
              ) : viz === 'line' ? (
                <LineChart data={monthlyData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, fontSize:12 }} />
                  <Line type="monotone" dataKey="budget" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="spent" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              ) : (
                <BarChart data={monthlyData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, fontSize:12 }} />
                  <Bar dataKey="budget" fill="#3b82f6" radius={[4,4,0,0]} />
                  <Bar dataKey="spent" fill="#10b981" radius={[4,4,0,0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

function Deadlines({ size, data }: { size: WidgetSize; data: ReturnType<typeof aggregate> }) {
  const items = size === "sm" ? data.deadlines.slice(0, 2) : size === "md" ? data.deadlines.slice(0, 3) : data.deadlines
  const compact = size === "sm"
  const pill = (tag: string) =>
    tag === "High" ? "bg-red-100 text-red-800" : tag === "Medium" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
  
  return (
    <div className={compact ? "pt-6" : ""}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-600">ITT Deadlines</h3>
          {!compact && <p className="text-xs text-neutral-500">Pending tender responses</p>}
        </div>
        <span className="text-2xl">⏰</span>
      </div>
      <div className="space-y-3">
        {items.map((d, i) => (
          <div key={i} className="flex items-center justify-between p-3 hover:bg-neutral-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-neutral-800">
                {compact ? d.title.split(" ")[0] : d.title}
                {!compact && <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${pill(d.tag)}`}>{d.tag}</span>}
              </div>
              {!compact && <div className="text-xs text-neutral-500">{d.project}</div>}
            </div>
            <div className="text-xs text-neutral-500">{d.remaining}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SupplierRankings({ size, data }: { size: WidgetSize; data: ReturnType<typeof aggregate> }) {
  const rows = size === "sm" ? data.suppliers.slice(0, 1) : size === "md" ? data.suppliers.slice(0, 2) : data.suppliers
  const compact = size === "sm"
  
  return (
    <div className={compact ? "pt-6" : ""}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-600">Supplier Rankings</h3>
          {!compact && <p className="text-xs text-neutral-500">Ranked by price, reliability, proximity</p>}
        </div>
        <span className="text-2xl">🏅</span>
      </div>
      <div className="divide-y divide-neutral-200 border border-neutral-200 rounded-xl overflow-hidden">
        {rows.map((s) => (
          <div key={s.name} className="flex items-center justify-between p-3 hover:bg-neutral-50">
            <div className="min-w-0">
              <div className="text-sm font-medium text-neutral-800 truncate">{s.name}</div>
              {!compact && <div className="text-xs text-neutral-500 truncate">{s.reason}</div>}
            </div>
            <span className="ml-4 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{s.score}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CompletionRate({ size, data }: { size: WidgetSize; data: ReturnType<typeof aggregate> }) {
  const compact = size === "sm"
  const value = data.kpis.completion
  const [viz, setViz] = useState<'bar' | 'line'>('bar')
  
  return (
    <div className={compact ? "pt-6" : ""}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-600">Completion Rate</h3>
          {!compact && <p className="text-xs text-neutral-500">Average across projects</p>}
        </div>
        <div className="flex items-center gap-2">
          {!compact && (
            <div className="flex items-center gap-1 text-xs">
              <button onClick={() => setViz('bar')} className={`px-2 py-1 rounded border ${viz==='bar'?'bg-neutral-900 text-white border-neutral-900':'border-neutral-200 hover:bg-neutral-100'}`}>Bar</button>
              <button onClick={() => setViz('line')} className={`px-2 py-1 rounded border ${viz==='line'?'bg-neutral-900 text-white border-neutral-900':'border-neutral-200 hover:bg-neutral-100'}`}>Line</button>
            </div>
          )}
          <span className="text-2xl">✅</span>
        </div>
      </div>
      {compact ? (
        <div className="text-center">
          <div className="text-2xl font-bold text-neutral-800">{value}%</div>
          <div className="text-xs text-green-600">↗ +3%</div>
        </div>
      ) : (
        <div className="h-28 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-center">
          <div className="w-full h-full px-4">
            <ResponsiveContainer width="100%" height="100%">
              {viz === 'bar' ? (
                <BarChart data={[{ label: 'Completion', value }]}> 
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" hide />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip contentStyle={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, fontSize:12 }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4,4,0,0]} />
                </BarChart>
              ) : (
                <LineChart data={[{ label: 'Now', value: value-3 }, { label: 'Current', value }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" hide />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip contentStyle={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, fontSize:12 }} />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

function SupplierNetwork({ size, data }: { size: WidgetSize; data: ReturnType<typeof aggregate> }) {
  const compact = size === "sm"
  const items = compact ? data.suppliers.slice(0, 2) : data.suppliers
  
  return (
    <div className={compact ? "pt-6" : ""}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-600">Supplier Network</h3>
          {!compact && <p className="text-xs text-neutral-500">Regional distribution</p>}
        </div>
        <span className="text-2xl">🌐</span>
      </div>
      <div className="space-y-3">
        {items.map((s) => (
          <div key={s.name} className="flex items-center justify-between p-3 hover:bg-neutral-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-neutral-800">{s.name}</div>
              {!compact && <div className="text-xs text-neutral-500">{s.region}</div>}
            </div>
            <span className="text-xs text-neutral-500">{s.score}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function QuickInsights({ size, data }: { size: WidgetSize; data: ReturnType<typeof aggregate> }) {
  const items = size === "sm" ? data.insights.slice(0, 1) : size === "md" ? data.insights.slice(0, 2) : data.insights
  const compact = size === "sm"
  
  return (
    <div className={compact ? "pt-6" : ""}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-600">Quick Insights</h3>
          {!compact && <p className="text-xs text-neutral-500">Key performance highlights</p>}
        </div>
        <span className="text-2xl">💡</span>
      </div>
      <div className="space-y-3">
        {items.map((i) => (
          <div key={i.title} className="flex items-center justify-between p-3 hover:bg-neutral-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-neutral-800">{compact ? i.title.split(" ")[0] : i.title}</div>
              {!compact && <div className="text-xs text-neutral-500">{i.trend}</div>}
            </div>
            <span className={`text-sm font-medium ${
              i.color === "green" ? "text-green-600" : 
              i.color === "blue" ? "text-blue-600" : "text-amber-600"
            }`}>
              {i.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PendingITTs({ size, data }: { size: WidgetSize; data: ReturnType<typeof aggregate> }) {
  const items = size === "sm" ? data.deadlines.slice(0, 1) : size === "md" ? data.deadlines.slice(0, 2) : data.deadlines.slice(0, 4)
  const compact = size === "sm"
  
  return (
    <div className={compact ? "pt-6" : ""}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-600">Pending ITTs</h3>
          {!compact && <p className="text-xs text-neutral-500">Awaiting responses</p>}
        </div>
        <span className="text-2xl">📄</span>
      </div>
      <div className="space-y-3">
        {items.map((d, i) => (
          <div key={i} className="flex items-center justify-between p-3 hover:bg-neutral-50 rounded-lg">
            <div className="min-w-0">
              <div className="text-sm font-medium text-neutral-800 truncate">
                {compact ? d.title.split(" ")[0] : d.title}
              </div>
              {!compact && <div className="text-xs text-neutral-500">{d.project}</div>}
            </div>
            <span className="text-xs text-neutral-500">{d.remaining}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SatisfactionTrend({ size, data }: { size: WidgetSize; data: ReturnType<typeof aggregate> }) {
  const xl = size === "xl"
  const compact = size === "sm"
  const latest = data.satisfaction[data.satisfaction.length - 1]
  
  return (
    <div className={compact ? "pt-6" : ""}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-600">Satisfaction Trend</h3>
          {!compact && <p className="text-xs text-neutral-500">Client satisfaction over time</p>}
        </div>
        <span className="text-2xl">📈</span>
      </div>
      {xl ? (
        <div className="h-32 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-center">
          <div className="w-full px-6">
            <div className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600 mb-3" />
            <div className="flex justify-between text-xs text-neutral-600">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>
        </div>
      ) : compact ? (
        <div className="text-center">
          <div className="text-2xl font-bold text-neutral-800">{latest.score}%</div>
          <div className="text-xs text-green-600">↗ +2%</div>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-2xl font-bold text-neutral-800">{latest.score}%</div>
          <div className="text-xs text-green-600">↗ +2% this month</div>
        </div>
      )}
    </div>
  )
}

function PerformanceAnalytics({ size, data }: { size: WidgetSize; data: ReturnType<typeof aggregate> }) {
  const xl = size === "xl"
  const compact = size === "sm"
  
  return (
    <div className={compact ? "pt-6" : ""}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-600">Performance Analytics</h3>
          {!compact && <p className="text-xs text-neutral-500">Comprehensive project metrics</p>}
        </div>
        <span className="text-2xl">📊</span>
      </div>
      {xl ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <div className="text-lg font-bold text-neutral-800">{data.kpis.onTime}%</div>
              <div className="text-xs text-neutral-500">On-Time</div>
            </div>
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <div className="text-lg font-bold text-neutral-800">{data.kpis.completion}%</div>
              <div className="text-xs text-neutral-500">Completion</div>
            </div>
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <div className="text-lg font-bold text-neutral-800">{data.kpis.risk}</div>
              <div className="text-xs text-neutral-500">Risk Score</div>
            </div>
          </div>
          <div className="h-24 bg-neutral-50 rounded-lg border border-neutral-200 flex items-center justify-center">
            <div className="text-sm text-neutral-500">Advanced Analytics Chart</div>
          </div>
        </div>
      ) : compact ? (
        <div className="text-center">
          <div className="text-2xl font-bold text-neutral-800">{data.kpis.onTime}%</div>
          <div className="text-xs text-green-600">On-Time Delivery</div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600">On-Time Delivery</span>
            <span className="text-sm font-medium text-neutral-800">{data.kpis.onTime}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600">Completion Rate</span>
            <span className="text-sm font-medium text-neutral-800">{data.kpis.completion}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-600">Risk Assessment</span>
            <span className="text-sm font-medium text-neutral-800">{data.kpis.risk}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// -----------------------------
// Widget Registry
// -----------------------------
function RenderWidget({ widget, data, onEditProject }: { widget: WidgetConfig; data: ReturnType<typeof aggregate>; onEditProject?: (project: any) => void }) {
  // Handle AI-generated widgets
  if (widget.id.startsWith('ai-widget-') && widget.definition) {
    // Import WidgetPreview dynamically to avoid circular dependencies
    const WidgetPreview = React.lazy(() => import('../widgets/WidgetPreview'))
    return (
      <React.Suspense fallback={<div className="flex items-center justify-center h-full text-neutral-500">Loading...</div>}>
        <WidgetPreview definition={widget.definition} className="h-full" />
      </React.Suspense>
    )
  }
  
  // Handle utility widgets
  if (widget.id.startsWith('utility-') && widget.definition) {
    const definition = widget.definition;
    
    if (definition.kind === 'utility') {
      if (definition.utilityType === 'world-clock') {
        const WorldClockWidget = React.lazy(() => import('../widgets/WorldClockWidget'))
        return (
          <React.Suspense fallback={<div className="flex items-center justify-center h-full text-neutral-500">Loading...</div>}>
            <WorldClockWidget 
              config={definition.config as any} 
              size={definition.size} 
              className="h-full" 
            />
          </React.Suspense>
        )
      }
      
      if (definition.utilityType === 'weather') {
        const WeatherWidget = React.lazy(() => import('../widgets/WeatherWidget'))
        return (
          <React.Suspense fallback={<div className="flex items-center justify-center h-full text-neutral-500">Loading...</div>}>
            <WeatherWidget 
              config={definition.config as any} 
              size={definition.size} 
              className="h-full" 
            />
          </React.Suspense>
        )
      }
    }
  }
  
  // Handle predefined widgets
  switch (widget.id) {
    case "total-projects":
      return <TotalProjects size={widget.size} data={data} />
    case "active-projects":
      return <ActiveProjects size={widget.size} data={data} onEditClick={onEditProject} />
    case "kpis":
      return <KPIs size={widget.size} data={data} />
    case "budget-vs-spend":
      return <BudgetVsSpend size={widget.size} />
    case "deadlines":
      return <Deadlines size={widget.size} data={data} />
    case "supplier-rankings":
      return <SupplierRankings size={widget.size} data={data} />
    case "completion-rate":
      return <CompletionRate size={widget.size} data={data} />
    case "supplier-network":
      return <SupplierNetwork size={widget.size} data={data} />
    case "quick-insights":
      return <QuickInsights size={widget.size} data={data} />
    case "pending-itts":
      return <PendingITTs size={widget.size} data={data} />
    case "satisfaction-trend":
      return <SatisfactionTrend size={widget.size} data={data} />
    case "performance-analytics":
      return <PerformanceAnalytics size={widget.size} data={data} />
    default:
      return null
  }
}

// -----------------------------
// iPhone-style Dashboard Grid
// -----------------------------
function DashboardGrid({ widgets, data, onEditProject }: { widgets: WidgetConfig[]; data: ReturnType<typeof aggregate>; onEditProject?: (project: any) => void }) {
  const { editMode, setWidgets } = useDashboardStore()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [forceUpdate, setForceUpdate] = useState(0)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Simple drop validation - allow dropping anywhere there's space
  const calculateDropPositions = (draggedWidget: WidgetConfig) => {
    const positions: { index: number; valid: boolean; reason?: string }[] = []
    
    // Allow dropping at any position (simple game-like behavior)
    for (let i = 0; i <= widgets.length; i++) {
      positions.push({ index: i, valid: true, reason: 'Valid drop position' })
    }
    
    return positions
  }

  const getColSpan = (size: WidgetSize) => {
    switch (size) {
      case 'sm': return 3
      case 'md': return 4
      case 'lg': return 6
      case 'xl': return 12
      default: return 4
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveId(null)
    setDragOverId(null)

    if (active.id !== over?.id && over) {
      // Use the same logic as the arrow keys
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
          // Create a copy and reorder like the arrow keys do
          const sorted = [...items].sort((a, b) => a.order - b.order)
          const [movedItem] = sorted.splice(oldIndex, 1)
          sorted.splice(newIndex, 0, movedItem)
          
          // Update the order property for all items
          const reordered = sorted.map((item, index) => ({
            ...item,
            order: index
          }))
          
          // Force a re-render
          setTimeout(() => {
            setForceUpdate(prev => prev + 1)
          }, 0)
          
          return reordered
        }
        return items
      })
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    
    if (over) {
      setDragOverId(over.id as string)
    } else {
      setDragOverId(null)
    }
  }

  const activeWidget = widgets.find(w => w.id === activeId)
  const dropPositions = activeWidget ? calculateDropPositions(activeWidget) : []

  if (!editMode) {
    // Simple grid packing - place widgets in order, wrapping to next row when needed
    const sortedWidgets = widgets.sort((a, b) => a.order - b.order)
    let currentRow = 0
    let currentCol = 0
    const widgetPositions: Array<{widget: WidgetConfig, row: number, col: number}> = []
    
    sortedWidgets.forEach(widget => {
      const colSpan = getColSpan(widget.size)
      
      // Check if widget fits in current row
      if (currentCol + colSpan > 12) {
        // Move to next row
        currentRow++
        currentCol = 0
      }
      
      widgetPositions.push({
        widget,
        row: currentRow,
        col: currentCol
      })
      
      currentCol += colSpan
    })
    
          return (
        <div className="p-4">
          <div className="grid grid-cols-12 gap-4" style={{ gridAutoRows: 'min-content' }}>
          {widgetPositions.map(({ widget, row, col }) => {
            const colSpan = getColSpan(widget.size)
            return (
              <div 
                key={widget.id} 
                style={{ 
                  gridColumn: `${col + 1} / span ${colSpan}`,
                  gridRow: row + 1
                }}
              >
                <WidgetFrame widget={widget}>
                  <RenderWidget widget={widget} data={data} onEditProject={onEditProject} />
                </WidgetFrame>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="p-4 grid grid-cols-12 gap-4 relative" style={{ gridAutoRows: 'min-content' }}>
        {widgets
          .sort((a, b) => a.order - b.order)
          .map((widget, index) => {
            const colSpan = getColSpan(widget.size)
            const isDragOver = dragOverId === widget.id
            const isActive = activeId === widget.id
            
            return (
              <div 
                key={`${widget.id}-${widget.order}-${forceUpdate}`} 
                style={{ gridColumn: `span ${colSpan}` }}
                className={`
                  transition-all duration-200
                  ${isDragOver ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50' : ''}
                  ${isActive ? 'opacity-50' : ''}
                `}
              >
                <WidgetFrame widget={widget}>
                  <RenderWidget widget={widget} data={data} onEditProject={onEditProject} />
                </WidgetFrame>
              </div>
            )
          })}
        

      </div>
      
      <DragOverlay>
        {activeId && activeWidget ? (
          <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-6 opacity-90 scale-105 transform rotate-1">
            <RenderWidget widget={activeWidget} data={data} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

// -----------------------------
// Main Dashboard Page
// -----------------------------
export default function DashboardPage() {
  const { 
    range, 
    setRange, 
    editMode, 
    setEditMode, 
    widgets, 
    searchQuery,
    setOriginalWidgets,
    setWidgets,
    addAIWidget,
    addUtilityWidget,
    projects,
    updateProject
  } = useDashboardStore()
  const [projectFilter, setProjectFilter] = useState("All Projects")
  const [isClient, setIsClient] = useState(false)
  
  // Modal state for widget creation
  const [showWidgetChooser, setShowWidgetChooser] = useState(false)
  const [showTypeToCreate, setShowTypeToCreate] = useState(false)
  const [showEditProject, setShowEditProject] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)

  // Client-side initialization
  useEffect(() => {
    setIsClient(true)
    const persisted = loadPersisted()
    if (persisted) {
      if (persisted.range) setRange(persisted.range)
      if (persisted.widgets) setWidgets(() => persisted.widgets)
    }
  }, [])



  // Store original state when entering edit mode
  useEffect(() => {
    if (editMode) {
      setOriginalWidgets([...widgets])
    }
  }, [editMode, widgets, setOriginalWidgets])

  const data = useMemo(() => aggregate(range, projects), [range, projects])
  const sorted = [...widgets].filter((w) => w.enabled).sort((a, b) => a.order - b.order)

  // Don't render until client-side initialization is complete
  if (!isClient) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-neutral-600">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      {/* Edit Toolbar */}
      <EditToolbar />

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-neutral-800">Dashboard</h1>
        <p className="text-neutral-500 mt-1">Welcome back, John. Here's your project overview.</p>
        {editMode && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Edit Mode Active:</strong> Drag widgets using the blue handle (⋮⋮) to reorder them, or use the side panel controls.
            </p>
            <div className="text-xs text-blue-600">
              <strong>Tip:</strong> Use the "Save" button to persist your changes, or "Save & Close" to exit edit mode.
            </div>
          </div>
        )}
      </div>

      {/* Grid with Edit Mode support */}
      <div className={editMode ? "pr-[420px]" : ""}>
        <DashboardGrid 
          widgets={sorted} 
          data={data} 
          onEditProject={(project) => {
            setSelectedProject(project)
            setShowEditProject(true)
          }}
        />
      </div>

      {/* Edit Side Panel */}
      <EditSidePanel 
        showWidgetChooser={showWidgetChooser}
        setShowWidgetChooser={setShowWidgetChooser}
        setShowTypeToCreate={setShowTypeToCreate}
      />
      
      {/* Modals */}
      <WidgetChooserModal
        isOpen={showWidgetChooser}
        onClose={() => {
          setShowWidgetChooser(false)
        }}
        onChooseStandard={() => {
          setShowWidgetChooser(false)
          // For now, show an alert. In the future, this would open a 4-step builder modal
          alert('Standard Builder selected! This would open a 4-step widget builder.')
        }}
        onChooseTypeToCreate={() => {
          setShowWidgetChooser(false)
          setShowTypeToCreate(true)
        }}
      />
      
                         <TypeToCreateWidgetModal
        isOpen={showTypeToCreate}
        onClose={() => setShowTypeToCreate(false)}
        onInsertWidget={addAIWidget}
        onInsertUtilityWidget={addUtilityWidget}
      />
      
      <EditProjectModal
        isOpen={showEditProject}
        onClose={() => {
          setShowEditProject(false)
          setSelectedProject(null)
        }}
        project={selectedProject}
        onSave={(updatedProject) => {
          updateProject(updatedProject)
          setShowEditProject(false)
          setSelectedProject(null)
        }}
      />
    </div>
  )
}