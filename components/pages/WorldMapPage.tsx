"use client";
import { useEffect, useRef, useState } from 'react'
import { Globe } from 'lucide-react'
import CountryModal from '../modals/CountryModal'
import { useAppState } from '../../hooks/useAppState'

export default function WorldMapPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState('')
  const [countryData, setCountryData] = useState<any>(null)
  const [is3D, setIs3D] = useState(false)
  const chartRef = useRef<any>(null)
  const lastTooltipRef = useRef<{ text: string; ts: number } | null>(null)
  const lastDownRef = useRef<{ x: number; y: number; ts: number } | null>(null)
  const justOpenedAtRef = useRef<number>(0)
  const isDraggingRef = useRef<boolean>(false)
  const { highlightedCountries } = useAppState()

  useEffect(() => {
    if (!containerRef.current) return
    try { console.log('[Map] useEffect mount - mode:', is3D ? '3D' : '2D') } catch {}

    // Prepare container
    containerRef.current.innerHTML = ''
    const wrapper = document.createElement('div')
    wrapper.style.position = 'relative'
    wrapper.style.width = '100%'
    wrapper.style.height = '600px' // Fits the target UI section
    wrapper.style.borderRadius = '12px'
    wrapper.style.overflow = 'hidden'
    wrapper.style.background = '#1a1a1a'

    // Create chart div (same id as in your HTML)
    const chartDiv = document.createElement('div')
    chartDiv.id = 'chartdiv'
    chartDiv.style.width = '100%'
    chartDiv.style.height = '100%'
    wrapper.appendChild(chartDiv)
    containerRef.current.appendChild(wrapper)

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
        try { console.log('[Map] viewer.js loaded') } catch {}
        if (disposed) return
        const am5viewer = (window as any).am5viewer
        if (!am5viewer) throw new Error('am5viewer not available')

        // Exact configuration from your working HTML (keys with dots must be quoted)
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
                    // recentre globe on init/resets
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
                ? { /* keep globe centered by not applying 2D translates */ }
                : { translateX: 926.5, translateY: 651.6032407502676 }),
            },
            'editor.pointTemplate': {
              toggleKey: 'active',
              centerX: { type: 'Percent', value: 50 },
              centerY: { type: 'Percent', value: 50 },
              tooltipText: '{name}',
            },
            'editor.bubbleTemplate': { toggleKey: 'active', tooltipText: '{name}: {value}' },
            'editor.pixelTemplate': { tooltipText: '{name}', toggleKey: 'active' },
            'editor.linePointTemplate': {
              toggleKey: 'active',
              centerX: { type: 'Percent', value: 50 },
              centerY: { type: 'Percent', value: 50 },
              tooltipText: '{name}',
            },
            'editor.labelTemplate': { toggleKey: 'active', tooltipText: '{name}' },
            'editor.polygonSeries': {
              valueField: 'value',
              calculateAggregates: true,
              id: 'polygonseries',
              exclude: ['AQ'],
              geometryField: 'geometry',
              geometryTypeField: 'geometryType',
              idField: 'id',
            },
            'editor.lineSeries': {
              layer: 30,
              id: 'lineseries',
              lineTypeField: 'lineType',
              geometryField: 'geometry',
              geometryTypeField: 'geometryType',
              idField: 'id',
            },
            'editor.pointSeries': {
              fixedField: 'fixed',
              id: 'pointseries',
              geometryField: 'geometry',
              geometryTypeField: 'geometryType',
              idField: 'id',
            },
            'editor.labelSeries': {
              fixedField: 'fixed',
              id: 'labelseries',
              geometryField: 'geometry',
              geometryTypeField: 'geometryType',
              idField: 'id',
            },
            'editor.bubbleSeries': {
              calculateAggregates: true,
              valueField: 'value',
              polygonIdField: 'id',
              id: 'bubbleseries',
              geometryField: 'geometry',
              geometryTypeField: 'geometryType',
              idField: 'id',
            },
            'editor.gridSeries': {
              themeTags: ['grid'],
              affectsBounds: false,
              lineTypeField: 'lineType',
              geometryField: 'geometry',
              geometryTypeField: 'geometryType',
              idField: 'id',
              clipExtent: true,
            },
            'editor.backgroundSeries': {
              visible: false,
              themeTags: ['polygon', 'background'],
              affectsBounds: false,
              geometryField: 'geometry',
              geometryTypeField: 'geometryType',
              idField: 'id',
            },
            'editor.backgroundSeries.mapPolygons.template': { forceInactive: true },
            'editor.gridSeries.mapLines.template': { forceInactive: true },
          },
          data: {
            'editor.polygonSeries': [],
            'editor.lineSeries': [],
            'editor.pointSeries': [],
            'editor.labelSeries': [],
            'editor.bubbleSeries': [],
            'editor.gridSeries': [],
          },
        } as any

        // Create the map exactly as in your HTML, but sized to this container
        const chart = am5viewer.create('chartdiv', config)
        try { console.log('[Map] Chart created') } catch {}
        chartRef.current = chart

        // Simple fallback: on chart click, if a tooltip with a short label is visible, open modal
        const onChartClickSimple = (e: MouseEvent) => {
          try {
            // Treat drags as non-clicks
            const down = lastDownRef.current
            if (down) {
              const dx = e.clientX - down.x
              const dy = e.clientY - down.y
              const moved = Math.hypot(dx, dy)
              if (moved > 6) return
            }
            // Most permissive, reliable restore: read current tooltip text at click time
            const tip = chartDiv.querySelector('[role="tooltip"], .am5-tooltip') as HTMLElement | null
            const raw = tip?.innerText?.trim() || ''
            if (raw && raw.length < 60 && !/amcharts|created|export|zoom|menu/i.test(raw)) {
              console.log('[Map] Fallback chart click; opening modal for', raw)
              setSelectedCountry(raw)
              setCountryData({ mode: is3D ? '3D' : '2D', source: 'simple-fallback' })
              setIsModalOpen(true)
              return
            }
          } catch (e) {
            console.warn('[Map] simple fallback error', e)
          }
        }
        chartDiv.addEventListener('click', onChartClickSimple, true)

        // Track pointer to distinguish drag vs click and update last tooltip text
        const onPointerDown = (ev: PointerEvent) => {
          isDraggingRef.current = false
          lastDownRef.current = { x: ev.clientX, y: ev.clientY, ts: Date.now() }
        }
        const onPointerMove = (ev: PointerEvent) => {
          const tipEl = chartDiv.querySelector('[role="tooltip"], .am5-tooltip') as HTMLElement | null
          const text = tipEl?.innerText?.trim() || ''
          if (text && text.length < 60 && !/amcharts|created|export|zoom|menu/i.test(text)) {
            lastTooltipRef.current = { text, ts: Date.now() }
          }
          const down = lastDownRef.current
          if (down) {
            const dx = ev.clientX - down.x
            const dy = ev.clientY - down.y
            if (Math.hypot(dx, dy) > 6) isDraggingRef.current = true
          }
        }
        const onPointerUp = (ev: PointerEvent) => {
          const down = lastDownRef.current
          if (down) {
            const dx = ev.clientX - down.x
            const dy = ev.clientY - down.y
            if (Math.hypot(dx, dy) > 6) isDraggingRef.current = true
          }
          // reset dragging shortly after to not affect later clicks
          setTimeout(() => { isDraggingRef.current = false }, 150)
        }
        chartDiv.addEventListener('pointerdown', onPointerDown, { passive: true })
        chartDiv.addEventListener('pointermove', onPointerMove, { passive: true })
        chartDiv.addEventListener('pointerup', onPointerUp, { passive: true })

        // Ensure no stale amCharts instances remain (hard cleanup)
        try {
          const gv = (window as any).am5viewer
          if (gv && Array.isArray(gv.charts)) {
            gv.charts
              .filter((c: any) => c && c !== chart)
              .forEach((c: any) => {
                try { c.dispose && c.dispose() } catch {}
              })
          }
        } catch {}
        
                // Add click event handler for countries using amCharts API
        setTimeout(() => {
          try {
            const localChart = chartRef.current as any
            if (!localChart) return

            // Try to reliably find the polygon series for this chart instance
            const seriesList =
              (localChart.series && (localChart.series.values || localChart.series._values)) || []
            let polygonSeries: any = null
            if (Array.isArray(seriesList)) {
              polygonSeries = seriesList.find((s: any) => {
                try {
                  return (
                    s?.mapPolygons ||
                    s?.get?.('id') === 'polygonseries' ||
                    s?.get?.('name')?.toLowerCase?.().includes('polygon')
                  )
                } catch {
                  return false
                }
              })
            }
            if (!polygonSeries && localChart.series?.getIndex) {
              const candidate = localChart.series.getIndex(0)
              if (candidate?.mapPolygons) polygonSeries = candidate
            }
            if (!polygonSeries) { try { console.warn('[Map] No polygon series found') } catch {} ; return }

            // Ensure polygons are actually interactive so click events fire
            try {
              polygonSeries.mapPolygons?.template?.setAll?.({ interactive: true })
            } catch {}

            const handlePolygonClick = (ev: any) => {
              if (isDraggingRef.current) return
              try { console.log('Polygon click event', ev) } catch {}
              const polygon = ev?.target
              const dataItem = polygon?.dataItem
              if (!dataItem) return
              const countryName = dataItem.get?.('name') || dataItem.dataContext?.name || 'Unknown Country'
              const dc = dataItem.dataContext || {}
              polygonSeries.zoomToDataItem?.(dataItem, 1.5)
              setSelectedCountry(countryName)
              setCountryData({ ...dc, mode: is3D ? '3D' : '2D' })
              setIsModalOpen(true)
              justOpenedAtRef.current = Date.now()
            }

            // Attach on template (future sprites)
            try {
              polygonSeries.mapPolygons?.template?.events?.on?.('click', handlePolygonClick)
              console.log('[Map] Attached click to polygons template')
            } catch {}

            // Attach on existing polygons
            try {
              polygonSeries.mapPolygons?.each?.((p: any) => {
                try { p?.setAll?.({ interactive: true }) } catch {}
                p?.events?.on?.('click', handlePolygonClick)
              })
              console.log('[Map] Attached click to existing polygons')
            } catch {}

            // Re-attach when data/geometry validates (new sprites created)
            try {
              polygonSeries.events?.on?.('datavalidated', () => {
                try {
                  polygonSeries.mapPolygons?.each?.((p: any) => {
                    try { p?.setAll?.({ interactive: true }) } catch {}
                    p?.events?.on?.('click', handlePolygonClick)
                  })
                  console.log('[Map] Re-attached click after datavalidated')
                } catch {}
              })
            } catch {}

            // Pointer-based fallback using visible tooltip near click time
            const isValidLabel = (txt: string | null | undefined) => {
              if (!txt) return false
              const t = txt.trim()
              if (!t) return false
              if (t.length > 60) return false
              if (/amcharts|created|export|zoom|menu/i.test(t)) return false
              return true
            }

            const onPointerMove = (e: PointerEvent) => {
              try {
                const tip = chartDiv.querySelector('[role="tooltip"], .am5-tooltip') as HTMLElement | null
                const text = tip?.innerText || ''
                if (isValidLabel(text)) {
                  lastTooltipRef.current = { text: text.trim(), ts: Date.now() }
                }
                if (Math.random() < 0.01) console.log('[Map] pointermove; tooltip=', lastTooltipRef.current?.text)
              } catch {}
            }
            const onPointerDown = (e: PointerEvent) => {
              lastDownRef.current = { x: e.clientX, y: e.clientY, ts: Date.now() }
              console.log('[Map] pointerdown', { x: e.clientX, y: e.clientY })
            }
            const onPointerUp = (e: PointerEvent) => {
              // Avoid duplicates if a polygon click just opened the modal
              if (Date.now() - justOpenedAtRef.current < 250) return
              const down = lastDownRef.current
              const tip = lastTooltipRef.current
              if (!down || !tip) return
              const dx = e.clientX - down.x
              const dy = e.clientY - down.y
              const moved = Math.hypot(dx, dy)
              const recent = Date.now() - tip.ts < 200
              // Additional guard: ensure the element under the pointer looks like a country polygon
              const elAtPoint = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
              const looksLikeCountry = !!(elAtPoint && (elAtPoint.closest('[class*="am5"][class*="polygon"]') || elAtPoint.className.toString().includes('am5') && elAtPoint.className.toString().includes('polygon')))
              console.log('[Map] pointerup', { moved, recent, tip: tip.text, looksLikeCountry })
              if (moved < 6 && recent && looksLikeCountry) {
                setSelectedCountry(tip.text)
                setCountryData({ mode: is3D ? '3D' : '2D', source: 'tooltip-fallback' })
                setIsModalOpen(true)
                justOpenedAtRef.current = Date.now()
              }
            }
            chartDiv.addEventListener('pointermove', onPointerMove, { passive: true })
            chartDiv.addEventListener('pointerdown', onPointerDown, { passive: true })
            chartDiv.addEventListener('pointerup', onPointerUp, { passive: true })

            // Cleanup for pointer listeners when unmounting
            try {
              localChart.events?.on?.('disposed', () => {
                try { chartDiv.removeEventListener('pointermove', onPointerMove) } catch {}
                try { chartDiv.removeEventListener('pointerdown', onPointerDown) } catch {}
                try { chartDiv.removeEventListener('pointerup', onPointerUp) } catch {}
              })
            } catch {}
          } catch (e) {
            console.warn('Failed to attach polygon click handler', e)
          }
        }, 600)
        
        // TEMP: disable control pruning while debugging modal clicks
        if (false) setTimeout(() => {
          // Only target specific control elements, not the map itself
          const controlSelectors = [
            '[class*="am5"][class*="zoom"][class*="control"]',
            '[class*="am5"][class*="button"][class*="control"]',
            '[class*="am5"][class*="menu"][class*="control"]',
            '[class*="am5"][class*="toolbar"]',
            '[class*="am5"][class*="widget"]',
            '[class*="am5"][class*="panel"]',
            '[class*="am5"][class*="overlay"]',
            '[class*="am5exporting"]',
            '[class*="am5"][class*="export"]',
            '[aria-label*="Export"]',
            '[role="button"][class*="am5"]',

            'canvas.am5-layer-30'
          ]
          
          controlSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector)
            elements.forEach(element => {
              if (element instanceof HTMLElement) {
                                 // Only hide if it's not the main map container or tooltip
                 const isMapContainer = element.id === 'chartdiv' || 
                                      element.classList.contains('am5-chart') ||
                                      element.classList.contains('am5-map') ||
                                      element.classList.contains('am5-series') ||
                                      element.classList.contains('am5-polygon') ||
                                      element.classList.contains('am5-background') ||
                                      element.classList.contains('am5-tooltip') ||
                                      element.getAttribute('role') === 'tooltip' ||
                                      element.style.position === 'absolute'
                
                if (!isMapContainer) {
                  element.style.display = 'none'
                  element.style.visibility = 'hidden'
                  element.style.opacity = '0'
                }
              }
            })
          })
          
          // Specifically target bottom-left positioned elements that are controls
          const allElements = document.querySelectorAll('*')
          allElements.forEach(element => {
            if (element instanceof HTMLElement) {
              const className = element.className || ''
              const id = element.id || ''
              
              // Only target if it's clearly a control element
              if ((className.includes('am5') || id.includes('am5')) && 
                  (className.includes('control') || className.includes('button') || className.includes('menu'))) {
                
                const rect = element.getBoundingClientRect()
                const isBottomLeft = rect.bottom > window.innerHeight - 100 && rect.left < 200
                
                // Don't target the main map or chart elements
                const isMapElement = element.id === 'chartdiv' || 
                                   element.classList.contains('am5-chart') ||
                                   element.classList.contains('am5-map') ||
                                   element.classList.contains('am5-series') ||
                                   element.classList.contains('am5-polygon')
                
                if (isBottomLeft && !isMapElement) {
                  element.style.display = 'none'
                  element.style.visibility = 'hidden'
                  element.style.opacity = '0'
                }
              }
            }
          })
          
          // Specifically target only the amCharts watermark
          const watermarkElements = document.querySelectorAll('div')
          watermarkElements.forEach(element => {
            if (element instanceof HTMLElement) {
              const text = element.textContent || ''
              const style = element.style.cssText || ''
              
              // Only target the exact watermark element
              if (text.includes('Created using amCharts 5') && 
                  style.includes('clip: rect') && 
                  style.includes('width: 1px') && 
                  style.includes('height: 1px')) {
                element.style.display = 'none'
                element.style.visibility = 'hidden'
                element.style.opacity = '0'
              }
            }
          })
        }, 1500)
      } catch (err) {
        // Visible error message in-page
        const msg = document.createElement('div')
        msg.style.position = 'absolute'
        msg.style.left = '12px'
        msg.style.bottom = '12px'
        msg.style.background = 'rgba(0,0,0,0.6)'
        msg.style.color = 'white'
        msg.style.padding = '10px'
        msg.style.borderRadius = '8px'
        msg.textContent = '⚠️ Could not load map viewer. Please check your internet connection.'
        wrapper.appendChild(msg)
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
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [is3D])

  // Apply highlight to selected countries from global state
  useEffect(() => {
    try {
      const chart = chartRef.current as any
      if (!chart) return
      const seriesList = (chart.series && (chart.series.values || chart.series._values)) || []
      const polygonSeries = Array.isArray(seriesList) ? seriesList.find((s: any) => s?.mapPolygons) : null
      if (!polygonSeries) return
      polygonSeries.mapPolygons?.each?.((p: any) => {
        const di = p?.dataItem
        const name = di?.get?.('name') || di?.dataContext?.name || ''
        const match = highlightedCountries.some((c) => name.toLowerCase() === c.toLowerCase() || (c === 'UK' && /united kingdom/i.test(name)))
        if (match) {
          try { p.setAll?.({ fill: chart?.root?.interfaceColors?.get?.('primaryButton')?.toCSS?.() || '#2563eb', fillOpacity: 0.9 }) } catch {}
        } else {
          try { p.setAll?.({ fillOpacity: 0.6 }) } catch {}
        }
      })
    } catch {}
  }, [highlightedCountries])

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-800 flex items-center gap-3">
          <Globe className="h-8 w-8 text-blue-600" />
          World Map
        </h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-4">
        {/* The amCharts map renders inside this container */}
        <div className="w-full h-[600px] rounded-xl overflow-hidden relative">
          <div ref={containerRef} className="w-full h-full" />
          {/* Button to cover bottom-left watermark area */}
          <div className="absolute bottom-0 left-0 w-32 h-16 bg-transparent z-[1000] pointer-events-auto"></div>
          {/* 3D Toggle Button */}
          <button
            onClick={() => {
              setIsModalOpen(false)
              setSelectedCountry('')
              setCountryData(null)
              setIs3D((v) => !v)
            }}
            className="absolute bottom-1 left-0.5 px-6 py-2 bg-gray-600 text-white text-base font-medium rounded-md shadow-md hover:bg-gray-700 transition-colors z-[1001]"
          >
            {is3D ? '2D' : '3D'}
          </button>
          
          {/* Test Modal Button */}
          <button 
            onClick={() => {
              console.log('Test button clicked')
              setSelectedCountry('Test Country')
              setCountryData({ test: true })
              setIsModalOpen(true)
            }}
            className="absolute top-2 right-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-md hover:bg-blue-700 transition-colors z-[1001]"
          >
            Test Modal
          </button>
          

        </div>
      </div>
      
      {/* Country Modal */}
      <CountryModal
        isOpen={isModalOpen}
        onClose={() => {
          console.log('Closing modal')
          setIsModalOpen(false)
        }}
        countryName={selectedCountry}
        countryData={countryData}
      />
      
      {/* Debug info */}
      <div className="text-sm text-gray-500 mt-2">
        Modal state: {isModalOpen ? 'Open' : 'Closed'} | Selected: {selectedCountry}
      </div>
    </div>
  )
} 