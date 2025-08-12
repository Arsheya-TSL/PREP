import { useState } from "react"
import { Plus, Filter, Search, BarChart3, Grid3X3, List, Star, Award, MapPin, Clock, CheckCircle, Package, Truck, TrendingUp, Eye, Users2, Zap } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Badge } from "../ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Separator } from "../ui/separator"
import { Checkbox } from "../ui/checkbox"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Progress } from "../ui/progress"
import { Widget, PageType } from "../../lib/types"
import { getResponsiveGridCols, formatLargeCurrency, getStatusColor } from "../../lib/utils"
import { supplierPerformanceData } from "../../lib/constants"
import DraggableWidget from "../layout/DraggableWidget"
import WidgetRenderer from "../widgets/WidgetRenderer"

interface SupplyChainPageProps {
  widgets: Widget[]
  getPageWidgets: (page: PageType) => Widget[]
  moveWidget: (dragIndex: number, dropIndex: number) => void
  updateWidgetSize: (widgetId: string, size: 'small' | 'medium' | 'large' | 'extra-large') => void
  customizeMode: boolean
  supplierViewMode: 'list' | 'card'
  setSupplierViewMode: (mode: 'list' | 'card') => void
  supplierComparison: string[]
  toggleSupplierComparison: (name: string) => void
  showSupplierComparison: boolean
  setShowSupplierComparison: (show: boolean) => void
  screenSize: 'mobile' | 'tablet' | 'desktop'
}

export default function SupplyChainPage({
  widgets,
  getPageWidgets,
  moveWidget,
  updateWidgetSize,
  customizeMode,
  supplierViewMode,
  setSupplierViewMode,
  supplierComparison,
  toggleSupplierComparison,
  showSupplierComparison,
  setShowSupplierComparison,
  screenSize
}: SupplyChainPageProps) {
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterRegion, setFilterRegion] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Enhanced supplier data with recommendation logic
  const getSupplierRecommendations = (supplier: typeof supplierPerformanceData[0]) => {
    const recommendations = []
    
    if (supplier.score >= 4.8) recommendations.push("Top Rated")
    if (supplier.onTimeDelivery >= 95) recommendations.push("Reliable Delivery")
    if (supplier.costPerUnit <= 25) recommendations.push("Best Value")
    if (supplier.responseTime <= 1) recommendations.push("Fast Response")
    if (supplier.region === "UK") recommendations.push("Local Supplier")
    
    return recommendations
  }

  const getBestMaterialMatch = (supplier: typeof supplierPerformanceData[0]) => {
    // Simulate finding best material price match
    const materials = supplier.materialsAvailable
    const bestMaterial = materials[Math.floor(Math.random() * materials.length)]
    const savings = Math.floor(Math.random() * 15) + 5
    
    return { material: bestMaterial, savings: `${savings}% below market` }
  }

  const filteredSuppliers = supplierPerformanceData.filter(supplier => {
    const matchesCategory = filterCategory === "all" || supplier.category.toLowerCase() === filterCategory.toLowerCase()
    const matchesRegion = filterRegion === "all" || supplier.region.toLowerCase() === filterRegion.toLowerCase()
    const matchesSearch = searchQuery === "" || 
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.materialsAvailable.some(material => material.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesCategory && matchesRegion && matchesSearch && supplier.approved
  })

  const selectedSuppliers = supplierComparison.map(name => 
    supplierPerformanceData.find(s => s.name === name)
  ).filter(Boolean)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-800">Supply Chain</h1>
        <p className="text-neutral-500 mt-1">Manage your supplier network and performance analytics</p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" className="flex items-center gap-2 h-11 px-4 rounded-xl hover:bg-neutral-100 border-neutral-200">
          <BarChart3 className="h-4 w-4" />
          Analytics
        </Button>
        <Button className="flex items-center gap-2 h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {/* Page-specific widgets for Supply Chain */}
      <div className={`grid gap-6 ${getResponsiveGridCols('desktop')}`}>
        {getPageWidgets('supply-chain').map((widget, index) => (
          <DraggableWidget
            key={widget.id}
            widget={widget}
            index={index}
            moveWidget={moveWidget}
            customizeMode={customizeMode}
            screenSize={screenSize}
            onSizeChange={updateWidgetSize}
          >
            <WidgetRenderer widget={widget} viewMode="monthly" setViewMode={() => {}} />
          </DraggableWidget>
        ))}
      </div>

      {/* Supply Chain Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">On-Time Delivery</p>
              <p className="text-3xl font-bold text-neutral-800 mt-1">94%</p>
              <p className="text-xs text-green-600 mt-1">Above target</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <Truck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Cost Savings</p>
              <p className="text-3xl font-bold text-neutral-800 mt-1">12%</p>
              <p className="text-xs text-green-600 mt-1">{formatLargeCurrency(285000)} saved</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
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
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg border">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-1 min-w-60">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <Input 
                placeholder="Search suppliers by name, category, or materials..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="electrical">Electrical</SelectItem>
              <SelectItem value="structural">Structural</SelectItem>
              <SelectItem value="hvac">HVAC</SelectItem>
              <SelectItem value="plumbing">Plumbing</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterRegion} onValueChange={setFilterRegion}>
            <SelectTrigger className="w-40">
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

        <div className="flex items-center gap-3">
          {supplierComparison.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowSupplierComparison(true)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Compare ({supplierComparison.length})
            </Button>
          )}
          
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={supplierViewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSupplierViewMode('list')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={supplierViewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSupplierViewMode('card')}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Supplier Cards/List */}
      {supplierViewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.name} className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base font-semibold text-neutral-800">{supplier.name}</CardTitle>
                    <p className="text-sm text-neutral-500 mt-1">{supplier.category} • {supplier.region}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-neutral-800">{supplier.score}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-sm font-semibold text-neutral-800">{supplier.onTimeDelivery}%</div>
                    <div className="text-xs text-neutral-500">On-Time</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-semibold text-neutral-800">{supplier.responseTime}d avg</div>
                    <div className="text-xs text-neutral-500">Response</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-800">£{supplier.costPerUnit}/unit</span>
                  <Badge variant={supplier.approved ? "default" : "secondary"}>
                    {supplier.approved ? "Approved" : "Pending"}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="text-xs text-neutral-500">Materials Available:</div>
                  <div className="flex flex-wrap gap-1">
                    {supplier.materialsAvailable.slice(0, 3).map((material) => (
                      <Badge key={material} variant="outline" className="text-xs">
                        {material}
                      </Badge>
                    ))}
                    {supplier.materialsAvailable.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{supplier.materialsAvailable.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={supplierComparison.includes(supplier.name)}
                      onCheckedChange={() => toggleSupplierComparison(supplier.name)}
                    />
                    <span className="text-sm text-neutral-600">Compare</span>
                  </div>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-neutral-800">Supplier Directory</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-neutral-800">Supplier</TableHead>
                  <TableHead className="font-semibold text-neutral-800">Category</TableHead>
                  <TableHead className="font-semibold text-neutral-800">Rating</TableHead>
                  <TableHead className="font-semibold text-neutral-800">Region</TableHead>
                  <TableHead className="font-semibold text-neutral-800">Best Material Match</TableHead>
                  <TableHead className="font-semibold text-neutral-800">On-Time</TableHead>
                  <TableHead className="font-semibold text-neutral-800">Cost/Unit</TableHead>
                  <TableHead className="font-semibold text-neutral-800">Status</TableHead>
                  <TableHead className="font-semibold text-neutral-800 w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => {
                  const bestMatch = getBestMaterialMatch(supplier)
                  return (
                    <TableRow key={supplier.name}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                              {supplier.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-neutral-800">{supplier.name}</div>
                            <div className="text-sm text-neutral-500">{supplier.contact}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{supplier.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-neutral-800">{supplier.score}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-neutral-500" />
                          <span className="text-sm text-neutral-600">{supplier.region}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-neutral-800">{bestMatch.material}</div>
                        <div className="text-xs text-green-600">{bestMatch.savings}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-neutral-800 font-medium">{supplier.onTimeDelivery}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-neutral-800 font-medium">£{supplier.costPerUnit}</TableCell>
                      <TableCell>
                        <Badge variant={supplier.approved ? "default" : "secondary"}>
                          {supplier.approved ? "Approved" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={supplierComparison.includes(supplier.name)}
                            onCheckedChange={() => toggleSupplierComparison(supplier.name)}
                          />
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Supplier Comparison Dialog */}
      <Dialog open={showSupplierComparison} onOpenChange={setShowSupplierComparison}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-neutral-800">Supplier Comparison</DialogTitle>
            <DialogDescription className="text-neutral-500">
              Compare selected suppliers across key metrics
            </DialogDescription>
          </DialogHeader>

          {selectedSuppliers.length > 0 && (
            <div className="space-y-6">
              {/* Quick Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedSuppliers.map((supplier) => 
                  supplier && (
                    <Card key={supplier.name}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold text-neutral-800">{supplier.name}</CardTitle>
                        <p className="text-sm text-neutral-500">{supplier.category} • {supplier.region}</p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600">Rating</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium text-neutral-800">{supplier.score}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600">On-Time Delivery</span>
                          <span className="font-medium text-neutral-800">{supplier.onTimeDelivery}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600">Cost per Unit</span>
                          <span className="font-medium text-neutral-800">£{supplier.costPerUnit}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-neutral-600">Response Time</span>
                          <span className="font-medium text-neutral-800">{supplier.responseTime}d</span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>

              {/* Detailed Comparison Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-neutral-800">Detailed Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold text-neutral-800">Metric</TableHead>
                        {selectedSuppliers.map((supplier) => 
                          supplier && (
                            <TableHead key={supplier.name} className="text-center font-semibold text-neutral-800">
                              {supplier.name}
                            </TableHead>
                          )
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium text-neutral-800">Overall Rating</TableCell>
                        {selectedSuppliers.map((supplier) => 
                          supplier && (
                            <TableCell key={supplier.name} className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium text-neutral-800">{supplier.score}</span>
                              </div>
                            </TableCell>
                          )
                        )}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-neutral-800">On-Time Delivery</TableCell>
                        {selectedSuppliers.map((supplier) => 
                          supplier && (
                            <TableCell key={supplier.name} className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${supplier.onTimeDelivery >= 95 ? 'bg-green-500' : supplier.onTimeDelivery >= 85 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                <span className="font-medium text-neutral-800">{supplier.onTimeDelivery}%</span>
                              </div>
                            </TableCell>
                          )
                        )}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-neutral-800">Cost per Unit</TableCell>
                        {selectedSuppliers.map((supplier) => 
                          supplier && (
                            <TableCell key={supplier.name} className="text-center font-medium text-neutral-800">
                              £{supplier.costPerUnit}
                            </TableCell>
                          )
                        )}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-neutral-800">Response Time</TableCell>
                        {selectedSuppliers.map((supplier) => 
                          supplier && (
                            <TableCell key={supplier.name} className="text-center text-neutral-800">
                              {supplier.responseTime}d avg
                            </TableCell>
                          )
                        )}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-neutral-800">Projects Completed</TableCell>
                        {selectedSuppliers.map((supplier) => 
                          supplier && (
                            <TableCell key={supplier.name} className="text-center font-medium text-neutral-800">
                              {supplier.projects}
                            </TableCell>
                          )
                        )}
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSupplierComparison(false)}>
              Close
            </Button>
            <Button>Export Comparison</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}