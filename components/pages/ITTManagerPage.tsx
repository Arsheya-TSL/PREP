import { Plus, Send, FileText, CheckCircle, AlertTriangle, Clock, Filter, Search, BarChart3, Target, Zap, Award, Users2, Package, X, Eye } from "lucide-react"
import { useState } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Badge } from "../ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Checkbox } from "../ui/checkbox"
import { Separator } from "../ui/separator"
import { Progress } from "../ui/progress"
import { Widget, PageType, ITTFormData, ActiveITT } from "../../lib/types"
import { getResponsiveGridCols, formatLargeCurrency, formatTimeAgo, getStatusColor } from "../../lib/utils"
import { projects, supplierPerformanceData, activeITTs } from "../../lib/constants"
import DraggableWidget from "../layout/DraggableWidget"
import WidgetRenderer from "../widgets/WidgetRenderer"

interface ITTManagerPageProps {
  widgets: Widget[]
  getPageWidgets: (page: PageType) => Widget[]
  moveWidget: (dragIndex: number, dropIndex: number) => void
  updateWidgetSize: (widgetId: string, size: 'small' | 'medium' | 'large' | 'extra-large') => void
  customizeMode: boolean
  setCustomizeMode: (mode: boolean) => void
  showCreateITT: boolean
  setShowCreateITT: (show: boolean) => void
  ittFormData: ITTFormData
  setIttFormData: (data: ITTFormData | ((prev: ITTFormData) => ITTFormData)) => void
  autoFillITTFromProject: (projectName: string) => void
  handleCreateITT: () => void
  screenSize: 'mobile' | 'tablet' | 'desktop'
  userITTs?: ActiveITT[]
  userProjects?: Array<{ id: number; name: string; country: string; startDate?: string; endDate?: string; description?: string; sizeBucket?: string }>
}

// ITT Manager Grid with Drag-and-Drop
function ITTGrid({ 
  widgets, 
  updateWidget, 
  moveWidget,
  userITTs,
  userProjects,
  customizeMode,
  screenSize,
  updateWidgetSize,
  moveWidgetProp,
  filteredITTs,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  filterRegion,
  setFilterRegion,
  filteredProjectsMissingITTs,
  handleAssignITT
}: { 
  widgets: any[]
  updateWidget: (id: string, updates: any) => void
  moveWidget: (id: string, direction: -1 | 1) => void
  userITTs: ActiveITT[]
  userProjects: Array<{ id: number; name: string; country: string; startDate?: string; endDate?: string; description?: string; sizeBucket?: string }>
  customizeMode: boolean
  screenSize: 'mobile' | 'tablet' | 'desktop'
  updateWidgetSize: (widgetId: string, size: 'small' | 'medium' | 'large' | 'extra-large') => void
  moveWidgetProp: (dragIndex: number, dropIndex: number) => void
  filteredITTs: ActiveITT[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  filterStatus: string
  setFilterStatus: (status: string) => void
  filterRegion: string
  setFilterRegion: (region: string) => void
  filteredProjectsMissingITTs: Array<{ id: number; name: string; country: string; startDate?: string; endDate?: string; description?: string; sizeBucket?: string }>
  handleAssignITT: (projectName: string) => void
}) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [forceUpdate, setForceUpdate] = useState(0)
  const [showFullScreenITTs, setShowFullScreenITTs] = useState(false)
  
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
      <div className="grid grid-cols-12 gap-6">
        {widgets
          .filter(w => w.enabled)
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
                  {widget.id === 'active-itts-table' && (
                    <Card className="bg-white border border-border rounded-xl shadow-sm">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg font-semibold text-foreground">🎯 Active ITTs</CardTitle>
                            <CardDescription className="text-neutral-500">Track your tender submissions and responses</CardDescription>
                          </div>
                          {/* Filters and Search */}
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                              <Input 
                                placeholder="Search ITTs..." 
                                className="pl-10 w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                              />
                            </div>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                              <SelectTrigger className="w-36">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="sent">Sent</SelectItem>
                                <SelectItem value="received">Received</SelectItem>
                                <SelectItem value="in-review">In Review</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={filterRegion} onValueChange={setFilterRegion}>
                              <SelectTrigger className="w-36">
                                <SelectValue placeholder="Region" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Regions</SelectItem>
                                <SelectItem value="uk">UK</SelectItem>
                                <SelectItem value="germany">Germany</SelectItem>
                                <SelectItem value="france">France</SelectItem>
                                <SelectItem value="netherlands">Netherlands</SelectItem>
                                <SelectItem value="spain">Spain</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-9 px-3 rounded-lg border-neutral-200 hover:bg-neutral-100"
                              onClick={() => setShowFullScreenITTs(true)}
                            >
                              View All
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-border hover:bg-neutral-50">
                                <TableHead className="font-medium text-neutral-700">Project</TableHead>
                                <TableHead className="font-medium text-neutral-700">ITT Type</TableHead>
                                <TableHead className="font-medium text-neutral-700">Status</TableHead>
                                <TableHead className="font-medium text-neutral-700">Responses</TableHead>
                                <TableHead className="font-medium text-neutral-700">Due Date</TableHead>
                                <TableHead className="font-medium text-neutral-700">Budget</TableHead>
                                <TableHead className="text-right font-medium text-neutral-700">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {/* Existing ITTs */}
                              {filteredITTs.map((itt: ActiveITT) => (
                                <TableRow key={itt.id} className="border-border hover:bg-neutral-50">
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                      <div>
                                        <p className="font-medium text-neutral-800">{itt.project}</p>
                                        <p className="text-xs text-neutral-500">{itt.region}</p>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="text-xs">
                                      {itt.category}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant="outline"
                                      className={`text-xs ${getStatusColor(itt.status)}`}
                                    >
                                      {itt.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">{itt.responses}</span>
                                      <div className="w-16 bg-neutral-200 rounded-full h-1.5">
                                        <div 
                                          className="bg-blue-600 h-1.5 rounded-full" 
                                          style={{ width: `${Math.min((itt.responses / itt.suppliers.length) * 100, 100)}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-xs text-neutral-500">/{itt.suppliers.length}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-3 w-3 text-neutral-500" />
                                      <span className="text-sm text-neutral-600">{formatTimeAgo(itt.deadline)}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm font-medium">{formatLargeCurrency(itt.budget)}</span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <Button variant="ghost" size="sm">
                                        <FileText className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm">
                                        <Send className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                              
                              {/* Projects missing ITTs */}
                              {filteredProjectsMissingITTs.map((project) => (
                                <TableRow key={`missing-itt-${project.id}`} className="border-border hover:bg-neutral-50 bg-amber-50/30">
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                      <div>
                                        <p className="font-medium text-neutral-800">{project.name}</p>
                                        <p className="text-xs text-neutral-500">{project.country}</p>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                                      No ITT
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant="outline"
                                      className="text-xs bg-red-100 text-red-700 border-red-200"
                                    >
                                      Missing
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-neutral-400">-</span>
                                      <div className="w-16 bg-neutral-200 rounded-full h-1.5">
                                        <div className="bg-neutral-300 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                                      </div>
                                      <span className="text-xs text-neutral-400">0/0</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-3 w-3 text-neutral-400" />
                                      <span className="text-sm text-neutral-400">No deadline</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm font-medium text-neutral-400">-</span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleAssignITT(project.name)}
                                        className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                      >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Assign ITT
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {widget.id === 'draft-itts-widget' && (
                    <Card className="bg-white border border-border rounded-xl shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-neutral-600">Draft ITTs</p>
                            <p className="text-2xl font-bold text-neutral-800 mt-1">3</p>
                            <p className="text-xs text-amber-600 mt-1">Needs completion</p>
                          </div>
                          <div className="p-3 bg-amber-100 rounded-xl">
                            <FileText className="h-5 w-5 text-amber-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {widget.id === 'sent-itts-widget' && (
                    <Card className="bg-white border border-border rounded-xl shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-neutral-600">Sent ITTs</p>
                            <p className="text-2xl font-bold text-neutral-800 mt-1">12</p>
                            <p className="text-xs text-blue-600 mt-1">Awaiting response</p>
                          </div>
                          <div className="p-3 bg-blue-100 rounded-xl">
                            <Send className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {widget.id === 'responses-widget' && (
                    <Card className="bg-white border border-border rounded-xl shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-neutral-600">Responses</p>
                            <p className="text-2xl font-bold text-neutral-800 mt-1">27</p>
                            <p className="text-xs text-green-600 mt-1">+5 this week</p>
                          </div>
                          <div className="p-3 bg-green-100 rounded-xl">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {widget.id === 'urgent-itts-widget' && (
                    <Card className="bg-white border border-border rounded-xl shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-neutral-600">Due This Week</p>
                            <p className="text-2xl font-bold text-neutral-800 mt-1">5</p>
                            <p className="text-xs text-red-600 mt-1">Requires attention</p>
                          </div>
                          <div className="p-3 bg-red-100 rounded-xl">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </WidgetFrame>
              </div>
            )
          })}
      </div>
      
      <DragOverlay>
        {activeId && activeWidget ? (
          <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-6 opacity-90 scale-105 transform rotate-1">
            <div className="text-lg font-semibold text-neutral-800">{activeWidget.title}</div>
          </div>
        ) : null}
      </DragOverlay>

      {/* Full Screen ITTs Modal */}
      {showFullScreenITTs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div>
                <h2 className="text-2xl font-semibold text-neutral-800">🎯 All Active ITTs</h2>
                <p className="text-neutral-500 mt-1">Complete ITT management with detailed tracking</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullScreenITTs(false)}
                className="h-10 w-10 p-0 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-neutral-200 bg-neutral-50">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <Input 
                    placeholder="Search ITTs..." 
                    className="pl-10 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="in-review">In Review</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterRegion} onValueChange={setFilterRegion}>
                  <SelectTrigger className="w-full sm:w-36">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    <SelectItem value="uk">UK</SelectItem>
                    <SelectItem value="germany">Germany</SelectItem>
                    <SelectItem value="france">France</SelectItem>
                    <SelectItem value="netherlands">Netherlands</SelectItem>
                    <SelectItem value="spain">Spain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-neutral-50">
                      <TableHead className="font-medium text-neutral-700">Project</TableHead>
                      <TableHead className="font-medium text-neutral-700">ITT Type</TableHead>
                      <TableHead className="font-medium text-neutral-700">Status</TableHead>
                      <TableHead className="font-medium text-neutral-700">Responses</TableHead>
                      <TableHead className="font-medium text-neutral-700">Due Date</TableHead>
                      <TableHead className="font-medium text-neutral-700">Budget</TableHead>
                      <TableHead className="text-right font-medium text-neutral-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredITTs.map((itt: ActiveITT) => (
                      <TableRow key={itt.id} className="border-border hover:bg-neutral-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <div>
                              <p className="font-medium text-neutral-800">{itt.project}</p>
                              <p className="text-xs text-neutral-500">{itt.region}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {itt.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={`text-xs ${getStatusColor(itt.status)}`}
                          >
                            {itt.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{itt.responses}</span>
                            <div className="w-16 bg-neutral-200 rounded-full h-1.5">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full" 
                                style={{ width: `${Math.min((itt.responses / itt.suppliers.length) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-neutral-500" />
                            <span className="text-sm">{itt.deadline}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{itt.budget}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
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
                  Showing {filteredITTs.length} of {filteredITTs.length} ITTs
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Export Data
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New ITT
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

export default function ITTManagerPage({
  widgets,
  getPageWidgets,
  moveWidget,
  updateWidgetSize,
  customizeMode,
  setCustomizeMode,
  showCreateITT,
  setShowCreateITT,
  ittFormData,
  setIttFormData,
  autoFillITTFromProject,
  handleCreateITT,
  screenSize,
  userITTs = [],
  userProjects = []
}: ITTManagerPageProps) {
  const { editMode } = useDashboardStore()
  
  // ITT Manager Widget State Management
  const [ittWidgets, setIttWidgets] = useState([
    { id: 'active-itts-table', title: 'Active ITTs', area: 'itt', size: 'xl' as const, enabled: true, order: 0 },
    { id: 'draft-itts-widget', title: 'Draft ITTs', area: 'itt', size: 'sm' as const, enabled: true, order: 1 },
    { id: 'sent-itts-widget', title: 'Sent ITTs', area: 'itt', size: 'sm' as const, enabled: true, order: 2 },
    { id: 'responses-widget', title: 'Responses', area: 'itt', size: 'sm' as const, enabled: true, order: 3 },
    { id: 'urgent-itts-widget', title: 'Due This Week', area: 'itt', size: 'sm' as const, enabled: true, order: 4 },
  ])

  const updateIttWidget = (id: string, updates: any) => {
    setIttWidgets(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w))
  }

  const moveIttWidget = (id: string, direction: -1 | 1) => {
    setIttWidgets(prev => {
      const widgets = [...prev]
      const index = widgets.findIndex(w => w.id === id)
      if (index === -1) return prev
      
      const newIndex = index + direction
      if (newIndex < 0 || newIndex >= widgets.length) return prev
      
      // Swap widgets
      const temp = widgets[index]
      widgets[index] = widgets[newIndex]
      widgets[newIndex] = temp
      
      return widgets
    })
  }

  // Data filtering and search state
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterRegion, setFilterRegion] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Filter ITTs based on search and filters
  const allITTs: ActiveITT[] = [...userITTs, ...activeITTs]
  const filteredITTs = allITTs.filter(itt => {
    const matchesStatus = filterStatus === "all" || itt.status.toLowerCase() === filterStatus.toLowerCase()
    const matchesRegion = filterRegion === "all" || itt.region.toLowerCase() === filterRegion.toLowerCase()
    const matchesSearch = searchQuery === "" || 
      itt.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      itt.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesRegion && matchesSearch
  })

  // Find projects that are missing ITTs
  const projectsWithITTs = new Set(allITTs.map(itt => itt.project))
  const projectsMissingITTs = userProjects.filter(project => !projectsWithITTs.has(project.name))
  
  // If no projects are missing ITTs, show all user projects (for testing)
  const projectsToShow = projectsMissingITTs.length > 0 ? projectsMissingITTs : userProjects
  
  // Filter projects missing ITTs based on search
  // Always show projects missing ITTs regardless of status filter
  const filteredProjectsMissingITTs = projectsToShow.filter(project => {
    const matchesRegion = filterRegion === "all" || project.country.toLowerCase() === filterRegion.toLowerCase()
    const matchesSearch = searchQuery === "" || 
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesRegion && matchesSearch
  })

  // Debug logging
  console.log('🔍 ITT Manager Debug:', {
    userProjects: userProjects.length,
    allITTs: allITTs.length,
    projectsWithITTs: Array.from(projectsWithITTs),
    projectsMissingITTs: projectsMissingITTs.length,
    projectsToShow: projectsToShow.length,
    filteredProjectsMissingITTs: filteredProjectsMissingITTs.length,
    userProjectNames: userProjects.map(p => p.name)
  })

  // Function to handle assigning ITT to a specific project
  const handleAssignITT = (projectName: string) => {
    // Auto-fill the ITT form with project details
    autoFillITTFromProject(projectName)
    // Open the create ITT modal
    setShowCreateITT(true)
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
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-800">ITT Manager</h1>
          <p className="text-neutral-500 mt-1">Create and manage Invitation to Tender documents with intelligent supplier matching</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" className="flex items-center gap-2 h-11 px-4 rounded-xl hover:bg-neutral-100 border-neutral-200">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
          <Button onClick={() => setShowCreateITT(true)} className="flex items-center gap-2 h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4" />
            Create ITT
          </Button>
        </div>

        {/* ITT Manager Grid with Drag-and-Drop */}
        <ITTGrid 
          widgets={ittWidgets}
          updateWidget={updateIttWidget}
          moveWidget={moveIttWidget}
          userITTs={userITTs}
          userProjects={userProjects}
          customizeMode={customizeMode}
          screenSize={screenSize}
          updateWidgetSize={updateWidgetSize}
          moveWidgetProp={moveWidget}
          filteredITTs={filteredITTs}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterRegion={filterRegion}
          setFilterRegion={setFilterRegion}
          filteredProjectsMissingITTs={filteredProjectsMissingITTs}
          handleAssignITT={handleAssignITT}
        />
      </div>

      {/* Global Edit Side Panel */}
      <EditSidePanel
        pageName="ITT Manager"
        pageWidgets={ittWidgets}
        updateWidget={updateIttWidget}
        moveWidget={moveIttWidget}
      />

      {/* Create ITT Modal */}
      <Dialog open={showCreateITT} onOpenChange={setShowCreateITT}>
        <DialogContent className="w-[60vw] max-w-4xl h-[75vh] !max-w-none bg-gradient-to-br from-slate-50 to-blue-50">
          <DialogHeader>
            <DialogTitle>📋 Create New ITT</DialogTitle>
            <DialogDescription>Create an intelligent ITT with automated supplier matching</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Project</Label>
              <Select value={ittFormData.project} onValueChange={(value) => setIttFormData(prev => ({ ...prev, project: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {userProjects.map(project => (
                    <SelectItem key={project.id} value={project.name}>{project.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Input 
                value={ittFormData.category}
                onChange={(e) => setIttFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Construction, Materials, Equipment..."
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea 
                value={ittFormData.description}
                onChange={(e) => setIttFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the ITT requirements..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateITT(false)}>Cancel</Button>
            <Button onClick={handleCreateITT}>Create ITT</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}