import { useEffect, useRef, useState } from "react"
import { Plus, BarChart3, FileText } from "lucide-react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { ProjectFormData, TenderDraft } from "../../lib/types"
import { projects, regionData } from "../../lib/constants"

// Working World Map Canvas Component (from WorldMapPage)
function WorldMapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState('')
  const [countryData, setCountryData] = useState<any>(null)
  const [is3D, setIs3D] = useState(false)
  const chartRef = useRef<any>(null)
  const lastTooltipRef = useRef<{ text: string; ts: number } | null>(null)
  const lastDownRef = useRef<{ x: number; y: number; ts: number } | null>(null)
  const justOpenedAtRef = useRef<number>(0)
  const isDraggingRef = useRef<boolean>(false)

  useEffect(() => {
    const fsHandler = () => setIsFullscreen(!!document.fullscreenElement)
    fsHandler()
    document.addEventListener('fullscreenchange', fsHandler)
    return () => document.removeEventListener('fullscreenchange', fsHandler)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
  

    // Prepare container
    containerRef.current.innerHTML = ''
    const wrapper = document.createElement('div')
    wrapper.style.position = 'relative'
    wrapper.style.width = '100%'
    const setWrapperHeight = () => {
      try {
        if (document.fullscreenElement) {
          wrapper.style.height = `${window.innerHeight}px`
        } else {
          wrapper.style.height = '500px'
        }
      } catch {
        wrapper.style.height = '500px'
      }
    }
    setWrapperHeight()
    wrapper.style.borderRadius = '12px'
    wrapper.style.overflow = 'hidden'
    wrapper.style.background = '#1a1a1a'

    // Create chart div with unique ID to avoid conflicts
    const uniqueId = 'chartdiv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
    const chartDiv = document.createElement('div')
    chartDiv.id = uniqueId
    chartDiv.style.width = '100%'
    chartDiv.style.height = '100%'
    wrapper.appendChild(chartDiv)
    containerRef.current.appendChild(wrapper)
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
        await loadScript('https://cdn.amcharts.com/lib/editor/map/5/viewer.js')
  
        if (disposed) return
        
        const am5viewer = (window as any).am5viewer
        
        
        if (!am5viewer) throw new Error('am5viewer not available')
        if (typeof am5viewer.create !== 'function') throw new Error('am5viewer.create is not a function')

        // Exact configuration from your working HTML
        const config = {
          settings: {
            editor: {
              themeTags: ['dark'],
              userData: {
                projection: is3D ? 'geoOrthographic' : 'geoMercator',
                geodata: 'worldLow',
                homeGeoPoint: is3D ? { longitude: 0, latitude: 0 } : undefined,
              },
            },
            'editor.map': {
              minZoomLevel: 0.8,
              projection: is3D ? 'geoOrthographic' : 'geoMercator',
              panX: 'rotateX',
              ...(is3D
                ? {
                    panY: 'rotateY',
                    rotationX: 0,
                    rotationY: 0,
                    homeZoomLevel: 1.0,
                    homeGeoPoint: { longitude: 0, latitude: 0 },
                  }
                : {}),
              zoomControl: {
                type: 'ZoomControl',
                settings: {
                   visible: false,
                  position: 'absolute',
                  layout: { type: 'VerticalLayout' },
                  themeTags: ['zoomtools'],
                  layer: 30,
                },
              },
              background: {
                type: 'Rectangle',
                settings: {
                  fill: { type: 'Color', value: '#1a1a1a' },
                  fillOpacity: 1,
                  width: 1853,
                  height: 916,
                  x: 0,
                  y: 0,
                  fillPattern: {
                    type: 'GrainPattern',
                    settings: { maxOpacity: 0.08, density: 0.2, colors: [{ type: 'Color', value: '#aaaaaa' }] },
                  },
                  isMeasured: false,
                },
              },
              themeTags: ['map'],
              ...(is3D
                ? { }
                : { translateX: 926.5, translateY: 651.6032407502676 }),
            },
            'editor.pointTemplate': {
              toggleKey: 'active',
              centerX: { type: 'Percent', value: 50 },
              centerY: { type: 'Percent', value: 50 },
              tooltipText: '{name}',
            },
            'editor.polygonSeries': {
              valueField: 'value',
              calculateAggregates: true,
              id: 'polygonseries',
              exclude: ['AQ'],
              geometryField: 'geometry',
              geometryTypeField: 'geometryType',
              idField: 'id',
            },
          },
          data: {
            'editor.polygonSeries': [
              // Pre-populate with country color data
              { id: 'GB', name: 'United Kingdom', fill: '#10B981', fillOpacity: 0.8 },
              { id: 'UK', name: 'United Kingdom', fill: '#10B981', fillOpacity: 0.8 },
              { id: 'DE', name: 'Germany', fill: '#3B82F6', fillOpacity: 0.8 },
              { id: 'FR', name: 'France', fill: '#8B5CF6', fillOpacity: 0.8 },
              { id: 'NL', name: 'Netherlands', fill: '#F59E0B', fillOpacity: 0.8 },
              { id: 'ES', name: 'Spain', fill: '#EF4444', fillOpacity: 0.8 }
            ],
          },
        } as any

        // Create the map

        const chart = am5viewer.create(uniqueId, config)

        chartRef.current = chart
        
        if (!chart) {
          console.error('[Map] Chart creation failed!')
          return
        }
        
        // Check if chart has root

        
        // Wait for chart to be ready
        if (chart.root) {
          chart.root.events.once('frameended', () => {
            
          })
        }


        
        // Set up click handlers (simplified)
        setTimeout(() => {
          const container = document.getElementById(uniqueId)
          if (container) {
            container.addEventListener('click', (e) => {
              const target = e.target as any
              if (target?.tagName === 'path') {
                const title = target.querySelector('title')?.textContent ||
                            target.getAttribute('aria-label') ||
                            'Unknown Country'
                setSelectedCountry(title)
                setCountryData({ mode: is3D ? '3D' : '2D' })
                setIsModalOpen(true)
              }
            })
          }
        }, 1000)
      } catch (err) {
        console.error(err)
      }
    }

    init()

    return () => {
      disposed = true
      try {
        const c = chartRef.current as any
        if (c && typeof c.dispose === 'function') {
          c.dispose()
        }
      } catch {}
      chartRef.current = null
      document.removeEventListener('fullscreenchange', onFsChange)
      window.removeEventListener('resize', onResize)
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [is3D])

  return (
    <div className="relative" style={{ height: isFullscreen ? '100vh' : '500px', backgroundColor: '#0a1426' }}>
      <div ref={containerRef} className="w-full h-full" />
      
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


      
      {/* Country Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md mx-4 transform scale-100 transition-transform duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">{selectedCountry}</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-gray-600">Regional information for {selectedCountry}</p>
            <div className="mt-4">
              <Button onClick={() => setIsModalOpen(false)} className="w-full">
                Close
              </Button>
            </div>
          </div>
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
  const previewRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  
  // All regions modal state
  const [showAllRegionsModal, setShowAllRegionsModal] = useState(false)
  const [regionSearch, setRegionSearch] = useState("")
  
  // Project detail modal state
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  
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
  ).slice(0, 10) // Limit to 10 results for performance

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
          
          <DialogContent className="w-[60vw] max-w-4xl h-[75vh] !max-w-none bg-background/80 backdrop-blur-md border border-border" style={{ width: '60vw', maxWidth: '900px', zIndex: 50 }} onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
            <DialogHeader className="border-b border-border pb-4 bg-card/50 rounded-t-lg">
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
                    {[1,2,3,4].map((step, index) => (
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
            <div className="flex-1 py-4">
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
                          💰 Scope & Budget
                        </h3>
                        <p className="text-muted-foreground text-sm">Define the project scope and financial details</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                            <label className="text-base font-bold text-foreground flex items-center gap-1">
                              📏 Project Size
                            </label>
                            <Select value={projectFormData.size} onValueChange={(value) => setProjectFormData({ ...projectFormData, size: value })}>
                              <SelectTrigger className="h-12 text-base">
                                <SelectValue placeholder="🔽 Select project size" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0-500">📐 Small (0–500 m²)</SelectItem>
                                <SelectItem value="500-2000">🏢 Medium (500–2,000 m²)</SelectItem>
                                <SelectItem value="2000-10000">🏗️ Large (2,000–10,000 m²)</SelectItem>
                                <SelectItem value="10000-50000">🏭 Very Large (10,000–50,000 m²)</SelectItem>
                                <SelectItem value=">50000">🌆 Mega Project (50,000+ m²)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-base font-bold text-foreground flex items-center gap-1">
                              💷 Estimated Budget
                            </label>
                            <Input 
                              className="h-12 text-base" 
                              value={projectFormData.budget} 
                              onChange={(e) => setProjectFormData({ ...projectFormData, budget: e.target.value })} 
                              placeholder="💰 e.g. £250,000" 
                            />
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

                  {tenderStep === 3 && (
                    <div className="space-y-4">
                                            <div className="mb-4 p-4 bg-card rounded-xl border border-border">
                        <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                          ✅ Compliance Requirements
                        </h3>
                        <p className="text-muted-foreground text-sm">Specify compliance requirements for this project</p>
                      </div>
                      
                      <div className="space-y-4">
                        
                        <div className="space-y-3">
                          <label className="text-base font-bold text-foreground flex items-center gap-1">
                            ✅ Compliance Requirements
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {['ISO 9001', 'NICEIC', 'CE Mark', 'CHAS'].map((req) => (
                              <label key={req} className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-accent cursor-pointer transition-all">
                                <input 
                                  type="checkbox" 
                                  className="w-6 h-6 text-primary rounded focus:ring-primary" 
                                  checked={projectFormData.compliance.includes(req)} 
                                  onChange={(e) => {
                                    const checked = e.target.checked
                                    setProjectFormData({
                                      ...projectFormData,
                                      compliance: checked ? [...projectFormData.compliance, req] : projectFormData.compliance.filter((r) => r !== req)
                                    })
                                  }} 
                                />
                                <span className="text-base font-semibold text-foreground">{req}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {tenderStep === 4 && (
                    <div className="space-y-4">
                      <div className="mb-4 p-4 bg-card rounded-xl border border-border">
                        <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                          📝 Review & Submit
                        </h3>
                        <p className="text-muted-foreground text-sm">Review your tender details before submitting</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                📝 Project Name
                              </span>
                              <p className="text-xl font-bold text-foreground">{projectFormData.name || 'Not specified'}</p>
                            </div>
                            <div>
                              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                🌍 Country
                              </span>
                              <p className="text-xl font-bold text-foreground">{selectedCountry || projectFormData.country || 'Not specified'}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                📅 Timeline
                              </span>
                              <p className="text-xl font-bold text-foreground">
                                {projectFormData.startDate || 'Not set'} → {projectFormData.endDate || 'Not set'}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                📏 Size & Budget
                              </span>
                              <p className="text-xl font-bold text-foreground">
                                {projectFormData.size || 'Not specified'} • {projectFormData.budget || 'Not specified'}
                              </p>
                            </div>
                          </div>
                          
                          {projectFormData.description && (
                            <div>
                              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                💭 Description
                              </span>
                              <p className="text-base font-medium text-foreground">{projectFormData.description}</p>
                            </div>
                          )}
                          
                          {projectFormData.materials.length > 0 && (
                            <div>
                                                            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                🔧 Materials
                              </span>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {projectFormData.materials.map((m, idx) => (
                                  <span key={idx} className="px-3 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold border border-primary/30">
                                    🔧 {m}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {projectFormData.compliance.length > 0 && (
                            <div>
                              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                ✅ Compliance
                              </span>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {projectFormData.compliance.map((c, idx) => (
                                  <span key={idx} className="px-3 py-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm font-semibold border border-green-500/30">
                                    ✅ {c}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-card border border-border rounded-xl p-6">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="w-6 h-6 text-primary mt-1 rounded focus:ring-primary" 
                              checked={createITTNow} 
                              onChange={(e) => setCreateITTNow(e.target.checked)} 
                            />
                            <div>
                              <span className="text-lg font-bold text-foreground flex items-center gap-2">
                                🚀 Create ITT immediately
                              </span>
                              <p className="text-muted-foreground text-sm mt-1 font-medium">
                                Automatically create and assign an Invitation to Tender for this project after submission
                              </p>
                            </div>
                          </label>
                        </div>
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
            <div className="border-t border-border pt-4 mt-4">
              <div className="flex items-center justify-between px-2">
                <Button 
                  variant="outline" 
                  className="h-14 px-8 text-base" 
                  onClick={() => {
                    const draft = {
                      currentStep: tenderStep as 1|2|3|4,
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
                  
                  {tenderStep < 4 ? (
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
          <WorldMapCanvas />
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
          <div>
            <h2 className="text-lg font-semibold text-foreground">📋 Projects In Progress</h2>
            <p className="text-sm text-muted-foreground">Current active projects across all regions</p>
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
                    <span className="text-xs text-muted-foreground">Budget:</span>
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
        <DialogContent className="w-[99.5vw] h-[96vh] max-w-none !max-w-none bg-background/95 backdrop-blur-md border border-border" style={{ width: '99.5vw', maxWidth: 'none' }}>
          <DialogHeader className="border-b border-border pb-4">
            <DialogTitle className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              {selectedProject?.image || '🏗️'} {selectedProject?.name || 'Project Details'}
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
                          <span className="text-sm font-medium text-muted-foreground">Budget</span>
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

                    {/* Team & Suppliers */}
                    <div className="space-y-3 lg:space-y-4">
                      <h4 className="text-base lg:text-lg font-semibold text-foreground">Team & Suppliers</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Team Size</span>
                          <span className="text-sm font-semibold text-foreground">
                            {Array.isArray(selectedProject.team) ? selectedProject.team.length : selectedProject.team}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Suppliers</span>
                          <span className="text-sm font-semibold text-foreground">{selectedProject.suppliers || 0}</span>
                        </div>
                        {selectedProject.issuesReported && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Issues Reported</span>
                            <span className="text-sm font-semibold text-foreground">{selectedProject.issuesReported}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-foreground">Progress Overview</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">Project Progress</span>
                          <span className="text-sm font-semibold text-foreground">{selectedProject.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${selectedProject.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ITT Section */}
                <div className="bg-card rounded-xl border border-border p-4 lg:p-6 overflow-y-auto">
                  <h3 className="text-lg lg:text-xl font-bold text-foreground mb-4 lg:mb-6 flex items-center gap-2 border-b border-border pb-3">
                    📄 ITT
                  </h3>
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📋</div>
                      <h4 className="text-lg font-semibold text-foreground mb-2">Invitation to Tender</h4>
                      <p className="text-muted-foreground text-sm mb-4">Manage tender documents and supplier responses</p>
                      <Button 
                        className="w-full"
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
                        Create New ITT
                      </Button>
                    </div>
                    
                    {/* Sample ITT Data */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-foreground">Recent ITTs</h4>
                      <div className="space-y-3">
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-foreground">General Construction</span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Deadline: {selectedProject.endDate || '2024-12-31'} • 5 responses
                          </div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-foreground">Electrical Systems</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Draft</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Created: 2024-11-15 • 0 responses
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SUPPLY CHAIN Section */}
                <div className="bg-card rounded-xl border border-border p-4 lg:p-6 overflow-y-auto">
                  <h3 className="text-lg lg:text-xl font-bold text-foreground mb-4 lg:mb-6 flex items-center gap-2 border-b border-border pb-3">
                    🔗 SUPPLY CHAIN
                  </h3>
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🏭</div>
                      <h4 className="text-lg font-semibold text-foreground mb-2">Supply Chain Management</h4>
                      <p className="text-muted-foreground text-sm mb-4">Track suppliers, materials, and logistics</p>
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setActiveTab && setActiveTab('supply-chain')
                          setShowProjectModal(false)
                        }}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Supply Chain
                      </Button>
                    </div>
                    
                    {/* Sample Supply Chain Data */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-foreground">Key Suppliers</h4>
                      <div className="space-y-3">
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-foreground">ABC Construction Ltd</span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Approved</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Materials: Concrete, Steel • Rating: 4.8/5
                          </div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-foreground">XYZ Electrical</span>
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Pending</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Services: Electrical Installation • Rating: 4.2/5
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Materials Overview */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-foreground">Materials Status</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">Concrete</span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Delivered</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">Steel Beams</span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">In Transit</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">Electrical Equipment</span>
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Ordered</span>
                        </div>
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
                <div className="space-y-6">
                  {/* Project Timeline */}
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
    </div>
  )
}