import { useState, useEffect } from 'react'
import { PageType, ViewMode, WidgetSize, ITTFormData, ProjectFormData, ActiveITT, TenderDraft } from '../lib/types'
import { allWidgets } from '../lib/constants'
import { defaultITTFormData, defaultProjectFormData } from '../lib/defaultFormData'
import { getScreenSize } from '../lib/utils'

export function useAppState() {
  // Core state
  const [activeTab, setActiveTab] = useState<PageType>("dashboard")
  const [widgets, setWidgets] = useState(allWidgets)
  const [customizeMode, setCustomizeMode] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("monthly")
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  // User-created projects and world-map highlights
  const [userProjects, setUserProjects] = useState<any[]>([])
  const [userITTs, setUserITTs] = useState<ActiveITT[]>([])
  const [tenderDrafts, setTenderDrafts] = useState<TenderDraft[]>([])
  const [highlightedCountries, setHighlightedCountries] = useState<string[]>([])

  // Project and comparison state
  const [comparisonProjects, setComparisonProjects] = useState<number[]>([])
  const [showComparison, setShowComparison] = useState(false)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [createProjectStep, setCreateProjectStep] = useState(1)

  // Supplier state
  const [supplierComparison, setSupplierComparison] = useState<string[]>([])
  const [showSupplierComparison, setShowSupplierComparison] = useState(false)
  const [supplierViewMode, setSupplierViewMode] = useState<'list' | 'card'>('list')

  // ITT state
  const [showCreateITT, setShowCreateITT] = useState(false)
  const [ittFormData, setIttFormData] = useState<ITTFormData>(defaultITTFormData)
  const [projectFormData, setProjectFormData] = useState<ProjectFormData>(defaultProjectFormData)

  // Enhanced responsive screen size detection with debouncing
  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setScreenSize(getScreenSize(window.innerWidth))
      }, 100)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  // Auto-exit customize mode on mobile
  useEffect(() => {
    if (screenSize === 'mobile' && customizeMode) {
      setCustomizeMode(false)
    }
  }, [screenSize, customizeMode])

  return {
    // Core state
    activeTab,
    setActiveTab,
    widgets,
    setWidgets,
    customizeMode,
    setCustomizeMode,
    viewMode,
    setViewMode,
    screenSize,

    // Project and comparison state
    comparisonProjects,
    setComparisonProjects,
    showComparison,
    setShowComparison,
    showCreateProject,
    setShowCreateProject,
    createProjectStep,
    setCreateProjectStep,

    // Supplier state
    supplierComparison,
    setSupplierComparison,
    showSupplierComparison,
    setShowSupplierComparison,
    supplierViewMode,
    setSupplierViewMode,

    // ITT state
    showCreateITT,
    setShowCreateITT,
    ittFormData,
    setIttFormData,
    projectFormData,
    setProjectFormData,
    userProjects,
    addProject: (project: any) => setUserProjects(prev => [{ id: Date.now(), ...project }, ...prev]),
    userITTs,
    addITT: (itt: ActiveITT) => setUserITTs(prev => [itt, ...prev]),
    tenderDrafts,
    saveTenderDraft: (draft: Omit<TenderDraft, 'id' | 'savedAt'>) => {
      const newDraft: TenderDraft = {
        id: Date.now(),
        savedAt: new Date().toISOString(),
        ...draft
      }
      setTenderDrafts(prev => [newDraft, ...prev])
      return newDraft
    },
    updateTenderDraft: (id: number, updater: (prev: TenderDraft) => TenderDraft) => {
      setTenderDrafts(prev => prev.map(d => d.id === id ? updater(d) : d))
    },
    removeTenderDraft: (id: number) => setTenderDrafts(prev => prev.filter(d => d.id !== id)),
    highlightedCountries,
    addHighlightedCountry: (country: string) => setHighlightedCountries(prev => prev.includes(country) ? prev : [...prev, country])
  }
}