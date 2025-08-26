import { useEffect, useRef, useState, useMemo } from "react"
import { Plus, BarChart3, FileText } from "lucide-react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { ProjectFormData, TenderDraft } from "../../lib/types"
import { projects, regionData } from "../../lib/constants"

// ReviewRow component for the final review page
function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold text-muted-foreground uppercase">{label}</div>
      <div className="text-sm font-bold text-foreground">{value}</div>
    </div>
  )
}
// CreatableInput below uses hooks already imported; no need to re-import React hooks here

function CreatableInput({ value, onChange, placeholder, suggestions }: { value: string; onChange: (v: string) => void; placeholder?: string; suggestions: string[] }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState(value || '')
  const containerRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => { setInput(value || '') }, [value])
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!containerRef.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  const filtered = useMemo(() => suggestions.filter(s => s.toLowerCase().includes(input.toLowerCase())), [input, suggestions])
  return (
    <div className="relative" ref={containerRef}>
      <input
        className="h-12 w-full text-base border border-border rounded-md bg-background text-foreground px-3"
        value={input}
        onChange={(e) => { setInput(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { onChange(input.trim()); setOpen(false) }
        }}
        placeholder={placeholder}
      />
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover text-foreground border border-border rounded-md shadow-lg max-h-48 overflow-auto z-[100]">
          {filtered.length > 0 ? filtered.map((s) => (
            <button key={s} type="button" className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground" onClick={() => { onChange(s); setInput(s); setOpen(false) }}>{s}</button>
          )) : (
            <div className="px-3 py-2 text-muted-foreground">Type and press Enter to add</div>
          )}
        </div>
      )}
    </div>
  )
}

// Working World Map Canvas Component (from WorldMapPage)
function WorldMapCanvas({ existingProjects, userProjects, setSelectedProject, setShowProjectModal, setSelectedMapCountry, setIsCountryModalOpen }: { 
  existingProjects: any[], 
  userProjects?: any[],
  setSelectedProject: (project: any) => void,
  setShowProjectModal: (show: boolean) => void,
  setSelectedMapCountry: (country: string) => void,
  setIsCountryModalOpen: (open: boolean) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState('')
  const [countryData, setCountryData] = useState<any>(null)
  const [is3D, setIs3D] = useState(false)
  const [isContainerReady, setIsContainerReady] = useState(false)
  const chartRef = useRef<any>(null)
  const lastTooltipRef = useRef<{ text: string; ts: number } | null>(null)
  const lastDownRef = useRef<{ x: number; y: number; ts: number } | null>(null)
  const justOpenedAtRef = useRef<number>(0)
  const isDraggingRef = useRef<boolean>(false)
  // NEW: track hovered country + timestamp
  const hoveredCountryRef = useRef<string>("")
  const lastHoverTsRef = useRef<number>(0)
  const [hoveredName, setHoveredName] = useState<string>("")

  // Country info function moved here
  const getCountryInfo = (country: string) => {
    const countryData: { [key: string]: { flag: string; region: string; emoji: string } } = {
      "United States": { flag: "🇺🇸", region: "North America", emoji: "🏢" },
      "United Kingdom": { flag: "🇬🇧", region: "Europe", emoji: "🏰" },
      "Germany": { flag: "🇩🇪", region: "Europe", emoji: "🏭" },
      "France": { flag: "🇫🇷", region: "Europe", emoji: "🗼" },
      "Canada": { flag: "🇨🇦", region: "North America", emoji: "🍁" },
      "Australia": { flag: "🇦🇺", region: "Oceania", emoji: "🦘" },
      "Japan": { flag: "🇯🇵", region: "Asia", emoji: "🏯" },
      "China": { flag: "🇨🇳", region: "Asia", emoji: "🏮" },
      "India": { flag: "🇮🇳", region: "Asia", emoji: "🕌" },
      "Brazil": { flag: "🇧🇷", region: "South America", emoji: "🌴" },
      "Netherlands": { flag: "🇳🇱", region: "Europe", emoji: "🌷" },
      "Spain": { flag: "🇪🇸", region: "Europe", emoji: "🏛️" },
      "Italy": { flag: "🇮🇹", region: "Europe", emoji: "🍝" },
      "Switzerland": { flag: "🇨🇭", region: "Europe", emoji: "🏔️" },
      "Singapore": { flag: "🇸🇬", region: "Asia", emoji: "🏙️" },
      "United Arab Emirates": { flag: "🇦🇪", region: "Middle East", emoji: "🏗️" },
      "South Korea": { flag: "🇰🇷", region: "Asia", emoji: "🏢" },
      "Mexico": { flag: "🇲🇽", region: "North America", emoji: "🌮" },
      "Norway": { flag: "🇳🇴", region: "Europe", emoji: "⛰️" },
      "Sweden": { flag: "🇸🇪", region: "Europe", emoji: "🌲" },
    }
    
    return countryData[country] || { 
      flag: "🌍", 
      region: "Global", 
      emoji: "🏗️" 
    }
  }

  useEffect(() => {
    const fsHandler = () => setIsFullscreen(!!document.fullscreenElement)
    fsHandler()
    document.addEventListener('fullscreenchange', fsHandler)
    return () => document.removeEventListener('fullscreenchange', fsHandler)
  }, [])

  // Effect to mark container as ready when ref is available
  useEffect(() => {
    if (containerRef.current) {
      setIsContainerReady(true)
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current || !isContainerReady) return
    
    const container = containerRef.current
    
    // Ensure container has explicit dimensions first
    container.style.width = '100%'
    container.style.height = '500px'
    container.style.minHeight = '500px'
    container.style.position = 'relative'
    container.style.overflow = 'hidden'
    container.style.borderRadius = '12px'
    container.style.background = '#1a1a1a'

    // Clear and prepare container
    container.innerHTML = ''
    const wrapper = document.createElement('div')
    wrapper.style.position = 'absolute'
    wrapper.style.top = '0'
    wrapper.style.left = '0'
    wrapper.style.width = '100%'
    wrapper.style.height = '100%'
    wrapper.style.overflow = 'hidden'
    
    const setWrapperHeight = () => {
      try {
        if (document.fullscreenElement) {
          wrapper.style.height = `${window.innerHeight}px`
          container.style.height = `${window.innerHeight}px`
        } else {
          wrapper.style.height = '500px'
          container.style.height = '500px'
        }
      } catch {
        wrapper.style.height = '500px'
        container.style.height = '500px'
      }
    }

    // Create chart div with unique ID to avoid conflicts
    const uniqueId = 'chartdiv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    const chartDiv = document.createElement('div')
    chartDiv.id = uniqueId
    chartDiv.style.width = '100%'
    chartDiv.style.height = '100%'
    chartDiv.style.position = 'absolute'
    chartDiv.style.top = '0'
    chartDiv.style.left = '0'
    wrapper.appendChild(chartDiv)
    container.appendChild(wrapper)
    
    const onFsChange = () => { setWrapperHeight(); setIsFullscreen(!!document.fullscreenElement) }
    const onResize = () => setWrapperHeight()
    document.addEventListener('fullscreenchange', onFsChange)
    window.addEventListener('resize', onResize)
    





    // Load external script only once
    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null
        if (existing) {
          if ((window as any).am5viewer) return resolve()
          existing.addEventListener('load', () => resolve())
          existing.addEventListener('error', () => reject(new Error('Failed to load amCharts viewer')))
          return
        }
        const script = document.createElement('script')
        script.src = src
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Failed to load amCharts viewer'))
        document.head.appendChild(script)
      })

    let disposed = false

    const init = async () => {
      try {
        // Load amCharts 5 core, map, and geodata directly
        const load = (src: string) => new Promise<void>((resolve, reject) => {
          const s = document.createElement('script')
          s.src = src
          s.async = true
          s.onload = () => resolve()
          s.onerror = () => reject(new Error('Failed to load ' + src))
          document.head.appendChild(s)
        })

        await load('https://cdn.amcharts.com/lib/5/index.js')
        await load('https://cdn.amcharts.com/lib/5/map.js')
        await load('https://cdn.amcharts.com/lib/5/geodata/worldLow.js')
  
        if (disposed) return
        
        const am5 = (window as any).am5
        const am5map = (window as any).am5map
        const am5geodata_worldLow = (window as any).am5geodata_worldLow

        if (!am5 || !am5map || !am5geodata_worldLow) throw new Error('amCharts 5 map libs not available')
        if (!containerRef.current) throw new Error('Container not available')

        // Create root directly on the dedicated chart div to avoid overlay/stacking issues
        const chartContainer = containerRef.current.querySelector('#' + uniqueId) as HTMLDivElement | null
        const root = am5.Root.new(chartContainer || containerRef.current)
        chartRef.current = root

        // Theme (optional): use animated
        root.setThemes([
          am5.Theme.new(root)
        ])
        // Ocean/background (black)
        try {
          root.set('background', am5.Rectangle.new(root, { fill: am5.color(0x0a0a0a), fillOpacity: 1 }))
        } catch {}

        // Create the map chart
        const chart = root.container.children.push(
          am5map.MapChart.new(root, {
            panX: is3D ? 'rotateX' : 'translateX',
            panY: is3D ? 'rotateY' : 'translateY',
            wheelX: 'zoomX',
            wheelY: 'zoomY',
            projection: is3D ? am5map.geoOrthographic() : am5map.geoMercator(),
            pinchZoom: true
          })
        )
        // SIMPLE: Just resize and let amCharts handle the rest
        root.resize()
        // Enable built-in wheel zoom directly on chart
        try { 
          chart.set('wheelX', 'zoomX')
          chart.set('wheelY', 'zoomY')
          chart.set('pinchZoom', true)
        } catch {}

        // Handle wheel zoom manually while preventing page scroll (like Google Maps)
        try {
          const mapContainer = containerRef.current
          if (mapContainer) {
            const handleWheelZoom = (e: WheelEvent) => {
              e.preventDefault()
              e.stopPropagation()
              
              // Manual zoom handling
              try {
                const zoomDirection = e.deltaY > 0 ? -1 : 1
                const zoomFactor = zoomDirection > 0 ? 1.2 : 0.8
                
                // Get current zoom level from chart
                const currentZoom = chart.get('zoomLevel') || 1
                const newZoom = Math.max(0.5, Math.min(32, currentZoom * zoomFactor))
                
                // Apply zoom to chart
                chart.set('zoomLevel', newZoom)
              } catch (zoomError) {
                console.log('Zoom error:', zoomError)
              }
            }
            
            mapContainer.addEventListener('wheel', handleWheelZoom, { passive: false })
            root.events.on('dispose', () => {
              try { mapContainer.removeEventListener('wheel', handleWheelZoom as any) } catch {}
            })
          }
        } catch {}

        // Force render when container size becomes available
        try {
          const targetEl = containerRef.current
          if (targetEl && 'ResizeObserver' in window) {
            const ro = new (window as any).ResizeObserver(() => {
              try { root.resize() } catch {}
            })
            ro.observe(targetEl)
            root.events.on('dispose', () => { try { ro.disconnect() } catch {} })
          }
        } catch {}
        // Zoom controls (match previous UX)
        const zoomControl = am5map.ZoomControl.new(root, {})
        chart.set('zoomControl', zoomControl)
        chart.zoomControl?.set('opacity', 0.9)
        chart.zoomControl?.set('x', am5.p100)
        chart.zoomControl?.set('centerX', am5.p100)

        // Create polygon series
        const polygonSeries = chart.series.push(
          am5map.MapPolygonSeries.new(root, {
            geoJSON: am5geodata_worldLow,
            valueField: 'value'
          })
        )

        // Optional graticule for 3D to enhance globe look
        if (is3D) {
          try {
            const graticule = chart.series.push(
              am5map.GraticuleSeries.new(root, { step: 20 })
            )
            graticule.mapLines.template.setAll({ stroke: am5.color(0x3f3f46), strokeOpacity: 0.2 })
          } catch {}
        }

        // Get countries that have projects - include both existing projects and user projects
        const getCountriesWithProjects = () => {
          const countriesWithProjects = new Set<string>()
          
          // Map project locations to country names
          const mapToCountry: Record<string, string> = {
            'UK': 'United Kingdom',
            'USA': 'United States', 
            'United States': 'United States',
            'United Kingdom': 'United Kingdom',
            'Germany': 'Germany',
            'France': 'France',
            'Netherlands': 'Netherlands',
            'Amsterdam': 'Netherlands',
            'London': 'United Kingdom',
            'Berlin': 'Germany',
            'Paris': 'France'
          }
          
          // Process existing projects
          existingProjects.forEach((project: any) => {
            // Check project country and location fields
            if (project.country) {
              const countryName: string = mapToCountry[project.country] || project.country
              countriesWithProjects.add(countryName)
            }
            if (project.location) {
              Object.keys(mapToCountry).forEach((key: string) => {
                if (project.location.includes(key)) {
                  countriesWithProjects.add(mapToCountry[key])
                }
              })
            }
          })
          
          // Process user projects (new tenders/projects)
          if (userProjects) {
            userProjects.forEach((project: any) => {
              if (project.country) {
                const countryName: string = mapToCountry[project.country] || project.country
                countriesWithProjects.add(countryName)
              }
              if (project.location) {
                Object.keys(mapToCountry).forEach((key: string) => {
                  if (project.location && project.location.includes(key)) {
                    countriesWithProjects.add(mapToCountry[key])
                  }
                })
              }
            })
          }
          
          return countriesWithProjects
        }
        
        const countriesWithProjects = getCountriesWithProjects()
        
        // Tooltip and interactivity
        polygonSeries.mapPolygons.template.setAll({
          tooltipText: '{name}',
          interactive: true,
          strokeOpacity: 0.9,
          strokeWidth: 1.2,
          stroke: am5.color(0x6b7280), // grey border
          fillOpacity: 1,
          fill: am5.color(0x262626) // default land grey
        })
        
        // Highlight countries with projects
        polygonSeries.mapPolygons.template.adapters.add('fill', (fill: any, target: any) => {
          const dataItem = target.dataItem
          const countryName = dataItem?.get?.('name') || dataItem?.dataContext?.name
          if (countryName && countriesWithProjects.has(countryName)) {
            return am5.color(0x3b82f6) // blue highlight for countries with projects
          }
          return am5.color(0x262626) // default grey
        })

        // Hover state
        polygonSeries.mapPolygons.template.states.create('hover', {
          fill: am5.color(0x9ca3af) // light grey hover
        })

        // Click to zoom and open modal for the selected country
        polygonSeries.mapPolygons.template.events.on('click', (ev: any) => {
          const dataItem = ev?.target?.dataItem
          if (!dataItem) return
          try {
            // Smooth zoom to country
            polygonSeries.zoomToDataItem(dataItem)
          } catch {}
          // Determine country name and open modal
          try {
            const name = dataItem.get?.('name') || dataItem.dataContext?.name
            if (name) {
              setSelectedMapCountry(name)
              setIsCountryModalOpen(true)
            }
          } catch {}
        })



      } catch (err) {
        console.error(err)
      }
    }

    // Wait for container to be properly sized, then initialize immediately
    const initializeMap = async () => {
      // Ensure container is ready
      if (container.offsetHeight === 0) {
        container.style.height = '500px'
        container.style.display = 'block'
      }
      
      await init()
    }
    
    // Initialize immediately after DOM setup
    setTimeout(() => {
      initializeMap()
    }, 0)

    return () => {
      disposed = true
      try {
        const root = chartRef.current as any
        if (root && typeof root.dispose === 'function') {
          root.dispose()
        }
      } catch {}
      chartRef.current = null
      document.removeEventListener('fullscreenchange', onFsChange)
      window.removeEventListener('resize', onResize)
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [is3D, isContainerReady, userProjects, existingProjects])

  useEffect(() => {
    // Global pointerup (capture) – opens only when a fresh tooltip name is present and click is inside map
    const onDocPointerUp = (ev: MouseEvent) => {
      if (!containerRef.current) return
      const target = ev.target as Node
      if (!containerRef.current.contains(target)) return // outside map
      const now = Date.now()
      const tipEl = (document.querySelector('.am5-tooltip') as HTMLElement) || (document.querySelector('[role="tooltip"]') as HTMLElement)
      const liveTip = tipEl?.textContent?.trim() || ""
      const candidate = liveTip.length > 1 ? liveTip : hoveredCountryRef.current
      // accept only if recently hovered (avoid stale/opening oceans)
      if (candidate && now - lastHoverTsRef.current < 800) {
        setSelectedMapCountry(candidate)
        setIsCountryModalOpen(true)
      }
    }
    document.addEventListener('pointerup', onDocPointerUp, true)
    return () => {
      document.removeEventListener('pointerup', onDocPointerUp, true)
    }
  }, [])

  return (
    <div 
      className="relative z-[10] overflow-hidden" 
      style={{ height: isFullscreen ? '100vh' : '500px', backgroundColor: '#0a1426' }}
      onMouseMove={(e) => {
        const target = e.target as any
        if (target && (target.tagName === 'path' || target.tagName === 'g' || target.tagName === 'circle')) {
          const tooltip = (document.querySelector('[role="tooltip"]') as HTMLElement)?.textContent ||
                          (document.querySelector('.am5-tooltip') as HTMLElement)?.textContent ||
                          (target.querySelector && target.querySelector('title') ? target.querySelector('title')?.textContent : '') ||
                          target.getAttribute?.('aria-label') ||
                          target.getAttribute?.('data-name') ||
                          (target.parentElement ? target.parentElement.querySelector('title')?.textContent : '') ||
                          ''
          if (tooltip && tooltip.trim().length > 1) {
            const name = tooltip.trim()
            e.currentTarget.setAttribute('data-hovered-country', name)
            hoveredCountryRef.current = name
            lastHoverTsRef.current = Date.now()
            setHoveredName(name)
          } else {
            e.currentTarget.removeAttribute('data-hovered-country')
            hoveredCountryRef.current = ""
            setHoveredName("")
          }
        } else {
          e.currentTarget.removeAttribute('data-hovered-country')
          hoveredCountryRef.current = ""
          setHoveredName("")
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.removeAttribute('data-hovered-country')
        hoveredCountryRef.current = ""
        setHoveredName("")
      }}
      onClick={(e) => {
        // Container click ignored; use the explicit action pill instead
        return
      }}
    >
      <div ref={containerRef} className="absolute inset-0 w-full h-full z-[50]" />
      
      {/* 3D Toggle Button */}
      <button
        onClick={() => {
          setIsModalOpen(false)
          setSelectedCountry('')
          setCountryData(null)
          setIs3D((v) => !v)
        }}
        className={`absolute bottom-1 left-0.5 px-6 py-2 bg-background/90 backdrop-blur text-foreground text-base font-medium rounded-md shadow-md hover:bg-accent hover:text-accent-foreground transition-colors z-[1001] border border-border ${isFullscreen ? 'fixed bottom-0 left-0 rounded-none' : 'absolute bottom-0 left-0 rounded-none'}`}
      >
        {is3D ? '2D' : '3D'}
      </button>

      {/* Hover action pill - appears only when a valid country name is under cursor */}
      {hoveredName && (
        <div className="fixed top-4 right-4 z-[99999]">
              <button 
            onClick={() => {
              setSelectedMapCountry(hoveredName)
              setIsCountryModalOpen(true)
            }}
            className="px-3 py-1.5 text-xs bg-background/95 backdrop-blur border border-border rounded-md shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
            title={`View projects in ${hoveredName}`}
          >
            View projects: {hoveredName}
              </button>
            </div>
      )}
      {/* Debug hovered name (temporary) */}
      {hoveredName && (
        <div className="fixed bottom-4 left-4 z-[99999] text-xs px-2 py-1 bg-black/60 text-white rounded">
          {hoveredName}
        </div>
      )}

    </div>
  )
}

interface ProjectsPageProps {
  comparisonProjects: number[]
  setComparisonProjects: (fn: (prev: number[]) => number[]) => void
  setShowComparison: (show: boolean) => void
  showCreateProject: boolean
  setShowCreateProject: (show: boolean) => void
  createProjectStep: number
  setCreateProjectStep: (step: number) => void
  projectFormData: ProjectFormData
  setProjectFormData: (data: ProjectFormData) => void
  handleCreateProject: () => void
  // Added for tender flow and cards
  userProjects?: Array<{ id: number; name: string; country: string; startDate?: string; endDate?: string; description?: string; sizeBucket?: string }>
  addProject?: (project: any) => void
  addITT?: (itt: any) => void
  addHighlightedCountry?: (country: string) => void
  setActiveTab?: (tab: string) => void
  setShowCreateITT?: (show: boolean) => void
  setIttFormData?: (data: any) => void
  tenderDrafts?: TenderDraft[]
  saveTenderDraft?: (draft: Omit<TenderDraft, 'id' | 'savedAt'>) => TenderDraft
  updateTenderDraft?: (id: number, updater: (prev: TenderDraft) => TenderDraft) => void
  removeTenderDraft?: (id: number) => void
}

export default function ProjectsPage({
  comparisonProjects,
  setComparisonProjects,
  setShowComparison,
  showCreateProject,
  setShowCreateProject,
  createProjectStep,
  setCreateProjectStep,
  projectFormData,
  setProjectFormData,
  handleCreateProject,
  userProjects = [],
  addProject,
  addITT,
  addHighlightedCountry,
  setActiveTab,
  setShowCreateITT,
  setIttFormData,
  tenderDrafts = [],
  saveTenderDraft,
  updateTenderDraft,
  removeTenderDraft
}: ProjectsPageProps) {
  // Tender modal local state
  const [tenderStep, setTenderStep] = useState<1 | 2 | 3 | 4>(1)
  const [selectedCountry, setSelectedCountry] = useState<string>("")
  const [openCreateTender, setOpenCreateTender] = useState(false)
  const [createITTNow, setCreateITTNow] = useState(false)
  const [newMaterial, setNewMaterial] = useState("")
  const [countrySearch, setCountrySearch] = useState("")
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  // Live FX state
  const [localCurrencyCode, setLocalCurrencyCode] = useState<string>("GBP")
  const [fxRateToLocal, setFxRateToLocal] = useState<number>(1)
  const [fxError, setFxError] = useState<string>("")
  const previewRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  
  // All regions modal state
  const [showAllRegionsModal, setShowAllRegionsModal] = useState(false)
  const [regionSearch, setRegionSearch] = useState("")
  
  // Project detail modal state
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  
  // Country modal state for map
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false)
  const [selectedMapCountry, setSelectedMapCountry] = useState('')
  
  // Projects state
  const [existingProjects, setExistingProjects] = useState<any[]>([
    {
      id: 'existing-1',
      name: 'Waterfront Office Complex',
      country: 'UK',
      location: 'London, UK',
      progress: 75,
      score: 94,
      status: 'On Track',
      startDate: '2024-01-15',
      endDate: '2024-12-20',
      description: 'Modern 15-story office complex with sustainable design features',
      budget: '£2.8M',
      sizeBucket: '2000-10000',
      team: 12,
      suppliers: 8,
      issues: 1,
      image: '🏢'
    },
    {
      id: 'existing-2',
      name: 'City Hospital Extension',
      country: 'UK',
      location: 'Manchester, UK',
      progress: 45,
      score: 87,
      status: 'On Track',
      startDate: '2024-03-01',
      endDate: '2025-06-30',
      description: 'Critical care unit expansion with state-of-the-art medical facilities',
      budget: '£4.2M',
      sizeBucket: '10000-50000',
      team: 18,
      suppliers: 12,
      issues: 0,
      image: '🏥'
    },
    {
      id: 'existing-3',
      name: 'Metro Station Upgrade',
      country: 'Germany',
      location: 'Berlin, Germany',
      progress: 92,
      score: 96,
      status: 'Ahead',
      startDate: '2023-11-01',
      endDate: '2024-08-15',
      description: 'Complete renovation of central metro station with accessibility improvements',
      budget: '€1.2M',
      sizeBucket: '500-2000',
      team: 8,
      suppliers: 5,
      issues: 1,
      image: '🚇'
    },
    {
      id: 'existing-4',
      name: 'Cultural Center Restoration',
      country: 'France',
      location: 'Paris, France',
      progress: 68,
      score: 89,
      status: 'On Track',
      startDate: '2024-02-10',
      endDate: '2024-11-30',
      description: 'Historical building restoration preserving architectural heritage',
      budget: '€950K',
      sizeBucket: '500-2000',
      team: 6,
      suppliers: 4,
      issues: 0,
      image: '🏛️'
    },
    {
      id: 'existing-5',
      name: 'Green Housing Project',
      country: 'Netherlands',
      location: 'Amsterdam, Netherlands',
      progress: 55,
      score: 91,
      status: 'On Track',
      startDate: '2024-01-20',
      endDate: '2025-02-28',
      description: 'Sustainable residential complex with renewable energy systems',
      budget: '€1.8M',
      sizeBucket: '2000-10000',
      team: 10,
      suppliers: 7,
      issues: 2,
      image: '🏘️'
    }
  ])
  
  // Map picker state
  const [showMapPicker, setShowMapPicker] = useState(false)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  
  // Map visibility and overlays
  const [showMap, setShowMap] = useState<boolean>(true)
  const [showRegionOverlay, setShowRegionOverlay] = useState<boolean>(true)
  const mapFullscreenRef = useRef<HTMLDivElement | null>(null)

  // Comprehensive list of all countries
  const allCountries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
    "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
    "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
    "Denmark", "Djibouti", "Dominica", "Dominican Republic",
    "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia",
    "Fiji", "Finland", "France",
    "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
    "Haiti", "Honduras", "Hungary",
    "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast",
    "Jamaica", "Japan", "Jordan",
    "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
    "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
    "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
    "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
    "Oman",
    "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
    "Qatar",
    "Romania", "Russia", "Rwanda",
    "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
    "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
    "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
    "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
    "Yemen",
    "Zambia", "Zimbabwe"
  ]

  // Filter countries based on search
  const filteredCountries = allCountries.filter(country =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  )

  // Normalize common country names for API lookup
  const normalizeCountryName = (name: string) => {
    const map: Record<string, string> = {
      UK: 'United Kingdom',
      'U.K.': 'United Kingdom',
      'United Kingdom of Great Britain and Northern Ireland': 'United Kingdom',
      USA: 'United States',
      'U.S.A.': 'United States',
    }
    return map[name] || name
  }

  // Fetch currency for selected country (RestCountries), with graceful fallback
  useEffect(() => {
    const country = normalizeCountryName(selectedCountry || projectFormData.country || '')
    if (!country) return
    let cancelled = false
    const run = async () => {
      try {
        setFxError("")
        // Try fullText exact match first
        let res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fullText=true&fields=currencies`)
        if (!res.ok) {
          // Fallback to non-fullText
          res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fields=currencies`)
        }
        if (!res.ok) throw new Error('country lookup failed')
        const data = await res.json()
        const currencies = data?.[0]?.currencies
        const code = currencies ? Object.keys(currencies)[0] : 'GBP'
        if (!cancelled) setLocalCurrencyCode(code || 'GBP')
      } catch (e) {
        if (!cancelled) {
          setLocalCurrencyCode('GBP')
          setFxError('') // do not show error here; we can still show GBP only
        }
      }
    }
    run()
    return () => { cancelled = true }
  }, [selectedCountry, projectFormData.country])

  // Fetch FX rate GBP -> local currency with robust fallback
  useEffect(() => {
    if (!localCurrencyCode) return
    let cancelled = false
    const run = async () => {
      try {
        setFxError("")
        if (localCurrencyCode === 'GBP') { setFxRateToLocal(1); return }
        // Primary: open.er-api.com
        let res = await fetch(`https://open.er-api.com/v6/latest/GBP`)
        let rate: number | undefined
        if (res.ok) {
          const data = await res.json()
          rate = data?.rates?.[localCurrencyCode]
        }
        // Fallback: exchangerate.host
        if (!rate) {
          const res2 = await fetch(`https://api.exchangerate.host/latest?base=GBP&symbols=${encodeURIComponent(localCurrencyCode)}`)
          if (res2.ok) {
            const data2 = await res2.json()
            rate = data2?.rates?.[localCurrencyCode]
          }
        }
        if (!rate) throw new Error('rate missing')
        if (!cancelled) setFxRateToLocal(rate)
      } catch (e) {
        if (!cancelled) {
          setFxRateToLocal(1)
          setFxError('Live FX unavailable; showing GBP')
        }
      }
    }
    run()
    return () => { cancelled = true }
  }, [localCurrencyCode])

  

  // Initialize map picker
  const initializeMapPicker = () => {
    if (typeof window === 'undefined') return

    // Check if Leaflet is already loaded
    if ((window as any).L) {
      createMap()
      return
    }

    // Load Leaflet CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
    link.crossOrigin = ''
    document.head.appendChild(link)

    // Load Leaflet JS
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
    script.crossOrigin = ''
    script.onload = createMap
    document.head.appendChild(script)
  }

  const createMap = () => {
    const L = (window as any).L
    if (!L) return

    const mapContainer = document.getElementById('map-picker')
    if (!mapContainer) return

    // Clear existing map
    mapContainer.innerHTML = ''

    // Get initial coordinates or default to London
    const initialLat = projectFormData.latitude ? parseFloat(projectFormData.latitude) : 51.5074
    const initialLng = projectFormData.longitude ? parseFloat(projectFormData.longitude) : -0.1278

    // Initialize map
    const map = L.map('map-picker').setView([initialLat, initialLng], 10)
    mapRef.current = map

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    // Add existing marker if coordinates exist
    if (projectFormData.latitude && projectFormData.longitude) {
      const marker = L.marker([initialLat, initialLng]).addTo(map)
      markerRef.current = marker
    }

    // Add click handler
    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng
      
      // Remove existing marker
      if (markerRef.current) {
        map.removeLayer(markerRef.current)
      }

      // Add new marker
      const marker = L.marker([lat, lng]).addTo(map)
      markerRef.current = marker

      // Update form data
      projectFormData.latitude = lat.toFixed(6)
      projectFormData.longitude = lng.toFixed(6)
      setProjectFormData({ ...projectFormData })
    })
  }

  // Initialize map when modal opens
  useEffect(() => {
    if (showMapPicker) {
      setTimeout(initializeMapPicker, 100)
    } else {
      // Clean up map when modal closes
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
      }
    }
  }, [showMapPicker])



  // Calculate dynamic regional stats
  const calculateRegionalStats = () => {
    const allProjects = [...existingProjects, ...userProjects]
    const regionMap = new Map()

    // Initialize with existing regions
    regionData.forEach(region => {
      regionMap.set(region.region, { ...region, activeProjects: 0 })
    })

    // Count projects by country
    allProjects.forEach(project => {
      const country = project.country
      if (regionMap.has(country)) {
        const current = regionMap.get(country)
        regionMap.set(country, { 
          ...current, 
          activeProjects: current.activeProjects + 1,
          color: current.color
        })
              } else {
        // Add new countries
        regionMap.set(country, {
          region: country,
          color: '#3B82F6', // Default blue
          performance: 'Good',
          projectsOnTime: 85,
          avgITTResponse: 3,
          supplierQuality: 4.2,
          budgetUsage: 78,
          activeProjects: 1,
          totalProjects: 1
        })
      }
    })

    return Array.from(regionMap.values()).filter(region => region.activeProjects > 0)
  }

    // Simple country info display instead of buggy globe
  const getCountryInfo = (country: string) => {
    const countryData: { [key: string]: { flag: string; region: string; emoji: string } } = {
      "United States": { flag: "🇺🇸", region: "North America", emoji: "🏢" },
      "United Kingdom": { flag: "🇬🇧", region: "Europe", emoji: "🏰" },
      "Germany": { flag: "🇩🇪", region: "Europe", emoji: "🏭" },
      "France": { flag: "🇫🇷", region: "Europe", emoji: "🗼" },
      "Canada": { flag: "🇨🇦", region: "North America", emoji: "🍁" },
      "Australia": { flag: "🇦🇺", region: "Oceania", emoji: "🦘" },
      "Japan": { flag: "🇯🇵", region: "Asia", emoji: "🏯" },
      "China": { flag: "🇨🇳", region: "Asia", emoji: "🏮" },
      "India": { flag: "🇮🇳", region: "Asia", emoji: "🕌" },
      "Brazil": { flag: "🇧🇷", region: "South America", emoji: "🌴" },
      "Netherlands": { flag: "🇳🇱", region: "Europe", emoji: "🌷" },
      "Spain": { flag: "🇪🇸", region: "Europe", emoji: "🏛️" },
      "Italy": { flag: "🇮🇹", region: "Europe", emoji: "🍝" },
      "Switzerland": { flag: "🇨🇭", region: "Europe", emoji: "🏔️" },
      "Singapore": { flag: "🇸🇬", region: "Asia", emoji: "🏙️" },
      "United Arab Emirates": { flag: "🇦🇪", region: "Middle East", emoji: "🏗️" },
      "South Korea": { flag: "🇰🇷", region: "Asia", emoji: "🏢" },
      "Mexico": { flag: "🇲🇽", region: "North America", emoji: "🌮" },
      "Norway": { flag: "🇳🇴", region: "Europe", emoji: "⛰️" },
      "Sweden": { flag: "🇸🇪", region: "Europe", emoji: "🌲" },
    }
    
    return countryData[country] || { 
      flag: "🌍", 
      region: "Global", 
      emoji: "🏗️" 
    }
  }

  const handleCreateTender = () => {
    // Create the project/tender and add it to existing projects (Projects in Progress)
    const newProject = {
      id: Date.now(),
      name: projectFormData.name || 'New Tender',
      location: selectedCountry || projectFormData.country || 'Global',
      country: selectedCountry || projectFormData.country || 'Global',
      progress: 0,
      budget: parseInt(projectFormData.budget?.replace(/[^\d]/g, '') || '0') || 50000,
      spent: 0,
      status: 'On Track',
      deadline: projectFormData.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      satisfaction: 85,
      size: projectFormData.size || 'Medium',
      score: 85,
      team: projectFormData.team || ['Project Manager', 'Site Engineer'],
      suppliers: 0,
      issuesReported: 0,
      reworkCost: 0,
      image: '🏗️',
      riskScore: 25,
      materials: projectFormData.materials || [],
      tradeCategories: projectFormData.tradeCategories || []
    }
    
    // Add to existing projects (Projects in Progress)
    setExistingProjects && setExistingProjects(prev => [newProject, ...prev])
    
    // Also add to user projects for backward compatibility
    addProject && addProject({ 
      name: projectFormData.name || 'New Tender', 
      country: selectedCountry, 
      startDate: projectFormData.startDate, 
      endDate: projectFormData.endDate, 
      description: projectFormData.description, 
      sizeBucket: projectFormData.size 
    })
    
    // Add highlighted country for map
    if (selectedCountry) addHighlightedCountry && addHighlightedCountry(selectedCountry)
    
    // Automatically create an ITT entry for this tender
    if (addITT) {
      const newITT = {
        id: Date.now(),
        project: projectFormData.name || 'New Tender',
        category: 'General Construction',
        status: 'Draft',
        created: new Date().toISOString().split('T')[0],
        deadline: projectFormData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        suppliers: [],
        responses: 0,
        budget: parseInt(projectFormData.budget?.replace(/[^\d]/g, '') || '0') || 50000,
        region: selectedCountry || projectFormData.country || 'Global'
      }
      addITT(newITT)
    }
    
    // Pre-fill ITT form data for potential additional ITT creation
    setIttFormData && setIttFormData((prev: any) => ({
      ...prev,
      project: projectFormData.name,
      region: (selectedCountry || projectFormData.country || '').toLowerCase(),
      materials: projectFormData.materials || [],
      compliance: projectFormData.compliance || [],
      specialRequirements: projectFormData.specialRequirements || ''
    }))
    
    // Navigate to ITT Manager and optionally open the create ITT modal
    setActiveTab && setActiveTab('itt-manager')
    if (createITTNow) {
      setShowCreateITT && setShowCreateITT(true)
    }
    
    // Close modal and reset form
    setOpenCreateTender(false)
    setTenderStep(1)
    setSelectedCountry("")
    setProjectFormData({
      name: "",
      location: "",
      country: "",
      startDate: "",
      endDate: "",
      description: "",
      budget: "",
      size: "",
      template: "",
      materials: [],
      tradeCategories: [],
      specialRequirements: "",
      compliance: [],
      team: [],
      autoGenerateITT: false,
      createTeamsChannel: false,
      setupFolders: false
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
                  <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">Comprehensive project management and analytics</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {comparisonProjects.length > 1 && (
          <Button
            variant="outline"
            onClick={() => setShowComparison(true)}
            className="flex items-center gap-2 h-11 px-4 rounded-xl hover:bg-accent hover:text-accent-foreground border-border"
          >
            <BarChart3 className="h-4 w-4" />
            Compare ({comparisonProjects.length})
          </Button>
        )}
        
        <Dialog open={openCreateTender} onOpenChange={setOpenCreateTender}>
          <DialogTrigger asChild>
            <Button className="h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setOpenCreateTender(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Tender
            </Button>
          </DialogTrigger>
          
                     <DialogContent className="w-[60vw] max-w-4xl h-[75vh] !max-w-none bg-card border border-border dark:bg-background/80 backdrop-blur-md flex flex-col" style={{ width: '60vw', maxWidth: '900px', zIndex: 50 }} onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
            <DialogHeader className="border-b border-border pb-4 bg-card/50 rounded-t-lg flex-shrink-0">
              <div className="flex items-center justify-between">
                {/* Left Side - Title */}
                <div>
                  <DialogTitle className="text-2xl font-bold text-foreground">
                    🚀 Create New Tender
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">Complete all steps to create your tender</DialogDescription>
                </div>
                
                {/* Right Side - Progress Stepper */}
                <div className="flex items-center gap-3">
                  {/* Mini Stepper */}
                  <div className="flex items-center gap-2">
                    {[1,2,3].map((step, index) => (
                      <div key={step} className="flex items-center">
                        <button
                          onClick={() => setTenderStep(step as 1|2|3|4)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                            step === tenderStep 
                              ? 'bg-primary text-primary-foreground scale-110 shadow-lg' 
                              : step < tenderStep 
                                ? 'bg-green-500 text-white shadow-md' 
                                : 'bg-muted text-muted-foreground border border-border hover:bg-accent hover:text-accent-foreground'
                          }`}
                        >
                          {step < tenderStep ? '✓' : step}
                        </button>
                        {index < 3 && (
                          <div className={`w-4 h-1 mx-1 rounded-full transition-all duration-500 ${step < tenderStep ? 'bg-green-500' : 'bg-border'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Percentage */}
                  <div className="text-right">
                    <span className="text-2xl font-black text-primary">
                      {Math.round((tenderStep/4)*100)}%
                    </span>
                    <div className="text-xs text-muted-foreground font-medium">complete</div>
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* Form Content */}
            <div className="flex-1 py-4 overflow-y-auto">
              <div className="flex gap-6">
                {/* Left Side - Form */}
              <div className="flex-1 space-y-4">
                {tenderStep === 1 && (
                    <div className="space-y-3">
                      <div className="mb-3 p-4 bg-card rounded-lg border border-border">
                        <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                          📋 Project Details
                        </h3>
                        <p className="text-muted-foreground text-sm">Essential project information (2x2 grid)</p>
                      </div>
                      
                                            {/* Compact 2x2 Grid - Better Readability */}
                      <div className="max-w-lg">
                  <div className="grid grid-cols-2 gap-4">
                          {/* Row 1: Country & Project Name */}
                  <div className="space-y-2">
                            <label className="text-base font-bold text-foreground flex items-center gap-1">
                              🌍 Country <span className="text-destructive">*</span>
                            </label>
                            <div className="relative">
                              <Input
                                value={selectedCountry || countrySearch}
                                onChange={(e) => {
                                  const value = e.target.value
                                  setCountrySearch(value)
                                  setShowCountryDropdown(true)
                                  if (!value) {
                                    setSelectedCountry("")
                                    setProjectFormData({ ...projectFormData, country: "" })
                                  }
                                }}
                                onFocus={() => {
                                  if (!selectedCountry) {
                                    setShowCountryDropdown(true)
                                  }
                                }}
                                onBlur={() => {
                                  setTimeout(() => setShowCountryDropdown(false), 200)
                                }}
                                className="h-12 w-full text-base"
                                placeholder="🔍 Search..."
                              />
                              
                              {/* Country Dropdown */}
                              {showCountryDropdown && !selectedCountry && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto z-50">
                                  {filteredCountries.length > 0 ? (
                                    filteredCountries.map((country) => (
                                      <button
                                        key={country}
                                        type="button"
                                        className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground transition-colors border-b border-border/30 last:border-b-0 text-base"
                                        onClick={() => {
                                          setSelectedCountry(country)
                                          setProjectFormData({ ...projectFormData, country })
                                          setCountrySearch("")
                                          setShowCountryDropdown(false)
                                        }}
                                      >
                                        🌍 {country}
                                      </button>
                                    ))
                                  ) : countrySearch ? (
                                    <div className="px-3 py-2 text-muted-foreground text-base">
                                      No countries found
                  </div>
                                  ) : (
                                    <div className="px-3 py-2 text-muted-foreground text-base">
                                      Type to search...
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {selectedCountry && (
                                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedCountry("")
                                      setProjectFormData({ ...projectFormData, country: "" })
                                      setCountrySearch("")
                                    }}
                                    className="text-muted-foreground hover:text-destructive text-base"
                                  >
                                    ❌
                                  </button>
                                </div>
                              )}
                            </div>
                  </div>
                          
                  <div className="space-y-2">
                            <label className="text-base font-bold text-foreground flex items-center gap-1">
                              📝 Project Name <span className="text-destructive">*</span>
                            </label>
                            <Input 
                              className="h-12 w-full text-base" 
                              value={projectFormData.name} 
                              onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })} 
                              placeholder="Project name" 
                            />
                  </div>

                  {/* Client dropdown with creatable input */}
                  <div className="space-y-2 col-span-2">
                    <label className="text-base font-bold text-foreground flex items-center gap-1">
                      🧑‍💼 Client
                    </label>
                    <CreatableInput
                      value={projectFormData.client || ''}
                      onChange={(v) => setProjectFormData({ ...projectFormData, client: v })}
                      placeholder="Select or type to add a client"
                      suggestions={[
                        'Google','Amazon','ARS','AWS','Microsoft','NewCold','Smartparc','Lidl','Iron Mountain','Jet 2','Rolls Royce','Tritax','GLP','Greggs','Pfizer'
                      ]}
                    />
                  </div>
                          
                  <div className="space-y-2">
                            <label className="text-base font-bold text-foreground flex items-center gap-1">
                              📍 Project Location <span className="text-destructive">*</span>
                            </label>
                            <div className="space-y-2">
                              <Input 
                                className="h-12 w-full text-base" 
                                value={projectFormData.location} 
                                onChange={(e) => setProjectFormData({ ...projectFormData, location: e.target.value })} 
                                placeholder="Enter address or location" 
                              />
                              <Button 
                                type="button"
                                variant="outline"
                                className="h-10 px-4 text-sm"
                                onClick={() => setShowMapPicker(true)}
                              >
                                🗺️ Drop Pin on Map
                              </Button>
                              {projectFormData.latitude && projectFormData.longitude && (
                                <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200">
                                  📍 Coordinates: {projectFormData.latitude}, {projectFormData.longitude}
                                </div>
                              )}
                            </div>
                  </div>
                          
                          {/* Row 2: Start Date & End Date */}
                  <div className="space-y-2">
                            <label className="text-base font-bold text-foreground flex items-center gap-1">
                              🗓️ Start Date
                            </label>
                            <Input 
                              className="h-12 w-full text-base" 
                              type="date" 
                              value={projectFormData.startDate} 
                              onChange={(e) => setProjectFormData({ ...projectFormData, startDate: e.target.value })} 
                            />
                  </div>
                          
                  <div className="space-y-2">
                            <label className="text-base font-bold text-foreground flex items-center gap-1">
                              🏁 End Date
                            </label>
                            <Input 
                              className="h-12 w-full text-base" 
                              type="date" 
                              value={projectFormData.endDate} 
                              onChange={(e) => setProjectFormData({ ...projectFormData, endDate: e.target.value })} 
                            />
                  </div>
                        </div>
                        
                        {/* Description below the 2x2 grid */}
                        <div className="space-y-2 mt-4">
                          <label className="text-base font-bold text-foreground flex items-center gap-1">
                            💭 Project Description
                          </label>
                          <Textarea 
                            className="w-full min-h-[80px] text-base" 
                            value={projectFormData.description} 
                            onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })} 
                            placeholder="Brief project description..." 
                          />
                  </div>
                  </div>
                </div>
                )}

                {tenderStep === 2 && (
                  <div className="space-y-4">
                      <div className="mb-4 p-4 bg-card rounded-xl border border-border">
                        <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                          💰 Scope and Value
                        </h3>
                        <p className="text-muted-foreground text-sm">Define the project scope and financial details</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-base font-bold text-foreground flex items-center gap-1">
                              💷 Estimated Value
                            </label>
                            {(() => {
                              // Simple country->currency mapping and rough GBP conversion factors
                              const countryToCurrency: Record<string, { code: string; symbol: string; ratePerGBP: number }> = {
                                'United Kingdom': { code: 'GBP', symbol: '£', ratePerGBP: 1 },
                                'UK': { code: 'GBP', symbol: '£', ratePerGBP: 1 },
                                'Germany': { code: 'EUR', symbol: '€', ratePerGBP: 1.17 },
                                'France': { code: 'EUR', symbol: '€', ratePerGBP: 1.17 },
                                'Netherlands': { code: 'EUR', symbol: '€', ratePerGBP: 1.17 },
                                'Spain': { code: 'EUR', symbol: '€', ratePerGBP: 1.17 },
                                'United States': { code: 'USD', symbol: '$', ratePerGBP: 1.25 },
                                'USA': { code: 'USD', symbol: '$', ratePerGBP: 1.25 },
                                'Albania': { code: 'ALL', symbol: 'L', ratePerGBP: 125 },
                              }
                              const country = (selectedCountry || projectFormData.country || 'UK') as string
                              const curInfo = countryToCurrency[country] || { code: 'GBP', symbol: '£', ratePerGBP: 1 }
                              const gbpValue = parseFloat(projectFormData.budget || '0') || 0
                              const fmt = (n: number, c: string) => new Intl.NumberFormat(undefined, { style: 'currency', currency: c }).format(n)
                              const localVal = gbpValue * curInfo.ratePerGBP
                              return (
                                <>
                                  <div className="flex gap-2 items-center">
                                    <div className="h-12 w-28 flex items-center justify-center rounded-md border border-border bg-muted/30 text-sm">£ GBP</div>
                                    <Input
                                      className="h-12 text-base flex-1"
                                      value={projectFormData.budget}
                                      onChange={(e) => {
                                        const raw = e.target.value.replace(/[^0-9.]/g, '')
                                        setProjectFormData({ ...projectFormData, budget: raw })
                                      }}
                                      placeholder="£ e.g. 250,000"
                                      inputMode="decimal"
                                    />
                                  </div>
                                  {projectFormData.budget && (
                                    <div className="text-sm text-muted-foreground">
                                      {fxError ? (
                                        <>£ {Number(projectFormData.budget).toLocaleString()} GBP</>
                                      ) : (
                                        <>
                                          {new Intl.NumberFormat(undefined, { style: 'currency', currency: localCurrencyCode }).format((parseFloat(projectFormData.budget || '0') || 0) * fxRateToLocal)} ({country}) • {fmt(parseFloat(projectFormData.budget || '0') || 0, 'GBP')} GBP
                                        </>
                                      )}
                                    </div>
                                  )}
                                </>
                              )
                            })()}
                          </div>

                          {/* Type (creatable) and Estimated Size */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-base font-bold text-foreground flex items-center gap-1">Type <span className="text-destructive">*</span></label>
                              <CreatableInput
                                value={projectFormData.type || ''}
                                onChange={(v) => setProjectFormData({ ...projectFormData, type: v })}
                                placeholder="Select or type a project type"
                                suggestions={[
                                  'Datacentre','Logistics','Aerospace','High Tech','Food Processing','Cold Store','Pharmaceuticals'
                                ]}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-base font-bold text-foreground flex items-center gap-1">Estimated Size (sqm)</label>
                              <Input
                                className="h-12 text-base"
                                value={projectFormData.estimatedSizeSqm || ''}
                                onChange={(e) => setProjectFormData({ ...projectFormData, estimatedSizeSqm: e.target.value.replace(/[^0-9.]/g,'') })}
                                placeholder="e.g. 7,500"
                                inputMode="decimal"
                              />
                            </div>
                          </div>
                        </div>
                        
                    <div className="space-y-2">
                          <label className="text-base font-bold text-foreground flex items-center gap-1">
                            ⚡ Special Requirements
                          </label>
                          <Textarea 
                            className="min-h-[120px] text-base" 
                            value={projectFormData.specialRequirements} 
                            onChange={(e) => setProjectFormData({ ...projectFormData, specialRequirements: e.target.value })} 
                            placeholder="📋 Any special requirements, compliance needs, or additional notes..." 
                          />
                        </div>
                    </div>
                  </div>
                )}

                  {/* Step 3 removed */}

                  {tenderStep === 3 && (
                    <div className="space-y-3">
                      <div className="p-3 bg-card rounded-lg border border-border">
                        <h3 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">📝 Review & Submit</h3>
                        <p className="text-xs md:text-sm text-muted-foreground">Complete summary of your tender</p>
                      </div>

                      <div className="bg-card border border-border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <ReviewRow label="Project Name" value={projectFormData.name || '—'} />
                          <ReviewRow label="Client" value={projectFormData.client || '—'} />
                          <ReviewRow label="Country" value={selectedCountry || projectFormData.country || '—'} />
                          <ReviewRow label="Location" value={projectFormData.location || '—'} />
                          <ReviewRow label="Start Date" value={projectFormData.startDate || '—'} />
                          <ReviewRow label="End Date" value={projectFormData.endDate || '—'} />
                          <ReviewRow label="Type" value={projectFormData.type || '—'} />
                          {/* Project Size removed per request */}
                          <ReviewRow label="Estimated Size (sqm)" value={projectFormData.estimatedSizeSqm || '—'} />
                          <div className="space-y-1">
                            <div className="text-xs font-semibold text-muted-foreground uppercase">Estimated Value</div>
                            <div className="text-sm font-bold text-foreground">
                              {(() => {
                                const gbpVal = parseFloat(projectFormData.budget || '0') || 0
                                const gbpStr = new Intl.NumberFormat(undefined, { style:'currency', currency:'GBP'}).format(gbpVal)
                                const localStr = new Intl.NumberFormat(undefined, { style:'currency', currency: localCurrencyCode }).format(gbpVal * fxRateToLocal)
                                return fxError ? gbpStr : `${localStr} (${selectedCountry || projectFormData.country || 'Local'}) • ${gbpStr} GBP`
                              })()}
                            </div>
                          </div>
                        </div>

                        {projectFormData.description && (
                          <div className="mt-3">
                            <div className="text-xs font-semibold text-muted-foreground uppercase">Description</div>
                            <div className="text-sm text-foreground leading-relaxed">{projectFormData.description}</div>
                          </div>
                        )}
                        {projectFormData.specialRequirements && (
                          <div className="mt-3">
                            <div className="text-xs font-semibold text-muted-foreground uppercase">Special Requirements</div>
                            <div className="text-sm text-foreground leading-relaxed">{projectFormData.specialRequirements}</div>
                          </div>
                        )}
                        {projectFormData.latitude && projectFormData.longitude && (
                          <div className="mt-3">
                            <div className="text-xs font-semibold text-muted-foreground uppercase">Coordinates</div>
                            <div className="text-sm text-foreground">📍 {projectFormData.latitude}, {projectFormData.longitude}</div>
                          </div>
                        )}
                      </div>

                      <div className="bg-card border border-border rounded-lg p-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" className="w-5 h-5 text-primary mt-0.5 rounded focus:ring-primary" checked={createITTNow} onChange={(e) => setCreateITTNow(e.target.checked)} />
                          <div>
                            <div className="text-sm md:text-base font-bold text-foreground flex items-center gap-2">🚀 Create ITT immediately</div>
                            <p className="text-xs md:text-sm text-muted-foreground">Automatically create and assign an Invitation to Tender after submission</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                                {/* Right Side - Country Preview */}
                <div className="w-96 flex-shrink-0">
                  <div className="sticky top-6">
                    <div className="bg-card rounded-xl border border-border p-6">
                      <h4 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        🌍 Country Preview
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      </h4>
                      
                      {projectFormData.latitude && projectFormData.longitude ? (
                        <div className="p-8 bg-card rounded-xl border border-border">
                          <div className="space-y-4">
                            <div className="relative">
                              <iframe 
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(projectFormData.longitude)-0.01},${parseFloat(projectFormData.latitude)-0.01},${parseFloat(projectFormData.longitude)+0.01},${parseFloat(projectFormData.latitude)+0.01}&layer=mapnik&marker=${projectFormData.latitude},${projectFormData.longitude}`}
                                width="100%"
                                height="288"
                                frameBorder="0"
                                scrolling="no"
                                marginHeight={0}
                                marginWidth={0}
                                className="rounded-lg border border-green-300 shadow-sm"
                                title="Location Map"
                              />
                              <div className="absolute top-3 right-3">
                                <div className="bg-red-500 text-white text-sm px-3 py-1 rounded-full shadow-lg">
                                  📍
                              </div>
                            </div>
                            <div className="absolute bottom-3 left-3">
                              <a 
                                href={`https://www.openstreetmap.org/?mlat=${projectFormData.latitude}&mlon=${projectFormData.longitude}#map=14/${projectFormData.latitude}/${projectFormData.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-primary hover:opacity-90 text-primary-foreground text-sm px-3 py-1 rounded shadow-sm transition-colors"
                              >
                                View Full
                              </a>
                            </div>
                          </div>
                          
                          <div className="text-sm text-green-500 font-mono bg-green-500/10 p-3 rounded border border-green-500/30 text-center">
                            Lat: {projectFormData.latitude} | Lng: {projectFormData.longitude}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-80 bg-card rounded-xl border-2 border-dashed border-border flex items-center justify-center">
                          <div className="text-center text-muted-foreground p-6">
                            <div className="text-6xl mb-4">🌍</div>
                            <h5 className="text-lg font-bold text-foreground mb-2">Select a Country</h5>
                            <p className="text-sm font-medium mb-2">Choose your project location</p>
                            <p className="text-xs text-muted-foreground">🔍 Search from 195+ countries worldwide</p>
                          </div>
                        </div>
                      )}
                    </div>
                    </div>
                  </div>
                </div>
              </div>

            {/* Bottom Actions */}
            <div className="border-t border-border pt-4 mt-4 flex-shrink-0">
              <div className="flex items-center justify-between px-2">
                <Button 
                  variant="outline" 
                  className="h-14 px-8 text-base" 
                  onClick={() => {
                    const draft = {
                      currentStep: tenderStep as 1|2|3,
                      selectedCountry,
                      formData: projectFormData
                    }
                    if (saveTenderDraft) saveTenderDraft(draft as any)
                    setOpenCreateTender(false)
                  }}
                >
                  💾 Save for Later
                </Button>
                
                <div className="flex items-center gap-3">
                  {tenderStep > 1 && (
                    <Button 
                      variant="outline" 
                      className="h-14 px-8 text-base" 
                      onClick={() => setTenderStep((prev) => (prev - 1) as any)}
                    >
                      ← Back
                    </Button>
                  )}
                  
                  {tenderStep < 3 ? (
                    <Button 
                      className="h-14 px-10 text-base" 
                      onClick={() => {
                        // Validation for step 1 - country is required
                        if (tenderStep === 1 && !selectedCountry) {
                          alert('🌍 Please select a country/region before continuing!')
                          return
                        }
                        setTenderStep((prev) => (prev + 1) as any)
                      }}
                    >
                      Next → ✨
                    </Button>
                  ) : (
                    <Button 
                      className="h-14 px-10 text-base" 
                      onClick={handleCreateTender}
                    >
                      🚀 Create Tender
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Tenders (Drafts) */}
      {tenderDrafts.length > 0 && (
        <div className="bg-background/80 backdrop-blur-md rounded-2xl shadow-sm border border-border p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground">Pending Tenders</h2>
            <p className="text-sm text-muted-foreground">Resume editing saved drafts</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tenderDrafts.map((d) => (
              <Card key={d.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{d.formData.name || 'Untitled Tender'}</CardTitle>
                  <CardDescription className="text-sm">{d.selectedCountry || d.formData.country || '-'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs text-muted-foreground">Saved {new Date(d.savedAt).toLocaleString()}</div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => {
                      setProjectFormData(d.formData)
                      setSelectedCountry(d.selectedCountry)
                      setTenderStep(d.currentStep)
                      setOpenCreateTender(true)
                    }}>Resume</Button>
                    <Button size="sm" variant="outline" onClick={() => removeTenderDraft && removeTenderDraft(d.id)}>Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

             {/* New Projects Awaiting ITT Assignment */}
      {userProjects.length > 0 && (
         <div className="bg-background/80 backdrop-blur-md rounded-2xl shadow-sm border border-border p-6">
           <div className="mb-4">
             <h2 className="text-lg font-semibold text-foreground">🚀 New Projects - ITT Assignment Required</h2>
             <p className="text-sm text-muted-foreground">Recently created projects that need ITT assignment</p>
           </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userProjects.map((p) => (
               <Card 
                 key={p.id} 
                 className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500 cursor-pointer hover:bg-accent/5"
                 onClick={() => {
                   setSelectedProject(p)
                   setShowProjectModal(true)
                 }}
               >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base leading-tight">{p.name}</CardTitle>
                       <CardDescription className="text-sm flex items-center gap-1">
                         🌍 {p.country}
                       </CardDescription>
                     </div>
                     <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                       New
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {p.description && <div className="text-sm text-muted-foreground line-clamp-3">{p.description}</div>}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{p.startDate || '-'} → {p.endDate || '-'}</span>
                  <span>{p.sizeBucket || ''}</span>
                </div>
                <div className="flex items-center gap-2 pt-2">
                     <Button variant="outline" className="h-9 w-full" onClick={() => {
                    setIttFormData && setIttFormData((prev: any) => ({ ...prev, project: p.name, region: (p.country || '').toLowerCase() }))
                    setActiveTab && setActiveTab('itt-manager')
                    setShowCreateITT && setShowCreateITT(true)
                  }}>
                    <FileText className="h-4 w-4 mr-2" />
                       Assign ITT
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
           </div>
        </div>
      )}

      {/* Interactive World Map */}
      <div className="bg-background/80 backdrop-blur-md rounded-2xl shadow-sm border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              🌍 Global Performance Heatmap
            </h2>
            <p className="text-muted-foreground text-sm mt-1">Interactive world map showing regional project performance</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-3 rounded-lg border-border hover:bg-accent hover:text-accent-foreground"
              onClick={() => setShowMap(!showMap)}
            >
              {showMap ? 'Hide Map' : 'Show Map'}
            </Button>
            <Button variant="outline" size="sm" className="h-9 px-3 rounded-lg border-border hover:bg-accent hover:text-accent-foreground">
              Clear Filter
            </Button>
          </div>
        </div>
        
        {/* Working amCharts World Map from WorldMapPage with overlay */}
        <div ref={mapFullscreenRef} className={`relative transition-all duration-300 ease-in-out ${showMap ? 'opacity-100 max-h-screen' : 'opacity-0 max-h-0 overflow-hidden'}`}>
        <WorldMapCanvas 
          existingProjects={existingProjects} 
          userProjects={userProjects}
          setSelectedProject={setSelectedProject}
          setShowProjectModal={setShowProjectModal}
          setSelectedMapCountry={setSelectedMapCountry}
          setIsCountryModalOpen={setIsCountryModalOpen}
        />
        

        

          {/* Fullscreen button */}
          <button
            className="absolute top-3 right-3 bg-background/90 backdrop-blur px-3 py-1.5 rounded-md border border-border text-xs text-foreground hover:bg-accent hover:text-accent-foreground shadow-sm"
            onClick={() => {
              const el = mapFullscreenRef.current
              if (!el) return
              if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {})
              } else {
                el.requestFullscreen?.().catch(() => {})
              }
            }}
          >
            Full Screen
          </button>
          {/* Regional Overview Overlay (bottom-right) */}
          <div className="pointer-events-auto absolute bottom-4 right-4 w-64 max-w-full">
            <div className="bg-background/80 backdrop-blur-md rounded-xl border border-border shadow-lg overflow-hidden">
              <div className="px-2.5 py-1.5 border-b border-border flex items-center justify-between gap-2">
                <div className="text-[11px] font-semibold text-foreground">Regional Overview</div>
                <div className="flex items-center gap-2">
                  <div className="text-[10px] text-muted-foreground hidden sm:block">
                    {calculateRegionalStats().reduce((sum, r) => sum + r.activeProjects, 0)} projects • {calculateRegionalStats().length} regions
              </div>
                  <button
                    onClick={() => setShowRegionOverlay(!showRegionOverlay)}
                    className="text-[10px] px-2 py-0.5 rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                    aria-label={showRegionOverlay ? 'Minimize' : 'Expand'}
                  >
                    {showRegionOverlay ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              {showRegionOverlay && (
                <>
                  <div className="max-h-48 overflow-auto">
                    {calculateRegionalStats()
                      .sort((a, b) => b.activeProjects - a.activeProjects)
                      .map((region) => (
                        <div key={region.region} className="px-2.5 py-1.5 text-[11px] flex items-center justify-between border-b last:border-b-0 border-border/30">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: region.color }} />
                            <span className="text-foreground truncate" title={region.region}>{region.region}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {region.projectsOnTime && (
                              <span className="text-green-500 tabular-nums">{region.projectsOnTime}%</span>
                            )}
                            <span className="text-foreground font-medium tabular-nums">{region.activeProjects}</span>
              </div>
            </div>
          ))}
        </div>
                  {calculateRegionalStats().length > 8 && (
                    <div className="px-2.5 py-1.5 bg-muted/30 flex items-center justify-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 px-3 text-[11px] border-border hover:bg-accent hover:text-accent-foreground"
                        onClick={() => setShowAllRegionsModal(true)}
                      >
                        View All
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Compact Regional Stats Summary (moved into overlay above) */}
      </div>

      {/* Existing Projects In Progress */}
               <div className="bg-background/80 backdrop-blur-md rounded-2xl shadow-sm border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">📋 Tenders in Progress</h2>
            

          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9 px-3 rounded-lg border-border hover:bg-accent hover:text-accent-foreground"
            onClick={() => window.open('https://google.com', '_blank')}
          >
            View All
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {existingProjects.map((project) => (
            <Card 
              key={project.id} 
              className="hover:shadow-md transition-shadow cursor-pointer hover:bg-accent/5"
              onClick={() => {
                setSelectedProject(project)
                setShowProjectModal(true)
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{project.image}</div>
                    <div>
                      <CardTitle className="text-base leading-tight">{project.name}</CardTitle>
                      <CardDescription className="text-sm">{project.location}</CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      project.score >= 90 ? 'text-green-600' : 
                      project.score >= 80 ? 'text-blue-600' : 
                      project.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {project.score}/100
                    </div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Progress</span>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      project.status === 'On Track' ? 'bg-green-100 text-green-700' :
                      project.status === 'Ahead' ? 'bg-blue-100 text-blue-700' :
                      project.status === 'Delayed' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {project.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{project.progress}%</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">👥</span>
                    <span>{project.team}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">🏢</span>
                    <span>{project.suppliers}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">Due: {project.endDate}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Value:</span>
                    <span className="text-xs font-medium">{project.budget}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* All Regions Modal */}
      <Dialog open={showAllRegionsModal} onOpenChange={setShowAllRegionsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              🌍 All Regions ({calculateRegionalStats().length})
            </DialogTitle>
            <DialogDescription>
              Browse and filter all regions with active projects
            </DialogDescription>
          </DialogHeader>
          
          {/* Search Bar */}
          <div className="mb-4">
            <Input
              placeholder="Search regions..."
              value={regionSearch}
              onChange={(e) => setRegionSearch(e.target.value)}
              className="w-full"
            />
          </div>
          
          {/* Regions Grid */}
          <div className="overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {calculateRegionalStats()
                .filter(region => 
                  region.region.toLowerCase().includes(regionSearch.toLowerCase())
                )
                .sort((a, b) => b.activeProjects - a.activeProjects)
                .map((region) => (
                <div key={region.region} className="bg-background rounded-lg border border-border p-4 hover:shadow-md transition-all duration-200 hover:border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full shadow-sm" 
                        style={{ backgroundColor: region.color }}
                      />
                      <span className="font-semibold text-sm text-foreground">{region.region}</span>
                    </div>
                    <div className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                      {region.activeProjects}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Active Projects</span>
                      <span className="font-medium text-foreground">{region.activeProjects}</span>
                    </div>
                    
                    {region.totalProjects && region.totalProjects > region.activeProjects && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Total Projects</span>
                        <span className="font-medium text-foreground">{region.totalProjects}</span>
                      </div>
                    )}
                    
                    {region.projectsOnTime && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">On Time</span>
                        <span className="font-medium text-green-600">{region.projectsOnTime}%</span>
                      </div>
                    )}
                    
                    {region.budgetUsage && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Budget Usage</span>
                        <span className="font-medium text-blue-600">{region.budgetUsage}%</span>
                      </div>
                    )}
                  </div>
                  
                  {region.performance && (
                    <div className="mt-3 pt-2 border-t border-neutral-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Performance</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          region.performance === 'Excellent' ? 'bg-green-100 text-green-700' :
                          region.performance === 'Great' ? 'bg-blue-100 text-blue-700' :
                          region.performance === 'Good' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-muted text-foreground'
                        }`}>
                          {region.performance}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {calculateRegionalStats().reduce((sum, region) => sum + region.activeProjects, 0)}
              </div>
              <div className="text-xs text-blue-700">Total Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {Math.round(calculateRegionalStats().reduce((sum, region) => sum + (region.projectsOnTime || 0), 0) / calculateRegionalStats().length)}%
              </div>
              <div className="text-xs text-green-700">Avg On-Time Rate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {calculateRegionalStats().length}
              </div>
              <div className="text-xs text-purple-700">Active Regions</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Map Picker Modal */}
      {showMapPicker && (
        <Dialog open={showMapPicker} onOpenChange={setShowMapPicker}>
          <DialogContent className="w-[90vw] max-w-4xl h-[80vh] !max-w-none">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                🗺️ Drop Pin on Map
              </DialogTitle>
              <DialogDescription>
                Click anywhere on the map to set your project location coordinates
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 relative">
              <div className="h-full w-full bg-gray-100 rounded-lg overflow-hidden">
                <div 
                  id="map-picker" 
                  className="w-full h-full"
                  style={{ minHeight: '400px' }}
                />
              </div>
              
              <div className="absolute top-4 right-4 bg-background p-3 rounded-lg shadow-lg border">
                <div className="text-sm font-medium text-gray-700 mb-2">📍 Selected Location</div>
                <div className="text-xs text-gray-500">
                  Click on the map to set coordinates
                </div>
                <div className="mt-2 space-y-1">
                  <div className="text-xs">
                    <span className="font-medium">Lat:</span> 
                    <input 
                      type="text" 
                      placeholder="51.5074" 
                      className="ml-1 px-2 py-1 border rounded text-xs w-20"
                      value={projectFormData.latitude || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, latitude: e.target.value })}
                    />
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">Lng:</span> 
                    <input 
                      type="text" 
                      placeholder="-0.1278" 
                      className="ml-1 px-2 py-1 border rounded text-xs w-20"
                      value={projectFormData.longitude || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, longitude: e.target.value })}
                    />
                  </div>
                </div>
                <Button 
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => setShowMapPicker(false)}
                >
                  ✅ Use This Location
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Project Detail Modal */}
      <Dialog open={showProjectModal} onOpenChange={setShowProjectModal}>
                 <DialogContent className="w-[99.5vw] h-[96vh] max-w-none !max-w-none bg-background/80 backdrop-blur-md border border-border" style={{ width: '99.5vw', maxWidth: 'none' }}>
          <DialogHeader className="border-b border-border pb-4">
            <DialogTitle className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              {selectedProject?.image || '🏗️'} {selectedProject?.name || 'Project Details'}
              {/* ITT Warning Badge in Header */}
              {(!selectedProject?.hasITT && !selectedProject?.progress) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                  ⚠️ ITT Required
                </span>
              )}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-base md:text-lg">
              Comprehensive project information and management
            </DialogDescription>
          </DialogHeader>
          
          {selectedProject && (
            <div className="flex-1 overflow-hidden">
              {/* Top 3 Sections: DETAILS, ITT, SUPPLY CHAIN */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 h-1/2 mb-4 lg:mb-6">
                
                {/* DETAILS Section */}
                <div className="bg-card rounded-xl border border-border p-4 lg:p-6 overflow-y-auto">
                  <h3 className="text-lg lg:text-xl font-bold text-foreground mb-4 lg:mb-6 flex items-center gap-2 border-b border-border pb-3">
                    📋 DETAILS
                  </h3>
                  <div className="space-y-4 lg:space-y-6">
                    {/* Project Overview */}
                    <div className="space-y-3 lg:space-y-4">
                      <h4 className="text-base lg:text-lg font-semibold text-foreground">Project Overview</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Location</span>
                          <span className="text-sm font-semibold text-foreground">🌍 {selectedProject.location || selectedProject.country}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Status</span>
                          <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                            selectedProject.status === 'On Track' ? 'bg-green-100 text-green-700' :
                            selectedProject.status === 'Ahead' ? 'bg-blue-100 text-blue-700' :
                            selectedProject.status === 'Delayed' ? 'bg-red-100 text-red-700' :
                            'bg-muted text-foreground'
                          }`}>
                            {selectedProject.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Progress</span>
                          <span className="text-sm font-semibold text-foreground">{selectedProject.progress || 0}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Score</span>
                          <span className={`text-sm font-semibold ${
                            (selectedProject.score || 0) >= 90 ? 'text-green-600' : 
                            (selectedProject.score || 0) >= 80 ? 'text-blue-600' : 
                            (selectedProject.score || 0) >= 70 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {selectedProject.score || 0}/100
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Financial Details */}
                    <div className="space-y-3 lg:space-y-4">
                      <h4 className="text-base lg:text-lg font-semibold text-foreground">Financial Details</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Value</span>
                          <span className="text-sm font-semibold text-foreground">{selectedProject.budget}</span>
                        </div>
                        {selectedProject.spent && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Spent</span>
                            <span className="text-sm font-semibold text-foreground">{selectedProject.spent}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Size</span>
                          <span className="text-sm font-semibold text-foreground">{selectedProject.size || selectedProject.sizeBucket}</span>
                        </div>
                      </div>
                    </div>


                  </div>
                </div>

                {/* ITT Section */}
                <div className="bg-card rounded-xl border border-border p-4 lg:p-5 overflow-y-auto">
                  {/* ITT Assignment Alert - Show if project needs ITT */}
                  {(!selectedProject.hasITT && !selectedProject.progress) && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="text-amber-600 mt-0.5">⚠️</div>
                        <div className="flex-1">
                          <h5 className="text-sm font-semibold text-amber-800 mb-1">ITT Assignment Required</h5>
                          <p className="text-xs text-amber-700 mb-2">This project needs an Invitation to Tender to proceed with supplier selection.</p>
                          <Button 
                            size="sm" 
                            className="h-7 px-3 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                            onClick={() => {
                              setIttFormData && setIttFormData((prev: any) => ({ 
                                ...prev, 
                                project: selectedProject.name, 
                                region: (selectedProject.country || '').toLowerCase() 
                              }))
                              setActiveTab && setActiveTab('itt-manager')
                              setShowCreateITT && setShowCreateITT(true)
                              setShowProjectModal(false)
                            }}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Assign ITT Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between mb-3 lg:mb-4">
                    <div className="flex items-center gap-2">
                      <div className="text-xl">📋</div>
                      <div>
                        <h4 className="text-base font-semibold text-foreground">Invitation to Tender</h4>
                        <p className="text-xs text-muted-foreground">Manage tender documents and supplier responses</p>
                      </div>
                    </div>
                      <Button 
                      size="sm"
                      className="px-3 py-1.5 text-xs"
                        onClick={() => {
                          setIttFormData && setIttFormData((prev: any) => ({ 
                            ...prev, 
                            project: selectedProject.name, 
                            region: (selectedProject.country || '').toLowerCase() 
                          }))
                          setActiveTab && setActiveTab('itt-manager')
                          setShowCreateITT && setShowCreateITT(true)
                          setShowProjectModal(false)
                        }}
                      >
                      <FileText className="h-3 w-3 mr-1" />
                      Create ITT
                      </Button>
                    </div>
                    
                    {/* Sample ITT Data */}
                      <div className="space-y-3">
                    <h5 className="text-sm font-semibold text-foreground">Recent ITTs</h5>
                    <div className="space-y-2">
                        <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-semibold text-foreground">General Construction</span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Deadline: {selectedProject.endDate || '2024-12-31'} • 5 responses
                          </div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-semibold text-foreground">Electrical Systems</span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Draft</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Created: 2024-11-15 • 0 responses
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SUPPLY CHAIN Section */}
                <div className="bg-card rounded-xl border border-border p-4 lg:p-5 overflow-y-auto">
                  <div className="flex items-start justify-between mb-3 lg:mb-4">
                    <div className="flex items-center gap-2">
                      <div className="text-xl">🏭</div>
                      <div>
                        <h4 className="text-base font-semibold text-foreground">Supply Chain Management</h4>
                        <p className="text-xs text-muted-foreground">Track suppliers, materials, and logistics</p>
                      </div>
                    </div>
                      <Button 
                      size="sm"
                      className="px-3 py-1.5 text-xs"
                        onClick={() => {
                          setActiveTab && setActiveTab('supply-chain')
                          setShowProjectModal(false)
                        }}
                      >
                      <BarChart3 className="h-3 w-3 mr-1" />
                      View Chain
                      </Button>
                    </div>
                    
                    {/* Sample Supply Chain Data */}
                      <div className="space-y-3">
                    <h5 className="text-sm font-semibold text-foreground">Key Suppliers</h5>
                    <div className="space-y-2">
                        <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-semibold text-foreground">ABC Construction Ltd</span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Approved</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Materials: Concrete, Steel • Rating: 4.8/5
                          </div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-semibold text-foreground">XYZ Electrical</span>
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pending</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Services: Electrical Installation • Rating: 4.2/5
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Materials Overview */}
                  <div className="mt-4 space-y-3">
                    <h5 className="text-sm font-semibold text-foreground">Materials Status</h5>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">Concrete</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Delivered</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">Steel Beams</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">In Transit</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">Electrical Equipment</span>
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Ordered</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section: TIMELINE */}
              <div className="bg-card rounded-xl border border-border p-4 lg:p-6 h-1/2 overflow-y-auto">
                <h3 className="text-lg lg:text-xl font-bold text-foreground mb-4 lg:mb-6 flex items-center gap-2 border-b border-border pb-3">
                  📅 TIMELINE
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Column 1: Project Timeline */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-foreground">Project Timeline</h4>
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-foreground">Project Initiation</span>
                            <span className="text-xs text-muted-foreground">{selectedProject.startDate || '2024-01-15'}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Project planning and team assembly completed</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-foreground">Foundation Work</span>
                            <span className="text-xs text-muted-foreground">2024-02-01</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Site preparation and foundation construction</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-foreground">Structural Work</span>
                            <span className="text-xs text-muted-foreground">2024-03-15</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Main structural elements and framework</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-foreground">Interior Finishing</span>
                            <span className="text-xs text-muted-foreground">2024-05-01</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Interior systems and finishing work</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-3 h-3 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-foreground">Project Completion</span>
                            <span className="text-xs text-muted-foreground">{selectedProject.endDate || selectedProject.deadline || '2024-12-31'}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Final inspection and handover</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Key Milestones */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-foreground">Key Milestones</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="text-sm font-semibold text-foreground mb-1">Planning Phase</div>
                        <div className="text-xs text-muted-foreground">Completed: {selectedProject.startDate || '2024-01-15'}</div>
                        <div className="w-full bg-muted rounded-full h-2 mt-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="text-sm font-semibold text-foreground mb-1">Construction Phase</div>
                        <div className="text-xs text-muted-foreground">Progress: {selectedProject.progress || 0}%</div>
                        <div className="w-full bg-muted rounded-full h-2 mt-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${selectedProject.progress || 0}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Recent Activities */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-foreground">Recent Activities</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-foreground">Site inspection completed</span>
                        <span className="text-muted-foreground text-xs">2 hours ago</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-foreground">Material delivery scheduled</span>
                        <span className="text-muted-foreground text-xs">1 day ago</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-foreground">Safety review meeting</span>
                        <span className="text-muted-foreground text-xs">3 days ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Milestones */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-foreground">Key Milestones</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-sm font-semibold text-foreground mb-1">Planning Phase</div>
                    <div className="text-xs text-muted-foreground">Completed: {selectedProject.startDate || '2024-01-15'}</div>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="text-sm font-semibold text-foreground mb-1">Construction Phase</div>
                    <div className="text-xs text-muted-foreground">Progress: {selectedProject.progress || 0}%</div>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${selectedProject.progress || 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-foreground">Recent Activities</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-foreground">Site inspection completed</span>
                    <span className="text-muted-foreground text-xs">2 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-foreground">Material delivery scheduled</span>
                    <span className="text-muted-foreground text-xs">1 day ago</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-foreground">Safety review meeting</span>
                    <span className="text-muted-foreground text-xs">3 days ago</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 mt-6 border-t border-border">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    className="h-12 px-8"
                    onClick={() => {
                      setIttFormData && setIttFormData((prev: any) => ({ 
                        ...prev, 
                        project: selectedProject.name, 
                        region: (selectedProject.country || '').toLowerCase() 
                      }))
                      setActiveTab && setActiveTab('itt-manager')
                      setShowCreateITT && setShowCreateITT(true)
                      setShowProjectModal(false)
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Create ITT
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-12 px-8"
                    onClick={() => {
                      setActiveTab && setActiveTab('supply-chain')
                      setShowProjectModal(false)
                    }}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Supply Chain
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-12 px-8"
                    onClick={() => {
                      setComparisonProjects(prev => [...prev, selectedProject])
                      setShowProjectModal(false)
                    }}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Compare
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  className="h-12 px-8"
                  onClick={() => setShowProjectModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Country Projects Modal */}
      {isCountryModalOpen && selectedMapCountry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 max-w-4xl w-[90vw] max-h-[80vh] overflow-y-auto mx-4 transform scale-100 transition-transform duration-300 border border-border">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {selectedMapCountry === 'United Kingdom' ? '🇬🇧' :
                   selectedMapCountry === 'Germany' ? '🇩🇪' :
                   selectedMapCountry === 'France' ? '🇫🇷' :
                   selectedMapCountry === 'Netherlands' ? '🇳🇱' : '🌍'}
    </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{selectedMapCountry}</h3>
                  <p className="text-muted-foreground">Projects in Europe</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCountryModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-2xl leading-none p-2 hover:bg-accent rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            {/* Country Projects Grid */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  🏗️ Active Projects in {selectedMapCountry}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Combined existing projects and user projects */}
                  {[...existingProjects, ...(userProjects || [])]
                    .filter(project => {
                      const mapToProject: Record<string, string[]> = {
                        'United Kingdom': ['UK', 'United Kingdom'],
                        'United States': ['USA', 'United States'],
                        'Germany': ['Germany'],
                        'France': ['France'],
                        'Netherlands': ['Netherlands']
                      }
                      
                      const projectCountries: string[] = mapToProject[selectedMapCountry] || [selectedMapCountry]
                      return projectCountries.some((country: string) => 
                        project.country === country || 
                        project.location?.includes(country) ||
                        project.location?.includes(selectedMapCountry)
                      )
                    })
                    .map((project) => (
                      <Card 
                        key={project.id} 
                        className="hover:shadow-md transition-shadow cursor-pointer hover:bg-accent/5"
                        onClick={() => {
                          setSelectedProject(project)
                          setShowProjectModal(true)
                          setIsCountryModalOpen(false)
                        }}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-xl">{project.image || '🏗️'}</div>
                              <div>
                                <CardTitle className="text-sm leading-tight">{project.name}</CardTitle>
                                <CardDescription className="text-xs">{project.location || project.country}</CardDescription>
                              </div>
                            </div>
                            <div className="text-right">
                              {project.score ? (
                                <div className={`text-xs font-medium ${
                                  project.score >= 90 ? 'text-green-600' : 
                                  project.score >= 80 ? 'text-blue-600' : 
                                  project.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {project.score}/100
                                </div>
                              ) : (
                                <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                  New
                                </div>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {project.progress !== undefined && (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-xs">Progress</span>
                                <span className="text-xs font-medium">{project.progress}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                            </>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{project.budget || 'Budget TBD'}</span>
                            {project.status && (
                              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                                project.status === 'On Track' ? 'bg-green-100 text-green-700' :
                                project.status === 'Ahead' ? 'bg-blue-100 text-blue-700' :
                                project.status === 'Delayed' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {project.status}
                              </span>
                            )}
                          </div>
                          {(project.startDate || project.endDate) && (
                            <div className="text-xs text-muted-foreground">
                              {project.startDate} → {project.endDate}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
                
                {[...existingProjects, ...(userProjects || [])].filter(project => {
                  const mapToProject: Record<string, string[]> = {
                    'United Kingdom': ['UK', 'United Kingdom'],
                    'United States': ['USA', 'United States'],
                    'Germany': ['Germany'],
                    'France': ['France'],
                    'Netherlands': ['Netherlands']
                  }
                  
                  const projectCountries: string[] = mapToProject[selectedMapCountry] || [selectedMapCountry]
                  return projectCountries.some((country: string) => 
                    project.country === country || 
                    project.location?.includes(country) ||
                    project.location?.includes(selectedMapCountry)
                  )
                }).length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🏗️</div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">No Active Projects</h4>
                    <p className="text-muted-foreground text-sm">No projects currently active in {selectedMapCountry}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-border">
              <Button onClick={() => setIsCountryModalOpen(false)} className="px-6">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}