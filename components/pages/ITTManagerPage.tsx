import { Plus, Send, FileText, CheckCircle, AlertTriangle, Clock, Filter, Search, BarChart3, Target, Zap, Award, Users2, Package, X, Eye, Paperclip, Trash2, Save, Mail } from "lucide-react"
import { useState, useEffect, useRef } from "react"
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
import { getResponsiveGridCols, formatLargeCurrency, formatTimeAgo, getStatusColor, validateEmail } from "../../lib/utils"
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
  const [selectedITTs, setSelectedITTs] = useState<number[]>([])
  
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
                  {widget.id === 'active-itts-widget' && (
                    <div>
                      <div className="pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-foreground font-semibold">Active ITTs</h3>
                            <p className="text-muted-foreground text-sm">Track tender submissions and responses</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Search ITTs..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-48 bg-background border-border text-foreground placeholder:text-muted-foreground"
                            />
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                              <SelectTrigger className="w-36 bg-background border-border text-foreground">
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
                              <SelectTrigger className="w-36 bg-background border-border text-foreground">
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
                              className="h-9 px-3 rounded-lg border-border hover:bg-accent hover:text-accent-foreground"
                              onClick={() => setShowFullScreenITTs(true)}
                            >
                              View All
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="p-0">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-border hover:bg-accent/50">
                                <TableHead className="font-medium text-foreground">Project</TableHead>
                                <TableHead className="font-medium text-foreground">ITT Type</TableHead>
                                <TableHead className="font-medium text-foreground">Status</TableHead>
                                <TableHead className="font-medium text-foreground">Responses</TableHead>
                                <TableHead className="font-medium text-foreground">Due Date</TableHead>
                                <TableHead className="font-medium text-foreground">Budget</TableHead>
                                <TableHead className="text-right font-medium text-foreground">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {/* Existing ITTs */}
                              {filteredITTs.map((itt: ActiveITT) => (
                                <TableRow key={itt.id} className="border-border hover:bg-accent/50">
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                      <div>
                                        <p className="font-medium text-foreground">{itt.project}</p>
                                        <p className="text-xs text-muted-foreground">{itt.region}</p>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="text-xs border-border text-foreground">
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
                                      <span className="text-sm font-medium text-foreground">{itt.responses}</span>
                                      <div className="w-16 bg-muted rounded-full h-1.5">
                                        <div 
                                          className="bg-blue-600 h-1.5 rounded-full" 
                                          style={{ width: `${Math.min((itt.responses / itt.suppliers.length) * 100, 100)}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-xs text-muted-foreground">/{itt.suppliers.length}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-sm text-muted-foreground">{formatTimeAgo(itt.deadline)}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm font-medium text-foreground">{formatLargeCurrency(itt.budget)}</span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <Button variant="ghost" size="sm" className="hover:bg-accent hover:text-accent-foreground">
                                        <FileText className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm" className="hover:bg-accent hover:text-accent-foreground">
                                        <Send className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                              
                              {/* Projects missing ITTs */}
                              {filteredProjectsMissingITTs.map((project) => (
                                <TableRow key={`missing-itt-${project.id}`} className="border-border hover:bg-accent/50 bg-amber-50/30 dark:bg-amber-900/20">
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                      <div>
                                        <p className="font-medium text-foreground">{project.name}</p>
                                        <p className="text-xs text-muted-foreground">{project.country}</p>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700">
                                      No ITT
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant="outline"
                                      className="text-xs bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"
                                    >
                                      Missing
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-muted-foreground">-</span>
                                      <div className="w-16 bg-muted rounded-full h-1.5">
                                        <div className="bg-muted-foreground/30 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                                      </div>
                                      <span className="text-xs text-muted-foreground">0/0</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-sm text-muted-foreground">No deadline</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <span className="text-sm font-medium text-muted-foreground">-</span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleAssignITT(project.name)}
                                        className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700"
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
                      </div>
                    </div>
                  )}

                  {widget.id === 'draft-itts-widget' && (
                    <div>
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Draft ITTs</p>
                            <p className="text-2xl font-bold text-foreground mt-1">3</p>
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Needs completion</p>
                          </div>
                          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                            <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {widget.id === 'sent-itts-widget' && (
                    <div>
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Sent ITTs</p>
                            <p className="text-2xl font-bold text-foreground mt-1">12</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Awaiting response</p>
                          </div>
                          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {widget.id === 'responses-widget' && (
                    <div>
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Responses</p>
                            <p className="text-2xl font-bold text-foreground mt-1">27</p>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">+5 this week</p>
                          </div>
                          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {widget.id === 'urgent-itts-widget' && (
                    <div>
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Due This Week</p>
                            <p className="text-2xl font-bold text-foreground mt-1">5</p>
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">Requires attention</p>
                          </div>
                          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </WidgetFrame>
              </div>
            )
          })}
      </div>
      
      <DragOverlay>
        {activeId && activeWidget ? (
          <div className="glass-card shadow-xl p-6 opacity-90 scale-105 transform rotate-1">
            <div className="text-lg font-semibold text-foreground">{activeWidget.title}</div>
          </div>
        ) : null}
      </DragOverlay>

      {/* Full Screen ITTs Modal */}
      {showFullScreenITTs && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">🎯 All Active ITTs</h2>
                <p className="text-muted-foreground mt-1">Complete ITT management with detailed tracking</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullScreenITTs(false)}
                className="h-10 w-10 p-0 hover:bg-accent hover:text-accent-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-border bg-muted/30">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Search ITTs..." 
                    className="pl-10 w-full bg-background border-border text-foreground placeholder:text-muted-foreground"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-36 bg-background border-border text-foreground">
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
                  <SelectTrigger className="w-full sm:w-36 bg-background border-border text-foreground">
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
              {/* Bulk actions */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={filteredITTs.length > 0 && filteredITTs.every((itt: any) => selectedITTs.includes(itt.id))}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        const all = filteredITTs.map((i: any) => i.id)
                        setSelectedITTs(all)
                      } else {
                        setSelectedITTs([])
                      }
                    }}
                  />
                  <span className="text-muted-foreground">Select all</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-accent hover:text-accent-foreground"
                    onClick={() => {
                      const selected = filteredITTs.filter((i: any) => selectedITTs.includes(i.id))
                      const headers = ['Project','Category','Status','Responses','DueDate','Budget','Region']
                      const rows = selected.map((i: any) => [i.project, i.category, i.status, i.responses, i.deadline, i.budget, i.region])
                      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
                      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                      const url = URL.createObjectURL(blob)
                      const link = document.createElement('a')
                      link.href = url
                      link.download = 'itts.csv'
                      link.click()
                      URL.revokeObjectURL(url)
                    }}
                  >
                    Export CSV
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-accent/50">
                      <TableHead className="w-12"></TableHead>
                      <TableHead className="font-medium text-foreground">Project</TableHead>
                      <TableHead className="font-medium text-foreground">ITT Type</TableHead>
                      <TableHead className="font-medium text-foreground">Status</TableHead>
                      <TableHead className="font-medium text-foreground">Responses</TableHead>
                      <TableHead className="font-medium text-foreground">Due Date</TableHead>
                      <TableHead className="font-medium text-foreground">Budget</TableHead>
                      <TableHead className="text-right font-medium text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredITTs.map((itt: ActiveITT) => (
                      <TableRow key={itt.id} className="border-border hover:bg-accent/50">
                        <TableCell>
                          <Checkbox
                            checked={selectedITTs.includes(itt.id)}
                            onCheckedChange={(checked) => {
                              if (checked) setSelectedITTs(prev => [...prev, itt.id])
                              else setSelectedITTs(prev => prev.filter(id => id !== itt.id))
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <div>
                              <p className="font-medium text-foreground">{itt.project}</p>
                              <p className="text-xs text-muted-foreground">{itt.region}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs border-border text-foreground">
                            {itt.category}
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
                  <label className="inline-flex items-center">
                    <input
                      type="file"
                      accept=".csv, text/csv, application/vnd.ms-excel"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const reader = new FileReader()
                        reader.onload = () => {
                          try {
                            const text = String(reader.result || '')
                            // Expected columns: id,project,category,status,created,deadline,budget,region, suppliers(responses ignored)
                            const lines = text.split(/\r?\n/).filter(Boolean)
                            if (lines.length <= 1) return
                            const header = lines[0].split(',').map(s=>s.trim().toLowerCase())
                            const rows = lines.slice(1)
                            let imported = 0
                            let replaced = 0
                            rows.forEach((line) => {
                              const cols = line.split(',')
                              if (!cols.length) return
                              const rec: any = {}
                              header.forEach((h, i) => rec[h] = (cols[i]||'').trim())
                              // Require project + category minimal
                              if (!rec.project) return
                              const idNum = rec.id ? Number(rec.id) : undefined
                              const newITT: any = {
                                id: idNum || Math.floor(Math.random()*1e9),
                                project: rec.project,
                                category: rec.category || 'General',
                                status: rec.status || 'Draft',
                                created: rec.created || new Date().toISOString().slice(0,10),
                                deadline: rec.deadline || '',
                                suppliers: [],
                                responses: rec.responses ? Number(rec.responses) : 0,
                                budget: rec.budget ? Number(rec.budget) : 0,
                                region: rec.region || 'Global',
                              }
                              // Duplicate by key within activeITTs source: id OR (project+category)
                              let matchIdx = (activeITTs as any[]).findIndex(i => (
                                (idNum && i.id === idNum) ||
                                (i.project?.toLowerCase() === String(rec.project).toLowerCase() && i.category?.toLowerCase() === String(newITT.category).toLowerCase())
                              ))
                              if (matchIdx >= 0) {
                                const replace = window.confirm(`ITT for "${newITT.project}" (${newITT.category}) exists. Replace existing record?`)
                                if (replace) {
                                  ;(activeITTs as any)[matchIdx] = { ...(activeITTs as any)[matchIdx], ...newITT }
                                  replaced++
                                } else {
                                  // skip
                                }
                              } else {
                                ;(activeITTs as any).push(newITT)
                                imported++
                              }
                            })
                            const msg = [`Imported ${imported} ITTs`]
                            if (replaced > 0) msg.push(`Replaced ${replaced}`)
                            alert(msg.join(' • '))
                            // Force re-render by nudging search
                            setSearchQuery(searchQuery)
                          } catch {
                            alert('Failed to import CSV. Ensure a header row and comma-separated values.')
                          }
                        }
                        reader.readAsText(file)
                        e.currentTarget.value = ''
                      }}
                    />
                    <Button asChild variant="outline" size="sm">
                      <span>Import Data</span>
                    </Button>
                  </label>
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
    { id: 'active-itts-widget', title: 'Active ITTs', area: 'itt', size: 'xl' as const, enabled: true, order: 0 },
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

  // Wizard State (top-level to avoid remount issues)
  const [wizardStep, setWizardStep] = useState<number>(1)
  const [wizardSelectedCategories, setWizardSelectedCategories] = useState<Set<string>>(new Set())
  const [wizardSelectedPackages, setWizardSelectedPackages] = useState<Set<string>>(new Set())
  const [wizardSelectedSuppliers, setWizardSelectedSuppliers] = useState<Set<string>>(new Set())
  const [wizardDesc, setWizardDesc] = useState<string>(ittFormData.description || '')
  const [emailSubject, setEmailSubject] = useState<string>('')
  const [emailBody, setEmailBody] = useState<string>('')
  const [additionalRecipients, setAdditionalRecipients] = useState<string[]>([])
  const [newRecipient, setNewRecipient] = useState<string>('')
  const [packageInfoLink, setPackageInfoLink] = useState<string>('')
  const [emailHtml, setEmailHtml] = useState<string>('')
  const composeRef = useRef<HTMLDivElement | null>(null)
  const emailBodyRef = useRef<HTMLDivElement | null>(null)
  
  // New email composer state
  const [showCc, setShowCc] = useState(false)
  const [attachments, setAttachments] = useState<{ name: string; size: number; type: string; data?: string }[]>([])
  const [errors, setErrors] = useState<{ to?: string; subject?: string }>({})
  const [showConfirmation, setShowConfirmation] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toggleInSet = (setObj: Set<string>, key: string) => {
    const copy = new Set<string>(Array.from(setObj))
    if (copy.has(key)) copy.delete(key); else copy.add(key)
    return copy
  }

  // Email composer helper functions
  const handleSend = () => {
    // Get recipients from the current step context
    const constants = require('../../lib/constants')
    const suppliersAll = constants.supplierPerformanceData as any[]
    const supplierObjs = suppliersAll.filter(s => wizardSelectedSuppliers.has(s.name))
    const recipients = supplierObjs.map(s => (s.contactEmail || s.contact || '')).filter((e: string) => !!e)
    const allRecipients = Array.from(new Set([...recipients, ...additionalRecipients.filter((e) => !!e)]))

    // Validation
    const newErrors: { to?: string; subject?: string } = {}
    if (allRecipients.length === 0) {
      newErrors.to = 'At least one recipient is required'
    }
    if (!emailSubject.trim()) {
      newErrors.subject = 'Subject is required'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Build email body with attachments note
    let body = emailHtml ? stripHtml(emailHtml) : (emailBody || '')
    if (packageInfoLink && !/package information:/i.test(body)) {
      body += `\n\nPackage Information: ${packageInfoLink} `
    }
    
    // Add attachments note if any
    if (attachments.length > 0) {
      body += `\n\n—\nAttachments included above. This message was prepared via the dashboard composer.`
    }

    // Log email object
    const emailObject = {
      to: allRecipients,
      cc: showCc ? additionalRecipients : undefined,
      subject: emailSubject,
      body: body,
      attachments: attachments
    }
    console.log('Email queued:', emailObject)

    // Show confirmation
    setShowConfirmation(true)
    setTimeout(() => setShowConfirmation(false), 2000)

    // Close modal
    setShowCreateITT(false)
    resetWizardState()
  }

  const handleSaveDraft = () => {
    // Save draft logic here
    console.log('Draft saved')
  }

  const handleDiscard = () => {
    setShowCreateITT(false)
    resetWizardState()
  }

  const handleAttachFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const base64Data = e.target?.result as string
          const base64Content = base64Data.split(',')[1] // Remove data URL prefix
          
          setAttachments(prev => [...prev, {
            name: file.name,
            size: file.size,
            type: file.type,
            data: base64Content
          }])
        }
        reader.readAsDataURL(file)
      })
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const truncateFileName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name
    const ext = name.split('.').pop()
    const nameWithoutExt = name.substring(0, name.lastIndexOf('.'))
    const half = Math.floor((maxLength - 3) / 2)
    return `${nameWithoutExt.substring(0, half)}...${nameWithoutExt.substring(nameWithoutExt.length - half)}.${ext}`
  }

  const addManualRecipient = (email: string) => {
    // Recompute all recipients from selected suppliers + additional list
    const constants = require('../../lib/constants')
    const suppliersAll = constants.supplierPerformanceData as any[]
    const supplierObjs = suppliersAll.filter((s: any) => wizardSelectedSuppliers.has(s.name))
    const recipients = supplierObjs
      .map((s: any) => (s.contactEmail || s.contact || ''))
      .filter((e: string) => !!e)
    const allRecipients = Array.from(new Set([...recipients, ...additionalRecipients.filter((e) => !!e)]))

    if (validateEmail(email) && !allRecipients.includes(email)) {
      setAdditionalRecipients(prev => [...prev, email])
      setNewRecipient('')
    }
  }

  const removeManualRecipient = (email: string) => {
    setAdditionalRecipients(prev => prev.filter(e => e !== email))
  }

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return (tmp.textContent || tmp.innerText || '').trim()
  }

  const resetWizardState = () => {
    setWizardStep(1)
    setWizardSelectedCategories(new Set())
    setWizardSelectedPackages(new Set())
    setWizardSelectedSuppliers(new Set())
    setWizardDesc('')
    setEmailSubject('')
    setEmailBody('')
    setAdditionalRecipients([])
    setNewRecipient('')
    setPackageInfoLink('')
    setEmailHtml('')
    setShowCc(false)
    setAttachments([])
    setErrors({})
    setShowConfirmation(false)
  }

  // Keyboard shortcuts for email composer
  useEffect(() => {
    if (wizardStep !== 4) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'Enter') {
          e.preventDefault()
          handleSend()
        } else if (e.key === 's') {
          e.preventDefault()
          handleSaveDraft()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [wizardStep, emailSubject, emailHtml, emailBody, packageInfoLink, attachments])

  // Initialize editable email fields when entering Send step
  useEffect(() => {
    if (wizardStep !== 4) return
    const defaultSubject = `ITT: ${ittFormData.project || ''} – ${Array.from(wizardSelectedCategories).join(', ') || 'General'}`.trim()
    const defaultBodyParts = [
      `Project: ${ittFormData.project || '—'}`,
      `Categories: ${Array.from(wizardSelectedCategories).join(', ') || '—'}`,
      `Work Packages: ${Array.from(wizardSelectedPackages).join(', ') || '—'}`,
      `Suppliers: ${Array.from(wizardSelectedSuppliers).join(', ') || '—'}`,
      '',
      'Details:',
      (wizardDesc || '—'),
    ].filter(Boolean).join('\n')
    if (!emailSubject) setEmailSubject(defaultSubject)
    if (!emailBody) setEmailBody(defaultBodyParts)
    if (!emailHtml) {
      const section = (title: string, content: string) => `<h3 style="margin:0 0 6px;font-size:14px">${title}</h3><div style="margin:0 0 12px;font-size:14px;line-height:1.5">${content}</div>`
      const pill = (t: string, color='#eef2ff', text='#1e40af') => `<span style="display:inline-block;padding:2px 8px;margin:2px;border-radius:9999px;background:${color};color:${text};font-size:12px">${t}</span>`
      const cats = Array.from(wizardSelectedCategories).map(c => pill(c,'#dbeafe','#1e3a8a')).join('') || '—'
      const packs = Array.from(wizardSelectedPackages).map(p => pill(p,'#f3f4f6','#111827')).join('') || '—'
      const sups = Array.from(wizardSelectedSuppliers).map(s => pill(s,'#dcfce7','#166534')).join('') || '—'
      const pkgLink = packageInfoLink ? `<p style="margin:0"><strong>Package Information:</strong> <a href="${packageInfoLink}" target="_blank">${packageInfoLink}</a></p>` : ''
      const html = `<!doctype html><html><body style="font-family:ui-sans-serif,system-ui;line-height:1.5;color:#111;padding:8px">
        ${section('Project', `<div>${ittFormData.project || '—'}</div>`) }
        ${section('Categories', cats)}
        ${section('Work Packages', packs)}
        ${section('Suppliers', sups)}
        ${section('Description', `<div>${(wizardDesc || '—').replace(/\n/g,'<br/>')}</div>`)}
        ${pkgLink}
      </body></html>`
      setEmailHtml(html)
    }
  }, [wizardStep, ittFormData.project, wizardSelectedCategories, wizardSelectedPackages, wizardSelectedSuppliers, wizardDesc, packageInfoLink])

  // Keep Package Information link synced inside the HTML content
  useEffect(() => {
    if (wizardStep !== 4) return
    const link = (packageInfoLink || '').trim()
    // Remove existing Package Information paragraph and insert updated one at the end of body
    const replacePkgInfo = (html: string) => {
      const regex = /<p[^>]*>\s*<strong>Package Information:<\/strong>[\s\S]*?<\/p>/i
      let updated = html.replace(regex, '')
      if (link) {
        const pkgPara = `<p style="margin:0"><strong>Package Information:</strong> <a href="${link}" target="_blank">${link}</a></p>`
        updated = updated.replace(/<\/body><\/html>\s*$/i, `${pkgPara}</body></html>`)
      }
      return updated
    }
    const newHtml = replacePkgInfo(emailHtml || '')
    if (newHtml !== (emailHtml || '')) {
      setEmailHtml(newHtml)
      if (composeRef.current) composeRef.current.innerHTML = newHtml
    }
  }, [packageInfoLink, wizardStep])

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
    // Ensure project is always prefilled, even if not in demo constants
    setIttFormData(prev => ({ ...prev, project: projectName }))
    // Enrich with additional details when available
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
                     <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">ITT Manager</h1>
                      <p className="text-muted-foreground mt-1">Create and manage Invitation to Tender documents with intelligent supplier matching</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" className="flex items-center gap-2 h-11 px-4 rounded-xl hover:bg-accent hover:text-accent-foreground border-border">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
          <Button onClick={() => setShowCreateITT(true)} className="flex items-center gap-2 h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4" />
            Create ITT
          </Button>
          {/* Import Work Packages */}
          <label className="inline-flex items-center">
            <input
              type="file"
              accept=".csv, text/csv, application/vnd.ms-excel"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const text = await file.text()
                try {
                  const { parseSimpleCSV } = await import('../../lib/utils')
                  const { workPackages } = await import('../../lib/constants')
                  const rows = parseSimpleCSV(text)
                  let imported = 0
                  let replaced = 0
                  rows.forEach(r => {
                    const coins = (r['coins code'] || r['coinscode'] || r['coins_code'] || r['coins'] || '').trim()
                    const description = (r['description'] || '').trim()
                    const idNum = Number(r['id'] || '') || Math.floor(Math.random()*1e9)
                    if (!coins || !description) return
                    const existingIdx = workPackages.findIndex((w: any) => w.coinsCode.toLowerCase() === coins.toLowerCase())
                    const wp = { coinsCode: coins, description, id: idNum }
                    if (existingIdx >= 0) {
                      const replace = window.confirm(`Work Package ${coins} exists. Replace it?`)
                      if (replace) { (workPackages as any)[existingIdx] = { ...(workPackages as any)[existingIdx], ...wp }; replaced++ }
                    } else {
                      (workPackages as any).push(wp); imported++
                    }
                  })
                  alert([`Work Packages imported: ${imported}`, replaced ? `Replaced: ${replaced}` : ''].filter(Boolean).join(' • '))
                } catch {
                  alert('Failed to import Work Packages CSV')
                } finally {
                  e.currentTarget.value = ''
                }
              }}
            />
            <Button asChild variant="outline" className="h-11 px-4 rounded-xl">
              <span>Import Work Packages</span>
            </Button>
          </label>
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

      {/* Create ITT Wizard */}
      <Dialog open={showCreateITT} onOpenChange={setShowCreateITT}>
        <DialogContent className="w-[90vw] max-w-[1280px] h-[90vh] !max-w-none bg-background/80 backdrop-blur-md border border-border p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-2 border-b border-border bg-card/50">
            <DialogTitle className="text-foreground">📋 Create New ITT</DialogTitle>
            <DialogDescription className="text-muted-foreground">Details → Packages & Suppliers → Review → Send</DialogDescription>
          </DialogHeader>
          {(() => {
            // Wizard local state
            const [step, setStep] = (useState as any)(1)
            const [selectedCategories, setSelectedCategories] = (useState as any)(new Set<string>())
            const [selectedPackages, setSelectedPackages] = (useState as any)(new Set<string>())
            const [selectedSuppliers, setSelectedSuppliers] = (useState as any)(new Set<string>())
            const [desc, setDesc] = (useState as any)(ittFormData.description)
            const toggleSet = (setObj: any, key: string) => {
              const copy = new Set<string>(Array.from(setObj))
              if (copy.has(key)) copy.delete(key); else copy.add(key)
              return copy
            }
            const canNext = () => {
              if (step === 1) return !!ittFormData.project && (selectedCategories.size > 0)
              if (step === 2) return selectedPackages.size > 0 || selectedSuppliers.size > 0
              return true
            }
            return (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Steps */}
                <div className="mb-0 sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
                  <div className="px-6 pt-4">
                    <div className="flex items-center gap-4 mb-2">
                      {[1,2,3,4].map((n) => (
                        <div key={n} className="flex items-center gap-2">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${wizardStep>=n ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border border-border'}`}>{n}</div>
                          <span className={`text-base ${wizardStep===n ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{n===1?'Details':n===2?'Packages & Suppliers':n===3?'Review':'Send'}</span>
                        </div>
                      ))}
                    </div>
                    <div className="h-2 bg-muted rounded">
                      <div className="h-2 bg-primary rounded transition-all" style={{ width: `${((wizardStep-1)/3)*100}%` }} />
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-6">
                  {wizardStep === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-base font-bold">Project</Label>
                        <Select value={ittFormData.project} onValueChange={(value) => setIttFormData((prev: any) => ({ ...prev, project: value }))}>
                <SelectTrigger className="h-12 text-base">
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
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-bold">Categories</Label>
                          <div className="text-sm flex items-center gap-2">
                            <button className="text-primary hover:underline" onClick={() => setWizardSelectedCategories(new Set(require('../../lib/constants').ittCategories))}>Select All</button>
                            <span className="text-muted-foreground">|</span>
                            <button className="text-muted-foreground hover:underline" onClick={() => setWizardSelectedCategories(new Set())}>Clear</button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {require('../../lib/constants').ittCategories.map((cat: string) => (
                            <label key={cat} className={`flex items-center gap-3 text-base p-3 border rounded-lg cursor-pointer transition-all ${wizardSelectedCategories.has(cat)?'bg-primary/10 border-primary':'border-border hover:bg-accent hover:text-accent-foreground'}`}>
                              <input type="checkbox" className="w-5 h-5 text-primary rounded focus:ring-primary" checked={wizardSelectedCategories.has(cat)} onChange={() => setWizardSelectedCategories((s: Set<string>) => toggleInSet(s, cat))} />
                              <span>{cat}</span>
                            </label>
                          ))}
                        </div>
                        {wizardSelectedCategories.size>0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {Array.from(wizardSelectedCategories).map((c: string) => (
                              <span key={c} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                                {c}
                                <button className="text-blue-700" onClick={() => setWizardSelectedCategories((s: Set<string>) => { const x = new Set<string>(Array.from(s)); x.delete(c); return x })}>×</button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-base font-bold">Description (optional)</Label>
                        <Textarea className="min-h-[120px] text-base" value={wizardDesc} onChange={(e: any) => setWizardDesc(e.target.value)} placeholder="Detailed description of the ITT requirements..." />
                      </div>
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center justify-between">
                          <Label>Work Packages</Label>
                          <div className="text-xs flex items-center gap-2">
                            <button className="text-blue-600 hover:underline" onClick={() => setWizardSelectedPackages(new Set(require('../../lib/constants').workPackageNames))}>Select All</button>
                            <span className="text-neutral-300">|</span>
                            <button className="text-neutral-600 hover:underline" onClick={() => setWizardSelectedPackages(new Set())}>Clear</button>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="mb-2">
                            <Input placeholder="Search work packages..." onChange={(e: any) => {
                              const q = e.target.value.toLowerCase()
                              const container = e.currentTarget.parentElement?.nextElementSibling as HTMLElement | null
                              if (!container) return
                              const items = Array.from(container.querySelectorAll('[data-wp]')) as HTMLElement[]
                              items.forEach(el => {
                                const name = el.getAttribute('data-wp') || ''
                                el.style.display = name.toLowerCase().includes(q) ? '' : 'none'
                              })
                            }} />
                          </div>
                          <div className="max-h-[50vh] overflow-auto border rounded-md">
                            {require('../../lib/constants').workPackageNames.map((name: string) => (
                              <label key={name} data-wp={name} className={`flex items-center justify-between gap-2 text-sm p-2 border-b last:border-b-0 ${wizardSelectedPackages.has(name)?'bg-blue-50':''}`}>
                                <div className="font-medium">{name}</div>
                                <input type="checkbox" checked={wizardSelectedPackages.has(name)} onChange={() => setWizardSelectedPackages((s: Set<string>) => toggleInSet(s, name))} />
                              </label>
                            ))}
                          </div>
                          {wizardSelectedPackages.size>0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {Array.from(wizardSelectedPackages).map((p: string) => (
                                <span key={p} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                                  {p}
                                  <button className="text-blue-700" onClick={() => setWizardSelectedPackages((s: Set<string>) => { const x = new Set<string>(Array.from(s)); x.delete(p); return x })}>×</button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label>Suggested Suppliers</Label>
                        <div className="mt-2 max-h-[50vh] overflow-auto border rounded-md divide-y">
                          {(() => {
                            const constants = require('../../lib/constants')
                            const base: any[] = constants.supplierPerformanceData
                            const categoriesSet = new Set<string>(Array.from(wizardSelectedCategories).map((c: string) => c.toLowerCase()))
                            const { inferCategoriesFromWorkPackageName } = require('../../lib/utils')
                            const derivedCats = new Set<string>()
                            Array.from(wizardSelectedPackages).forEach((p: string) => inferCategoriesFromWorkPackageName(p).forEach((c: string) => derivedCats.add(c.toLowerCase())))
                            const shouldFilter = categoriesSet.size > 0 || derivedCats.size > 0
                            const filtered = shouldFilter ? base.filter((s: any) => {
                              const cat = String(s.category || '').toLowerCase()
                              const matchCategory = categoriesSet.size === 0 || categoriesSet.has(cat)
                              const matchDerived = derivedCats.size === 0 || derivedCats.has(cat)
                              return matchCategory && matchDerived
                            }) : base
                            const list = filtered.length > 0 ? filtered : base
                            return list.map((s: any) => (
                            <label key={s.name} className="group flex items-center justify-between gap-3 text-sm p-3 hover:bg-accent hover:text-accent-foreground transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center text-xs font-semibold">
                                  {s.name.split(' ').map((w: string) => w[0]).slice(0,2).join('')}
                                </div>
                                <div>
                                  <div className="font-medium flex items-center gap-2">
                                    {s.name}
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border">{s.category}</span>
                                    {s.approved && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">Approved</span>}
                                  </div>
                                  <div className="text-neutral-500 text-xs">Region: {s.region} • On-time: {s.onTimeDelivery ?? '-'}% • Quality: {s.qualityScore ?? '-'}</div>
                                </div>
                              </div>
                              <input type="checkbox" className="h-4 w-4 accent-blue-600" checked={wizardSelectedSuppliers.has(s.name)} onChange={() => setWizardSelectedSuppliers((ss: Set<string>) => toggleInSet(ss, s.name))} />
                            </label>
                            ))
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-lg border">
                          <div className="text-sm font-semibold mb-2">Project</div>
                          <div className="text-sm text-foreground">{ittFormData.project || '—'}</div>
                        </div>
                        <div className="p-4 bg-white rounded-lg border">
                          <div className="text-sm font-semibold mb-2">Categories</div>
                          {wizardSelectedCategories.size > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {Array.from(wizardSelectedCategories).map((c: string) => (
                                <span key={c} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{c}</span>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-neutral-500">—</div>
                          )}
                        </div>
                        <div className="p-4 bg-white rounded-lg border">
                          <div className="text-sm font-semibold mb-2">Work Packages</div>
                          {wizardSelectedPackages.size > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {Array.from(wizardSelectedPackages).map((p: string) => (
                                <span key={p} className="px-2 py-1 text-xs rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border">{p}</span>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-neutral-500">—</div>
                          )}
                        </div>
                        <div className="p-4 bg-white rounded-lg border">
                          <div className="text-sm font-semibold mb-2">Suppliers</div>
                          {wizardSelectedSuppliers.size > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {Array.from(wizardSelectedSuppliers).map((s: string) => (
                                <span key={s} className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">{s}</span>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-neutral-500">—</div>
                          )}
                        </div>
                        <div className="md:col-span-2 p-4 bg-white rounded-lg border">
                          <div className="text-sm font-semibold mb-2">Description</div>
                          <div className="text-sm whitespace-pre-wrap text-foreground">{wizardDesc || '—'}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {wizardStep === 4 && (() => {
                    const constants = require('../../lib/constants')
                    const suppliersAll = constants.supplierPerformanceData as any[]
                    const supplierObjs = suppliersAll.filter(s => wizardSelectedSuppliers.has(s.name))
                    const recipients = supplierObjs.map(s => (s.contactEmail || s.contact || '')).filter((e: string) => !!e)
                    const allRecipients = Array.from(new Set([...recipients, ...additionalRecipients.filter((e) => !!e)]))

                    return (
                      <div className="h-full flex flex-col">
                        {/* Email Composer */}
                        <div className="flex-1 w-full mx-auto">
                          <div className="bg-white rounded-2xl shadow-lg border p-4 space-y-4 h-full">
                            {/* To Field */}
                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-700">
                                To <span className="text-red-500">*</span>
                              </label>
                              <div className="flex flex-wrap gap-1 p-2 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-muted-foreground/20 focus-within:border-muted-foreground/20">
                                {allRecipients.map((email, index) => (
                                  <div key={index} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                                    <span>{email}</span>
                                    <button
                                      type="button"
                                      onClick={() => setAdditionalRecipients(prev => prev.filter((_, i) => i !== index))}
                                      className="hover:bg-blue-100 rounded-full p-0.5"
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                ))}
                                {showCc && additionalRecipients.map((email, index) => (
                                  <div key={`cc-${index}`} className="flex items-center gap-1 bg-gray-50 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                                    <span>{email}</span>
                                    <button
                                      type="button"
                                      onClick={() => removeManualRecipient(email)}
                                      className="hover:bg-gray-100 rounded-full p-0.5"
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                              {errors.to && <p className="text-xs text-red-500">{errors.to}</p>}
                            </div>

                            {/* Cc Field */}
                            <div className="space-y-1">
                              {!showCc ? (
                                <button
                                  type="button"
                                  onClick={() => setShowCc(true)}
                                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                                >
                                  + Add Cc
                                </button>
                              ) : (
                                <div className="space-y-1">
                                  <label className="text-sm font-medium text-gray-700">Cc</label>
                                  <div className="flex gap-2">
                                    <input
                                      type="email"
                                      value={newRecipient}
                                      onChange={(e) => setNewRecipient(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ',') {
                                          e.preventDefault()
                                          addManualRecipient(newRecipient)
                                        }
                                      }}
                                      placeholder="Enter email address"
                                      className="flex-1 px-2 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-muted-foreground/20 focus:border-muted-foreground/20 text-sm"
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => addManualRecipient(newRecipient)}
                                      className="px-2 py-1 h-auto"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Subject Field with Attach Button */}
                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-700">
                                Subject <span className="text-red-500">*</span>
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={emailSubject}
                                  onChange={(e) => setEmailSubject(e.target.value)}
                                  placeholder="Enter subject"
                                  className="flex-1 px-2 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-muted-foreground/20 focus:border-muted-foreground/20 text-sm"
                                  aria-invalid={!!errors.subject}
                                />
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  multiple
                                  onChange={handleAttachFiles}
                                  className="hidden"
                                  accept="*/*"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="px-2 py-1 h-auto"
                                >
                                  <Paperclip className="w-3 h-3" />
                                </Button>
                              </div>
                              {errors.subject && <p className="text-xs text-red-500">{errors.subject}</p>}
                            </div>

                            {/* Attachments */}
                            {attachments.length > 0 && (
                              <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Attachments</label>
                                <div className="flex flex-wrap gap-1">
                                  {attachments.map((file, index) => (
                                    <div key={index} className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-xs">
                                      <FileText className="w-3 h-3 text-gray-500" />
                                      <span className="text-gray-700" title={file.name}>
                                        {truncateFileName(file.name, 15)}
                                      </span>
                                      <span className="text-gray-500 text-xs">
                                        {formatFileSize(file.size)}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => removeAttachment(index)}
                                        className="hover:bg-gray-200 rounded-full p-0.5"
                                      >
                                        <X className="w-2.5 h-2.5 text-gray-500" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Body Field */}
                            <div className="space-y-1 flex-1">
                              <label className="text-sm font-medium text-gray-700">Message</label>
                              <div
                                contentEditable
                                ref={emailBodyRef}
                                onInput={(e) => setEmailHtml(e.currentTarget.innerHTML)}
                                className="min-h-[120px] max-h-[200px] px-2 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-muted-foreground/20 focus:border-muted-foreground/20 text-sm resize-none overflow-y-auto"
                                style={{ whiteSpace: 'pre-wrap' }}
                                dangerouslySetInnerHTML={{ __html: emailHtml }}
                              />
                            </div>

                            {/* Package Information Link */}
                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-700">Package Information Link</label>
                              <input
                                type="url"
                                value={packageInfoLink}
                                onChange={(e) => setPackageInfoLink(e.target.value)}
                                placeholder="Enter package information URL"
                                className="w-full px-2 py-1 border border-gray-200 rounded-lg focus:ring-2 focus:ring-muted-foreground/20 focus:border-muted-foreground/20 text-sm"
                              />
                            </div>

                            {/* Download Actions */}
                            <div className="space-y-1">
                              <label className="text-sm font-medium text-gray-700">Email Actions</label>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // Get recipients from the current step context
                                    const constants = require('../../lib/constants')
                                    const suppliersAll = constants.supplierPerformanceData as any[]
                                    const supplierObjs = suppliersAll.filter(s => wizardSelectedSuppliers.has(s.name))
                                    const recipients = supplierObjs.map(s => (s.contactEmail || s.contact || '')).filter((e: string) => !!e)
                                    const allRecipients = Array.from(new Set([...recipients, ...additionalRecipients.filter((e) => !!e)]))

                                    // Build the HTML content with proper structure
                                    const htmlContent = `
                                      <!DOCTYPE html>
                                      <html>
                                      <head>
                                        <meta charset="UTF-8">
                                        <title>${emailSubject}</title>
                                      </head>
                                      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
                                        <h2 style="color: #2563eb;">ITT: ${ittFormData.project || 'Project'}</h2>
                                        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
                                          <p><strong>Subject:</strong> ${emailSubject}</p>
                                          <p><strong>Project:</strong> ${ittFormData.project || '—'}</p>
                                          <p><strong>Categories:</strong> ${Array.from(wizardSelectedCategories).join(', ') || '—'}</p>
                                          <p><strong>Work Packages:</strong> ${Array.from(wizardSelectedPackages).join(', ') || '—'}</p>
                                          <p><strong>Suppliers:</strong> ${Array.from(wizardSelectedSuppliers).join(', ') || '—'}</p>
                                        </div>
                                        <div style="margin: 15px 0;">
                                          <p><strong>Description:</strong></p>
                                          <div style="background: #fefefe; padding: 10px; border-left: 3px solid #2563eb;">${(wizardDesc || '—').replace(/\n/g, '<br>')}</div>
                                        </div>
                                        ${packageInfoLink ? `<div style="margin: 15px 0;"><p><strong>Package Information:</strong></p><p><a href="${packageInfoLink}" target="_blank" style="color: #2563eb;">${packageInfoLink}</a></p></div>` : ''}
                                        ${attachments.length > 0 ? `<div style="margin: 15px 0;"><p><strong>Attachments (${attachments.length}):</strong></p><ul style="background: #f8fafc; padding: 10px; border-radius: 5px;">${attachments.map(file => `<li>${file.name} (${formatFileSize(file.size)})</li>`).join('')}</ul></div>` : ''}
                                        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                                        <p style="color: #6b7280; font-size: 12px;">This email was generated via the PREP Construction Management System.</p>
                                      </body>
                                      </html>
                                    `

                                    // Create multipart MIME message with attachments
                                    const boundary = `----=_PREP_${Date.now()}`
                                    const htmlBody = htmlContent.replace(/\n/g, '\r\n')
                                    
                                    let mimeContent = [
                                      'MIME-Version: 1.0',
                                      `Date: ${new Date().toUTCString()}`,
                                      'From: PREP <noreply@prep.local>',
                                      `To: ${allRecipients.join(', ')}`,
                                      `Subject: ${emailSubject}`,
                                      `Content-Type: multipart/mixed; boundary="${boundary}"`,
                                      '',
                                      `--${boundary}`,
                                      'Content-Type: text/html; charset="UTF-8"',
                                      'Content-Transfer-Encoding: 8bit',
                                      '',
                                      htmlBody
                                    ]

                                    // Add attachments if any
                                    if (attachments.length > 0) {
                                      attachments.forEach((file, index) => {
                                        // Use actual file data if available, otherwise create placeholder
                                        let base64Content: string
                                        if (file.data) {
                                          base64Content = file.data
                                        } else {
                                          // Fallback placeholder content
                                          const fileContent = `This is the content of ${file.name}\nFile size: ${formatFileSize(file.size)}\nFile type: ${file.type}\n\nThis is a placeholder for the actual file content.`
                                          base64Content = btoa(unescape(encodeURIComponent(fileContent)))
                                        }
                                        
                                        mimeContent.push(
                                          '',
                                          `--${boundary}`,
                                          `Content-Type: ${file.type || 'application/octet-stream'}; name="${file.name}"`,
                                          'Content-Transfer-Encoding: base64',
                                          `Content-Disposition: attachment; filename="${file.name}"`,
                                          '',
                                          base64Content
                                        )
                                      })
                                    }

                                    mimeContent.push(
                                      '',
                                      `--${boundary}--`
                                    )

                                    const content = mimeContent.join('\r\n')
                                    const blob = new Blob([content], { type: 'message/rfc822;charset=utf-8' })
                                    const url = URL.createObjectURL(blob)
                                    const a = document.createElement('a')
                                    a.href = url
                                    a.download = `ITT_${(ittFormData.project||'project').replace(/\s+/g,'_')}.eml`
                                    a.click()
                                    URL.revokeObjectURL(url)
                                  }}
                                  className="px-2 py-1 h-auto text-xs"
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  Download .eml
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // Get recipients from the current step context
                                    const constants = require('../../lib/constants')
                                    const suppliersAll = constants.supplierPerformanceData as any[]
                                    const supplierObjs = suppliersAll.filter(s => wizardSelectedSuppliers.has(s.name))
                                    const recipients = supplierObjs.map(s => (s.contactEmail || s.contact || '')).filter((e: string) => !!e)
                                    const allRecipients = Array.from(new Set([...recipients, ...additionalRecipients.filter((e) => !!e)]))

                                    let body = emailHtml ? stripHtml(emailHtml) : (emailBody || '')
                                    if (packageInfoLink && !/package information:/i.test(body)) {
                                      body += `\n\nPackage Information: ${packageInfoLink} `
                                    }
                                    // Note: Email clients can't handle actual file attachments via mailto
                                    // Users will need to manually attach files in their email client
                                    if (attachments.length > 0) {
                                      body += `\n\nNote: ${attachments.length} attachment(s) need to be manually added to this email.`
                                    }
                                    const mailto = `mailto:${encodeURIComponent(allRecipients.join(','))}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(body)}`
                                    window.location.href = mailto
                                  }}
                                  className="px-2 py-1 h-auto text-xs"
                                >
                                  <Mail className="w-3 h-3 mr-1" />
                                  Open Email
                                </Button>
                              </div>
                            </div>

                            {/* Confirmation Message */}
                            {showConfirmation && (
                              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-1 text-xs text-green-700">
                                Email queued
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                <DialogFooter className="px-6 py-4 border-t mt-auto">
                  {wizardStep < 4 ? (
                    <>
                      <Button variant="outline" onClick={() => setShowCreateITT(false)}>Cancel</Button>
                      {wizardStep > 1 && <Button variant="outline" onClick={() => setWizardStep(wizardStep-1)}>Back</Button>}
                      <Button disabled={!(ittFormData.project && (wizardSelectedCategories.size>0) || wizardStep>1 && (wizardSelectedPackages.size>0 || wizardSelectedSuppliers.size>0))} onClick={() => {
                        if (wizardStep === 1) {
                          setIttFormData((prev: any) => ({ ...prev, description: wizardDesc, category: Array.from(wizardSelectedCategories)[0] || prev.category }))
                        }
                        if (wizardStep === 3) {
                          // Finalize before send
                          setIttFormData((prev: any) => ({ ...prev, suppliers: Array.from(wizardSelectedSuppliers) }))
                        }
                        setWizardStep(wizardStep+1)
                      }}>Next</Button>
                    </>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        onClick={handleDiscard}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Discard
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleSaveDraft}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Draft
                      </Button>
                      <Button
                        onClick={handleSend}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Send
                      </Button>
                    </div>
                  )}
          </DialogFooter>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}