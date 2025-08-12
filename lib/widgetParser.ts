import { 
  WidgetDefinition, 
  ParsedWidgetIntent, 
  DataSource, 
  AggregationType, 
  VisualizationType, 
  Filter, 
  Metric,
  WidgetSizeAI,
  DateScope
} from './types'

// -----------------------------
// Vocabulary and Synonyms
// -----------------------------

const SOURCE_KEYWORDS: Record<string, DataSource> = {
  'project': 'projects',
  'projects': 'projects',
  'itt': 'itts',
  'itts': 'itts',
  'tender': 'itts',
  'tenders': 'itts',
  'supplier': 'suppliers',
  'suppliers': 'suppliers',
  'vendor': 'suppliers',
  'vendors': 'suppliers',
  'cost': 'costs',
  'costs': 'costs',
  'budget': 'costs',
  'spend': 'costs',
  'financial': 'costs',
  'issue': 'issues',
  'issues': 'issues',
  'problem': 'issues',
  'defect': 'issues',
  'region': 'regionMetrics',
  'regional': 'regionMetrics',
  'country': 'regionMetrics',
  'geographic': 'regionMetrics'
}

const METRIC_KEYWORDS: Record<string, AggregationType> = {
  'count': 'count',
  'number': 'count',
  'total': 'count',
  'sum': 'sum',
  'amount': 'sum',
  'value': 'sum',
  'average': 'avg',
  'avg': 'avg',
  'mean': 'avg',
  'minimum': 'min',
  'min': 'min',
  'maximum': 'max',
  'max': 'max',
  'percentage': 'pct_change',
  'percent': 'pct_change',
  'change': 'pct_change',
  'growth': 'pct_change'
}

const DIMENSION_KEYWORDS: Record<string, string> = {
  'region': 'region',
  'country': 'country',
  'trade': 'tradeCategories',
  'category': 'tradeCategories',
  'supplier': 'supplier',
  'month': 'month',
  'week': 'week',
  'quarter': 'quarter',
  'year': 'year',
  'status': 'status',
  'type': 'project_type',
  'priority': 'priority'
}

const VIZ_KEYWORDS: Record<string, VisualizationType> = {
  'bar': 'bar',
  'bar chart': 'bar',
  'column': 'bar',
  'line': 'line',
  'line chart': 'line',
  'trend': 'line',
  'area': 'area',
  'area chart': 'area',
  'pie': 'pie',
  'pie chart': 'pie',
  'donut': 'pie',
  'table': 'table',
  'list': 'table',
  'kpi': 'kpi',
  'metric': 'kpi',
  'number': 'kpi',
  'progress': 'progress',
  'gauge': 'progress',
  'card': 'card'
}

const SIZE_KEYWORDS: Record<string, WidgetSizeAI> = {
  'small': 'sm',
  'sm': 'sm',
  'compact': 'sm',
  'medium': 'md',
  'md': 'md',
  'standard': 'md',
  'large': 'lg',
  'lg': 'lg',
  'big': 'lg',
  'extra large': 'xl',
  'xl': 'xl',
  'full': 'xl',
  'wide': 'xl'
}

const TIME_KEYWORDS: Record<string, string> = {
  'today': 'today',
  'yesterday': 'yesterday',
  'this week': 'this_week',
  'last week': 'last_week',
  'this month': 'this_month',
  'last month': 'last_month',
  'this quarter': 'this_quarter',
  'last quarter': 'last_quarter',
  'this year': 'this_year',
  'last year': 'last_year',
  'next 7 days': 'next_7_days',
  'next 14 days': 'next_14_days',
  'next 30 days': 'next_30_days',
  'next 90 days': 'next_90_days'
}

// -----------------------------
// Field Mappings by Source
// -----------------------------

const SOURCE_FIELDS: Record<DataSource, string[]> = {
  projects: ['name', 'location', 'country', 'progress', 'budget', 'spent', 'status', 'deadline', 'satisfaction', 'size', 'score', 'team', 'suppliers', 'issuesReported', 'reworkCost', 'riskScore', 'tradeCategories'],
  itts: ['project', 'task', 'daysLeft', 'priority', 'value', 'suppliers', 'responses', 'status', 'category', 'created', 'deadline', 'region'],
  suppliers: ['name', 'score', 'projects', 'onTimeDelivery', 'region', 'category', 'costPerUnit', 'approved', 'responseTime'],
  costs: ['budget', 'spent', 'variance', 'month', 'year', 'project', 'category'],
  issues: ['type', 'title', 'description', 'severity', 'timestamp', 'project', 'status'],
  regionMetrics: ['region', 'performance', 'projectsOnTime', 'avgITTResponse', 'supplierQuality', 'budgetUsage', 'activeProjects', 'totalProjects']
}

// -----------------------------
// Main Parser Function
// -----------------------------

export function parseWidgetIntent(text: string): ParsedWidgetIntent {
  const lowerText = text.toLowerCase()
  const words = lowerText.split(/\s+/)
  
  try {
    // 1. Detect source
    const source = detectSource(lowerText)
    if (!source) {
      return {
        success: false,
        error: 'Could not determine data source. Please specify projects, ITTs, suppliers, costs, issues, or region metrics.',
        clarification: 'What type of data would you like to visualize?'
      }
    }

    // 2. Extract time window and build date filter
    const dateFilter = extractDateFilter(lowerText)
    
    // 3. Extract groupBy dimension
    const groupBy = extractGroupBy(lowerText, source)
    
    // 4. Extract measure (default = count)
    const metrics = extractMetrics(lowerText, source)
    
    // 5. Detect visualization
    const viz = detectVisualization(lowerText, groupBy, metrics)
    
    // 6. Decide size
    const size = determineSize(lowerText, viz, groupBy)
    
    // 7. Extract additional filters
    const filters = extractFilters(lowerText, source, dateFilter)
    
    // 8. Generate name
    const name = generateWidgetName(lowerText, source, viz, groupBy)
    
    // 9. Build definition
    const definition: WidgetDefinition = {
      name,
      source,
      filters,
      groupBy,
      metrics,
      viz,
      size,
      options: buildOptions(lowerText, viz, groupBy),
      dateScope: dateFilter ? 'custom' : 'global'
    }

    return {
      success: true,
      definition
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse widget intent: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

// -----------------------------
// Helper Functions
// -----------------------------

function detectSource(text: string): DataSource | null {
  for (const [keyword, source] of Object.entries(SOURCE_KEYWORDS)) {
    if (text.includes(keyword)) {
      return source
    }
  }
  return 'projects' // Default fallback
}

function extractDateFilter(text: string): Filter | null {
  for (const [keyword, timeRange] of Object.entries(TIME_KEYWORDS)) {
    if (text.includes(keyword)) {
      const now = new Date()
      let start: Date, end: Date
      
      switch (timeRange) {
        case 'today':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
          break
        case 'this_week':
          const dayOfWeek = now.getDay()
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek)
          end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59)
          break
        case 'this_month':
          start = new Date(now.getFullYear(), now.getMonth(), 1)
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
          break
        case 'next_14_days':
          start = now
          end = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
          break
        case 'next_30_days':
          start = now
          end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          break
        default:
          return null
      }
      
      return {
        field: 'deadline',
        operator: 'gte',
        value: start.toISOString().split('T')[0]
      }
    }
  }
  return null
}

function extractGroupBy(text: string, source: DataSource): string[] | undefined {
  const dimensions: string[] = []
  
  for (const [keyword, field] of Object.entries(DIMENSION_KEYWORDS)) {
    if (text.includes(keyword) && SOURCE_FIELDS[source].includes(field)) {
      dimensions.push(field)
    }
  }
  
  // Special cases
  if (text.includes('compare') && text.includes('vs')) {
    if (text.includes('uk') && text.includes('usa')) {
      return ['country']
    }
    if (text.includes('region')) {
      return ['region']
    }
  }
  
  if (text.includes('top') && text.includes('supplier')) {
    return ['supplier']
  }
  
  if (text.includes('monthly') || text.includes('by month')) {
    return ['month']
  }
  
  return dimensions.length > 0 ? dimensions : undefined
}

function extractMetrics(text: string, source: DataSource): Metric[] {
  const metrics: Metric[] = []
  
  // Default metric
  if (!text.includes('count') && !text.includes('sum') && !text.includes('avg')) {
    metrics.push({
      label: 'Count',
      agg: 'count',
      unit: 'count'
    })
    return metrics
  }
  
  // Extract specific metrics
  for (const [keyword, agg] of Object.entries(METRIC_KEYWORDS)) {
    if (text.includes(keyword)) {
      let field = ''
      let unit: Metric['unit'] = ''
      
      // Map common field names
      if (text.includes('budget') || text.includes('spend')) {
        field = 'spent'
        unit = '£'
      } else if (text.includes('progress') || text.includes('completion')) {
        field = 'progress'
        unit = '%'
      } else if (text.includes('score') || text.includes('rating')) {
        field = 'score'
        unit = ''
      } else if (text.includes('time') || text.includes('delivery')) {
        field = 'onTimeDelivery'
        unit = '%'
      }
      
      metrics.push({
        label: keyword.charAt(0).toUpperCase() + keyword.slice(1),
        agg,
        field,
        unit
      })
    }
  }
  
  return metrics.length > 0 ? metrics : [{
    label: 'Count',
    agg: 'count',
    unit: 'count'
  }]
}

function detectVisualization(text: string, groupBy?: string[], metrics?: Metric[]): VisualizationType {
  // Explicit visualization requests
  for (const [keyword, viz] of Object.entries(VIZ_KEYWORDS)) {
    if (text.includes(keyword)) {
      return viz
    }
  }
  
  // Smart defaults based on context
  if (groupBy && groupBy.length > 0) {
    if (groupBy.includes('month') || groupBy.includes('week') || groupBy.includes('year')) {
      return 'line'
    }
    if (groupBy.includes('region') || groupBy.includes('country') || groupBy.includes('supplier')) {
      return 'bar'
    }
  }
  
  if (metrics && metrics.length === 1 && metrics[0].agg === 'count') {
    return 'kpi'
  }
  
  return 'bar' // Default fallback
}

function determineSize(text: string, viz: VisualizationType, groupBy?: string[]): WidgetSizeAI {
  // Explicit size requests
  for (const [keyword, size] of Object.entries(SIZE_KEYWORDS)) {
    if (text.includes(keyword)) {
      return size
    }
  }
  
  // Smart defaults
  if (viz === 'kpi') {
    return 'sm'
  }
  
  if (groupBy && groupBy.length > 0) {
    return 'lg'
  }
  
  if (viz === 'table') {
    return 'xl'
  }
  
  return 'md' // Default
}

function extractFilters(text: string, source: DataSource, dateFilter?: Filter): Filter[] {
  const filters: Filter[] = []
  
  if (dateFilter) {
    filters.push(dateFilter)
  }
  
  // Status filters
  if (text.includes('active')) {
    filters.push({ field: 'status', operator: 'eq', value: 'Active' })
  }
  
  if (text.includes('pending')) {
    filters.push({ field: 'status', operator: 'eq', value: 'Pending' })
  }
  
  // Priority filters
  if (text.includes('high priority')) {
    filters.push({ field: 'priority', operator: 'eq', value: 'High' })
  }
  
  // Region filters
  if (text.includes('uk')) {
    filters.push({ field: 'country', operator: 'eq', value: 'UK' })
  }
  
  if (text.includes('usa')) {
    filters.push({ field: 'country', operator: 'eq', value: 'USA' })
  }
  
  // Top N filters
  const topMatch = text.match(/top\s+(\d+)/i)
  if (topMatch) {
    const limit = parseInt(topMatch[1])
    // This will be handled in options
  }
  
  return filters
}

function generateWidgetName(text: string, source: DataSource, viz: VisualizationType, groupBy?: string[]): string {
  const parts: string[] = []
  
  // Add source
  parts.push(source.charAt(0).toUpperCase() + source.slice(1))
  
  // Add groupBy if present
  if (groupBy && groupBy.length > 0) {
    parts.push(`by ${groupBy[0]}`)
  }
  
  // Add visualization
  parts.push(viz.charAt(0).toUpperCase() + viz.slice(1))
  
  return parts.join(' ')
}

function buildOptions(text: string, viz: VisualizationType, groupBy?: string[]): WidgetDefinition['options'] {
  const options: WidgetDefinition['options'] = {}
  
  // Top N limit
  const topMatch = text.match(/top\s+(\d+)/i)
  if (topMatch) {
    options.limit = parseInt(topMatch[1])
    options.orderBy = { field: 'score', direction: 'desc' }
  }
  
  // Chart options
  if (viz === 'bar' || viz === 'line') {
    options.legend = true
    options.axisLabels = true
  }
  
  if (viz === 'kpi') {
    options.decimals = 0
    options.abbreviate = true
  }
  
  return options
}

// -----------------------------
// Validation Functions
// -----------------------------

export function validateWidgetDefinition(definition: WidgetDefinition): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!definition.name) {
    errors.push('Widget name is required')
  }
  
  if (!definition.source) {
    errors.push('Data source is required')
  }
  
  if (!definition.metrics || definition.metrics.length === 0) {
    errors.push('At least one metric is required')
  }
  
  if (!definition.viz) {
    errors.push('Visualization type is required')
  }
  
  if (!definition.size) {
    errors.push('Widget size is required')
  }
  
  // Validate field names against source
  const validFields = SOURCE_FIELDS[definition.source]
  if (definition.groupBy) {
    for (const field of definition.groupBy) {
      if (!validFields.includes(field)) {
        errors.push(`Invalid groupBy field: ${field}`)
      }
    }
  }
  
  for (const filter of definition.filters) {
    if (!validFields.includes(filter.field)) {
      errors.push(`Invalid filter field: ${filter.field}`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
} 