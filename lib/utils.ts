import { WidgetSize } from './types'

// Enhanced responsive grid system with proper breakpoints
export const getResponsiveGridCols = (screenSize: 'mobile' | 'tablet' | 'desktop'): string => {
  switch (screenSize) {
    case 'mobile': return 'grid-cols-1'
    case 'tablet': return 'grid-cols-2'
    case 'desktop': return 'grid-cols-3'
    default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  }
}

// Premium widget sizing with perfect grid snapping
export const getGridSpan = (size: WidgetSize, screenSize: 'mobile' | 'tablet' | 'desktop' = 'desktop'): string => {
  if (screenSize === 'mobile') {
    return 'col-span-1' // All widgets take full width on mobile
  }
  
  if (screenSize === 'tablet') {
    switch (size) {
      case 'small': return 'col-span-1'
      case 'medium': return 'col-span-1'  
      case 'large': return 'col-span-2'
      case 'extra-large': return 'col-span-2'
      default: return 'col-span-1'
    }
  }

  // Desktop sizing
  switch (size) {
    case 'small': return 'col-span-1'
    case 'medium': return 'col-span-1'
    case 'large': return 'col-span-2'
    case 'extra-large': return 'col-span-3'
    default: return 'col-span-1'
  }
}

// Adaptive widget heights that scale with content
export const getWidgetHeight = (size: WidgetSize, hasChart: boolean = false): string => {
  const baseHeight = {
    small: hasChart ? 'min-h-36' : 'min-h-32',
    medium: hasChart ? 'min-h-48' : 'min-h-40', 
    large: hasChart ? 'min-h-64' : 'min-h-56',
    'extra-large': hasChart ? 'min-h-80' : 'min-h-72'
  }
  return `${baseHeight[size]} h-auto`
}

// Responsive padding that adapts to widget size
export const getWidgetPadding = (size: WidgetSize): string => {
  switch (size) {
    case 'small': return 'p-3'
    case 'medium': return 'p-4'
    case 'large': return 'p-5'
    case 'extra-large': return 'p-6'
    default: return 'p-4'
  }
}

// Typography scaling for widget sizes
export const getWidgetTitleSize = (size: WidgetSize): string => {
  switch (size) {
    case 'small': return 'text-xs font-medium'
    case 'medium': return 'text-sm font-medium' 
    case 'large': return 'text-base font-semibold'
    case 'extra-large': return 'text-lg font-semibold'
    default: return 'text-sm font-medium'
  }
}

export const getWidgetValueSize = (size: WidgetSize): string => {
  switch (size) {
    case 'small': return 'text-lg font-bold'
    case 'medium': return 'text-2xl font-bold'
    case 'large': return 'text-3xl font-bold'  
    case 'extra-large': return 'text-4xl font-bold'
    default: return 'text-2xl font-bold'
  }
}

export const getWidgetIconSize = (size: WidgetSize): string => {
  switch (size) {
    case 'small': return 'h-3 w-3'
    case 'medium': return 'h-4 w-4'
    case 'large': return 'h-5 w-5'
    case 'extra-large': return 'h-6 w-6'
    default: return 'h-4 w-4'
  }
}

// Status color utilities
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "On Track": return "bg-green-50 text-green-700 border-green-200"
    case "Delayed": return "bg-red-50 text-red-700 border-red-200"
    case "Ahead": return "bg-blue-50 text-blue-700 border-blue-200"
    case "At Risk": return "bg-orange-50 text-orange-700 border-orange-200"
    default: return "bg-gray-50 text-gray-700 border-gray-200"
  }
}

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case "High": return "bg-red-50 text-red-700 border-red-200"
    case "Medium": return "bg-yellow-50 text-yellow-700 border-yellow-200"
    case "Low": return "bg-green-50 text-green-700 border-green-200"
    default: return "bg-gray-50 text-gray-700 border-gray-200"
  }
}

export const getScoreColor = (score: number): string => {
  if (score >= 90) return "text-green-600"
  if (score >= 80) return "text-blue-600"
  if (score >= 70) return "text-yellow-600"
  return "text-red-600"
}

export const getInsightSeverityColor = (severity: string): string => {
  switch (severity) {
    case "high": return "bg-red-50 border-red-200 text-red-700"
    case "medium": return "bg-yellow-50 border-yellow-200 text-yellow-700"
    case "positive": return "bg-green-50 border-green-200 text-green-700"
    case "info": return "bg-blue-50 border-blue-200 text-blue-700"
    default: return "bg-gray-50 border-gray-200 text-gray-700"
  }
}

// Enhanced chart utilities
export const getChartHeight = (size: WidgetSize): number => {
  switch (size) {
    case 'small': return 80
    case 'medium': return 120
    case 'large': return 180
    case 'extra-large': return 240
    default: return 120
  }
}

// Grid snapping utilities
export const snapToGrid = (x: number, y: number, gridSize: number = 8): { x: number; y: number } => {
  return {
    x: Math.round(x / gridSize) * gridSize,
    y: Math.round(y / gridSize) * gridSize
  }
}

// Animation utilities
export const getTransitionClasses = (): string => {
  return 'transition-all duration-300 ease-in-out'
}

export const getHoverClasses = (): string => {
  return 'hover:shadow-lg hover:scale-[1.02] hover:z-10'
}

// Responsive breakpoint utilities
export const getScreenSize = (width: number): 'mobile' | 'tablet' | 'desktop' => {
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'  
  return 'desktop'
}

// Format utilities for consistent display
export const formatCurrency = (amount: number, currency: string = 'GBP'): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export const formatLargeCurrency = (amount: number, currency: string = 'GBP'): string => {
  if (amount >= 1000000) {
    return `${currency === 'GBP' ? '£' : '$'}${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `${currency === 'GBP' ? '£' : '$'}${(amount / 1000).toFixed(0)}K`
  }
  return formatCurrency(amount, currency)
}

export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${value.toFixed(decimals)}%`
}

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export const formatTimeAgo = (timestamp: string): string => {
  const now = new Date()
  const past = new Date(timestamp)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(timestamp)
}

// Validation utilities for forms
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0
}

export const validateNumber = (value: string, min?: number, max?: number): boolean => {
  const num = parseFloat(value)
  if (isNaN(num)) return false
  if (min !== undefined && num < min) return false
  if (max !== undefined && num > max) return false
  return true
}

export const validateDate = (date: string): boolean => {
  const parsedDate = new Date(date)
  return !isNaN(parsedDate.getTime())
}

// Search and filter utilities
export const fuzzySearch = (query: string, text: string): boolean => {
  const queryLower = query.toLowerCase()
  const textLower = text.toLowerCase()
  
  let queryIndex = 0
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      queryIndex++
    }
  }
  
  return queryIndex === queryLower.length
}

export const highlightSearchTerm = (text: string, query: string): string => {
  if (!query.trim()) return text
  
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
}

// Performance utilities
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}