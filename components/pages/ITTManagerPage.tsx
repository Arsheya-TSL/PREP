import { Plus, Send, FileText, CheckCircle, AlertTriangle, Clock, Filter, Search, BarChart3, Target, Zap, Award, Users2, Package } from "lucide-react"
import { useState } from "react"
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

export default function ITTManagerPage({
  widgets,
  getPageWidgets,
  moveWidget,
  updateWidgetSize,
  customizeMode,
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
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterRegion, setFilterRegion] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestedSuppliers, setSuggestedSuppliers] = useState<typeof supplierPerformanceData>([])
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])

  // Generate intelligent supplier suggestions
  const generateSupplierSuggestions = (projectName: string, category: string, materials: string[], region: string) => {
    const suggestions = supplierPerformanceData.filter(supplier => {
      // Region matching
      const regionMatch = region === 'all' || 
        supplier.region.toLowerCase() === region.toLowerCase() ||
        (region === 'europe' && ['UK', 'Germany', 'France', 'Netherlands', 'Spain'].includes(supplier.region))

      // Category matching
      const categoryMatch = supplier.category.toLowerCase() === category.toLowerCase() || 
        supplier.category === 'General'

      // Material matching
      const materialMatch = materials.some(material => 
        supplier.materialsAvailable.some(available => 
          available.toLowerCase().includes(material.toLowerCase())
        )
      )

      // Only approved suppliers
      const isApproved = supplier.approved

      return regionMatch && (categoryMatch || materialMatch) && isApproved
    }).sort((a, b) => {
      // Enhanced scoring algorithm
      let scoreA = a.score
      let scoreB = b.score

      // Boost for exact region match
      if (a.region.toLowerCase() === region.toLowerCase()) scoreA += 5
      if (b.region.toLowerCase() === region.toLowerCase()) scoreB += 5

      // Boost for exact category match
      if (a.category.toLowerCase() === category.toLowerCase()) scoreA += 3
      if (b.category.toLowerCase() === category.toLowerCase()) scoreB += 3

      // Boost for material availability
      const aMatches = materials.filter(m => a.materialsAvailable.some(am => am.toLowerCase().includes(m.toLowerCase()))).length
      const bMatches = materials.filter(m => b.materialsAvailable.some(bm => bm.toLowerCase().includes(m.toLowerCase()))).length
      scoreA += aMatches * 2
      scoreB += bMatches * 2

      // Boost for response time (lower is better)
      scoreA += (5 - a.responseTime) * 0.5
      scoreB += (5 - b.responseTime) * 0.5

      return scoreB - scoreA
    })

    setSuggestedSuppliers(suggestions.slice(0, 10))
  }

  const handleProjectChange = (projectName: string) => {
    autoFillITTFromProject(projectName)
    
    // Generate suggestions when project is selected
    if (projectName && ittFormData.category && ittFormData.region) {
      generateSupplierSuggestions(
        projectName,
        ittFormData.category,
        ittFormData.materials,
        ittFormData.region
      )
    }
  }

  const handleCategoryChange = (category: string) => {
    setIttFormData(prev => ({ ...prev, category }))
    
    if (ittFormData.project && category && ittFormData.region) {
      generateSupplierSuggestions(
        ittFormData.project,
        category,
        ittFormData.materials,
        ittFormData.region
      )
    }
  }

  const handleRegionChange = (region: string) => {
    setIttFormData(prev => ({ ...prev, region }))
    
    if (ittFormData.project && ittFormData.category && region) {
      generateSupplierSuggestions(
        ittFormData.project,
        ittFormData.category,
        ittFormData.materials,
        region
      )
    }
  }

  const toggleSupplierSelection = (supplierName: string) => {
    const updatedSuppliers = ittFormData.suppliers.includes(supplierName)
      ? ittFormData.suppliers.filter(s => s !== supplierName)
      : [...ittFormData.suppliers, supplierName]
    
    setIttFormData(prev => ({ ...prev, suppliers: updatedSuppliers }))
  }

  const getSupplierRecommendationReason = (supplier: typeof supplierPerformanceData[0]) => {
    const reasons = []
    
    if (supplier.region === ittFormData.region) {
      reasons.push(`Local supplier in ${supplier.region}`)
    }
    
    if (supplier.score >= 4.8) {
      reasons.push("Highest rated supplier")
    } else if (supplier.score >= 4.5) {
      reasons.push("Highly rated")
    }
    
    if (supplier.onTimeDelivery >= 95) {
      reasons.push("Excellent delivery record")
    }
    
    if (supplier.responseTime <= 2) {
      reasons.push("Fast response time")
    }
    
    const materialMatches = ittFormData.materials.filter(m => 
      supplier.materialsAvailable.some(am => am.toLowerCase().includes(m.toLowerCase()))
    )
    
    if (materialMatches.length > 0) {
      reasons.push(`Supplies ${materialMatches[0]}${materialMatches.length > 1 ? ` +${materialMatches.length - 1} more` : ''}`)
    }
    
    return reasons[0] || "Good match for project requirements"
  }

  const allITTs: ActiveITT[] = [...userITTs, ...activeITTs]
  const filteredITTs = allITTs.filter(itt => {
    const matchesStatus = filterStatus === "all" || itt.status.toLowerCase() === filterStatus.toLowerCase()
    const matchesRegion = filterRegion === "all" || itt.region.toLowerCase() === filterRegion.toLowerCase()
    const matchesSearch = searchQuery === "" || 
      itt.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      itt.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesStatus && matchesRegion && matchesSearch
  })

  return (
    <div className="space-y-6">
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

      {/* Active ITTs Table - TOP PRIORITY */}
      <DraggableWidget
        widget={{
          id: 'active-itts-table',
          title: 'Active ITTs',
          description: 'Track your tender submissions and responses',
          type: 'data-table',
          category: 'itt',
          enabled: true,
          pages: ['itt-manager'],
          order: 0,
          size: 'extra-large'
        }}
        index={0}
        moveWidget={moveWidget}
        customizeMode={customizeMode}
        screenSize={screenSize}
        onSizeChange={updateWidgetSize}
      >
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
                    className="pl-10 w-60"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                    <SelectItem value="awarded">Awarded</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterRegion} onValueChange={setFilterRegion}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
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
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-gray-50/50">
                    <TableHead className="font-semibold text-foreground">Project</TableHead>
                    <TableHead className="font-semibold text-foreground">Category</TableHead>
                    <TableHead className="font-semibold text-foreground">Status</TableHead>
                    <TableHead className="font-semibold text-foreground">Region</TableHead>
                    <TableHead className="font-semibold text-foreground">Created</TableHead>
                    <TableHead className="font-semibold text-foreground">Deadline</TableHead>
                    <TableHead className="font-semibold text-foreground">Suppliers</TableHead>
                    <TableHead className="font-semibold text-foreground">Responses</TableHead>
                    <TableHead className="font-semibold text-foreground">Budget</TableHead>
                    <TableHead className="font-semibold text-foreground w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredITTs.map((itt) => (
                    <TableRow key={itt.id} className="hover:bg-secondary/30 transition-colors">
                      <TableCell className="font-medium text-foreground">{itt.project}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{itt.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(itt.status)}>
                          {itt.status === 'Draft' && <FileText className="h-3 w-3 mr-1" />}
                          {itt.status === 'Sent' && <Send className="h-3 w-3 mr-1" />}
                          {itt.status === 'Replied' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {itt.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{itt.region}</Badge>
                      </TableCell>
                      <TableCell className="text-neutral-500 text-sm">{formatTimeAgo(itt.created)}</TableCell>
                      <TableCell className="text-neutral-500 text-sm">{formatTimeAgo(itt.deadline)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users2 className="h-4 w-4 text-neutral-500" />
                          <span className="text-foreground">{itt.suppliers.length}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-foreground font-medium">{itt.responses}</span>
                          {itt.responses > 0 && <CheckCircle className="h-4 w-4 text-green-600" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground font-medium">{formatLargeCurrency(itt.budget)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Send className="h-4 w-4" />
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
      </DraggableWidget>

      {/* ITT Overview Cards as Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DraggableWidget
          widget={{
            id: 'draft-itts-widget',
            title: 'Draft ITTs',
            description: 'ITTs ready to send',
            type: 'stat-card',
            category: 'itt',
            enabled: true,
            pages: ['itt-manager'],
            order: 1,
            size: 'small'
          }}
          index={1}
          moveWidget={moveWidget}
          customizeMode={customizeMode}
          screenSize={screenSize}
          onSizeChange={updateWidgetSize}
        >
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Draft ITTs</p>
                <p className="text-3xl font-bold text-neutral-800 mt-1">3</p>
                <p className="text-xs text-neutral-500 mt-1">Ready to send</p>
              </div>
              <div className="p-3 bg-neutral-100 rounded-xl">
                <FileText className="h-6 w-6 text-neutral-600" />
              </div>
            </div>
          </div>
        </DraggableWidget>
        
        <DraggableWidget
          widget={{
            id: 'sent-itts-widget',
            title: 'Sent ITTs',
            description: 'ITTs awaiting responses',
            type: 'stat-card',
            category: 'itt',
            enabled: true,
            pages: ['itt-manager'],
            order: 2,
            size: 'small'
          }}
          index={2}
          moveWidget={moveWidget}
          customizeMode={customizeMode}
          screenSize={screenSize}
          onSizeChange={updateWidgetSize}
        >
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Sent ITTs</p>
                <p className="text-3xl font-bold text-neutral-800 mt-1">8</p>
                <p className="text-xs text-neutral-500 mt-1">Awaiting responses</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Send className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </DraggableWidget>
        
        <DraggableWidget
          widget={{
            id: 'responses-widget',
            title: 'Responses',
            description: 'ITT responses received',
            type: 'stat-card',
            category: 'itt',
            enabled: true,
            pages: ['itt-manager'],
            order: 3,
            size: 'small'
          }}
          index={3}
          moveWidget={moveWidget}
          customizeMode={customizeMode}
          screenSize={screenSize}
          onSizeChange={updateWidgetSize}
        >
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Responses</p>
                <p className="text-3xl font-bold text-neutral-800 mt-1">12</p>
                <p className="text-xs text-green-600 mt-1">75% response rate</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </DraggableWidget>
        
        <DraggableWidget
          widget={{
            id: 'urgent-itts-widget',
            title: 'Due This Week',
            description: 'ITTs requiring attention',
            type: 'stat-card',
            category: 'itt',
            enabled: true,
            pages: ['itt-manager'],
            order: 4,
            size: 'small'
          }}
          index={4}
          moveWidget={moveWidget}
          customizeMode={customizeMode}
          screenSize={screenSize}
          onSizeChange={updateWidgetSize}
        >
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Due This Week</p>
                <p className="text-3xl font-bold text-red-600 mt-1">5</p>
                <p className="text-xs text-red-600 mt-1">Requires attention</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </DraggableWidget>
      </div>

      {/* Page-specific widgets for ITT Manager */}
      <div className={`grid gap-6 ${getResponsiveGridCols('desktop')}`}>
        {getPageWidgets('itt-manager').map((widget, index) => (
          <DraggableWidget
            key={widget.id}
            widget={widget}
            index={index + 5}
            moveWidget={moveWidget}
            customizeMode={customizeMode}
            screenSize={screenSize}
            onSizeChange={updateWidgetSize}
          >
            <WidgetRenderer widget={widget} viewMode="monthly" setViewMode={() => {}} screenSize={screenSize} />
          </DraggableWidget>
        ))}
      </div>

      {/* Enhanced Create ITT Modal */}
      <Dialog open={showCreateITT} onOpenChange={setShowCreateITT}>
        <DialogContent 
          className="w-[60vw] max-w-4xl h-[75vh] !max-w-none bg-gradient-to-br from-slate-50 to-blue-50" 
          style={{ width: '60vw', maxWidth: '900px', zIndex: 50 }} 
          onInteractOutside={(e) => e.preventDefault()} 
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="border-b border-blue-200 pb-4 bg-white/80 backdrop-blur-sm rounded-t-lg">
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              📋 Create New ITT
            </DialogTitle>
            <DialogDescription className="text-slate-600 text-sm">Create an intelligent ITT with automated supplier matching</DialogDescription>
          </DialogHeader>

          {/* Form Content */}
          <div className="flex-1 py-4 overflow-y-auto">
            <div className="max-w-2xl space-y-4">
              {/* ITT Basics Header */}
              <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
                  📋 ITT Details
                </h3>
                <p className="text-slate-600 text-xs">Create invitation to tender for your project</p>
              </div>
              
              <div className="space-y-4">
                {/* Row 1: Project & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                      🏗️ Project <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={ittFormData.project} 
                      onChange={(e) => {
                        const value = e.target.value;
                        setIttFormData(prev => ({ ...prev, project: value }));
                        if (value) {
                          autoFillITTFromProject(value);
                        }
                      }}
                      className="h-10 w-full border border-slate-200 focus:border-blue-400 bg-white rounded-md shadow-sm text-sm px-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                    >
                      <option value="">🔽 Select project</option>
                      {/* User Projects First - Recently Created */}
                      {userProjects.map(project => (
                        <option key={`user-${project.id}`} value={project.name}>
                          ⭐ {project.name} ({project.country})
                        </option>
                      ))}
                      {/* Mock Projects */}
                      {projects.map(project => (
                        <option key={`mock-${project.id}`} value={project.name}>
                          📁 {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                      🔧 Trade Category <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={ittFormData.category}
                      onChange={(e) => setIttFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="h-10 w-full border border-slate-200 focus:border-blue-400 bg-white rounded-md shadow-sm text-sm px-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                    >
                      <option value="">🔽 Select category</option>
                      <option value="general">🏗️ General Construction</option>
                      <option value="electrical">⚡ Electrical</option>
                      <option value="structural">🏢 Structural</option>
                      <option value="hvac">🌡️ HVAC</option>
                      <option value="plumbing">🚰 Plumbing</option>
                    </select>
                  </div>
                </div>
                
                {/* Row 2: Budget & Deadline */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                      💷 Budget Range
                    </label>
                    <Input 
                      className="h-10 border border-slate-200 focus:border-blue-400 bg-white rounded-md shadow-sm text-sm" 
                      placeholder="💰 e.g. £50,000 - £75,000"
                      value={ittFormData.budget}
                      onChange={(e) => setIttFormData(prev => ({ ...prev, budget: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                      📅 Response Deadline <span className="text-red-500">*</span>
                    </label>
                    <Input 
                      className="h-10 border border-slate-200 focus:border-blue-400 bg-white rounded-md shadow-sm text-sm" 
                      type="date"
                      value={ittFormData.deadline}
                      onChange={(e) => setIttFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    />
                  </div>
                </div>
                
                {/* Row 3: Region */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                    🌍 Target Region <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={ittFormData.region}
                    onChange={(e) => setIttFormData(prev => ({ ...prev, region: e.target.value }))}
                    className="h-10 w-full border border-slate-200 focus:border-blue-400 bg-white rounded-md shadow-sm text-sm px-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                  >
                    <option value="">🔽 Select region</option>
                    <option value="all">🌍 All Regions</option>
                    <option value="uk">🇬🇧 United Kingdom</option>
                    <option value="germany">🇩🇪 Germany</option>
                    <option value="france">🇫🇷 France</option>
                    <option value="netherlands">🇳🇱 Netherlands</option>
                    <option value="spain">🇪🇸 Spain</option>
                  </select>
                </div>
                
                {/* Row 4: Scope */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                    📋 Scope of Work <span className="text-red-500">*</span>
                  </label>
                  <Textarea 
                    className="border border-slate-200 focus:border-blue-400 bg-white rounded-md shadow-sm text-sm min-h-[80px]" 
                    placeholder="📝 Describe the work required in detail..."
                    value={ittFormData.scope}
                    onChange={(e) => setIttFormData(prev => ({ ...prev, scope: e.target.value }))}
                  />
                </div>

                {/* Materials & Compliance - Auto-filled from project */}
                {ittFormData.materials.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                      📦 Required Materials <span className="text-green-600 text-xs">(Auto-filled from project)</span>
                    </label>
                    <div className="flex flex-wrap gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                      {ittFormData.materials.map((material, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-white border border-green-300">
                          <Package className="h-3 w-3 mr-1" />
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compliance Checkboxes */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                    ✅ Compliance Requirements
                  </label>
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    {['ISO 9001', 'NICEIC', 'CE Mark', 'CHAS'].map((req) => (
                      <div key={req} className="flex items-center gap-2">
                        <Checkbox
                          checked={ittFormData.compliance.includes(req)}
                          onCheckedChange={(checked) => {
                            setIttFormData(prev => ({
                              ...prev,
                              compliance: checked
                                ? [...prev.compliance, req]
                                : prev.compliance.filter(r => r !== req)
                            }))
                          }}
                        />
                        <span className="text-sm text-slate-700">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Requirements */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                    📝 Special Requirements
                  </label>
                  <Textarea 
                    className="border border-slate-200 focus:border-blue-400 bg-white rounded-md shadow-sm text-sm min-h-[60px]" 
                    placeholder="💡 Any special requirements, compliance needs, or additional notes..."
                    value={ittFormData.specialRequirements}
                    onChange={(e) => setIttFormData(prev => ({ ...prev, specialRequirements: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="border-t-2 border-blue-100 pt-4 mt-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-b-lg">
            <div className="flex items-center justify-between px-2">
              <Button 
                variant="outline" 
                className="h-12 px-6 border-2 border-slate-300 hover:border-blue-400 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all" 
                onClick={() => setShowCreateITT(false)}
              >
                ❌ Cancel
              </Button>
              
              <Button 
                className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-105" 
                onClick={handleCreateITT}
                disabled={!ittFormData.project || !ittFormData.category || !ittFormData.deadline || !ittFormData.scope || !ittFormData.region}
              >
                🚀 Create ITT
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}