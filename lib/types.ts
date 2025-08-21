export type WidgetSize = 'small' | 'medium' | 'large' | 'extra-large'
export type PageType = 'dashboard' | 'projects' | 'supply-chain' | 'itt-manager' | 'cost-system' | 'world-map' | 'settings'
export type ViewMode = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface Project {
  id: number
  name: string
  location: string
  country: string
  progress: number
  budget: number
  spent: number
  status: string
  deadline: string
  satisfaction: number
  size: string
  score: number
  team: string[]
  suppliers: number
  issuesReported: number
  reworkCost: number
  image: string
  riskScore: number
  materials: string[]
  tradeCategories: string[]
}

export interface RegionData {
  region: string
  color: string
  performance: string
  projectsOnTime: number
  avgITTResponse: number
  supplierQuality: number
  budgetUsage: number
  activeProjects: number
  totalProjects: number
}

export interface Widget {
  id: string
  title: string
  description?: string
  type?: string
  category: 'projects' | 'itt' | 'financial' | 'supply' | 'analytics' | 'insights'
  enabled: boolean
  order: number
  size: WidgetSize
  pages: PageType[]
}

export interface SupplierData {
  name: string
  score: number
  projects: number
  onTimeDelivery: number
  region: string
  category: string
  costPerUnit: number
  approved: boolean
  contact: string
  phone: string
  materialsAvailable: string[]
  stockLevels: Record<string, number>
  certifications: string[]
  responseTime: number
}

export interface ITTDeadline {
  project: string
  task: string
  daysLeft: number
  priority: string
  value: number
  suppliers: number
  responses: number
  status: string
}

export interface ActiveITT {
  id: number
  project: string
  category: string
  status: string
  created: string
  deadline: string
  suppliers: string[]
  responses: number
  budget: number
  region: string
}

export interface WorkPackage {
  coinsCode: string
  description: string
  id: number
  category?: string
}

export interface Insight {
  type: string
  title: string
  description: string
  severity: string
  timestamp: string
}

export interface MonthlyData {
  month: string
  budget: number
  spent: number
  projects: number
  variance: number
  satisfaction: number
}

export interface ITTFormData {
  project: string
  category: string
  scope: string
  budget: string
  deadline: string
  region: string
  suppliers: string[]
  materials: string[]
  quantities: Record<string, number>
  specialRequirements: string
  compliance: string[]
  description: string
}

export interface ProjectFormData {
  name: string
  client?: string
  location: string
  latitude?: string
  longitude?: string
  country: string
  startDate: string
  endDate: string
  description: string
  budget: string
  size: string
  type?: string
  estimatedSizeSqm?: string
  template: string
  materials: string[]
  tradeCategories: string[]
  specialRequirements: string
  compliance: string[]
  team: string[]
  autoGenerateITT: boolean
  createTeamsChannel: boolean
  setupFolders: boolean
}

export interface TenderDraft {
  id: number
  savedAt: string
  currentStep: 1 | 2 | 3 | 4
  selectedCountry: string
  formData: ProjectFormData
}

export interface DragItem {
  id: string
  index: number
}

// -----------------------------
// AI Widget Generator Types
// -----------------------------

export type DataSource = 'projects' | 'itts' | 'suppliers' | 'costs' | 'issues' | 'regionMetrics'
export type AggregationType = 'count' | 'sum' | 'avg' | 'min' | 'max' | 'pct_change'
export type VisualizationType = 'kpi' | 'bar' | 'line' | 'area' | 'pie' | 'table' | 'progress' | 'card'
export type WidgetSizeAI = 'sm' | 'md' | 'lg' | 'xl'
export type DateScope = 'global' | 'custom'

export interface Filter {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'contains' | 'starts_with' | 'ends_with'
  value: string | number | string[] | number[]
}

export interface Metric {
  label: string
  agg?: AggregationType
  field?: string
  expr?: string
  unit?: '%' | '£' | '' | 'days' | 'count'
}

export interface WidgetDefinition {
  name: string
  source: DataSource
  filters: Filter[]
  groupBy?: string[]
  metrics: Metric[]
  viz: VisualizationType
  size: WidgetSizeAI
  options?: {
    decimals?: number
    abbreviate?: boolean
    legend?: boolean
    axisLabels?: boolean
    limit?: number
    orderBy?: { field: string; direction: 'asc' | 'desc' }
  }
  dateScope?: DateScope
  dateRange?: {
    start: string
    end: string
  }
}

export interface ParsedWidgetIntent {
  success: boolean
  definition?: WidgetDefinition
  error?: string
  clarification?: string
}

export interface MockDataPoint {
  label: string
  value: number
  color?: string
  metadata?: Record<string, any>
}

export interface MockChartData {
  type: VisualizationType
  data: MockDataPoint[]
  options?: Record<string, any>
}

export interface WidgetPreview {
  definition: WidgetDefinition
  mockData: MockChartData
  isValid: boolean
  errors: string[]
}