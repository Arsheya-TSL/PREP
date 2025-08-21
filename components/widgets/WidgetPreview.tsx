import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { WidgetDefinition, MockChartData, VisualizationType } from '../../lib/types'
import { generateMockData } from '../../lib/mockDataGenerator'

interface WidgetPreviewProps {
  definition: WidgetDefinition
  className?: string
}

export default function WidgetPreview({ definition, className = '' }: WidgetPreviewProps) {
  const mockData = generateMockData(definition)
  const { viz, size, name } = definition
  
  const isCompact = size === 'sm'
  const isExpanded = size === 'lg' || size === 'xl'
  const showChart = (size === 'lg' || size === 'xl') && viz !== 'kpi'

  return (
          <Card className="bg-card border border-border">
      <CardHeader className={`flex flex-row items-center justify-between space-y-0 ${getPadding(size)} pb-2`}>
        <div className="space-y-1 flex-1 min-w-0">
          <CardTitle className={`${getTitleSize(size)} text-neutral-800 truncate`}>
            {isCompact ? name.split(' ').slice(0, 2).join(' ') : name}
          </CardTitle>
          {!isCompact && (
            <p className="text-xs text-neutral-500">Preview</p>
          )}
        </div>
        <div className={`p-2 bg-neutral-100 rounded-lg flex-shrink-0 ${isCompact ? 'p-1.5' : 'p-2'}`}>
          <div className={`${getIconSize(size)} text-neutral-600`}>
            {getVizIcon(viz)}
          </div>
        </div>
      </CardHeader>
      <CardContent className={`flex-1 ${getPadding(size)} pt-0`}>
        <RenderPreviewContent 
          viz={viz} 
          mockData={mockData} 
          size={size} 
          isCompact={isCompact}
          isExpanded={isExpanded}
          showChart={showChart}
        />
      </CardContent>
    </Card>
  )
}

function RenderPreviewContent({ 
  viz, 
  mockData, 
  size, 
  isCompact, 
  isExpanded, 
  showChart 
}: {
  viz: VisualizationType
  mockData: MockChartData
  size: string
  isCompact: boolean
  isExpanded: boolean
  showChart: boolean
}) {
  switch (viz) {
    case 'kpi':
      return <KPIPreview data={mockData.data[0]} size={size} isCompact={isCompact} />
    
    case 'bar':
      return showChart ? (
        <BarChartPreview data={mockData.data} isExpanded={isExpanded} />
      ) : (
        <CompactBarPreview data={mockData.data} isCompact={isCompact} />
      )
    
    case 'line':
      return showChart ? (
        <LineChartPreview data={mockData.data} isExpanded={isExpanded} />
      ) : (
        <CompactLinePreview data={mockData.data} isCompact={isCompact} />
      )
    
    case 'pie':
      return showChart ? (
        <PieChartPreview data={mockData.data} isExpanded={isExpanded} />
      ) : (
        <CompactPiePreview data={mockData.data} isCompact={isCompact} />
      )
    
    case 'table':
      return <TablePreview data={mockData.data} isCompact={isCompact} isExpanded={isExpanded} />
    
    case 'progress':
      return <ProgressPreview data={mockData.data} isCompact={isCompact} />
    
    case 'card':
      return <CardPreview data={mockData.data} isCompact={isCompact} isExpanded={isExpanded} />
    
    default:
      return <DefaultPreview data={mockData.data} isCompact={isCompact} />
  }
}

function KPIPreview({ data, size, isCompact }: { data: any; size: string; isCompact: boolean }) {
  const unit = data.unit || ''
  const formattedValue = formatValue(data.value, unit)
  
  return (
    <div className="text-center">
      <div className={`${getValueSize(size)} font-bold text-neutral-800 mb-1`}>
        {formattedValue}
      </div>
      <div className={`${isCompact ? 'text-xs' : 'text-sm'} text-neutral-600`}>
        {data.label}
      </div>
    </div>
  )
}

function BarChartPreview({ data, isExpanded }: { data: any[]; isExpanded: boolean }) {
  const chartData = data.map(item => ({
    name: item.label,
    value: item.value,
    color: item.color
  }))

  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
          <YAxis stroke="#64748b" fontSize={10} />
          <Tooltip 
            contentStyle={{ 
              background: '#ffffff', 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px',
              fontSize: '12px'
            }} 
          />
          <Bar dataKey="value" fill="#3b82f6" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function CompactBarPreview({ data, isCompact }: { data: any[]; isCompact: boolean }) {
  return (
    <div className="space-y-2">
      {data.slice(0, isCompact ? 2 : 3).map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <span className={`${isCompact ? 'text-xs' : 'text-sm'} text-neutral-600 truncate flex-1 mr-2`}>
            {item.label}
          </span>
          <div className="flex items-center gap-2">
            <div className="h-2 bg-neutral-200 rounded-full w-16">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min((item.value / Math.max(...data.map(d => d.value))) * 100, 100)}%`,
                  backgroundColor: item.color
                }}
              />
            </div>
            <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-neutral-800 min-w-0`}>
              {item.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function LineChartPreview({ data, isExpanded }: { data: any[]; isExpanded: boolean }) {
  const chartData = data.map(item => ({
    name: item.label,
    value: item.value,
    color: item.color
  }))

  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
          <YAxis stroke="#64748b" fontSize={10} />
          <Tooltip 
            contentStyle={{ 
              background: '#ffffff', 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px',
              fontSize: '12px'
            }} 
          />
          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function CompactLinePreview({ data, isCompact }: { data: any[]; isCompact: boolean }) {
  return (
    <div className="space-y-2">
      {data.slice(0, isCompact ? 2 : 3).map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <span className={`${isCompact ? 'text-xs' : 'text-sm'} text-neutral-600`}>
            {item.label}
          </span>
          <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-neutral-800`}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function PieChartPreview({ data, isExpanded }: { data: any[]; isExpanded: boolean }) {
  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={30}
            outerRadius={60}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              background: '#ffffff', 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px',
              fontSize: '12px'
            }} 
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function CompactPiePreview({ data, isCompact }: { data: any[]; isCompact: boolean }) {
  return (
    <div className="space-y-2">
      {data.slice(0, isCompact ? 2 : 3).map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className={`${isCompact ? 'text-xs' : 'text-sm'} text-neutral-600 flex-1`}>
            {item.label}
          </span>
          <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-neutral-800`}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function TablePreview({ data, isCompact, isExpanded }: { data: any[]; isCompact: boolean; isExpanded: boolean }) {
  const displayData = data.slice(0, isCompact ? 2 : isExpanded ? 5 : 3)
  
  return (
    <div className="space-y-2">
      {displayData.map((item, index) => (
        <div key={index} className={`flex items-center justify-between ${isCompact ? 'p-1' : 'p-2'} rounded-lg hover:bg-neutral-50 transition-colors`}>
          <div className="flex-1 min-w-0">
            <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-neutral-800 truncate block`}>
              {isCompact ? item.label.split(' ').slice(0, 2).join(' ') : item.label}
            </span>
            {!isCompact && item.metadata && (
              <span className="text-xs text-neutral-500">
                {Object.values(item.metadata).slice(0, 2).join(' • ')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs px-2 py-0.5`} style={{ backgroundColor: item.color + '20', color: item.color }}>
              {item.value}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}

function ProgressPreview({ data, isCompact }: { data: any[]; isCompact: boolean }) {
  const mainData = data[0]
  const percentage = Math.min((mainData.value / Math.max(...data.map(d => d.value))) * 100, 100)
  
  return (
    <div className="space-y-3">
      <div className="text-center">
        <div className={`${isCompact ? 'text-lg' : 'text-2xl'} font-bold text-neutral-800 mb-1`}>
          {mainData.value}
        </div>
        <div className={`${isCompact ? 'text-xs' : 'text-sm'} text-neutral-600`}>
          {mainData.label}
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: mainData.color
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-neutral-500">
          <span>0</span>
          <span>{Math.max(...data.map(d => d.value))}</span>
        </div>
      </div>
    </div>
  )
}

function CardPreview({ data, isCompact, isExpanded }: { data: any[]; isCompact: boolean; isExpanded: boolean }) {
  const displayData = data.slice(0, isCompact ? 1 : isExpanded ? 3 : 2)
  
  return (
    <div className="space-y-3">
      {displayData.map((item, index) => (
        <div key={index} className={`p-3 rounded-lg border ${isCompact ? 'p-2' : 'p-3'}`} style={{ borderColor: item.color + '30' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className={`${isCompact ? 'text-sm' : 'text-base'} font-medium text-neutral-800 truncate`}>
                {item.label}
              </div>
              {!isCompact && item.metadata && (
                <div className="text-xs text-neutral-500 mt-1">
                  {Object.entries(item.metadata).slice(0, 2).map(([key, value]) => `${key}: ${value}`).join(', ')}
                </div>
              )}
            </div>
            <div className={`${isCompact ? 'text-lg' : 'text-xl'} font-bold`} style={{ color: item.color }}>
              {item.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function DefaultPreview({ data, isCompact }: { data: any[]; isCompact: boolean }) {
  return (
    <div className="space-y-2">
      {data.slice(0, isCompact ? 2 : 3).map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <span className={`${isCompact ? 'text-xs' : 'text-sm'} text-neutral-600`}>
            {item.label}
          </span>
          <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium text-neutral-800`}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// -----------------------------
// Utility Functions
// -----------------------------

function getVizIcon(viz: VisualizationType): string {
  switch (viz) {
    case 'kpi': return '📊'
    case 'bar': return '📈'
    case 'line': return '📉'
    case 'pie': return '🥧'
    case 'table': return '📋'
    case 'progress': return '⏳'
    case 'card': return '🃏'
    default: return '📊'
  }
}

function formatValue(value: number, unit: string): string {
  if (unit === '£') {
    return `£${value.toLocaleString()}`
  }
  if (unit === '%') {
    return `${value}%`
  }
  if (unit === 'count') {
    return value.toLocaleString()
  }
  return value.toString()
}

function getPadding(size: string): string {
  switch (size) {
    case 'sm': return 'p-3'
    case 'md': return 'p-4'
    case 'lg': return 'p-5'
    case 'xl': return 'p-6'
    default: return 'p-4'
  }
}

function getTitleSize(size: string): string {
  switch (size) {
    case 'sm': return 'text-sm'
    case 'md': return 'text-base'
    case 'lg': return 'text-lg'
    case 'xl': return 'text-xl'
    default: return 'text-base'
  }
}

function getValueSize(size: string): string {
  switch (size) {
    case 'sm': return 'text-xl'
    case 'md': return 'text-2xl'
    case 'lg': return 'text-3xl'
    case 'xl': return 'text-4xl'
    default: return 'text-2xl'
  }
}

function getIconSize(size: string): string {
  switch (size) {
    case 'sm': return 'h-4 w-4'
    case 'md': return 'h-5 w-5'
    case 'lg': return 'h-6 w-6'
    case 'xl': return 'h-7 w-7'
    default: return 'h-5 w-5'
  }
} 