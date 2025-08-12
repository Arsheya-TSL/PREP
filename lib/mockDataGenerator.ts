import { 
  WidgetDefinition, 
  MockChartData, 
  MockDataPoint, 
  VisualizationType,
  DataSource 
} from './types'

// -----------------------------
// Mock Data Generators by Source
// -----------------------------

const PROJECTS_MOCK_DATA = {
  regions: ['UK', 'USA', 'Europe', 'Asia', 'Australia'],
  statuses: ['Active', 'Completed', 'On Hold', 'Planning'],
  tradeCategories: ['Electrical', 'Mechanical', 'Civil', 'HVAC', 'Plumbing'],
  projects: [
    { name: 'London Bridge Renovation', region: 'UK', status: 'Active', progress: 75, budget: 2500000, spent: 1875000 },
    { name: 'NYC Office Tower', region: 'USA', status: 'Active', progress: 45, budget: 5000000, spent: 2250000 },
    { name: 'Berlin Airport Terminal', region: 'Europe', status: 'Planning', progress: 15, budget: 8000000, spent: 1200000 },
    { name: 'Tokyo Metro Station', region: 'Asia', status: 'Active', progress: 60, budget: 3500000, spent: 2100000 },
    { name: 'Sydney Opera House Upgrade', region: 'Australia', status: 'Completed', progress: 100, budget: 1500000, spent: 1500000 }
  ]
}

const ITTS_MOCK_DATA = {
  categories: ['Electrical', 'Mechanical', 'Civil', 'HVAC', 'Plumbing'],
  priorities: ['High', 'Medium', 'Low'],
  statuses: ['Draft', 'Sent', 'Replied', 'Awarded'],
  itts: [
    { project: 'London Bridge', category: 'Electrical', priority: 'High', value: 500000, daysLeft: 7, responses: 8, suppliers: 12 },
    { project: 'NYC Tower', category: 'Mechanical', priority: 'Medium', value: 750000, daysLeft: 14, responses: 5, suppliers: 8 },
    { project: 'Berlin Airport', category: 'Civil', priority: 'High', value: 1200000, daysLeft: 3, responses: 12, suppliers: 15 },
    { project: 'Tokyo Metro', category: 'HVAC', priority: 'Low', value: 300000, daysLeft: 21, responses: 3, suppliers: 6 },
    { project: 'Sydney Opera', category: 'Plumbing', priority: 'Medium', value: 200000, daysLeft: 10, responses: 6, suppliers: 9 }
  ]
}

const SUPPLIERS_MOCK_DATA = {
  regions: ['UK', 'USA', 'Europe', 'Asia'],
  categories: ['Electrical', 'Mechanical', 'Civil', 'HVAC', 'Plumbing'],
  suppliers: [
    { name: 'ElectroCorp UK', region: 'UK', category: 'Electrical', score: 95, projects: 12, onTimeDelivery: 98 },
    { name: 'MechSolutions USA', region: 'USA', category: 'Mechanical', score: 92, projects: 8, onTimeDelivery: 95 },
    { name: 'CivilWorks Europe', region: 'Europe', category: 'Civil', score: 88, projects: 15, onTimeDelivery: 92 },
    { name: 'HVAC Masters Asia', region: 'Asia', category: 'HVAC', score: 85, projects: 6, onTimeDelivery: 89 },
    { name: 'PlumbTech UK', region: 'UK', category: 'Plumbing', score: 90, projects: 10, onTimeDelivery: 94 }
  ]
}

const COSTS_MOCK_DATA = {
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  categories: ['Materials', 'Labor', 'Equipment', 'Overhead'],
  costs: [
    { month: 'Jan', budget: 500000, spent: 480000, variance: -20000 },
    { month: 'Feb', budget: 550000, spent: 520000, variance: -30000 },
    { month: 'Mar', budget: 600000, spent: 580000, variance: -20000 },
    { month: 'Apr', budget: 650000, spent: 670000, variance: 20000 },
    { month: 'May', budget: 700000, spent: 680000, variance: -20000 },
    { month: 'Jun', budget: 750000, spent: 720000, variance: -30000 }
  ]
}

const ISSUES_MOCK_DATA = {
  types: ['Safety', 'Quality', 'Schedule', 'Cost', 'Technical'],
  severities: ['Low', 'Medium', 'High', 'Critical'],
  issues: [
    { type: 'Safety', severity: 'High', count: 3, project: 'London Bridge' },
    { type: 'Quality', severity: 'Medium', count: 7, project: 'NYC Tower' },
    { type: 'Schedule', severity: 'Low', count: 12, project: 'Berlin Airport' },
    { type: 'Cost', severity: 'Medium', count: 5, project: 'Tokyo Metro' },
    { type: 'Technical', severity: 'High', count: 2, project: 'Sydney Opera' }
  ]
}

const REGION_METRICS_MOCK_DATA = {
  regions: ['UK', 'USA', 'Europe', 'Asia', 'Australia'],
  metrics: [
    { region: 'UK', projectsOnTime: 92, avgITTResponse: 4.2, supplierQuality: 88, budgetUsage: 85, activeProjects: 8, totalProjects: 12 },
    { region: 'USA', projectsOnTime: 89, avgITTResponse: 3.8, supplierQuality: 85, budgetUsage: 78, activeProjects: 6, totalProjects: 9 },
    { region: 'Europe', projectsOnTime: 94, avgITTResponse: 4.5, supplierQuality: 92, budgetUsage: 82, activeProjects: 10, totalProjects: 15 },
    { region: 'Asia', projectsOnTime: 87, avgITTResponse: 3.5, supplierQuality: 83, budgetUsage: 75, activeProjects: 4, totalProjects: 7 },
    { region: 'Australia', projectsOnTime: 91, avgITTResponse: 4.0, supplierQuality: 87, budgetUsage: 80, activeProjects: 3, totalProjects: 5 }
  ]
}

// -----------------------------
// Main Mock Data Generator
// -----------------------------

export function generateMockData(definition: WidgetDefinition): MockChartData {
  const { source, viz, groupBy, metrics, options } = definition
  
  switch (source) {
    case 'projects':
      return generateProjectsMockData(definition)
    case 'itts':
      return generateITTsMockData(definition)
    case 'suppliers':
      return generateSuppliersMockData(definition)
    case 'costs':
      return generateCostsMockData(definition)
    case 'issues':
      return generateIssuesMockData(definition)
    case 'regionMetrics':
      return generateRegionMetricsMockData(definition)
    default:
      return generateDefaultMockData(definition)
  }
}

// -----------------------------
// Source-Specific Generators
// -----------------------------

function generateProjectsMockData(definition: WidgetDefinition): MockChartData {
  const { viz, groupBy, metrics, options } = definition
  
  if (viz === 'kpi') {
    const totalProjects = PROJECTS_MOCK_DATA.projects.length
    const activeProjects = PROJECTS_MOCK_DATA.projects.filter(p => p.status === 'Active').length
    const avgProgress = Math.round(PROJECTS_MOCK_DATA.projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects)
    
    return {
      type: 'kpi',
      data: [{
        label: metrics[0]?.label || 'Total Projects',
        value: totalProjects,
        color: '#3b82f6'
      }],
      options: { unit: 'count' }
    }
  }
  
  if (groupBy?.includes('region')) {
    const regionData = PROJECTS_MOCK_DATA.regions.map(region => ({
      label: region,
      value: PROJECTS_MOCK_DATA.projects.filter(p => p.region === region).length,
      color: getRegionColor(region)
    }))
    
    return {
      type: viz,
      data: regionData,
      options: { legend: true, axisLabels: true }
    }
  }
  
  if (groupBy?.includes('status')) {
    const statusData = PROJECTS_MOCK_DATA.statuses.map(status => ({
      label: status,
      value: PROJECTS_MOCK_DATA.projects.filter(p => p.status === status).length,
      color: getStatusColor(status)
    }))
    
    return {
      type: viz,
      data: statusData,
      options: { legend: true, axisLabels: true }
    }
  }
  
  // Default: project list
  const projectData = PROJECTS_MOCK_DATA.projects.slice(0, options?.limit || 5).map(project => ({
    label: project.name,
    value: project.progress,
    color: '#10b981',
    metadata: { region: project.region, status: project.status }
  }))
  
  return {
    type: viz,
    data: projectData,
    options: { legend: true, axisLabels: true }
  }
}

function generateITTsMockData(definition: WidgetDefinition): MockChartData {
  const { viz, groupBy, metrics, options } = definition
  
  if (viz === 'kpi') {
    const totalITTs = ITTS_MOCK_DATA.itts.length
    const urgentITTs = ITTS_MOCK_DATA.itts.filter(itt => itt.daysLeft <= 7).length
    
    return {
      type: 'kpi',
      data: [{
        label: metrics[0]?.label || 'Total ITTs',
        value: totalITTs,
        color: '#f59e0b'
      }],
      options: { unit: 'count' }
    }
  }
  
  if (groupBy?.includes('category')) {
    const categoryData = ITTS_MOCK_DATA.categories.map(category => ({
      label: category,
      value: ITTS_MOCK_DATA.itts.filter(itt => itt.category === category).length,
      color: getCategoryColor(category)
    }))
    
    return {
      type: viz,
      data: categoryData,
      options: { legend: true, axisLabels: true }
    }
  }
  
  if (groupBy?.includes('priority')) {
    const priorityData = ITTS_MOCK_DATA.priorities.map(priority => ({
      label: priority,
      value: ITTS_MOCK_DATA.itts.filter(itt => itt.priority === priority).length,
      color: getPriorityColor(priority)
    }))
    
    return {
      type: viz,
      data: priorityData,
      options: { legend: true, axisLabels: true }
    }
  }
  
  // Default: ITT list by days left
  const ittData = ITTS_MOCK_DATA.itts
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, options?.limit || 5)
    .map(itt => ({
      label: itt.project,
      value: itt.daysLeft,
      color: itt.daysLeft <= 7 ? '#ef4444' : itt.daysLeft <= 14 ? '#f59e0b' : '#10b981',
      metadata: { category: itt.category, priority: itt.priority, value: itt.value }
    }))
  
  return {
    type: viz,
    data: ittData,
    options: { legend: true, axisLabels: true }
  }
}

function generateSuppliersMockData(definition: WidgetDefinition): MockChartData {
  const { viz, groupBy, metrics, options } = definition
  
  if (viz === 'kpi') {
    const totalSuppliers = SUPPLIERS_MOCK_DATA.suppliers.length
    const avgScore = Math.round(SUPPLIERS_MOCK_DATA.suppliers.reduce((sum, s) => sum + s.score, 0) / totalSuppliers)
    
    return {
      type: 'kpi',
      data: [{
        label: metrics[0]?.label || 'Average Score',
        value: avgScore,
        color: '#8b5cf6'
      }],
      options: { unit: '' }
    }
  }
  
  if (groupBy?.includes('region')) {
    const regionData = SUPPLIERS_MOCK_DATA.regions.map(region => ({
      label: region,
      value: SUPPLIERS_MOCK_DATA.suppliers.filter(s => s.region === region).length,
      color: getRegionColor(region)
    }))
    
    return {
      type: viz,
      data: regionData,
      options: { legend: true, axisLabels: true }
    }
  }
  
  if (groupBy?.includes('category')) {
    const categoryData = SUPPLIERS_MOCK_DATA.categories.map(category => ({
      label: category,
      value: SUPPLIERS_MOCK_DATA.suppliers.filter(s => s.category === category).length,
      color: getCategoryColor(category)
    }))
    
    return {
      type: viz,
      data: categoryData,
      options: { legend: true, axisLabels: true }
    }
  }
  
  // Default: top suppliers by score
  const supplierData = SUPPLIERS_MOCK_DATA.suppliers
    .sort((a, b) => b.score - a.score)
    .slice(0, options?.limit || 5)
    .map(supplier => ({
      label: supplier.name,
      value: supplier.score,
      color: supplier.score >= 90 ? '#10b981' : supplier.score >= 80 ? '#f59e0b' : '#ef4444',
      metadata: { region: supplier.region, category: supplier.category, projects: supplier.projects }
    }))
  
  return {
    type: viz,
    data: supplierData,
    options: { legend: true, axisLabels: true }
  }
}

function generateCostsMockData(definition: WidgetDefinition): MockChartData {
  const { viz, groupBy, metrics, options } = definition
  
  if (viz === 'kpi') {
    const totalBudget = COSTS_MOCK_DATA.costs.reduce((sum, c) => sum + c.budget, 0)
    const totalSpent = COSTS_MOCK_DATA.costs.reduce((sum, c) => sum + c.spent, 0)
    const variance = totalBudget - totalSpent
    
    return {
      type: 'kpi',
      data: [{
        label: metrics[0]?.label || 'Budget Variance',
        value: Math.abs(variance),
        color: variance >= 0 ? '#10b981' : '#ef4444'
      }],
      options: { unit: '£' }
    }
  }
  
  if (groupBy?.includes('month')) {
    const monthData = COSTS_MOCK_DATA.costs.map(cost => ({
      label: cost.month,
      value: cost.spent,
      color: '#3b82f6',
      metadata: { budget: cost.budget, variance: cost.variance }
    }))
    
    return {
      type: viz,
      data: monthData,
      options: { legend: true, axisLabels: true }
    }
  }
  
  // Default: monthly trend
  const trendData = COSTS_MOCK_DATA.costs.map(cost => ({
    label: cost.month,
    value: cost.spent,
    color: cost.variance >= 0 ? '#10b981' : '#ef4444',
    metadata: { budget: cost.budget, variance: cost.variance }
  }))
  
  return {
    type: viz,
    data: trendData,
    options: { legend: true, axisLabels: true }
  }
}

function generateIssuesMockData(definition: WidgetDefinition): MockChartData {
  const { viz, groupBy, metrics, options } = definition
  
  if (viz === 'kpi') {
    const totalIssues = ISSUES_MOCK_DATA.issues.reduce((sum, i) => sum + i.count, 0)
    const criticalIssues = ISSUES_MOCK_DATA.issues.filter(i => i.severity === 'Critical').reduce((sum, i) => sum + i.count, 0)
    
    return {
      type: 'kpi',
      data: [{
        label: metrics[0]?.label || 'Total Issues',
        value: totalIssues,
        color: '#ef4444'
      }],
      options: { unit: 'count' }
    }
  }
  
  if (groupBy?.includes('type')) {
    const typeData = ISSUES_MOCK_DATA.types.map(type => ({
      label: type,
      value: ISSUES_MOCK_DATA.issues.filter(i => i.type === type).reduce((sum, i) => sum + i.count, 0),
      color: getIssueTypeColor(type)
    }))
    
    return {
      type: viz,
      data: typeData,
      options: { legend: true, axisLabels: true }
    }
  }
  
  if (groupBy?.includes('severity')) {
    const severityData = ISSUES_MOCK_DATA.severities.map(severity => ({
      label: severity,
      value: ISSUES_MOCK_DATA.issues.filter(i => i.severity === severity).reduce((sum, i) => sum + i.count, 0),
      color: getSeverityColor(severity)
    }))
    
    return {
      type: viz,
      data: severityData,
      options: { legend: true, axisLabels: true }
    }
  }
  
  // Default: issues by type
  const issueData = ISSUES_MOCK_DATA.issues.map(issue => ({
    label: issue.type,
    value: issue.count,
    color: getIssueTypeColor(issue.type),
    metadata: { severity: issue.severity, project: issue.project }
  }))
  
  return {
    type: viz,
    data: issueData,
    options: { legend: true, axisLabels: true }
  }
}

function generateRegionMetricsMockData(definition: WidgetDefinition): MockChartData {
  const { viz, groupBy, metrics, options } = definition
  
  if (viz === 'kpi') {
    const avgOnTime = Math.round(REGION_METRICS_MOCK_DATA.metrics.reduce((sum, m) => sum + m.projectsOnTime, 0) / REGION_METRICS_MOCK_DATA.metrics.length)
    
    return {
      type: 'kpi',
      data: [{
        label: metrics[0]?.label || 'Avg On-Time %',
        value: avgOnTime,
        color: '#10b981'
      }],
      options: { unit: '%' }
    }
  }
  
  if (groupBy?.includes('region')) {
    const regionData = REGION_METRICS_MOCK_DATA.metrics.map(metric => ({
      label: metric.region,
      value: metric.projectsOnTime,
      color: getRegionColor(metric.region),
      metadata: { 
        avgITTResponse: metric.avgITTResponse,
        supplierQuality: metric.supplierQuality,
        activeProjects: metric.activeProjects
      }
    }))
    
    return {
      type: viz,
      data: regionData,
      options: { legend: true, axisLabels: true }
    }
  }
  
  // Default: regional performance
  const performanceData = REGION_METRICS_MOCK_DATA.metrics.map(metric => ({
    label: metric.region,
    value: metric.projectsOnTime,
    color: metric.projectsOnTime >= 90 ? '#10b981' : metric.projectsOnTime >= 80 ? '#f59e0b' : '#ef4444',
    metadata: { 
      avgITTResponse: metric.avgITTResponse,
      supplierQuality: metric.supplierQuality,
      activeProjects: metric.activeProjects
    }
  }))
  
  return {
    type: viz,
    data: performanceData,
    options: { legend: true, axisLabels: true }
  }
}

function generateDefaultMockData(definition: WidgetDefinition): MockChartData {
  return {
    type: definition.viz,
    data: [
      { label: 'Sample 1', value: 25, color: '#3b82f6' },
      { label: 'Sample 2', value: 35, color: '#10b981' },
      { label: 'Sample 3', value: 20, color: '#f59e0b' },
      { label: 'Sample 4', value: 30, color: '#ef4444' }
    ],
    options: { legend: true, axisLabels: true }
  }
}

// -----------------------------
// Color Utilities
// -----------------------------

function getRegionColor(region: string): string {
  const colors: Record<string, string> = {
    'UK': '#3b82f6',
    'USA': '#ef4444',
    'Europe': '#10b981',
    'Asia': '#f59e0b',
    'Australia': '#8b5cf6'
  }
  return colors[region] || '#6b7280'
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'Active': '#10b981',
    'Completed': '#3b82f6',
    'On Hold': '#f59e0b',
    'Planning': '#6b7280'
  }
  return colors[status] || '#6b7280'
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Electrical': '#3b82f6',
    'Mechanical': '#10b981',
    'Civil': '#f59e0b',
    'HVAC': '#8b5cf6',
    'Plumbing': '#ef4444'
  }
  return colors[category] || '#6b7280'
}

function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    'High': '#ef4444',
    'Medium': '#f59e0b',
    'Low': '#10b981'
  }
  return colors[priority] || '#6b7280'
}

function getIssueTypeColor(type: string): string {
  const colors: Record<string, string> = {
    'Safety': '#ef4444',
    'Quality': '#f59e0b',
    'Schedule': '#3b82f6',
    'Cost': '#10b981',
    'Technical': '#8b5cf6'
  }
  return colors[type] || '#6b7280'
}

function getSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    'Critical': '#ef4444',
    'High': '#f59e0b',
    'Medium': '#3b82f6',
    'Low': '#10b981'
  }
  return colors[severity] || '#6b7280'
} 