import { Building2, DollarSign, Clock3, Award, Package, BarChart3, FileText, Users, TrendingUp, Star, Sparkles, RefreshCw, AlertTriangle, CheckCircle, Truck, Globe, Target, Calendar, Send, CheckCircle2, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Progress } from "../ui/progress"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Separator } from "../ui/separator"
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { Widget, ViewMode } from "../../lib/types"
import { projects, monthlyData, upcomingITTDeadlines, supplierPerformanceData, recentInsights, activeITTs } from "../../lib/constants"
import { 
  getStatusColor, 
  getPriorityColor, 
  getInsightSeverityColor, 
  getWidgetPadding, 
  getWidgetTitleSize, 
  getWidgetValueSize, 
  getWidgetIconSize,
  getChartHeight,
  formatLargeCurrency,
  formatPercentage,
  formatTimeAgo
} from "../../lib/utils"

interface WidgetRendererProps {
  widget: Widget
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  screenSize?: 'mobile' | 'tablet' | 'desktop'
  userITTs?: any[]
}

export default function WidgetRenderer({ widget, viewMode, setViewMode, screenSize = 'desktop', userITTs = [] }: WidgetRendererProps) {
  const baseCardClass = `
    bg-white border border-border rounded-2xl shadow-lg hover:shadow-xl 
    transition-all duration-300 h-full flex flex-col group
    backdrop-blur-sm hover:scale-[1.02] hover:-translate-y-1 relative z-10 pointer-events-auto
  `
  
  const isCompact = widget.size === 'small'
  const isExpanded = widget.size === 'large' || widget.size === 'extra-large'
  const showChart = (widget.size === 'large' || widget.size === 'extra-large') && screenSize !== 'mobile'

  switch (widget.id) {
    case 'demo-showcase':
      return (
        <Card className={`${baseCardClass} bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200/50 shadow-xl`}>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${getWidgetPadding(widget.size)} pb-2`}>
            <div className="space-y-1 flex-1 min-w-0">
              <CardTitle className={`${getWidgetTitleSize(widget.size)} text-foreground truncate flex items-center gap-2`}>
                <Sparkles className="h-4 w-4 text-blue-600" />
                {isCompact ? 'Demo' : 'System Showcase'}
              </CardTitle>
              {!isCompact && (
                <p className="text-xs text-muted-foreground">Key features and capabilities</p>
              )}
            </div>
            <div className={`p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex-shrink-0 ${isCompact ? 'p-2' : 'p-3'} shadow-sm`}>
              <Zap className={`${getWidgetIconSize(widget.size)} text-blue-600`} />
            </div>
          </CardHeader>
          <CardContent className={`flex-1 flex flex-col justify-between ${getWidgetPadding(widget.size)} pt-0`}>
            {!isCompact ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-lg font-bold text-blue-600">24</div>
                    <div className="text-xs text-muted-foreground">Active Projects</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="text-lg font-bold text-green-600">87%</div>
                    <div className="text-xs text-muted-foreground">On-Time Delivery</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Real-time project tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>Supplier management</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                    <span>Advanced analytics</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-orange-600" />
                    <span>Global project oversight</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600 mb-1">PREP</div>
                <div className="text-xs text-muted-foreground">Construction Management</div>
              </div>
            )}
          </CardContent>
        </Card>
      )

    case 'total-projects':
      // Calculate live tenders data
      const totalTenders = activeITTs.length + (userITTs?.length || 0)
      const activeTenders = activeITTs.filter(itt => itt.status === 'Sent' || itt.status === 'Draft').length + 
                           (userITTs?.filter(itt => itt.status === 'Sent' || itt.status === 'Draft').length || 0)
      const completedTenders = totalTenders - activeTenders
      const yearlyProgress = Math.round((totalTenders / 50) * 100) // Assuming target of 50 tenders/year
      
      // Country breakdown (top 3)
      const countryStats = [...activeITTs, ...(userITTs || [])].reduce((acc, itt) => {
        const country = itt.region || 'Unknown'
        acc[country] = (acc[country] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      const topCountries = Object.entries(countryStats)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3)
      
      return (
        <Card className={`${baseCardClass} bg-gradient-to-br from-white to-blue-50/30`}>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${getWidgetPadding(widget.size)} pb-2`}>
            <div className="space-y-1 flex-1 min-w-0">
              <CardTitle className={`${getWidgetTitleSize(widget.size)} text-foreground truncate`}>
                {isCompact ? 'Live Tenders' : 'Total Live Tenders'}
              </CardTitle>
              {!isCompact && (
                <p className="text-xs text-muted-foreground truncate">
                  Active ITTs across all projects
                </p>
              )}
            </div>
            <div className={`p-3 bg-gradient-to-br from-primary/10 to-blue-100 rounded-xl flex-shrink-0 ${isCompact ? 'p-2' : 'p-3'} shadow-sm`}>
              <FileText className={`${getWidgetIconSize(widget.size)} text-primary`} />
            </div>
          </CardHeader>
          <CardContent className={`flex-1 flex flex-col justify-between ${getWidgetPadding(widget.size)} pt-0`}>
            <div>
              <div className={`${getWidgetValueSize(widget.size)} text-foreground mb-1`}>{totalTenders}</div>
              <div className={`flex items-center ${isCompact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                <TrendingUp className={`${getWidgetIconSize(widget.size)} mr-1.5 text-green-600`} />
                <span className="text-green-600 font-medium">+{activeTenders}</span>
                {!isCompact && (
                  <span className="ml-1">active this month</span>
                )}
              </div>
            </div>
            {!isCompact && (
              <div className="mt-4 space-y-3">
                {/* Yearly Progress */}
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Yearly Progress</span>
                    <span>{yearlyProgress}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(yearlyProgress, 100)}%` }}
                    />
                  </div>
                </div>
                
                {/* Top Countries */}
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground mb-2">Top Regions</div>
                  {topCountries.map(([country, count]) => {
                    const countNum = count as number;
                    return (
                    <div key={country} className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">{country}</span>
                      <div className="flex items-center gap-2 flex-1 mx-2">
                        <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" 
                            style={{ width: `${(countNum / totalTenders) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-4">{countNum}</span>
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )

    case 'active-projects':
      // Calculate timeline progress for projects
      const activeProjects = projects.filter(p => p.status !== 'Completed')
      const calculateTimelineProgress = (project: any) => {
        const startDate = new Date('2024-01-01') // Mock start date
        const endDate = new Date(project.deadline)
        const currentDate = new Date()
        const totalDuration = endDate.getTime() - startDate.getTime()
        const elapsedTime = currentDate.getTime() - startDate.getTime()
        const timelineProgress = Math.min(100, Math.max(0, (elapsedTime / totalDuration) * 100))
        return Math.round(timelineProgress)
      }
      
      return (
        <Card className={`${baseCardClass} bg-gradient-to-br from-white to-green-50/30`}>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${getWidgetPadding(widget.size)} pb-2`}>
            <div className="space-y-1 flex-1 min-w-0">
              <CardTitle className={`${getWidgetTitleSize(widget.size)} text-foreground truncate`}>
                {isCompact ? 'Active' : 'Active Projects'}
              </CardTitle>
              {!isCompact && (
                <p className="text-xs text-muted-foreground">Timeline progress vs planned</p>
              )}
            </div>
            <div className={`p-3 bg-gradient-to-br from-green-500/10 to-green-100 rounded-xl flex-shrink-0 ${isCompact ? 'p-2' : 'p-3'} shadow-sm`}>
              <Calendar className={`${getWidgetIconSize(widget.size)} text-green-600`} />
            </div>
          </CardHeader>
          <CardContent className={`flex-1 ${getWidgetPadding(widget.size)} pt-0`}>
            <div className={`${getWidgetValueSize(widget.size)} text-foreground ${isCompact ? 'mb-2' : 'mb-4'}`}>{activeProjects.length}</div>
            <div className="space-y-3">
              {activeProjects.slice(0, isCompact ? 2 : isExpanded ? 4 : 3).map((project) => {
                const timelineProgress = calculateTimelineProgress(project)
                const isOnTrack = project.progress >= timelineProgress - 10 // 10% tolerance
                return (
                  <div key={project.id} className={`${isCompact ? 'p-1' : 'p-3'} rounded-lg border border-slate-100 hover:bg-secondary/30 transition-colors cursor-pointer group`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-foreground truncate block`}>
                          {isCompact ? project.name.split(' ').slice(0, 2).join(' ') : project.name}
                        </span>
                        {!isCompact && (
                          <span className="text-xs text-muted-foreground">{project.location}</span>
                        )}
                      </div>
                      <Badge className={`${isOnTrack ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'} border text-xs px-2 py-1 font-medium`}>
                        {isOnTrack ? 'On Track' : 'Behind'}
                      </Badge>
                    </div>
                    
                    {!isCompact && (
                      <div className="space-y-1">
                        {/* Project Progress */}
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Project Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500" 
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        
                        {/* Timeline Progress */}
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Time Elapsed</span>
                          <span>{timelineProgress}%</span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
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
                    )}
                  </div>
                )
              })}
            </div>
            
            {!isCompact && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" className="w-full text-xs h-8 hover:bg-secondary/50">
                  📝 Edit Project Timelines
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )

    case 'project-kpis':
      const onTimePercentage = Math.round((projects.filter(p => p.status === "On Track" || p.status === "Ahead").length / projects.length) * 100)
      const completionRate = Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length)
      const avgRiskScore = Math.round(projects.reduce((acc, p) => acc + p.riskScore, 0) / projects.length)
      
      return (
        <Card className={`${baseCardClass} bg-gradient-to-br from-white to-purple-50/30`}>
          <CardHeader className={`${getWidgetPadding(widget.size)} pb-3`}>
            <CardTitle className={`${getWidgetTitleSize(widget.size)} text-foreground`}>
              {isCompact ? 'KPIs' : 'Active Project KPIs'}
            </CardTitle>
            {!isCompact && (
              <CardDescription className="text-xs text-muted-foreground">Key performance indicators</CardDescription>
            )}
          </CardHeader>
          <CardContent className={`flex-1 ${getWidgetPadding(widget.size)} pt-0`}>
            <div className={`grid ${isCompact ? 'grid-cols-1 gap-2' : 'grid-cols-3 gap-4'} h-full`}>
              <div className="text-center">
                <div className={`${isCompact ? 'text-lg' : 'text-2xl'} font-bold text-green-600 mb-1`}>
                  {onTimePercentage}%
                </div>
                <div className={`${isCompact ? 'text-xs' : 'text-xs'} text-muted-foreground mb-2`}>
                  On-Time
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${onTimePercentage}%` }} />
                </div>
              </div>
              {!isCompact && (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{completionRate}%</div>
                    <div className="text-xs text-muted-foreground mb-2">Completion</div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }} />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600 mb-1">{avgRiskScore}</div>
                    <div className="text-xs text-muted-foreground mb-2">Risk Score</div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full transition-all duration-500" style={{ width: `${avgRiskScore}%` }} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )

    case 'budget-vs-spend':
      return (
        <Card className={baseCardClass}>
          <CardHeader className={`${getWidgetPadding(widget.size)} pb-3`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className={`${getWidgetTitleSize(widget.size)} text-foreground truncate`}>
                  {isCompact ? 'Budget' : 'Budget vs Spend'}
                </CardTitle>
                {!isCompact && (
                  <CardDescription className="text-xs text-muted-foreground">Real-time financial tracking</CardDescription>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!isCompact && (
                  <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
                    <SelectTrigger className="w-20 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                <div className={`p-2 bg-green-500/10 rounded-lg ${isCompact ? 'p-1.5' : 'p-2'}`}>
                  <DollarSign className={`${getWidgetIconSize(widget.size)} text-green-600`} />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className={`flex-1 ${getWidgetPadding(widget.size)} pt-0`}>
            <div className={isCompact ? 'mb-2' : 'mb-4'}>
              <div className={`${getWidgetValueSize(widget.size)} text-foreground mb-1`}>
                {formatLargeCurrency(8550000)}
              </div>
              {!isCompact && (
                <div className="text-sm text-muted-foreground">Total allocated budget</div>
              )}
            </div>
            {showChart && (
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id={`budgetGradient-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id={`spentGradient-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#ffffff', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px',
                        fontSize: '12px'
                      }} 
                    />
                    <Area type="monotone" dataKey="budget" stroke="#3b82f6" fill={`url(#budgetGradient-${widget.id})`} strokeWidth={2} />
                    <Area type="monotone" dataKey="spent" stroke="#10b981" fill={`url(#spentGradient-${widget.id})`} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            {isCompact && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Budget</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Spent</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )

    case 'itt-deadlines':
      return (
        <Card className={baseCardClass}>
          <CardHeader className={`${getWidgetPadding(widget.size)} pb-3`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className={`${getWidgetTitleSize(widget.size)} text-foreground truncate`}>
                  {isCompact ? 'Deadlines' : 'ITT Deadlines'}
                </CardTitle>
                {!isCompact && (
                  <CardDescription className="text-xs text-muted-foreground">Pending tender responses</CardDescription>
                )}
              </div>
              <div className={`p-2 bg-orange-500/10 rounded-lg flex-shrink-0 ${isCompact ? 'p-1.5' : 'p-2'}`}>
                <Clock3 className={`${getWidgetIconSize(widget.size)} text-orange-600`} />
              </div>
            </div>
          </CardHeader>
          <CardContent className={`flex-1 ${getWidgetPadding(widget.size)} pt-0`}>
            <div className="space-y-2">
              {upcomingITTDeadlines.slice(0, isCompact ? 2 : isExpanded ? 5 : 3).map((deadline, index) => (
                <div key={index} className={`flex items-center justify-between ${isCompact ? 'p-2' : 'p-3'} bg-secondary/30 rounded-lg border hover:bg-secondary/50 transition-colors`}>
                  <div className="flex-1 min-w-0 mr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-foreground truncate`}>
                        {isCompact ? deadline.task.split(' ').slice(0, 2).join(' ') : deadline.task}
                      </p>
                      <Badge className={`${getPriorityColor(deadline.priority)} border text-xs px-1 py-0.5`}>
                        {isCompact ? deadline.priority[0] : deadline.priority}
                      </Badge>
                    </div>
                    {!isCompact && (
                      <p className="text-xs text-muted-foreground truncate">{deadline.project}</p>
                    )}
                    <div className={`flex items-center gap-3 mt-1 text-xs text-muted-foreground ${isCompact ? 'gap-2' : 'gap-3'}`}>
                      <span>{formatLargeCurrency(deadline.value)}</span>
                      <span>{deadline.responses}/{deadline.suppliers} responses</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`${isCompact ? 'text-sm' : 'text-sm'} font-bold ${deadline.daysLeft <= 3 ? 'text-red-600' : 'text-foreground'}`}>
                      {deadline.daysLeft}d
                    </div>
                    {!isCompact && (
                      <div className="text-xs text-muted-foreground">remaining</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )

    case 'supplier-performance':
      const topSuppliers = supplierPerformanceData
        .sort((a, b) => b.score - a.score)
        .slice(0, isCompact ? 3 : isExpanded ? 5 : 4)

      return (
        <Card className={baseCardClass}>
          <CardHeader className={`${getWidgetPadding(widget.size)} pb-3`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className={`${getWidgetTitleSize(widget.size)} text-foreground truncate`}>
                  {isCompact ? 'Top Suppliers' : 'Supplier Performance Rankings'}
                </CardTitle>
                {!isCompact && (
                  <CardDescription className="text-xs text-muted-foreground">Top performing suppliers</CardDescription>
                )}
              </div>
              <div className={`p-2 bg-purple-500/10 rounded-lg flex-shrink-0 ${isCompact ? 'p-1.5' : 'p-2'}`}>
                <Award className={`${getWidgetIconSize(widget.size)} text-purple-600`} />
              </div>
            </div>
          </CardHeader>
          <CardContent className={`flex-1 ${getWidgetPadding(widget.size)} pt-0`}>
            <div className="space-y-2">
              {topSuppliers.map((supplier, index) => (
                <div key={supplier.name} className={`flex items-center gap-3 ${isCompact ? 'p-1' : 'p-2'} rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer`}>
                  <div className={`flex-shrink-0 ${isCompact ? 'w-5 h-5' : 'w-6 h-6'} bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-foreground truncate`}>
                      {isCompact ? supplier.name.split(' ')[0] : supplier.name}
                    </p>
                    {!isCompact && (
                      <p className="text-xs text-muted-foreground">{supplier.category} • {supplier.region}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <Star className={`${isCompact ? 'h-3 w-3' : 'h-3 w-3'} fill-yellow-400 text-yellow-400`} />
                      <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-foreground`}>{supplier.score}</span>
                    </div>
                    {!isCompact && (
                      <div className="text-xs text-muted-foreground">{supplier.projects} projects</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )

    case 'quick-insights':
      return (
        <Card className={baseCardClass}>
          <CardHeader className={`${getWidgetPadding(widget.size)} pb-3`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className={`${getWidgetTitleSize(widget.size)} text-foreground truncate`}>
                  {isCompact ? 'Insights' : 'Quick Insights'}
                </CardTitle>
                {!isCompact && (
                  <CardDescription className="text-xs text-muted-foreground">Recent changes and alerts</CardDescription>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!isCompact && (
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                )}
                <div className={`p-2 bg-blue-500/10 rounded-lg ${isCompact ? 'p-1.5' : 'p-2'}`}>
                  <Sparkles className={`${getWidgetIconSize(widget.size)} text-blue-600`} />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className={`flex-1 ${getWidgetPadding(widget.size)} pt-0`}>
            <div className="space-y-2">
              {recentInsights.slice(0, isCompact ? 2 : isExpanded ? 4 : 3).map((insight, index) => (
                <div key={index} className={`${isCompact ? 'p-2' : 'p-3'} rounded-lg border transition-colors hover:bg-opacity-80 ${getInsightSeverityColor(insight.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium mb-1 truncate`}>{insight.title}</p>
                      <p className={`${isCompact ? 'text-xs' : 'text-xs'} opacity-80 ${isCompact ? 'truncate' : ''}`}>{insight.description}</p>
                    </div>
                    <div className={`${isCompact ? 'text-xs' : 'text-xs'} opacity-60 ml-2 flex-shrink-0`}>
                      {formatTimeAgo(insight.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )

    case 'material-availability':
      const materials = ["Steel", "Concrete", "Cables", "HVAC Equipment"]
      
      return (
        <Card className={baseCardClass}>
          <CardHeader className={`${getWidgetPadding(widget.size)} pb-3`}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className={`${getWidgetTitleSize(widget.size)} text-foreground truncate`}>
                  {isCompact ? 'Materials' : 'Material Availability'}
                </CardTitle>
                {!isCompact && (
                  <CardDescription className="text-xs text-muted-foreground">Stock levels across suppliers</CardDescription>
                )}
              </div>
              <div className={`p-2 bg-green-500/10 rounded-lg flex-shrink-0 ${isCompact ? 'p-1.5' : 'p-2'}`}>
                <Package className={`${getWidgetIconSize(widget.size)} text-green-600`} />
              </div>
            </div>
          </CardHeader>
          <CardContent className={`flex-1 ${getWidgetPadding(widget.size)} pt-0`}>
            <div className={`space-y-${isCompact ? '3' : '4'}`}>
              {materials.slice(0, isCompact ? 2 : 4).map((material) => {
                const avgStock = Math.floor(Math.random() * 40) + 60
                return (
                  <div key={material} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-foreground truncate`}>
                        {material}
                      </span>
                      <span className={`${isCompact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                        {formatPercentage(avgStock)} avg
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${avgStock > 80 ? 'bg-green-500' : avgStock > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${avgStock}%` }}
                      />
                    </div>
                    {!isCompact && (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{Math.floor(Math.random() * 5) + 3} suppliers</span>
                        <span>{avgStock > 80 ? 'High' : avgStock > 60 ? 'Medium' : 'Low'} availability</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )

    case 'project-completion':
      return (
        <Card className={baseCardClass}>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${getWidgetPadding(widget.size)} pb-2`}>
            <div className="space-y-1 flex-1 min-w-0">
              <CardTitle className={`${getWidgetTitleSize(widget.size)} text-foreground truncate`}>
                {isCompact ? 'Completion' : 'Completion Rate'}
              </CardTitle>
              {!isCompact && (
                <p className="text-xs text-muted-foreground">On-time completion</p>
              )}
            </div>
            <div className={`p-2 bg-green-500/10 rounded-lg flex-shrink-0 ${isCompact ? 'p-1.5' : 'p-2'}`}>
              <BarChart3 className={`${getWidgetIconSize(widget.size)} text-green-600`} />
            </div>
          </CardHeader>
          <CardContent className={`flex-1 flex flex-col ${getWidgetPadding(widget.size)} pt-0`}>
            <div className={`${getWidgetValueSize(widget.size)} text-foreground mb-1`}>87%</div>
            <p className={`${isCompact ? 'text-xs' : 'text-sm'} text-muted-foreground ${isCompact ? 'mb-2' : 'mb-4'}`}>
              {isCompact ? 'On time' : 'Projects delivered on time'}
            </p>
            {showChart && (
              <div className="flex-1 min-h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <Line type="monotone" dataKey="projects" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      )

    case 'pending-itts':
      const ittStats = [
        { label: 'Draft', count: 3, color: 'text-gray-600' },
        { label: 'Sent', count: 8, color: 'text-blue-600' },
        { label: 'Replied', count: 12, color: 'text-green-600' }
      ]

      return (
        <Card className={baseCardClass}>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${getWidgetPadding(widget.size)} pb-2`}>
            <div className="space-y-1 flex-1 min-w-0">
              <CardTitle className={`${getWidgetTitleSize(widget.size)} text-foreground truncate`}>
                {isCompact ? 'ITTs' : 'Pending ITTs'}
              </CardTitle>
              {!isCompact && (
                <p className="text-xs text-muted-foreground">Tender status overview</p>
              )}
            </div>
            <div className={`p-2 bg-blue-500/10 rounded-lg flex-shrink-0 ${isCompact ? 'p-1.5' : 'p-2'}`}>
              <FileText className={`${getWidgetIconSize(widget.size)} text-blue-600`} />
            </div>
          </CardHeader>
          <CardContent className={`flex-1 ${getWidgetPadding(widget.size)} pt-0`}>
            <div className={`space-y-${isCompact ? '2' : '4'}`}>
              {ittStats.map((stat, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className={`${isCompact ? 'text-xs' : 'text-sm'} text-muted-foreground`}>{stat.label}</span>
                  <span className={`${isCompact ? 'text-base' : 'text-lg'} font-bold text-foreground`}>{stat.count}</span>
                </div>
              ))}
              {!isCompact && <Separator />}
              <div className={`bg-yellow-50 ${isCompact ? 'p-2' : 'p-3'} rounded-lg border border-yellow-200`}>
                <div className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-yellow-800`}>
                  Due this week: 3
                </div>
                {!isCompact && (
                  <div className="text-xs text-yellow-700 mt-1">Requires immediate attention</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )

    case 'supplier-count':
      return (
        <Card className={baseCardClass}>
          <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${getWidgetPadding(widget.size)} pb-2`}>
            <div className="space-y-1 flex-1 min-w-0">
              <CardTitle className={`${getWidgetTitleSize(widget.size)} text-foreground truncate`}>
                {isCompact ? 'Suppliers' : 'Supplier Network'}
              </CardTitle>
              {!isCompact && (
                <p className="text-xs text-muted-foreground">Active partnerships</p>
              )}
            </div>
            <div className={`p-2 bg-indigo-500/10 rounded-lg flex-shrink-0 ${isCompact ? 'p-1.5' : 'p-2'}`}>
              <Users className={`${getWidgetIconSize(widget.size)} text-indigo-600`} />
            </div>
          </CardHeader>
          <CardContent className={`flex-1 flex flex-col justify-between ${getWidgetPadding(widget.size)} pt-0`}>
            <div>
              <div className={`${getWidgetValueSize(widget.size)} text-foreground mb-1`}>47</div>
              <div className={`flex items-center ${isCompact ? 'text-xs' : 'text-sm'} text-muted-foreground ${isCompact ? 'mb-2' : 'mb-4'}`}>
                <TrendingUp className={`${getWidgetIconSize(widget.size)} mr-1.5 text-green-600`} />
                <span className="text-green-600 font-medium">+6%</span>
                {!isCompact && <span className="ml-1">this quarter</span>}
              </div>
            </div>
            {!isCompact && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">New this month:</span>
                  <span className="font-medium text-foreground">3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Yearly goal:</span>
                  <span className="font-medium text-foreground">60</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )

    default:
      return (
        <Card className={baseCardClass}>
          <CardContent className={`${getWidgetPadding(widget.size)} flex items-center justify-center h-full`}>
            <div className="text-center text-muted-foreground">
              <div className="text-sm">Widget: {widget.title}</div>
              <div className="text-xs mt-1">Coming soon</div>
            </div>
          </CardContent>
        </Card>
      )
  }
}