import { useState } from "react"
import { Plus, Filter, Search, BarChart3, Grid3X3, List, Star, Award, MapPin, Clock, CheckCircle, Package, Truck, TrendingUp, Eye, Users2, Zap, X } from "lucide-react"
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { useDashboardStore, WidgetFrame } from "./DashboardPage"
import EditSidePanel from "../layout/EditSidePanel"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Badge } from "../ui/badge"
import { Progress } from "../ui/progress"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Checkbox } from "../ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { DialogTrigger } from "../ui/dialog"
import DraggableWidget from "../layout/DraggableWidget"
import { Widget, PageType } from "../../lib/types"
import { supplierPerformanceData } from "../../lib/constants"
import WidgetRenderer from "../widgets/WidgetRenderer"

interface SupplyChainPageProps {
  widgets: Widget[]
  getPageWidgets: (page: PageType) => Widget[]
  moveWidget: (dragIndex: number, dropIndex: number) => void
  updateWidgetSize: (widgetId: string, size: 'small' | 'medium' | 'large' | 'extra-large') => void
  customizeMode: boolean
  setCustomizeMode: (mode: boolean) => void
  supplierViewMode: 'list' | 'card'
  setSupplierViewMode: (mode: 'list' | 'card') => void
  supplierComparison: string[]
  toggleSupplierComparison: (name: string) => void
  showSupplierComparison: boolean
  setShowSupplierComparison: (show: boolean) => void
  screenSize: 'mobile' | 'tablet' | 'desktop'
}

// Supply Chain Grid with Drag-and-Drop
function SupplyChainGrid({ 
  widgets, 
  updateWidget, 
  moveWidget,
  filteredSuppliers,
  searchQuery,
  setSearchQuery,
  filterCategory,
  setFilterCategory,
  filterRegion,
  setFilterRegion,
  supplierComparison,
  toggleSupplierComparison,
  customizeMode,
  screenSize,
  updateWidgetSize,
  moveWidgetProp
}: { 
  widgets: any[]
  updateWidget: (id: string, updates: any) => void
  moveWidget: (id: string, direction: -1 | 1) => void
  filteredSuppliers: any[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  filterCategory: string
  setFilterCategory: (category: string) => void
  filterRegion: string
  setFilterRegion: (region: string) => void
  supplierComparison: string[]
  toggleSupplierComparison: (name: string) => void
  customizeMode: boolean
  screenSize: 'mobile' | 'tablet' | 'desktop'
  updateWidgetSize: (widgetId: string, size: 'small' | 'medium' | 'large' | 'extra-large') => void
  moveWidgetProp: (dragIndex: number, dropIndex: number) => void
}) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [forceUpdate, setForceUpdate] = useState(0)
  const [showFullScreenSuppliers, setShowFullScreenSuppliers] = useState(false)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const getColSpan = (size: string) => {
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
      const oldIndex = widgets.findIndex((item) => item.id === active.id)
      const newIndex = widgets.findIndex((item) => item.id === over.id)

      if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
        const direction = newIndex > oldIndex ? 1 : -1
        moveWidget(active.id as string, direction)
        
        setTimeout(() => {
          setForceUpdate(prev => prev + 1)
        }, 0)
      }
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    if (over) {
      setDragOverId(over.id as string)
    } else {
      setDragOverId(null)
    }
  }

  const activeWidget = activeId ? widgets.find(w => w.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="space-y-6">
        {/* Supply Chain Overview Cards - Draggable Grid */}
        <div className="grid grid-cols-12 gap-6">
          {widgets
            .filter(w => w.enabled && w.size === 'sm')
            .sort((a, b) => a.order - b.order)
            .map((widget) => {
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
                    {widget.id === 'active-suppliers-metric' && (
                      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-neutral-600">Active Suppliers</p>
                            <p className="text-3xl font-bold text-neutral-800 mt-1">47</p>
                            <p className="text-xs text-green-600 mt-1">+6% this quarter</p>
                          </div>
                          <div className="p-3 bg-blue-100 rounded-xl">
                            <Users2 className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {widget.id === 'on-time-delivery-metric' && (
                      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-neutral-600">On-Time Delivery</p>
                            <p className="text-3xl font-bold text-neutral-800 mt-1">94.2%</p>
                            <p className="text-xs text-green-600 mt-1">Above target</p>
                          </div>
                          <div className="p-3 bg-green-100 rounded-xl">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {widget.id === 'cost-savings-metric' && (
                      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-neutral-600">Cost Savings</p>
                            <p className="text-3xl font-bold text-neutral-800 mt-1">£127K</p>
                            <p className="text-xs text-green-600 mt-1">+£23K this month</p>
                          </div>
                          <div className="p-3 bg-green-100 rounded-xl">
                            <TrendingUp className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {widget.id === 'quality-score-metric' && (
                      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-neutral-600">Quality Score</p>
                            <p className="text-3xl font-bold text-neutral-800 mt-1">4.7</p>
                            <p className="text-xs text-green-600 mt-1">High performance</p>
                          </div>
                          <div className="p-3 bg-amber-100 rounded-xl">
                            <Award className="h-6 w-6 text-amber-600" />
                          </div>
                        </div>
                      </div>
                    )}
                  </WidgetFrame>
                </div>
              )
            })}
        </div>

        {/* Supplier Directory - Large Widget */}
        {widgets.find(w => w.id === 'supplier-directory')?.enabled && (
          <div className="grid grid-cols-12 gap-6">
            <div 
              style={{ gridColumn: 'span 12' }}
              className={`
                transition-all duration-200
                ${dragOverId === 'supplier-directory' ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50' : ''}
                ${activeId === 'supplier-directory' ? 'opacity-50' : ''}
              `}
            >
              <WidgetFrame widget={widgets.find(w => w.id === 'supplier-directory')!}>
                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                  <div className="p-6 border-b border-neutral-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h2 className="text-xl font-semibold text-neutral-800">Supplier Directory</h2>
                        <p className="text-neutral-500 text-sm mt-1">Manage and monitor your supplier network</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Supplier
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-9 px-3 rounded-lg border-neutral-200 hover:bg-neutral-100"
                          onClick={() => setShowFullScreenSuppliers(true)}
                        >
                          View All
                        </Button>
                      </div>
                    </div>
                    
                    {/* Filter Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                      <div className="flex-1 max-w-sm">
                        <Input
                          placeholder="Search suppliers..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="construction">Construction</SelectItem>
                          <SelectItem value="materials">Materials</SelectItem>
                          <SelectItem value="equipment">Equipment</SelectItem>
                          <SelectItem value="services">Services</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={filterRegion} onValueChange={setFilterRegion}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="All Regions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Regions</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                          <SelectItem value="europe">Europe</SelectItem>
                          <SelectItem value="germany">Germany</SelectItem>
                          <SelectItem value="france">France</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Supplier Table */}
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Region</TableHead>
                          <TableHead>Performance</TableHead>
                          <TableHead>Cost/Unit</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSuppliers.map((supplier) => (
                          <TableRow key={supplier.id} className="hover:bg-neutral-50">
                            <TableCell>
                              <Checkbox 
                                checked={supplierComparison.includes(supplier.name)}
                                onCheckedChange={() => toggleSupplierComparison(supplier.name)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs">{supplier.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-neutral-800">{supplier.name}</p>
                                  <p className="text-xs text-neutral-500">{supplier.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {supplier.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-neutral-600">{supplier.region}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{supplier.score}/5.0</span>
                                <Progress value={supplier.score * 20} className="w-16 h-2" />
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-medium">£{supplier.costPerUnit}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={supplier.approved ? "default" : "secondary"}>
                                {supplier.approved ? "Approved" : "Pending"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </WidgetFrame>
            </div>
          </div>
        )}
      </div>
      
      <DragOverlay>
        {activeId && activeWidget ? (
          <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-6 opacity-90 scale-105 transform rotate-1">
            <div className="text-lg font-semibold text-neutral-800">{activeWidget.title}</div>
          </div>
        ) : null}
      </DragOverlay>

      {/* Full Screen Suppliers Modal */}
      {showFullScreenSuppliers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div>
                <h2 className="text-2xl font-semibold text-neutral-800">📋 All Suppliers Directory</h2>
                <p className="text-neutral-500 mt-1">Complete supplier network with detailed information</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullScreenSuppliers(false)}
                className="h-10 w-10 p-0 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-neutral-200 bg-neutral-50">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 max-w-sm">
                  <Input
                    placeholder="Search suppliers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="construction">Construction</SelectItem>
                    <SelectItem value="materials">Materials</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filterRegion} onValueChange={setFilterRegion}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="europe">Europe</SelectItem>
                    <SelectItem value="germany">Germany</SelectItem>
                    <SelectItem value="france">France</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Cost/Unit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers.map((supplier) => (
                      <TableRow key={supplier.id} className="hover:bg-neutral-50">
                        <TableCell>
                          <Checkbox 
                            checked={supplierComparison.includes(supplier.name)}
                            onCheckedChange={() => toggleSupplierComparison(supplier.name)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">{supplier.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-neutral-800">{supplier.name}</p>
                              <p className="text-xs text-neutral-500">{supplier.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {supplier.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-neutral-500" />
                            <span className="text-sm">{supplier.region}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-neutral-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${supplier.performance}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{supplier.performance}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">${supplier.costPerUnit}</span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={supplier.approved ? "default" : "secondary"}
                            className={supplier.approved ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-600"}
                          >
                            {supplier.approved ? "Approved" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-neutral-200 bg-neutral-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-neutral-500">
                  Showing {filteredSuppliers.length} of {supplierPerformanceData.length} suppliers
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Export Data
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Supplier
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  )
}

export default function SupplyChainPage(props: SupplyChainPageProps) {
  const {
    widgets,
    getPageWidgets,
    moveWidget,
    updateWidgetSize,
    customizeMode,
    setCustomizeMode,
    supplierViewMode,
    setSupplierViewMode,
    supplierComparison,
    toggleSupplierComparison,
    showSupplierComparison,
    setShowSupplierComparison,
    screenSize
  } = props
  
  const { editMode } = useDashboardStore()
  
  // Supply Chain Widget State Management
  const [supplyWidgets, setSupplyWidgets] = useState([
    { id: 'active-suppliers-metric', title: 'Active Suppliers', area: 'supply', size: 'sm' as const, enabled: true, order: 1 },
    { id: 'on-time-delivery-metric', title: 'On-Time Delivery', area: 'supply', size: 'sm' as const, enabled: true, order: 2 },
    { id: 'cost-savings-metric', title: 'Cost Savings', area: 'supply', size: 'sm' as const, enabled: true, order: 3 },
    { id: 'quality-score-metric', title: 'Quality Score', area: 'supply', size: 'sm' as const, enabled: true, order: 4 },
    { id: 'supplier-directory', title: 'Supplier Directory', area: 'supply', size: 'xl' as const, enabled: true, order: 5 },
  ])

  const updateSupplyWidget = (id: string, updates: any) => {
    setSupplyWidgets(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w))
  }

  const moveSupplyWidget = (id: string, direction: -1 | 1) => {
    setSupplyWidgets(prev => {
      const widgets = [...prev]
      const index = widgets.findIndex(w => w.id === id)
      if (index === -1) return prev
      
      const newIndex = index + direction
      if (newIndex < 0 || newIndex >= widgets.length) return prev
      
      const temp = widgets[index]
      widgets[index] = widgets[newIndex]
      widgets[newIndex] = temp
      
      return widgets.map((w, i) => ({ ...w, order: i }))
    })
  }

  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterRegion, setFilterRegion] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Filter suppliers
  const filteredSuppliers = supplierPerformanceData.filter(supplier => {
    const matchesCategory = filterCategory === "all" || supplier.category.toLowerCase() === filterCategory.toLowerCase()
    const matchesRegion = filterRegion === "all" || supplier.region.toLowerCase() === filterRegion.toLowerCase()
    const matchesSearch = searchQuery === "" || 
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesRegion && matchesSearch && supplier.approved
  })

  // Simple supplier selection - avoiding complex array methods
  const selectedSuppliers = []
  for (const name of supplierComparison) {
    const supplier = supplierPerformanceData.find(s => s.name === name)
    if (supplier) {
      selectedSuppliers.push(supplier)
    }
  }

  return (
    <div className="space-y-6">
      {/* Edit Mode Notification */}
      {editMode && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 mb-2">
            <strong>Edit Mode Active:</strong> Drag widgets using the blue handle (⋮⋮) to reorder them, or use the side panel controls.
          </p>
          <div className="text-xs text-blue-600">
            <strong>Tip:</strong> Toggle widget visibility and sizes from the right panel.
          </div>
        </div>
      )}
      
      <div className={editMode ? "pr-[420px]" : ""}>
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-800">Supply Chain</h1>
          <p className="text-neutral-500 mt-1">Manage your supplier network and performance analytics</p>
        </div>

        {/* Supply Chain Grid with Drag-and-Drop */}
        <SupplyChainGrid 
          widgets={supplyWidgets}
          updateWidget={updateSupplyWidget}
          moveWidget={moveSupplyWidget}
          filteredSuppliers={filteredSuppliers}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterRegion={filterRegion}
          setFilterRegion={setFilterRegion}
          supplierComparison={supplierComparison}
          toggleSupplierComparison={toggleSupplierComparison}
          customizeMode={customizeMode}
          screenSize={screenSize}
          updateWidgetSize={updateWidgetSize}
          moveWidgetProp={moveWidget}
        />
      </div>

      {/* Global Edit Side Panel */}
      <EditSidePanel
        pageName="Supply Chain"
        pageWidgets={supplyWidgets}
        updateWidget={updateSupplyWidget}
        moveWidget={moveSupplyWidget}
      />
    </div>
  )
}